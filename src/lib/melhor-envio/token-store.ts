import { createAdminClient } from "@/lib/supabase/client";
import { refreshMelhorEnvioAccessToken } from "./oauth";

const REFRESH_BUFFER_MS = 24 * 60 * 60 * 1000;

type MelhorEnvioTokenRow = {
  access_token: string;
  refresh_token: string;
  expires_at: string;
};

let refreshPromise: Promise<string> | null = null;

export function hasMelhorEnvioAppCredentials(): boolean {
  return !!(
    process.env.MELHOR_ENVIO_CLIENT_ID?.trim() &&
    process.env.MELHOR_ENVIO_CLIENT_SECRET?.trim()
  );
}

export function hasMelhorEnvioOAuthCredentials(): boolean {
  return (
    hasMelhorEnvioAppCredentials() &&
    !!(process.env.MELHOR_ENVIO_REFRESH_TOKEN?.trim() || process.env.MELHOR_ENVIO_TOKEN?.trim())
  );
}

async function loadTokensFromDb(): Promise<MelhorEnvioTokenRow | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("melhor_envio_oauth_tokens")
    .select("access_token, refresh_token, expires_at")
    .eq("id", 1)
    .maybeSingle();

  if (error) {
    console.error("[melhor-envio] erro ao ler tokens:", error.message);
    return null;
  }
  return data;
}

export async function saveMelhorEnvioTokensToDb(tokens: MelhorEnvioTokenRow): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin.from("melhor_envio_oauth_tokens").upsert({
    id: 1,
    access_token: tokens.access_token,
    refresh_token: tokens.refresh_token,
    expires_at: tokens.expires_at,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Falha ao persistir tokens Melhor Envio: ${error.message}`);
  }
}

async function seedTokensFromEnv(): Promise<MelhorEnvioTokenRow | null> {
  const access = process.env.MELHOR_ENVIO_TOKEN?.trim();
  const refresh = process.env.MELHOR_ENVIO_REFRESH_TOKEN?.trim();
  if (!access || !refresh) return null;

  const row: MelhorEnvioTokenRow = {
    access_token: access,
    refresh_token: refresh,
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  };

  try {
    await saveMelhorEnvioTokensToDb(row);
    return row;
  } catch {
    return row;
  }
}

function isTokenValid(expiresAt: string): boolean {
  return new Date(expiresAt).getTime() - Date.now() > REFRESH_BUFFER_MS;
}

async function refreshAndPersist(refreshToken: string): Promise<string> {
  const refreshed = await refreshMelhorEnvioAccessToken(refreshToken);
  await saveMelhorEnvioTokensToDb({
    access_token: refreshed.access_token,
    refresh_token: refreshed.refresh_token,
    expires_at: new Date(Date.now() + refreshed.expires_in * 1000).toISOString(),
  });
  return refreshed.access_token;
}

async function ensureValidAccessToken(force = false): Promise<string | null> {
  const envToken = process.env.MELHOR_ENVIO_TOKEN?.trim();

  if (!hasMelhorEnvioAppCredentials()) {
    return envToken ?? null;
  }

  let stored = await loadTokensFromDb();
  if (!stored) {
    stored = await seedTokensFromEnv();
  }

  if (stored && !force && isTokenValid(stored.expires_at)) {
    return stored.access_token;
  }

  const refreshToken = stored?.refresh_token ?? process.env.MELHOR_ENVIO_REFRESH_TOKEN?.trim();
  if (!refreshToken) {
    return stored?.access_token ?? envToken ?? null;
  }

  if (!refreshPromise) {
    refreshPromise = refreshAndPersist(refreshToken).finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

export async function getMelhorEnvioAccessToken(): Promise<string | null> {
  return ensureValidAccessToken(false);
}

export async function getMelhorEnvioTokenExpiry(): Promise<string | null> {
  const stored = (await loadTokensFromDb()) ?? (await seedTokensFromEnv());
  return stored?.expires_at ?? null;
}

export async function isMelhorEnvioOAuthConnected(): Promise<boolean> {
  const stored = (await loadTokensFromDb()) ?? (await seedTokensFromEnv());
  return !!stored?.refresh_token;
}
