"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import { retryBlingSync } from "@/actions/bling-sync";

type Props = {
  orderId: string;
  blingOrderId: string | null;
  blingSyncStatus: string | null;
  blingSyncError: string | null;
  nfeNumber: string | null;
  nfeUrl: string | null;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "Enviando…",
  synced: "Sincronizado",
  error: "Erro",
};

export function BlingOrderPanel({
  orderId,
  blingOrderId,
  blingSyncStatus,
  blingSyncError,
  nfeNumber,
  nfeUrl,
}: Props) {
  const [pending, startTransition] = useTransition();

  function handleRetry() {
    startTransition(async () => {
      const result = await retryBlingSync(orderId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Pedido reenviado ao Bling");
    });
  }

  const statusLabel = blingSyncStatus
    ? (STATUS_LABELS[blingSyncStatus] ?? blingSyncStatus)
    : "Aguardando pagamento";

  const canRetry = blingSyncStatus !== "synced" || !nfeNumber;

  return (
    <div className="rounded-xl border bg-white p-5">
      <h2 className="font-semibold">Bling / NF-e</h2>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-500">Status</dt>
          <dd>{statusLabel}</dd>
        </div>
        {blingOrderId && (
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">ID pedido Bling</dt>
            <dd className="font-mono text-xs">{blingOrderId}</dd>
          </div>
        )}
        {blingSyncError && (
          <div className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-800">{blingSyncError}</div>
        )}
        {nfeNumber && (
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">NF-e</dt>
            <dd className="font-mono text-xs">{nfeNumber}</dd>
          </div>
        )}
        {nfeUrl && (
          <div>
            <a
              href={nfeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-iseul-ink underline"
            >
              Abrir DANFE
            </a>
          </div>
        )}
      </dl>
      {canRetry && (
        <button
          type="button"
          onClick={handleRetry}
          disabled={pending}
          className="mt-4 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-neutral-50 disabled:opacity-50"
        >
          {pending ? "Enviando…" : "Enviar / reenviar ao Bling"}
        </button>
      )}
    </div>
  );
}
