import {
  forceRefreshBlingAccessToken,
  getBlingAccessToken,
  hasBlingAppCredentials,
} from "@/lib/bling/token-store";

const BLING_API = "https://api.bling.com.br/Api/v3";

export function isBlingConfigured(): boolean {
  return hasBlingAppCredentials() || !!process.env.BLING_API_KEY?.trim();
}

async function blingRequest(
  path: string,
  token: string,
  options: RequestInit,
): Promise<Response> {
  return fetch(`${BLING_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
}

export async function blingFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ ok: true; data: T } | { ok: false; error: string }> {
  let token = await getBlingAccessToken();
  if (!token) return { ok: false, error: "Bling não configurado (tokens ausentes)" };

  let res = await blingRequest(path, token, options);

  if (res.status === 401 && hasBlingAppCredentials()) {
    token = (await forceRefreshBlingAccessToken()) ?? token;
    res = await blingRequest(path, token, options);
  }

  if (!res.ok) {
    const text = await res.text();
    return { ok: false, error: `Bling ${res.status}: ${text.slice(0, 1500)}` };
  }

  const text = await res.text();
  if (!text.trim()) {
    return { ok: true, data: {} as T };
  }

  const data = JSON.parse(text) as T;
  return { ok: true, data };
}
