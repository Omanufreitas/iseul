import { getAsaasApiKey, isAsaasConfigured } from "@/lib/config";
import { ASAAS_CHECKOUT_PLACEHOLDER_IMAGE_BASE64 } from "@/lib/asaas-constants";
import { normalizePostalCode } from "@/lib/melhor-envio";
import { resolveStoreOrigin } from "@/lib/store-url";

type AsaasResult<T> = { ok: true; data: T } | { ok: false; error: string };

type AsaasErrorBody = {
  errors?: { code?: string; description?: string }[];
};

export type CheckoutItem = {
  title: string;
  quantity: number;
  unit_price: number;
};

export type CheckoutPayer = {
  email: string;
  full_name: string;
  cpf: string;
  phone: string;
  zip: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  city_ibge: number;
};

export type AsaasCheckoutSession = {
  id: string;
  link: string;
};

export type AsaasPayment = {
  id: string;
  status: string;
  value?: number;
  externalReference?: string | null;
  subscription?: string | null;
  customer?: string | null;
  checkoutSession?: string | null;
  billingType?: string;
};

const CONFIRMED_PAYMENT_STATUSES = new Set([
  "CONFIRMED",
  "RECEIVED",
  "RECEIVED_IN_CASH",
  "AUTHORIZED",
]);

/** Máximo de parcelas no cartão (juros configurados no painel Asaas). */
export const ASAAS_MAX_INSTALLMENTS = 12;

function asaasApiBase(): string {
  const env = process.env.ASAAS_ENV?.trim().toLowerCase();
  if (env === "sandbox") return "https://api-sandbox.asaas.com";
  if (env === "production") return "https://api.asaas.com";
  const key = getAsaasApiKey();
  if (key.includes("_test_") || key.startsWith("$aact_hmlg")) {
    return "https://api-sandbox.asaas.com";
  }
  return "https://api.asaas.com";
}

function asaasHeaders(): HeadersInit {
  return {
    access_token: getAsaasApiKey(),
    "Content-Type": "application/json",
    "User-Agent": "Iseul/1.0",
  };
}

async function asaasFetch<T>(path: string, init?: RequestInit): Promise<AsaasResult<T>> {
  const res = await fetch(`${asaasApiBase()}${path}`, {
    ...init,
    headers: { ...asaasHeaders(), ...init?.headers },
  });

  if (!res.ok) {
    let message = res.statusText;
    try {
      const body = (await res.json()) as AsaasErrorBody;
      message =
        body.errors?.map((e) => e.description ?? e.code).filter(Boolean).join("; ") ||
        message;
    } catch {
      message = (await res.text()) || message;
    }
    return { ok: false, error: `Asaas: ${message}` };
  }

  return { ok: true, data: (await res.json()) as T };
}

function normalizeAsaasPhone(phone: string): string {
  let digits = phone.replace(/\D/g, "");
  if (digits.length === 13 && digits.startsWith("55")) digits = digits.slice(2);
  if (digits.length > 11) digits = digits.slice(-11);
  return digits;
}

function normalizeAsaasAddressNumber(number: string): number {
  const parsed = Number.parseInt(number.replace(/\D/g, ""), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
}

function canUseHostedCheckout(appUrl: string): boolean {
  try {
    const u = new URL(appUrl);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return true;
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

export function isConfirmedAsaasPaymentStatus(status: string | undefined): boolean {
  return !!status && CONFIRMED_PAYMENT_STATUSES.has(status);
}

export function pickConfirmedAsaasPayment(payments: AsaasPayment[]): AsaasPayment | null {
  return (
    payments.find((p) => p.status === "CONFIRMED" || p.status === "RECEIVED" || p.status === "RECEIVED_IN_CASH") ??
    payments.find((p) => p.status === "AUTHORIZED") ??
    null
  );
}

/** Checkout avulso (PIX ou cartão) para pedidos da loja. */
export async function createStoreAsaasCheckout(
  orderId: string,
  payer: CheckoutPayer,
  items: CheckoutItem[],
  shipping: number,
  billingTypes: Array<"PIX" | "CREDIT_CARD">,
  requestOrigin?: string | null
): Promise<{ ok: true; initPoint: string; checkoutId: string } | { ok: false; error: string }> {
  if (!isAsaasConfigured()) {
    return { ok: false, error: "Asaas não configurado. Adicione ASAAS_API_KEY." };
  }

  const appUrl = resolveStoreOrigin(requestOrigin);
  if (!appUrl || !canUseHostedCheckout(appUrl)) {
    return {
      ok: false,
      error: "Configure NEXT_PUBLIC_APP_URL com https:// na Vercel (não use localhost em produção).",
    };
  }

  const cpfCnpj = payer.cpf.replace(/\D/g, "");
  const phone = normalizeAsaasPhone(payer.phone);
  const postalCode = normalizePostalCode(payer.zip);
  const cityIbge = Number(payer.city_ibge);

  if (phone.length < 10) {
    return { ok: false, error: "Telefone inválido. Informe DDD + número." };
  }
  if (postalCode.length !== 8) {
    return { ok: false, error: "CEP inválido. Informe 8 dígitos." };
  }
  if (!Number.isFinite(cityIbge) || cityIbge <= 0) {
    return { ok: false, error: "CEP não encontrado. Aguarde o preenchimento automático do endereço." };
  }

  const asaasItems = items.map((item) => ({
    name: item.title.slice(0, 30),
    description: item.title.slice(0, 150),
    quantity: item.quantity,
    value: Math.round(item.unit_price * 100) / 100,
    imageBase64: ASAAS_CHECKOUT_PLACEHOLDER_IMAGE_BASE64,
  }));

  if (shipping > 0) {
    asaasItems.push({
      name: "Frete",
      description: "Frete Iseul",
      quantity: 1,
      value: Math.round(shipping * 100) / 100,
      imageBase64: ASAAS_CHECKOUT_PLACEHOLDER_IMAGE_BASE64,
    });
  }

  const body = {
    billingTypes,
    chargeTypes: billingTypes.includes("CREDIT_CARD")
      ? (["DETACHED", "INSTALLMENT"] as const)
      : (["DETACHED"] as const),
    installment: billingTypes.includes("CREDIT_CARD")
      ? {
          maxInstallmentCount: ASAAS_MAX_INSTALLMENTS,
        }
      : undefined,
    minutesToExpire: 120,
    externalReference: orderId,
    callback: {
      successUrl: `${appUrl}/obrigado?order=${orderId}`,
      cancelUrl: `${appUrl}/checkout?status=failure&order=${orderId}`,
      expiredUrl: `${appUrl}/checkout/aguardando?order=${orderId}`,
    },
    items: asaasItems,
    customerData: {
      name: payer.full_name.slice(0, 80),
      email: payer.email.trim().toLowerCase(),
      cpfCnpj,
      phone,
      address: payer.street.slice(0, 120),
      addressNumber: normalizeAsaasAddressNumber(payer.number),
      complement: payer.complement?.slice(0, 255) || undefined,
      postalCode,
      province: payer.neighborhood.slice(0, 80),
      city: cityIbge,
    },
  };

  const result = await asaasFetch<AsaasCheckoutSession>("/v3/checkouts", {
    method: "POST",
    body: JSON.stringify(body),
  });

  if (!result.ok) return result;
  if (!result.data.link || !result.data.id) {
    return { ok: false, error: "Resposta inválida do Asaas (checkout)." };
  }

  return { ok: true, initPoint: result.data.link, checkoutId: result.data.id };
}

export async function getAsaasPayment(paymentId: string): Promise<AsaasPayment | null> {
  if (!isAsaasConfigured()) return null;
  const result = await asaasFetch<AsaasPayment>(`/v3/payments/${paymentId}`);
  return result.ok ? result.data : null;
}

export async function listPaymentsByExternalReference(
  externalReference: string
): Promise<AsaasPayment[]> {
  if (!isAsaasConfigured()) return [];
  const params = new URLSearchParams({ externalReference, limit: "20" });
  const result = await asaasFetch<{ data: AsaasPayment[] }>(`/v3/payments?${params}`);
  return result.ok ? result.data.data ?? [] : [];
}

export async function listPaymentsByCheckoutSession(
  checkoutSessionId: string,
): Promise<AsaasPayment[]> {
  if (!isAsaasConfigured()) return [];
  const params = new URLSearchParams({ checkoutSession: checkoutSessionId, limit: "20" });
  const result = await asaasFetch<{ data: AsaasPayment[] }>(`/v3/payments?${params}`);
  return result.ok ? result.data.data ?? [] : [];
}

export async function findConfirmedPaymentForReference(
  externalReference: string,
  checkoutSessionId?: string | null,
): Promise<AsaasPayment | null> {
  const byReference = pickConfirmedAsaasPayment(
    await listPaymentsByExternalReference(externalReference),
  );
  if (byReference) return byReference;

  if (!checkoutSessionId) return null;
  return pickConfirmedAsaasPayment(await listPaymentsByCheckoutSession(checkoutSessionId));
}
