import { CONTACT_EMAIL } from "@/lib/site";
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
  return toMeAddress({
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

  return {
    service: input.serviceId,
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
      non_commercial: false,
    },
  };
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

  const data = await melhorEnvioFetch<
    Array<{ id: number; name: string; price: string; company?: { name: string } }>
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
    },
  });

  const methodLower = input.shippingMethod.toLowerCase();
  const match = data.find((o) => {
    const label = o.company?.name ? `${o.company.name} ${o.name}` : o.name;
    const priceMatch = Math.abs(Number(o.price) - input.shippingPrice) < 0.02;
    const nameMatch =
      methodLower.includes(o.name.toLowerCase()) ||
      label.toLowerCase().includes(methodLower) ||
      methodLower.includes(label.toLowerCase());
    return nameMatch || (priceMatch && methodLower.split(" ")[0] === o.name.toLowerCase());
  });

  return match?.id ?? data[0]?.id ?? null;
}
