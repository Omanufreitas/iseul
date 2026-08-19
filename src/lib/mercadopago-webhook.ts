import { createHmac, timingSafeEqual } from "crypto";

type WebhookHeaders = {
  signature: string | null;
  requestId: string | null;
};

export function isMercadoPagoIpnRequest(searchParams: URLSearchParams): boolean {
  return searchParams.has("topic") && !searchParams.has("type");
}

export function extractMercadoPagoWebhookDataId(
  searchParams: URLSearchParams,
  body?: Record<string, unknown>
): string | null {
  const fromQuery = searchParams.get("data.id") ?? searchParams.get("id");
  if (fromQuery) return fromQuery;

  const dataId = body?.data as { id?: string | number } | undefined;
  if (dataId?.id != null) return String(dataId.id);
  if (body?.id != null) return String(body.id);

  return null;
}

export function resolveMercadoPagoWebhookSecret(): string | null {
  const raw = process.env.MERCADOPAGO_WEBHOOK_SECRET?.trim();
  if (!raw) return null;
  if (/^https?:\/\//i.test(raw)) return null;
  if (/example\.com/i.test(raw)) return null;
  if (raw.length < 8) return null;
  return raw;
}

export function mercadoPagoWebhookNotificationUrl(appUrl: string): string {
  const base = appUrl.replace(/\/+$/, "");
  return `${base}/api/webhooks/mercadopago?source_news=webhooks`;
}

function parseSignatureHeader(header: string | null): { ts: string; v1: string } | null {
  if (!header) return null;
  const parts = Object.fromEntries(
    header.split(",").map((part) => {
      const [key, ...rest] = part.split("=");
      return [key.trim(), rest.join("=").trim()];
    })
  );
  if (!parts.ts || !parts.v1) return null;
  return { ts: parts.ts, v1: parts.v1 };
}

export function verifyMercadoPagoWebhookSignature(
  dataId: string,
  headers: WebhookHeaders
): boolean {
  const secret = resolveMercadoPagoWebhookSecret();
  if (!secret) return true;

  const parsed = parseSignatureHeader(headers.signature);
  if (!parsed) return false;

  const manifest = `id:${dataId};request-id:${headers.requestId ?? ""};ts:${parsed.ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(parsed.v1), Buffer.from(expected));
  } catch {
    return false;
  }
}
