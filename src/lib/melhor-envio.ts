import { CONTACT_EMAIL } from "@/lib/site";
import { getMelhorEnvioAccessToken } from "@/lib/melhor-envio/token-store";

const PRODUCTION_BASE = "https://melhorenvio.com.br";
const SANDBOX_BASE = "https://sandbox.melhorenvio.com.br";

/** Dimensões padrão para cosméticos (cm / kg) quando o produto não tem medidas cadastradas. */
export const DEFAULT_PRODUCT_SHIPPING = {
  width: 8,
  height: 15,
  length: 8,
  weight: 0.25,
} as const;

export type MelhorEnvioProductInput = {
  id: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  insurance_value: number;
  quantity: number;
};

export type MelhorEnvioQuoteOption = {
  id: number;
  name: string;
  company: string;
  price: number;
  deliveryDays: number;
};

type MelhorEnvioRawQuote = {
  id?: number;
  name?: string;
  price?: string;
  custom_price?: string;
  custom_delivery_time?: number;
  delivery_time?: number;
  error?: string;
  company?: { id?: number; name?: string };
};

function apiBaseUrl(): string {
  return process.env.MELHOR_ENVIO_SANDBOX === "true" ? SANDBOX_BASE : PRODUCTION_BASE;
}

export function isMelhorEnvioConfigured(): boolean {
  const hasToken = !!process.env.MELHOR_ENVIO_TOKEN?.trim();
  const hasOAuth = !!(
    process.env.MELHOR_ENVIO_CLIENT_ID?.trim() &&
    process.env.MELHOR_ENVIO_CLIENT_SECRET?.trim() &&
    (process.env.MELHOR_ENVIO_REFRESH_TOKEN?.trim() || hasToken)
  );
  return !!(
    (hasToken || hasOAuth) &&
    normalizePostalCode(process.env.MELHOR_ENVIO_ORIGIN_POSTAL_CODE ?? "79072266")
  );
}

export function getMelhorEnvioOriginPostalCode(): string {
  return normalizePostalCode(process.env.MELHOR_ENVIO_ORIGIN_POSTAL_CODE ?? "79072266");
}

export function normalizePostalCode(cep: string): string {
  return cep.replace(/\D/g, "").slice(0, 8);
}

export function isAllowedCheckoutCarrierName(companyName: string | undefined): boolean {
  const name = (companyName ?? "").toLowerCase();
  return name.includes("correios") || name.includes("total");
}

export function isAllowedCheckoutShippingOption(option: MelhorEnvioQuoteOption): boolean {
  return isAllowedCheckoutCarrierName(option.company);
}

export function filterAllowedCheckoutShippingOptions(
  options: MelhorEnvioQuoteOption[]
): MelhorEnvioQuoteOption[] {
  return options.filter(isAllowedCheckoutShippingOption);
}

function parseQuotePrice(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

type MelhorEnvioServiceRow = {
  id: number;
  status?: string;
  company?: { id?: number; name?: string };
};

const SERVICE_IDS_CACHE_MS = 60 * 60 * 1000;
let cachedServiceIds: { ids: string; at: number } | null = null;

function melhorEnvioUserAgent(): string {
  return process.env.MELHOR_ENVIO_USER_AGENT?.trim() ?? `Iseul (${CONTACT_EMAIL})`;
}

/** IDs das transportadoras habilitadas na conta (cache 1h). */
export async function getMelhorEnvioAvailableServiceIds(): Promise<string | null> {
  if (cachedServiceIds && Date.now() - cachedServiceIds.at < SERVICE_IDS_CACHE_MS) {
    return cachedServiceIds.ids;
  }

  const token = (await getMelhorEnvioAccessToken())?.trim();
  if (!token) return null;

  const res = await fetch(`${apiBaseUrl()}/api/v2/me/shipment/services`, {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": melhorEnvioUserAgent(),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("[melhor-envio] services failed", res.status, await res.text().catch(() => ""));
    return null;
  }

  const data = (await res.json()) as MelhorEnvioServiceRow[];
  if (!Array.isArray(data)) return null;

  const ids = data
    .filter(
      (row) =>
        row.status === "available" &&
        row.id != null &&
        isAllowedCheckoutCarrierName(row.company?.name)
    )
    .map((row) => row.id)
    .join(",");

  if (ids) {
    cachedServiceIds = { ids, at: Date.now() };
  }

  return ids || null;
}

function normalizeCalculateResponse(data: unknown): MelhorEnvioRawQuote[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object" && "id" in data) {
    return [data as MelhorEnvioRawQuote];
  }
  return [];
}

function mapRawQuotes(data: MelhorEnvioRawQuote[]): MelhorEnvioQuoteOption[] {
  return data
    .filter((row) => !row.error && row.id != null && row.name)
    .map((row) => {
      const price =
        parseQuotePrice(row.custom_price) ??
        parseQuotePrice(row.price) ??
        Number.POSITIVE_INFINITY;
      return {
        id: row.id!,
        name: row.name!,
        company: row.company?.name ?? "Transportadora",
        price,
        deliveryDays: row.custom_delivery_time ?? row.delivery_time ?? 0,
      };
    })
    .filter((row) => Number.isFinite(row.price) && isAllowedCheckoutCarrierName(row.company));
}

export async function calculateMelhorEnvioQuotes(
  destinationPostalCode: string,
  products: MelhorEnvioProductInput[]
): Promise<MelhorEnvioQuoteOption[]> {
  const token = (await getMelhorEnvioAccessToken())?.trim();
  if (!token) return [];

  const from = getMelhorEnvioOriginPostalCode();
  const to = normalizePostalCode(destinationPostalCode);
  if (from.length !== 8 || to.length !== 8 || products.length === 0) return [];

  const services = await getMelhorEnvioAvailableServiceIds();

  const res = await fetch(`${apiBaseUrl()}/api/v2/me/shipment/calculate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": melhorEnvioUserAgent(),
    },
    body: JSON.stringify({
      from: { postal_code: from },
      to: { postal_code: to },
      products,
      ...(services ? { services } : {}),
      options: {
        receipt: false,
        own_hand: false,
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    console.error("[melhor-envio] calculate failed", res.status, await res.text().catch(() => ""));
    return [];
  }

  const data = normalizeCalculateResponse(await res.json());
  return mapRawQuotes(data);
}

export function pickCheapestQuote(quotes: MelhorEnvioQuoteOption[]): MelhorEnvioQuoteOption | null {
  if (!quotes.length) return null;
  return quotes.reduce((best, current) => (current.price < best.price ? current : best));
}
