import { CONTACT_EMAIL } from "@/lib/site";

export class MelhorEnvioError extends Error {
  constructor(
    message: string,
    public status?: number,
    public body?: unknown
  ) {
    super(message);
    this.name = "MelhorEnvioError";
  }
}

export function isMelhorEnvioConfigured(): boolean {
  return !!process.env.MELHOR_ENVIO_TOKEN?.trim();
}

export function melhorEnvioBaseUrl(): string {
  if (process.env.MELHOR_ENVIO_SANDBOX === "true") {
    return "https://sandbox.melhorenvio.com.br/api/v2";
  }
  return "https://melhorenvio.com.br/api/v2";
}

export async function melhorEnvioFetch<T>(
  path: string,
  options: RequestInit & { json?: unknown } = {}
): Promise<T> {
  const token = process.env.MELHOR_ENVIO_TOKEN?.trim();
  if (!token) {
    throw new MelhorEnvioError("MELHOR_ENVIO_TOKEN não configurado");
  }

  const userAgent =
    process.env.MELHOR_ENVIO_USER_AGENT?.trim() ?? `Iseul (${CONTACT_EMAIL})`;

  const { json, headers, ...rest } = options;
  const res = await fetch(`${melhorEnvioBaseUrl()}${path}`, {
    ...rest,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": userAgent,
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    let msg =
      typeof data === "object" && data !== null && "message" in data
        ? String((data as { message: string }).message)
        : typeof data === "object" && data !== null && "error" in data
          ? String((data as { error: string }).error)
          : `Melhor Envio HTTP ${res.status}`;

    if (typeof data === "object" && data !== null && "errors" in data) {
      const errors = (data as { errors: Record<string, string[]> }).errors;
      const first = Object.values(errors ?? {})[0]?.[0];
      if (first) msg = first;
    }

    throw new MelhorEnvioError(msg, res.status, data);
  }

  return data as T;
}
