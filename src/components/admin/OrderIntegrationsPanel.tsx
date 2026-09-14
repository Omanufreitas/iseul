"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { syncOrderPaymentAdmin, confirmOrderPaymentManuallyAdmin } from "@/actions/admin/orders";
import { retryBlingSync } from "@/actions/bling-sync";
import { cn } from "@/lib/utils";

type Props = {
  orderId: string;
  paymentStatus: string;
  paymentMethod: string;
  asaasCheckoutId: string | null;
  asaasPaymentId: string | null;
  paidAt: string | null;
  blingOrderId: string | null;
  blingSyncStatus: string | null;
  blingSyncError: string | null;
  nfeNumber: string | null;
  nfeUrl: string | null;
};

const BLING_STATUS_LABELS: Record<string, string> = {
  pending: "Enviando…",
  synced: "Sincronizado",
  error: "Erro",
};

function IntegrationRow({
  title,
  summary,
  summaryState,
  defaultOpen,
  children,
}: {
  title: string;
  summary: string;
  summaryState: "done" | "pending" | "error" | "neutral";
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen ?? false);

  const dotStyles = {
    done: "bg-emerald-500",
    pending: "bg-amber-500",
    error: "bg-red-500",
    neutral: "bg-neutral-300",
  };

  return (
    <div className="border-b last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition hover:bg-neutral-50"
      >
        <span className={cn("h-2 w-2 shrink-0 rounded-full", dotStyles[summaryState])} />
        <span className="flex-1 text-sm font-medium text-iseul-ink">{title}</span>
        <span className="text-xs text-neutral-500">{summary}</span>
        <span className="text-xs text-neutral-400">{open ? "▾" : "▸"}</span>
      </button>
      {open && <div className="border-t bg-neutral-50/50 px-5 py-4">{children}</div>}
    </div>
  );
}

export function OrderIntegrationsPanel({
  orderId,
  paymentStatus,
  paymentMethod,
  asaasCheckoutId,
  asaasPaymentId,
  paidAt,
  blingOrderId,
  blingSyncStatus,
  blingSyncError,
  nfeNumber,
  nfeUrl,
}: Props) {
  const router = useRouter();
  const [asaasPending, startAsaasTransition] = useTransition();
  const [manualPending, startManualTransition] = useTransition();
  const [blingPending, startBlingTransition] = useTransition();

  const isPaid = paymentStatus === "aprovado";
  const blingLabel = blingSyncStatus
    ? (BLING_STATUS_LABELS[blingSyncStatus] ?? blingSyncStatus)
    : "Aguardando pagamento";
  const canRetryBling = blingSyncStatus !== "synced" || !nfeNumber;

  const asaasSummary = isPaid ? "Aprovado" : paymentStatus;
  const asaasState = isPaid ? "done" : "pending";

  const blingSummary = nfeNumber ? `NF-e ${nfeNumber}` : blingLabel;
  const blingState =
    nfeNumber ? "done" : blingSyncStatus === "error" || blingSyncError ? "error" : "neutral";

  function handleAsaasSync() {
    startAsaasTransition(async () => {
      const result = await syncOrderPaymentAdmin(orderId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Pagamento atualizado");
      router.refresh();
    });
  }

  function handleManualConfirm() {
    const ok = window.confirm(
      "Confirmar pagamento manualmente?\n\nUse quando a cliente já pagou (ex.: link Asaas enviado por fora). O estoque será baixado e o pedido irá ao Bling."
    );
    if (!ok) return;

    startManualTransition(async () => {
      const result = await confirmOrderPaymentManuallyAdmin(orderId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Pagamento confirmado");
      router.refresh();
    });
  }

  function handleBlingRetry() {
    startBlingTransition(async () => {
      const result = await retryBlingSync(orderId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Pedido reenviado ao Bling");
      router.refresh();
    });
  }

  return (
    <div className="rounded-xl border bg-white">
      <div className="border-b px-5 py-4">
        <h2 className="font-semibold text-iseul-ink">Integrações</h2>
        <p className="mt-0.5 text-xs text-neutral-500">Pagamento, NF-e e detalhes técnicos.</p>
      </div>

      <IntegrationRow
        title="Asaas"
        summary={asaasSummary}
        summaryState={asaasState}
        defaultOpen={!isPaid}
      >
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Pagamento</dt>
            <dd className="capitalize">{paymentStatus}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Método</dt>
            <dd>{paymentMethod}</dd>
          </div>
          {paidAt && (
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500">Pago em</dt>
              <dd>{new Date(paidAt).toLocaleString("pt-BR")}</dd>
            </div>
          )}
        </dl>

        {(asaasCheckoutId || asaasPaymentId) && (
          <details className="mt-3">
            <summary className="cursor-pointer text-xs font-medium text-neutral-500">
              IDs técnicos
            </summary>
            <dl className="mt-2 space-y-2 text-xs">
              {asaasCheckoutId && (
                <div>
                  <dt className="text-neutral-400">Checkout</dt>
                  <dd className="break-all font-mono">{asaasCheckoutId}</dd>
                </div>
              )}
              {asaasPaymentId && (
                <div>
                  <dt className="text-neutral-400">Cobrança</dt>
                  <dd className="break-all font-mono">{asaasPaymentId}</dd>
                </div>
              )}
            </dl>
          </details>
        )}

        {!isPaid && (
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={handleAsaasSync}
              disabled={asaasPending || manualPending}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
            >
              {asaasPending ? "Consultando Asaas…" : "Buscar pagamento no Asaas"}
            </button>
            <button
              type="button"
              onClick={handleManualConfirm}
              disabled={asaasPending || manualPending}
              className="w-full rounded-lg bg-iseul-pine px-3 py-2 text-sm font-medium text-white hover:bg-iseul-pine/90 disabled:opacity-50"
            >
              {manualPending ? "Confirmando…" : "Confirmar pagamento manualmente"}
            </button>
          </div>
        )}
      </IntegrationRow>

      <IntegrationRow
        title="Bling / NF-e"
        summary={blingSummary}
        summaryState={blingState}
        defaultOpen={blingState === "error"}
      >
        <dl className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Status</dt>
            <dd>{blingLabel}</dd>
          </div>
          {nfeNumber && (
            <div className="flex justify-between gap-4">
              <dt className="text-neutral-500">NF-e</dt>
              <dd className="font-mono text-xs">{nfeNumber}</dd>
            </div>
          )}
        </dl>

        {blingSyncError && (
          <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
            {blingSyncError}
          </p>
        )}

        {nfeUrl && (
          <a
            href={nfeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block text-sm font-medium text-iseul-pine underline"
          >
            Abrir DANFE
          </a>
        )}

        {blingOrderId && (
          <details className="mt-3">
            <summary className="cursor-pointer text-xs font-medium text-neutral-500">
              IDs técnicos
            </summary>
            <p className="mt-2 break-all font-mono text-xs text-neutral-600">{blingOrderId}</p>
          </details>
        )}

        {canRetryBling && (
          <button
            type="button"
            onClick={handleBlingRetry}
            disabled={blingPending}
            className="mt-4 w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-50"
          >
            {blingPending ? "Enviando…" : "Enviar / reenviar ao Bling"}
          </button>
        )}
      </IntegrationRow>
    </div>
  );
}
