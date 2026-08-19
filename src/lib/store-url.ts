const LOCALHOST_HOSTS = new Set(["localhost", "127.0.0.1", "[::1]"]);

export function normalizeStoreOrigin(raw: string | null | undefined): string | null {
  if (!raw?.trim()) return null;
  try {
    const withProtocol = /^https?:\/\//i.test(raw) ? raw.trim() : `https://${raw.trim()}`;
    const url = new URL(withProtocol);
    if (!url.hostname) return null;
    return `${url.protocol}//${url.host}`.replace(/\/+$/, "");
  } catch {
    return null;
  }
}

export function resolveStoreOrigin(requestOrigin?: string | null): string | null {
  const fromRequest = normalizeStoreOrigin(requestOrigin);
  if (fromRequest) return fromRequest;

  const fromEnv = normalizeStoreOrigin(process.env.NEXT_PUBLIC_APP_URL);
  if (fromEnv) return fromEnv;

  const vercel = normalizeStoreOrigin(
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : null
  );
  if (vercel) return vercel;

  return "http://localhost:3000";
}

export function isValidMercadoPagoBackUrl(appUrl: string, isProductionToken: boolean): boolean {
  try {
    const u = new URL(appUrl);
    if (LOCALHOST_HOSTS.has(u.hostname)) {
      return !isProductionToken;
    }
    return u.protocol === "https:";
  } catch {
    return false;
  }
}
