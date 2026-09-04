import { melhorEnvioFetch, MelhorEnvioError } from "./client";

/** Total Express na API v2 (Melhor Envio). */
export const TOTAL_EXPRESS_COMPANY_ID = 8;

type MelhorEnvioAgencyRow = {
  id: number;
  name: string;
  address?: {
    city?: { city?: string; state?: { state_abbr?: string } };
  };
  services?: Array<{ id: number }>;
};

const agencyCache = new Map<string, { id: number; at: number }>();
const CACHE_MS = 24 * 60 * 60 * 1000;

export function melhorEnvioServiceRequiresAgency(
  serviceId: number,
  shippingMethod: string
): boolean {
  if (/\btotal\b/i.test(shippingMethod)) return true;
  // Standard (35) é o serviço Total Express habilitado na conta Iseul.
  return serviceId === 35;
}

function pickAgency(
  agencies: MelhorEnvioAgencyRow[],
  originCity: string,
  serviceId: number
): MelhorEnvioAgencyRow | null {
  if (!agencies.length) return null;

  const cityLower = originCity.trim().toLowerCase();
  const supportsService = (row: MelhorEnvioAgencyRow) =>
    !row.services?.length || row.services.some((s) => s.id === serviceId);

  const inCity = agencies.find(
    (row) =>
      supportsService(row) &&
      row.address?.city?.city?.trim().toLowerCase() === cityLower
  );
  if (inCity) return inCity;

  const anyForService = agencies.find(supportsService);
  return anyForService ?? agencies[0] ?? null;
}

/** Resolve agência de postagem obrigatória (ex.: Total Express). */
export async function resolveMelhorEnvioAgencyId(input: {
  serviceId: number;
  shippingMethod: string;
  originState: string;
  originCity?: string;
}): Promise<number | null> {
  if (!melhorEnvioServiceRequiresAgency(input.serviceId, input.shippingMethod)) {
    return null;
  }

  const envOverride = process.env.MELHOR_ENVIO_TOTAL_EXPRESS_AGENCY_ID?.trim();
  if (envOverride) {
    const parsed = Number.parseInt(envOverride, 10);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }

  const state = input.originState.toUpperCase().slice(0, 2);
  const cacheKey = `${input.serviceId}:${state}`;
  const cached = agencyCache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_MS) {
    return cached.id;
  }

  const agencies = await melhorEnvioFetch<MelhorEnvioAgencyRow[]>(
    `/me/shipment/agencies?company=${TOTAL_EXPRESS_COMPANY_ID}&state=${state}`
  );

  const picked = pickAgency(
    Array.isArray(agencies) ? agencies : [],
    input.originCity ?? "",
    input.serviceId
  );

  if (!picked?.id) {
    throw new MelhorEnvioError(
      `Nenhuma agência Total Express encontrada para ${state}. Configure MELHOR_ENVIO_TOTAL_EXPRESS_AGENCY_ID ou cadastre a agência no Melhor Envio.`
    );
  }

  agencyCache.set(cacheKey, { id: picked.id, at: Date.now() });
  return picked.id;
}
