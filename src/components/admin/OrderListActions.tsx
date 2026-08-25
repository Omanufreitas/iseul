"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteOrder } from "@/actions/admin/orders";

type Props = {
  orderId: string;
  orderNumber: number;
  customerName: string;
  layout?: "row" | "stack";
};

export function OrderListActions({ orderId, orderNumber, customerName, layout = "row" }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (
      !confirm(
        `Excluir pedido #${orderNumber} (${customerName})? Esta ação não pode ser desfeita.`,
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteOrder(orderId);
      if (result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Pedido excluído");
      router.refresh();
    });
  }

  const stack = layout === "stack";

  return (
    <div className={stack ? "mt-3 flex flex-wrap gap-2" : "flex flex-wrap items-center justify-end gap-2"}>
      <Link
        href={`/admin/pedidos/${encodeURIComponent(orderId)}`}
        className="rounded-lg border px-3 py-1.5 text-xs font-medium transition hover:bg-neutral-50"
      >
        Saiba mais
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
      >
        {pending ? "Excluindo…" : "Excluir"}
      </button>
    </div>
  );
}
