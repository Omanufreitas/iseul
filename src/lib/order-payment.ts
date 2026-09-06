/** Pedido cancelado no fluxo operacional. */
export function isCancelledOrder(order: { status: string }): boolean {
  return order.status === "cancelado";
}

/** Pagamento ainda aguardando confirmação (exclui cancelados). */
export function isPendingPayment(order: { status: string; payment_status: string }): boolean {
  if (isCancelledOrder(order)) return false;
  return order.payment_status === "pendente";
}

/** Exibe pagamento coerente com status do pedido (legado: cancelado com pendente no banco). */
export function resolvePaymentStatus(order: {
  status: string;
  payment_status: string;
}): string {
  if (isCancelledOrder(order) && order.payment_status === "pendente") {
    return "cancelado";
  }
  return order.payment_status;
}

export const PAYMENT_STATUS_LABELS: Record<string, string> = {
  pendente: "Pendente",
  aprovado: "Aprovado",
  recusado: "Recusado",
  reembolsado: "Reembolsado",
  cancelado: "Cancelado",
};

export function paymentStatusLabel(status: string): string {
  return PAYMENT_STATUS_LABELS[status] ?? status;
}

export function paymentStatusBadgeClass(status: string): string {
  switch (status) {
    case "aprovado":
      return "bg-green-100 text-green-800";
    case "cancelado":
    case "recusado":
      return "bg-neutral-100 text-neutral-600";
    case "reembolsado":
      return "bg-sky-100 text-sky-800";
    default:
      return "bg-amber-100 text-amber-800";
  }
}
