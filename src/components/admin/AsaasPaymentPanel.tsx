"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { syncOrderPaymentAdmin } from "@/actions/admin/orders";

type Props = {
  orderId: string;
  paymentStatus: string;
  asaasCheckoutId: string | null;
  asaasPaymentId: string | null;
  paidAt: string | null;
};

export function AsaasPaymentPanel({
  orderId,
  paymentStatus,
  asaasCheckoutId,
  asaasPaymentId,
  paidAt,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSync() {
    startTransition(async () => {
      const result = await syncOrderPaymentAdmin(orderId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success(result.message ?? "Pagamento atualizado");
      router.refresh();
    });
  }

  const isPaid = paymentStatus === "aprovado";

  return (
    <div className="rounded-xl border bg-white p-5">
      <h2 className="font-semibold">Asaas</h2>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-neutral-500">Pagamento</dt>
          <dd className="capitalize">{paymentStatus}</dd>
        </div>
        {asaasCheckoutId && (
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Checkout</dt>
            <dd className="break-all text-right font-mono text-xs">{asaasCheckoutId}</dd>
          </div>
        )}
        {asaasPaymentId && (
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Cobrança</dt>
            <dd className="break-all text-right font-mono text-xs">{asaasPaymentId}</dd>
          </div>
        )}
        {paidAt && (
          <div className="flex justify-between gap-4">
            <dt className="text-neutral-500">Pago em</dt>
            <dd>{new Date(paidAt).toLocaleString("pt-BR")}</dd>
          </div>
        )}
      </dl>
      {!isPaid && (
        <button
          type="button"
          onClick={handleSync}
          disabled={pending}
          className="mt-4 rounded-lg border px-3 py-2 text-sm font-medium transition hover:bg-neutral-50 disabled:opacity-50"
        >
          {pending ? "Consultando Asaas…" : "Confirmar pagamento no Asaas"}
        </button>
      )}
    </div>
  );
}
