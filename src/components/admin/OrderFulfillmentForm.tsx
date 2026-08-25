"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateOrderFulfillment } from "@/actions/admin/orders";
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
  trackingCode: string | null;
  notes: string | null;
};

export function OrderFulfillmentForm({
  orderId,
  currentStatus,
  trackingCode,
  notes,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);
  const [tracking, setTracking] = useState(trackingCode ?? "");
  const [internalNotes, setInternalNotes] = useState(notes ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await updateOrderFulfillment(orderId, {
        status,
        tracking_code: tracking.trim() || null,
        notes: internalNotes.trim() || null,
      });
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Pedido atualizado");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border bg-white p-5">
      <h2 className="font-semibold">Status e envio</h2>

      <label className="block text-sm">
        <span className="mb-1 block text-neutral-500">Status do pedido</span>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          className="w-full rounded-lg border px-3 py-2.5 text-sm sm:max-w-xs"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-neutral-500">Código de rastreamento</span>
        <input
          value={tracking}
          onChange={(e) => setTracking(e.target.value.toUpperCase())}
          placeholder="BR123456789BR"
          className="w-full rounded-lg border px-3 py-2.5 text-sm sm:max-w-md"
        />
      </label>

      <label className="block text-sm">
        <span className="mb-1 block text-neutral-500">Observações internas</span>
        <input
          value={internalNotes}
          onChange={(e) => setInternalNotes(e.target.value)}
          placeholder="Anotação interna..."
          className="w-full rounded-lg border px-3 py-2.5 text-sm"
        />
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
