import { isMercadoPagoConfigured } from "@/lib/config";
import { mercadoPagoWebhookNotificationUrl } from "@/lib/mercadopago-webhook";
import { isValidMercadoPagoBackUrl, resolveStoreOrigin } from "@/lib/store-url";

type CheckoutResult = { ok: true; initPoint: string } | { ok: false; error: string };

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
  neighborhood: string;
  city: string;
  state: string;
};

function splitFullName(fullName: string): { name: string; surname: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return { name: "Cliente", surname: "Iseul" };
  if (parts.length === 1) return { name: parts[0], surname: parts[0] };
  return { name: parts[0], surname: parts.slice(1).join(" ") };
}

function buildMercadoPagoPayer(payer: CheckoutPayer) {
  const cpfCnpj = payer.cpf.replace(/\D/g, "");
  const phone = payer.phone.replace(/\D/g, "");
  const { name, surname } = splitFullName(payer.full_name);

  return {
    email: payer.email.trim().toLowerCase(),
    name,
    surname,
    phone: {
      area_code: phone.length >= 10 ? phone.slice(0, 2) : "11",
      number: phone.length >= 10 ? phone.slice(2) : phone || "999999999",
    },
    identification: {
      type: cpfCnpj.length > 11 ? "CNPJ" : "CPF",
      number: cpfCnpj,
    },
    address: {
      zip_code: payer.zip.replace(/\D/g, ""),
      street_name: payer.street.trim(),
      street_number: payer.number.trim() || "S/N",
      neighborhood: payer.neighborhood.trim(),
      city: payer.city.trim(),
      federal_unit: payer.state.trim().toUpperCase(),
    },
  };
}

function canUseAutoReturn(appUrl: string): boolean {
  try {
    const u = new URL(appUrl);
    if (u.hostname === "localhost" || u.hostname === "127.0.0.1") return false;
    return u.protocol === "https:";
  } catch {
    return false;
  }
}

export async function createStoreCheckoutPreference(
  orderId: string,
  payer: CheckoutPayer,
  items: CheckoutItem[],
  shipping: number,
  requestOrigin?: string | null
): Promise<CheckoutResult> {
  if (!isMercadoPagoConfigured()) {
    return { ok: false, error: "Mercado Pago não configurado." };
  }

  const token = process.env.MERCADOPAGO_ACCESS_TOKEN!;
  const isProductionToken = !token.startsWith("TEST-");
  const appUrl = resolveStoreOrigin(requestOrigin);

  if (!appUrl || !isValidMercadoPagoBackUrl(appUrl, isProductionToken)) {
    return {
      ok: false,
      error: isProductionToken
        ? "Configure NEXT_PUBLIC_APP_URL com https:// na Vercel (não use localhost)."
        : "URL da loja inválida para checkout Mercado Pago.",
    };
  }

  const useAutoReturn = canUseAutoReturn(appUrl);
  const isTestToken = token.startsWith("TEST-");

  const mpItems = items.map((item, i) => ({
    id: `item-${i}`,
    title: item.title.slice(0, 256),
    quantity: item.quantity,
    currency_id: "BRL",
    unit_price: Math.round(item.unit_price * 100) / 100,
  }));

  if (shipping > 0) {
    mpItems.push({
      id: "shipping",
      title: "Frete",
      quantity: 1,
      currency_id: "BRL",
      unit_price: Math.round(shipping * 100) / 100,
    });
  }

  const body: Record<string, unknown> = {
    items: mpItems,
    payer: buildMercadoPagoPayer(payer),
    external_reference: orderId,
    metadata: { order_id: orderId, email: payer.email.trim().toLowerCase() },
    payment_methods: {
      installments: 3,
      default_installments: 1,
    },
    back_urls: {
      success: `${appUrl}/obrigado?order=${orderId}`,
      failure: `${appUrl}/checkout?status=failure&order=${orderId}`,
      pending: `${appUrl}/checkout/aguardando?order=${orderId}`,
    },
  };

  if (shipping > 0) {
    body.shipments = {
      cost: Math.round(shipping * 100) / 100,
      mode: "not_specified",
    };
  }

  if (useAutoReturn) {
    body.auto_return = "approved";
    body.notification_url = mercadoPagoWebhookNotificationUrl(appUrl);
  }

  const res = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Idempotency-Key": orderId,
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const err = await res.text();
    return { ok: false, error: `Mercado Pago: ${err}` };
  }

  const data = (await res.json()) as { init_point?: string; sandbox_init_point?: string };
  const initPoint =
    isTestToken && data.sandbox_init_point ? data.sandbox_init_point : data.init_point;

  if (!initPoint) {
    return { ok: false, error: "Resposta inválida do Mercado Pago." };
  }

  return { ok: true, initPoint };
}

export async function getPaymentDetails(paymentId: string) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) return null;

  const res = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return null;
  return res.json() as Promise<{
    id: number;
    status: string;
    external_reference?: string;
    payment_method_id?: string;
    transaction_amount?: number;
  }>;
}

export async function searchApprovedPaymentByReference(externalReference: string) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) return null;

  const params = new URLSearchParams({
    external_reference: externalReference,
    sort: "date_created",
    criteria: "desc",
  });

  const res = await fetch(`https://api.mercadopago.com/v1/payments/search?${params}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    results?: Array<{ id: number; status: string; external_reference?: string }>;
  };

  return data.results?.find((p) => p.status === "approved") ?? null;
}
