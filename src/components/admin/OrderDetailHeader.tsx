import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { OrderStatus } from "@/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pago",
  separando: "Separando",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

type BadgeState = "done" | "pending" | "error" | "neutral";

function Badge({ label, state }: { label: string; state: BadgeState }) {
  const styles: Record<BadgeState, string> = {
    done: "bg-emerald-50 text-emerald-800 ring-emerald-200",
    pending: "bg-amber-50 text-amber-800 ring-amber-200",
    error: "bg-red-50 text-red-800 ring-red-200",
    neutral: "bg-neutral-100 text-neutral-600 ring-neutral-200",
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${styles[state]}`}
    >
      {label}
    </span>
  );
}

const FLOW_STEPS: { key: OrderStatus; label: string }[] = [
  { key: "pago", label: "Pago" },
  { key: "separando", label: "Separando" },
  { key: "enviado", label: "Enviado" },
  { key: "entregue", label: "Entregue" },
];

const STATUS_RANK: Record<OrderStatus, number> = {
  aguardando_pagamento: 0,
  pago: 1,
  separando: 2,
  enviado: 3,
  entregue: 4,
  cancelado: -1,
};

type Props = {
  orderNumber: number;
  orderedAt: string;
  total: number;
  status: OrderStatus;
  paymentStatus: string;
  paymentMethod: string;
  nfeNumber: string | null;
  blingSyncStatus: string | null;
  blingSyncError: string | null;
  melhorEnvioStatus: string | null;
  melhorEnvioLabelUrl: string | null;
};

export function OrderDetailHeader({
  orderNumber,
  orderedAt,
  total,
  status,
  paymentStatus,
  paymentMethod,
  nfeNumber,
  blingSyncStatus,
  blingSyncError,
  melhorEnvioStatus,
  melhorEnvioLabelUrl,
}: Props) {
  const isPaid = paymentStatus === "aprovado";
  const hasLabel =
    melhorEnvioStatus === "generated" || melhorEnvioStatus === "total_express" || !!melhorEnvioLabelUrl;
  const isCancelled = status === "cancelado";
  const currentRank = STATUS_RANK[status];

  const paymentBadge: { label: string; state: BadgeState } = isPaid
    ? { label: "Pago", state: "done" }
    : { label: "Pagamento pendente", state: "pending" };

  const nfeBadge: { label: string; state: BadgeState } = nfeNumber
    ? { label: `NF-e ${nfeNumber}`, state: "done" }
    : blingSyncStatus === "error" || blingSyncError
      ? { label: "NF-e com erro", state: "error" }
      : { label: "NF-e pendente", state: "neutral" };

  const labelBadge: { label: string; state: BadgeState } =
    melhorEnvioStatus === "total_express"
      ? { label: "Total Express", state: "done" }
      : hasLabel
        ? { label: "Etiqueta gerada", state: "done" }
        : { label: "Sem etiqueta", state: "neutral" };

  const opsBadge: { label: string; state: BadgeState } = isCancelled
    ? { label: "Cancelado", state: "error" }
    : status === "entregue"
      ? { label: "Entregue", state: "done" }
      : status === "enviado"
        ? { label: "Enviado", state: "done" }
        : { label: STATUS_LABELS[status], state: status === "aguardando_pagamento" ? "pending" : "neutral" };

  return (
    <div className="rounded-2xl border border-iseul-line/80 bg-white p-5 shadow-card">
      <Link
        href="/admin/pedidos"
        className="text-sm text-neutral-500 transition hover:text-iseul-ink"
      >
        ← Voltar aos pedidos
      </Link>

      <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-iseul-ink">Pedido #{orderNumber}</h1>
          <p className="mt-1 text-sm text-neutral-500">
            {new Date(orderedAt).toLocaleString("pt-BR")} · {paymentMethod}
          </p>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-2xl font-semibold text-iseul-ink">{formatCurrency(total)}</div>
          <p className="mt-1 text-xs text-neutral-500">Total do pedido</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge {...paymentBadge} />
        <Badge {...nfeBadge} />
        <Badge {...labelBadge} />
        <Badge {...opsBadge} />
      </div>

      {!isCancelled && (
        <div className="mt-5 hidden sm:block">
          <div className="flex items-center">
            {FLOW_STEPS.map((step, index) => {
              const stepRank = STATUS_RANK[step.key];
              const isDone = currentRank >= stepRank && currentRank > 0;
              const isCurrent =
                status === step.key ||
                (step.key === "pago" && status === "aguardando_pagamento" && isPaid);

              return (
                <div key={step.key} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        isDone
                          ? "bg-iseul-pine"
                          : isCurrent
                            ? "bg-iseul-sage ring-2 ring-iseul-dew"
                            : "bg-neutral-200"
                      }`}
                    />
                    <span
                      className={`text-[10px] font-medium uppercase tracking-wide ${
                        isDone || isCurrent ? "text-iseul-pine" : "text-neutral-400"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < FLOW_STEPS.length - 1 && (
                    <div
                      className={`mx-1 mb-4 h-0.5 flex-1 ${
                        currentRank > stepRank ? "bg-iseul-pine" : "bg-neutral-200"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
