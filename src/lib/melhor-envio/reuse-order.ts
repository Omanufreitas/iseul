import { melhorEnvioFetch } from "./client";

function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export type MeOrderListRow = {
  id: string;
  protocol?: string | null;
  status?: string | null;
  canceled_at?: string | null;
  generated_at?: string | null;
  tracking?: string | null;
  invoice?: { key?: string } | null;
  to?: {
    postal_code?: string;
    document?: string;
    company_document?: string;
  };
};

export function matchesMeOrderRecipient(
  order: MeOrderListRow,
  recipientZip: string,
  recipientDocument: string
): boolean {
  const zip = onlyDigits(recipientZip);
  const doc = onlyDigits(recipientDocument);
  const to = order.to;
  if (!to) return false;

  const orderZip = onlyDigits(to.postal_code ?? "");
  const orderDoc = onlyDigits(to.document ?? to.company_document ?? "");
  return orderZip === zip && orderDoc === doc;
}

/** Envio já pago/gerado no ME com a mesma NF-e e destinatário (ex.: retry após erro no Iseul). */
export function findReusableMelhorEnvioOrder(
  orders: MeOrderListRow[],
  invoiceKey: string,
  recipientZip: string,
  recipientDocument: string
): MeOrderListRow | null {
  const key = onlyDigits(invoiceKey);

  for (const order of orders) {
    if (order.canceled_at) continue;
    if (!order.generated_at && order.status !== "released") continue;

    const orderKey = onlyDigits(order.invoice?.key ?? "");
    if (orderKey !== key) continue;
    if (!matchesMeOrderRecipient(order, recipientZip, recipientDocument)) continue;

    return order;
  }

  return null;
}

export async function findExistingMelhorEnvioOrderForInvoice(input: {
  invoiceKey: string;
  recipientZip: string;
  recipientDocument: string;
}): Promise<{
  id: string;
  protocol: string | null;
  tracking: string | null;
  alreadyGenerated: boolean;
} | null> {
  const raw = await melhorEnvioFetch<{ data?: MeOrderListRow[] } | MeOrderListRow[]>(
    "/me/orders?limit=50"
  );
  const list = Array.isArray(raw) ? raw : (raw.data ?? []);
  const match = findReusableMelhorEnvioOrder(
    list,
    input.invoiceKey,
    input.recipientZip,
    input.recipientDocument
  );

  if (!match) return null;

  return {
    id: match.id,
    protocol: match.protocol ?? null,
    tracking: match.tracking ?? null,
    alreadyGenerated: !!(match.generated_at || match.status === "released"),
  };
}
