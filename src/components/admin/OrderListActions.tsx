"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteOrder } from "@/actions/admin/orders";
import { cn } from "@/lib/utils";

type Props = {
  orderId: string;
  orderNumber: number;
  customerName: string;
  layout?: "row" | "stack";
};

const actionBase =
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-medium transition whitespace-nowrap";

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
    <div
      className={cn(
        "items-center",
        stack ? "mt-3 flex flex-wrap gap-2" : "inline-flex gap-1.5",
      )}
    >
      <Link
        href={`/admin/pedidos/${encodeURIComponent(orderId)}`}
        className={cn(
          actionBase,
          "border border-iseul-line/80 bg-white text-neutral-700 shadow-sm hover:border-iseul-accent2 hover:bg-iseul-dew/40 hover:text-iseul-accent",
        )}
      >
        <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        Saiba mais
      </Link>
      <button
        type="button"
        onClick={handleDelete}
        disabled={pending}
        className={cn(
          actionBase,
          "border border-red-200/80 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100 disabled:opacity-60",
        )}
      >
        <Trash2 className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        {pending ? "Excluindo…" : "Excluir"}
      </button>
    </div>
  );
}
