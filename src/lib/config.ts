import { normalizeStoreOrigin } from "@/lib/store-url";

export function getAppUrl(): string {
  const fromEnv = normalizeStoreOrigin(process.env.NEXT_PUBLIC_APP_URL);
  if (fromEnv) return fromEnv;

  const vercelProd = normalizeStoreOrigin(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null
  );
  if (vercelProd) return vercelProd;

  return "http://localhost:3000";
}

export function isSupabaseConfigured(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isMercadoPagoConfigured(): boolean {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  return !!token && token.length > 10;
}

export function getFreeShippingThreshold(): number {
  const raw = process.env.FREE_SHIPPING_THRESHOLD;
  if (raw) {
    const n = Number(raw);
    return n > 1000 ? n / 100 : n;
  }
  return 199;
}

export function getPixDiscountPercent(): number {
  return Number(process.env.PIX_DISCOUNT_PERCENT ?? 5);
}

export function isMockCatalogEnabled(): boolean {
  if (process.env.NEXT_PUBLIC_USE_MOCK_CATALOG === "true") return true;
  return !isSupabaseConfigured();
}
