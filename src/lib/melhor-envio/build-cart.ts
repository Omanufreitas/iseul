import { CONTACT_EMAIL } from "@/lib/site";
import { LOCAL_MOTOBOY_OPTION_ID } from "@/lib/local-delivery";
import type { MelhorEnvioAddress, MelhorEnvioCartPayload, ShipperSettings } from "./types";

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

function splitBrDocument(document: string): { document: string; company_document?: string } {
  const digits = onlyDigits(document).slice(0, 14);
  if (digits.length === 14) {
    return { document: "", company_document: digits };
  }
  return { document: digits.slice(0, 11) };
}

function toMeAddress(person: {
  name: string;
  phone: string;
  email: string;
  document: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  zip: string;
}): MelhorEnvioAddress {
  const { document, company_document } = splitBrDocument(person.document);

  return {
    name: person.name.slice(0, 64),
    phone: onlyDigits(person.phone).slice(0, 11) || "67999999999",
    email: person.email.slice(0, 128) || CONTACT_EMAIL,
    document,
    ...(company_document ? { company_document } : {}),
    address: person.street.slice(0, 128),
    complement: (person.complement || "").slice(0, 64),
    number: person.number.slice(0, 16) || "S/N",
    district: person.neighborhood.slice(0, 64),
    city: person.city.slice(0, 64),
    state_abbr: person.state.toUpperCase().slice(0, 2),
    postal_code: onlyDigits(person.zip).slice(0, 8),
    country_id: "BR",
  };
}

export function shipperFromSettings(settings: ShipperSettings): MelhorEnvioAddress {
  const address = toMeAddress({
    name: settings.name,
    phone: settings.phone,
    email: settings.email,
    document: settings.document,
    street: settings.street,
    number: settings.number,
    complement: settings.complement,
    neighborhood: settings.neighborhood,
    city: settings.city,
    state: settings.state,
    zip: settings.zip,
  });

  const stateRegister = settings.stateRegister?.trim();
  if (stateRegister) {
    address.state_register = stateRegister;
  }

  return address;
}

type OrderItemRow = {
  product_name: string;
  quantity: number;
  unit_price: number;
  variant_id: string | null;
};

type VariantDims = {
  weight_grams: number;
  length_cm: number;
  width_cm: number;
  height_cm: number;
};

export function buildCartPayload(input: {
  serviceId: number;
  shipper: ShipperSettings;
  recipient: {
    name: string;
    phone: string;
    email: string;
    document: string;
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    zip: string;
  };
  items: OrderItemRow[];
  variantDims: Map<string, VariantDims>;
  insuranceValue: number;
  agencyId?: number | null;
  invoiceKey?: string | null;
}): MelhorEnvioCartPayload {
  const products = input.items.map((item) => ({
    name: item.product_name.slice(0, 128),
    quantity: item.quantity,
    unitary_value: Number(item.unit_price),
  }));

  let totalWeightKg = 0;
  let maxLength = 30;
  let maxWidth = 25;
  let maxHeight = 3;

  for (const item of input.items) {
    const dims = item.variant_id ? input.variantDims.get(item.variant_id) : undefined;
    const weightG = dims?.weight_grams ?? 200;
    totalWeightKg += (weightG / 1000) * item.quantity;
    maxLength = Math.max(maxLength, dims?.length_cm ?? 30);
    maxWidth = Math.max(maxWidth, dims?.width_cm ?? 25);
    maxHeight = Math.max(maxHeight, dims?.height_cm ?? 3);
  }

  const commercial = !!input.invoiceKey;

  return {
    service: input.serviceId,
    ...(input.agencyId ? { agency: input.agencyId } : {}),
    from: shipperFromSettings(input.shipper),
    to: toMeAddress(input.recipient),
    products,
    volumes: [
      {
        length: maxLength,
        width: maxWidth,
        height: maxHeight,
        weight: Math.max(totalWeightKg, 0.2),
      },
    ],
    options: {
      insurance_value: Math.max(0, input.insuranceValue),
      receipt: false,
      own_hand: false,
      reverse: false,
      non_commercial: !commercial,
      ...(input.agencyId ? { agency_id: input.agencyId } : {}),
      ...(commercial ? { invoice: { key: input.invoiceKey! } } : {}),
    },
  };
}

/** IDs usados no checkout quando Melhor Envio não cotou (fallback local). */
const CHECKOUT_FALLBACK_SERVICE_IDS: Record<number, number> = {
  [-1]: 1,
  [-2]: 2,
};

export function resolveServiceIdFromCheckoutFallback(
  fallbackId: number,
  shippingMethod: string
): number | null {
  if (CHECKOUT_FALLBACK_SERVICE_IDS[fallbackId]) {
    return CHECKOUT_FALLBACK_SERVICE_IDS[fallbackId];
  }

  const methodLower = shippingMethod.toLowerCase();
  if (/\bsedex\b/.test(methodLower)) return 2;
  if (/\bpac\b/.test(methodLower)) return 1;

  return null;
}

export function parseMelhorEnvioServiceId(value: unknown): number {
  if (value == null || value === "") return NaN;
  const parsed = Number.parseInt(String(value), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : NaN;
}

export async function resolveMelhorEnvioServiceId(input: {
  storedServiceId: unknown;
  addressOptionId: unknown;
  shippingMethod: string;
  originZip: string;
  destinationZip: string;
  items: OrderItemRow[];
  variantDims: Map<string, VariantDims>;
  shippingPrice: number;
}): Promise<number | null> {
  const rawStored = Number.parseInt(String(input.storedServiceId ?? ""), 10);
  const rawAddress = Number.parseInt(String(input.addressOptionId ?? ""), 10);
  if (rawStored === LOCAL_MOTOBOY_OPTION_ID || rawAddress === LOCAL_MOTOBOY_OPTION_ID) {
    return null;
  }

  let serviceId = parseMelhorEnvioServiceId(input.storedServiceId);
  if (!Number.isFinite(serviceId)) {
    serviceId = parseMelhorEnvioServiceId(input.addressOptionId);
  }

  if (!Number.isFinite(serviceId)) {
    const rawFallback = Number.parseInt(
      String(input.storedServiceId ?? input.addressOptionId ?? ""),
      10
    );
    if (Number.isFinite(rawFallback)) {
      const mapped = resolveServiceIdFromCheckoutFallback(rawFallback, input.shippingMethod);
      if (mapped) serviceId = mapped;
    }
  }

  if (!Number.isFinite(serviceId)) {
    const mapped = resolveServiceIdFromCheckoutFallback(0, input.shippingMethod);
    if (mapped) serviceId = mapped;
  }

  if (!Number.isFinite(serviceId)) {
    serviceId = (await matchServiceIdFromQuote({
      originZip: input.originZip,
      destinationZip: input.destinationZip,
      items: input.items,
      variantDims: input.variantDims,
      shippingMethod: input.shippingMethod,
      shippingPrice: input.shippingPrice,
    })) ?? NaN;
  }

  return Number.isFinite(serviceId) ? serviceId : null;
}

export async function matchServiceIdFromQuote(input: {
  originZip: string;
  destinationZip: string;
  items: OrderItemRow[];
  variantDims: Map<string, VariantDims>;
  shippingMethod: string;
  shippingPrice: number;
}): Promise<number | null> {
  const { melhorEnvioFetch } = await import("./client");
  const { getMelhorEnvioAvailableServiceIds, isAllowedCheckoutCarrierName } = await import(
    "@/lib/melhor-envio"
  );

  const services = await getMelhorEnvioAvailableServiceIds();

  let totalWeightKg = 0;
  let maxLength = 30;
  let maxWidth = 25;
  let maxHeight = 3;

  for (const item of input.items) {
    const dims = item.variant_id ? input.variantDims.get(item.variant_id) : undefined;
    const weightG = dims?.weight_grams ?? 200;
    totalWeightKg += (weightG / 1000) * item.quantity;
    maxLength = Math.max(maxLength, dims?.length_cm ?? 30);
    maxWidth = Math.max(maxWidth, dims?.width_cm ?? 25);
    maxHeight = Math.max(maxHeight, dims?.height_cm ?? 3);
  }

  const raw = await melhorEnvioFetch<
    Array<{ id: number; name: string; price: string; company?: { name: string }; error?: string }>
  >("/me/shipment/calculate", {
    method: "POST",
    json: {
      from: { postal_code: input.originZip.replace(/\D/g, "") },
      to: { postal_code: input.destinationZip.replace(/\D/g, "") },
      products: input.items.map((item) => ({
        weight: Math.max(totalWeightKg, 0.2),
        width: maxWidth,
        height: maxHeight,
        length: maxLength,
        quantity: item.quantity,
        insurance_value: 0,
      })),
      ...(services ? { services } : {}),
    },
  });

  const data = Array.isArray(raw)
    ? raw.filter(
        (row) =>
          !row.error &&
          row.id != null &&
          isAllowedCheckoutCarrierName(row.company?.name)
      )
    : [];

  const methodLower = input.shippingMethod.toLowerCase();
  const match = data.find((o) => {
    const label = o.company?.name ? `${o.company.name} ${o.name}` : o.name;
    const labelLower = label.toLowerCase();
    const priceMatch = Math.abs(Number(o.price) - input.shippingPrice) < 0.02;
    const nameMatch =
      methodLower.includes(o.name.toLowerCase()) ||
      labelLower.includes(methodLower) ||
      methodLower.includes(labelLower);
    return nameMatch || (priceMatch && methodLower.split(" ")[0] === o.name.toLowerCase());
  });

  if (match?.id) return match.id;

  if (/\bpac\b/i.test(methodLower)) {
    const pac = data.find(
      (o) => /\bpac\b/i.test(o.name) && !/\bsedex\b/i.test(o.name.toLowerCase())
    );
    if (pac?.id) return pac.id;
  }

  if (/\bsedex\b/i.test(methodLower)) {
    const sedex = data.find((o) => /\bsedex\b/i.test(o.name.toLowerCase()));
    if (sedex?.id) return sedex.id;
  }

  if (/\btotal\b/i.test(methodLower)) {
    const totalExpress = data.find((o) => /total/i.test(o.company?.name ?? o.name));
    if (totalExpress?.id) return totalExpress.id;
  }

  return data[0]?.id ?? null;
}
