import { samePhone } from "./phone";

export type AbandonedCheckoutRow = {
  id: string;
  nome: string;
  telefone: string;
  email: string | null;
  itens: unknown;
  total: number | string;
  criado_em: string;
  cupom_codigo: string | null;
  cupom_expira_em: string | null;
};

export type PaidOrderMatch = {
  phone: string | null;
  email: string | null;
  orderedAt: string;
};

function sameEmail(left: string | null, right: string | null): boolean {
  const a = left?.trim().toLowerCase() ?? "";
  const b = right?.trim().toLowerCase() ?? "";
  return a.length > 0 && a === b;
}

export function customerPaidAfterCheckout(row: AbandonedCheckoutRow, orders: PaidOrderMatch[]): boolean {
  const started = new Date(row.criado_em).getTime();
  return orders.some((order) => {
    if (new Date(order.orderedAt).getTime() < started) return false;
    return samePhone(row.telefone, order.phone ?? "") || sameEmail(row.email, order.email);
  });
}

/** Um telefone por vez, o checkout mais recente. Quem já recebeu nos últimos 30 dias fica de fora. */
export function selectAbandonedCarts(
  candidates: AbandonedCheckoutRow[],
  recentlySentPhones: string[],
  paidOrders: PaidOrderMatch[]
): { pending: AbandonedCheckoutRow[]; paidIds: string[] } {
  const seen = new Set<string>();
  const pending: AbandonedCheckoutRow[] = [];
  const paidIds: string[] = [];

  for (const row of candidates) {
    if (seen.has(row.telefone) || recentlySentPhones.some((phone) => samePhone(phone, row.telefone))) {
      continue;
    }
    seen.add(row.telefone);
    if (customerPaidAfterCheckout(row, paidOrders)) {
      paidIds.push(row.id);
      continue;
    }
    pending.push(row);
  }

  return { pending, paidIds };
}
