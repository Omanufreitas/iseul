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

/** Chaves Asaas começam com $. Se o .env tiver `\$aact_...`, removemos a barra. */
export function getAsaasApiKey(): string {
  let key = process.env.ASAAS_API_KEY?.trim() ?? "";
  if (key.startsWith("\\$")) key = key.slice(1);
  else if (key.startsWith("\\") && key.includes("$aact")) {
    key = key.replace(/^\\+/, "");
  }
  return key;
}

export function isAsaasConfigured(): boolean {
  return !!getAsaasApiKey();
}

/** @deprecated Mercado Pago removido — use isAsaasConfigured */
export function isMercadoPagoConfigured(): boolean {
  return false;
}

export function isCheckoutConfigured(): boolean {
  return isAsaasConfigured();
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

/** Credenciais de fallback quando Supabase não está configurado */
export function getDemoAdminCredentials() {
  return {
    email: (process.env.DEMO_ADMIN_EMAIL ?? "manu.oficial93@gmail.com").trim().toLowerCase(),
    password: process.env.DEMO_ADMIN_PASSWORD ?? "123456",
    name: process.env.DEMO_ADMIN_NAME ?? "Manu",
  };
}
