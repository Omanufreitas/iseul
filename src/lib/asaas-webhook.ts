/** Valida token do webhook configurado no painel Asaas (header `asaas-access-token`). */
export function verifyAsaasWebhookToken(request: Request): boolean {
  const expected = process.env.ASAAS_WEBHOOK_TOKEN?.trim();
  if (!expected) return true;

  const header =
    request.headers.get("asaas-access-token") ??
    request.headers.get("Asaas-Access-Token");

  return header === expected;
}

export type AsaasWebhookPayload = {
  event?: string;
  payment?: {
    id?: string;
    status?: string;
    externalReference?: string | null;
    subscription?: string | null;
    customer?: string | null;
    checkoutSession?: string | null;
    billingType?: string;
    value?: number;
  };
};

export function parseAsaasWebhookPayload(body: unknown): AsaasWebhookPayload {
  if (!body || typeof body !== "object") return {};
  return body as AsaasWebhookPayload;
}

const PAYMENT_ACTIVATION_EVENTS = new Set(["PAYMENT_CONFIRMED", "PAYMENT_RECEIVED"]);

export function isAsaasPaymentActivationEvent(event: string | undefined): boolean {
  if (!event) return false;
  return PAYMENT_ACTIVATION_EVENTS.has(event);
}

const PAYMENT_FAILURE_EVENTS = new Set([
  "PAYMENT_OVERDUE",
  "PAYMENT_CREDIT_CARD_CAPTURE_REFUSED",
  "PAYMENT_REPROVED_BY_RISK_ANALYSIS",
  "PAYMENT_DELETED",
  "PAYMENT_REFUNDED",
]);

export function isAsaasPaymentFailureEvent(event: string | undefined): boolean {
  if (!event) return false;
  return PAYMENT_FAILURE_EVENTS.has(event);
}
