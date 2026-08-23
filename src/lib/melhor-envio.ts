import { CONTACT_EMAIL } from "@/lib/site";

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
  return !!(
    process.env.MELHOR_ENVIO_TOKEN?.trim() &&
    normalizePostalCode(process.env.MELHOR_ENVIO_ORIGIN_POSTAL_CODE ?? "79072266")
  );
}

export function getMelhorEnvioOriginPostalCode(): string {
  return normalizePostalCode(process.env.MELHOR_ENVIO_ORIGIN_POSTAL_CODE ?? "79072266");
}

export function normalizePostalCode(cep: string): string {
  return cep.replace(/\D/g, "").slice(0, 8);
}

function parseQuotePrice(value: string | undefined): number | null {
  if (!value) return null;
  const n = Number(value.replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export async function calculateMelhorEnvioQuotes(
  destinationPostalCode: string,
  products: MelhorEnvioProductInput[]
): Promise<MelhorEnvioQuoteOption[]> {
  const token = process.env.MELHOR_ENVIO_TOKEN?.trim();
  if (!token) return [];

  const from = getMelhorEnvioOriginPostalCode();
  const to = normalizePostalCode(destinationPostalCode);
  if (from.length !== 8 || to.length !== 8 || products.length === 0) return [];

  const userAgent =
    process.env.MELHOR_ENVIO_USER_AGENT?.trim() ??
    `Iseul (${CONTACT_EMAIL})`;

  const res = await fetch(`${apiBaseUrl()}/api/v2/me/shipment/calculate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      "User-Agent": userAgent,
    },
    body: JSON.stringify({
      from: { postal_code: from },
      to: { postal_code: to },
      products,
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

  const data = (await res.json()) as MelhorEnvioRawQuote[] | { message?: string };
  if (!Array.isArray(data)) return [];

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
    .filter((row) => Number.isFinite(row.price));
}

export function pickCheapestQuote(quotes: MelhorEnvioQuoteOption[]): MelhorEnvioQuoteOption | null {
  if (!quotes.length) return null;
  return quotes.reduce((best, current) => (current.price < best.price ? current : best));
}
