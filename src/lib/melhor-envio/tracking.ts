import { melhorEnvioFetch } from "./client";
import type { MelhorEnvioOrderDetails } from "./types";

/** Protocolo interno do Melhor Envio (ex.: ORD-202609144606880) — não rastreia nos Correios. */
export function isMelhorEnvioProtocolCode(code: string | null | undefined): boolean {
  const value = code?.trim().toUpperCase() ?? "";
  return value.startsWith("ORD-");
}

/** Só aceita código de transportadora; nunca usa protocol/ORD como rastreio. */
export function resolveCarrierTrackingCode(input: {
  tracking?: string | null;
  protocol?: string | null;
}): string | null {
  const tracking = input.tracking?.trim() ?? "";
  if (tracking && !isMelhorEnvioProtocolCode(tracking)) {
    return tracking;
  }
  return null;
}

export async function fetchMelhorEnvioTrackingCodeWithRetry(
  meOrderId: string,
  options?: { attempts?: number; delayMs?: number }
): Promise<string | null> {
  const attempts = options?.attempts ?? 6;
  const delayMs = options?.delayMs ?? 2500;

  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      const details = await melhorEnvioFetch<MelhorEnvioOrderDetails>(`/me/orders/${meOrderId}`);
      const code = resolveCarrierTrackingCode(details);
      if (code) return code;
    } catch {
      /* tenta de novo */
    }

    if (attempt < attempts) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return null;
}
