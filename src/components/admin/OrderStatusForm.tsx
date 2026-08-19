"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { updateOrderStatus } from "@/actions/admin/products";
import type { OrderStatus } from "@/types";

const STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: "aguardando_pagamento", label: "Aguardando pagamento" },
  { value: "pago", label: "Pago" },
  { value: "separando", label: "Separando" },
  { value: "enviado", label: "Enviado" },
  { value: "entregue", label: "Entregue" },
  { value: "cancelado", label: "Cancelado" },
];

type Props = {
  orderId: string;
  currentStatus: OrderStatus;
};

export function OrderStatusForm({ orderId, currentStatus }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleChange(status: string) {
    startTransition(async () => {
      const result = await updateOrderStatus(orderId, status);
      if ("error" in result && result.error) toast.error(result.error);
      else {
        toast.success("Status atualizado");
        router.refresh();
      }
    });
  }

  return (
    <div className="rounded-xl border bg-white p-5">
      <h2 className="font-semibold">Status do pedido</h2>
      <select
        defaultValue={currentStatus}
        disabled={pending}
        onChange={(e) => handleChange(e.target.value)}
        className="mt-3 w-full rounded-lg border px-3 py-2.5 text-sm disabled:opacity-60 sm:max-w-xs"
      >
        {STATUS_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {pending && <p className="mt-2 text-xs text-neutral-500">Salvando...</p>}
    </div>
  );
}
