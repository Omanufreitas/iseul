import { CONTACT_EMAIL } from "@/lib/site";
import { getAppUrl } from "@/lib/config";

export function melhorEnvioOAuthBaseUrl(): string {
  if (process.env.MELHOR_ENVIO_SANDBOX === "true") {
    return "https://sandbox.melhorenvio.com.br";
  }
  return "https://melhorenvio.com.br";
}

export const MELHOR_ENVIO_OAUTH_SCOPES = [
  "cart-read",
  "cart-write",
  "shipping-calculate",
  "shipping-companies",
  "shipping-checkout",
  "shipping-generate",
  "shipping-print",
  "orders-read",
  "purchases-read",
  "shipping-tracking",
  "users-read",
] as const;

export function getMelhorEnvioRedirectUri(): string {
  return `${getAppUrl()}/api/melhor-envio/callback`;
}

function melhorEnvioUserAgent(): string {
  return process.env.MELHOR_ENVIO_USER_AGENT?.trim() ?? `Iseul (${CONTACT_EMAIL})`;
}

export function getMelhorEnvioAuthorizeUrl(state: string): string | null {
  const clientId = process.env.MELHOR_ENVIO_CLIENT_ID?.trim();
  if (!clientId) return null;

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: getMelhorEnvioRedirectUri(),
    response_type: "code",
    state,
    scope: MELHOR_ENVIO_OAUTH_SCOPES.join(" "),
  });

  return `${melhorEnvioOAuthBaseUrl()}/oauth/authorize?${params.toString()}`;
}

type MelhorEnvioTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type?: string;
};

async function requestMelhorEnvioToken(body: Record<string, string>): Promise<MelhorEnvioTokenResponse> {
  const clientId = process.env.MELHOR_ENVIO_CLIENT_ID?.trim();
  const clientSecret = process.env.MELHOR_ENVIO_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("MELHOR_ENVIO_CLIENT_ID e MELHOR_ENVIO_CLIENT_SECRET são obrigatórios");
  }

  const res = await fetch(`${melhorEnvioOAuthBaseUrl()}/oauth/token`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": melhorEnvioUserAgent(),
    },
    body: JSON.stringify({
      client_id: Number(clientId),
      client_secret: clientSecret,
      redirect_uri: getMelhorEnvioRedirectUri(),
      ...body,
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Melhor Envio OAuth ${res.status}: ${text.slice(0, 300)}`);
  }

  return JSON.parse(text) as MelhorEnvioTokenResponse;
}

export async function exchangeMelhorEnvioAuthorizationCode(code: string): Promise<MelhorEnvioTokenResponse> {
  return requestMelhorEnvioToken({
    grant_type: "authorization_code",
    code,
  });
}

export async function refreshMelhorEnvioAccessToken(refreshToken: string): Promise<MelhorEnvioTokenResponse> {
  return requestMelhorEnvioToken({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
  });
}
