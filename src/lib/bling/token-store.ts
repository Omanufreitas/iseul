import { createAdminClient } from "@/lib/supabase/client";

const BLING_TOKEN_URL = "https://www.bling.com.br/Api/v3/oauth/token";
const REFRESH_BUFFER_MS = 5 * 60 * 1000;

type BlingTokenRow = {
  access_token: string;
  refresh_token: string;
  expires_at: string;
};

type BlingTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

let refreshPromise: Promise<string> | null = null;

/** App OAuth cadastrado na Vercel (client id + secret). */
export function hasBlingAppCredentials(): boolean {
  return !!(
    process.env.BLING_CLIENT_ID?.trim() && process.env.BLING_CLIENT_SECRET?.trim()
  );
}

/** Credenciais legadas no env (refresh/api key) — fallback dev/ops. */
export function hasBlingOAuthCredentials(): boolean {
  return (
    hasBlingAppCredentials() &&
    !!(process.env.BLING_REFRESH_TOKEN?.trim() || process.env.BLING_API_KEY?.trim())
  );
}

async function loadTokensFromDb(): Promise<BlingTokenRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("bling_oauth_tokens")
    .select("access_token, refresh_token, expires_at")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("[bling] erro ao ler tokens:", error.message);
    return null;
  }
  return data;
}

export async function saveBlingTokensToDb(tokens: BlingTokenRow): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("bling_oauth_tokens").upsert({
    id: 1,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: tokens.expires_at,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Falha ao persistir tokens Bling: ${error.message}`);
  }
}

async function seedTokensFromEnv(): Promise<BlingTokenRow | null> {
  const access = process.env.BLING_API_KEY?.trim();
  const refresh = process.env.BLING_REFRESH_TOKEN?.trim();
  if (!access || !refresh) return null;

  const row: BlingTokenRow = {
    access_token: access,
    refresh_token: refresh,
    expires_at: new Date(Date.now() + 21600 * 1000).toISOString(),
  };

  try {
    await saveBlingTokensToDb(row);
    return row;
  } catch {
    return row;
  }
}

async function requestTokenRefresh(refreshToken: string): Promise<BlingTokenRow> {
  const clientId = process.env.BLING_CLIENT_ID?.trim();
  const clientSecret = process.env.BLING_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("BLING_CLIENT_ID e BLING_CLIENT_SECRET são obrigatórios para renovar o token");
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(BLING_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Bling refresh ${res.status}: ${text.slice(0, 300)}`);
  }

  const data = JSON.parse(text) as BlingTokenResponse;
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: new Date(Date.now() + data.expires_in * 1000).toISOString(),
  };
}

function isTokenValid(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() - Date.now() > REFRESH_BUFFER_MS;
}

async function refreshAndPersist(refreshToken: string): Promise<string> {
  const refreshed = await requestTokenRefresh(refreshToken);
  await saveBlingTokensToDb(refreshed);
  return refreshed.access_token;
}

async function ensureValidAccessToken(force = false): Promise<string | null> {
  const apiKeyOnly = process.env.BLING_API_KEY?.trim();

  if (!hasBlingAppCredentials()) {
    return apiKeyOnly ?? null;
  }

  let stored = await loadTokensFromDb();
  if (!stored) {
    stored = await seedTokensFromEnv();
  }

  if (stored && !force && isTokenValid(stored.expires_at)) {
    return stored.access_token;
  }

  const refreshToken = stored?.refresh_token ?? process.env.BLING_REFRESH_TOKEN?.trim();
  if (!refreshToken) {
    return stored?.access_token ?? apiKeyOnly ?? null;
  }

  if (!refreshPromise) {
    refreshPromise = refreshAndPersist(refreshToken).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function getBlingAccessToken(): Promise<string | null> {
  return ensureValidAccessToken(false);
}

export async function forceRefreshBlingAccessToken(): Promise<string | null> {
  return ensureValidAccessToken(true);
}

export async function getBlingTokenExpiry(): Promise<string | null> {
  const stored = (await loadTokensFromDb()) ?? (await seedTokensFromEnv());
  return stored?.expires_at ?? null;
}

/** True quando OAuth foi autorizado e há refresh token salvo no Supabase. */
export async function isBlingOAuthConnected(): Promise<boolean> {
  const stored = (await loadTokensFromDb()) ?? (await seedTokensFromEnv());
  return !!stored?.refresh_token;
}
