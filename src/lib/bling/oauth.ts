import { getAppUrl } from "@/lib/config";

export function getBlingRedirectUri(): string {
  return `${getAppUrl()}/api/bling/callback`;
}

export function getBlingAuthorizeUrl(state: string): string | null {
  const clientId = process.env.BLING_CLIENT_ID?.trim();
  if (!clientId) return null;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    state,
  });

  return `https://api.bling.com.br/Api/v3/oauth/authorize?${params.toString()}`;
}

export async function exchangeBlingAuthorizationCode(code: string): Promise<{
  access_token: string;
  refresh_token: string;
  expires_in: number;
}> {
  const clientId = process.env.BLING_CLIENT_ID?.trim();
  const clientSecret = process.env.BLING_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    throw new Error("BLING_CLIENT_ID e BLING_CLIENT_SECRET são obrigatórios");
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://api.bling.com.br/Api/v3/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${basic}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getBlingRedirectUri(),
    }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Bling OAuth ${res.status}: ${text.slice(0, 300)}`);
  }

  return JSON.parse(text) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };
}
