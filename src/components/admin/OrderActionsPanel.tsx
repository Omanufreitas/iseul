"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { AdminSelect } from "@/components/admin/ui/AdminSelect";
import { resendOrderEmailAdmin, updateOrderFulfillment } from "@/actions/admin/orders";
import { generateMelhorEnvioLabel, getMelhorEnvioLabelPdfUrl } from "@/actions/melhor-envio";
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
  hasShippingAddress: boolean;
  isLocalMotoboy: boolean;
  melhorEnvioStatus: string | null;
  melhorEnvioError: string | null;
  melhorEnvioLabelUrl: string | null;
  confirmationEmailSentAt?: string | null;
  shippedEmailSentAt?: string | null;
};

export function OrderActionsPanel({
  orderId,
  currentStatus,
  trackingCode,
  notes,
  hasShippingAddress,
  isLocalMotoboy,
  melhorEnvioStatus,
  melhorEnvioError,
  melhorEnvioLabelUrl,
  confirmationEmailSentAt,
  shippedEmailSentAt,
}: Props) {
  const router = useRouter();
  const [savePending, startSaveTransition] = useTransition();
  const [labelPending, startLabelTransition] = useTransition();
  const [emailPending, startEmailTransition] = useTransition();
  const [status, setStatus] = useState(currentStatus);
  const [tracking, setTracking] = useState(trackingCode ?? "");
  const [internalNotes, setInternalNotes] = useState(notes ?? "");

  const hasLabel = melhorEnvioStatus === "generated" || !!melhorEnvioLabelUrl;
  const canGenerateLabel = ["pago", "separando"].includes(status);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startSaveTransition(async () => {
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

  function handleGenerateLabel() {
    startLabelTransition(async () => {
      const result = await generateMelhorEnvioLabel(orderId);
      if ("error" in result && result.error) {
        toast.error(result.error);
        router.refresh();
        return;
      }
      toast.success("Etiqueta gerada");
      router.refresh();
      if ("labelUrl" in result && result.labelUrl) {
        window.open(result.labelUrl, "_blank", "noopener,noreferrer");
      }
    });
  }

  function handleSendEmail(kind: "confirmado" | "enviado") {
    startEmailTransition(async () => {
      const result = await resendOrderEmailAdmin(orderId, kind);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("message" in result && result.message ? result.message : "E-mail enviado.");
      router.refresh();
    });
  }

  function handlePrintLabel() {
    startLabelTransition(async () => {
      const result = await getMelhorEnvioLabelPdfUrl(orderId);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      if ("labelUrl" in result && result.labelUrl) {
        window.open(result.labelUrl, "_blank", "noopener,noreferrer");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border bg-white p-5">
      <h2 className="font-semibold text-iseul-ink">Ações do pedido</h2>
      <p className="mt-1 text-sm text-neutral-500">Status, envio e etiqueta de postagem.</p>

      <div className="mt-4 space-y-4">
        <label className="block text-sm">
          <span className="mb-1 block text-neutral-500">Status do pedido</span>
          <AdminSelect
            value={status}
            onChange={(e) => setStatus(e.target.value as OrderStatus)}
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </AdminSelect>
        </label>

        {hasShippingAddress && (
          <div className="rounded-lg border border-neutral-100 bg-neutral-50 p-3">
            {isLocalMotoboy ? (
              <p className="text-sm text-neutral-600">
                Entrega local por motoboy em Campo Grande — sem etiqueta no Melhor Envio.
              </p>
            ) : (
              <>
                <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Melhor Envio
                </div>

                {melhorEnvioError && (
                  <p className="mt-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {melhorEnvioError}
                  </p>
                )}

                <div className="mt-2">
                  {hasLabel ? (
                    <button
                      type="button"
                      disabled={labelPending}
                      onClick={handlePrintLabel}
                      className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-neutral-50 disabled:opacity-60"
                    >
                      {labelPending ? "Abrindo..." : "Imprimir etiqueta"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={labelPending || !canGenerateLabel}
                      onClick={handleGenerateLabel}
                      className="w-full rounded-lg bg-iseul-pine px-4 py-2.5 text-sm font-medium text-white hover:bg-iseul-pine/90 disabled:opacity-60"
                    >
                      {labelPending
                        ? "Gerando..."
                        : melhorEnvioError
                          ? "Tentar gerar etiqueta novamente"
                          : "Gerar etiqueta"}
                    </button>
                  )}
                </div>

                {!canGenerateLabel && !hasLabel && (
                  <p className="mt-2 text-xs text-neutral-500">
                    Disponível quando o pedido estiver como Pago ou Separando.
                  </p>
                )}
              </>
            )}
          </div>
        )}

        <label className="block text-sm">
          <span className="mb-1 block text-neutral-500">Código de rastreamento</span>
          <input
            value={tracking}
            onChange={(e) => setTracking(e.target.value.toUpperCase())}
            placeholder="TXAQ123... ou AP123...BR"
            className="w-full rounded-lg border border-neutral-200 px-3 py-2.5 font-mono text-sm focus:border-iseul-pine focus:outline-none focus:ring-1 focus:ring-iseul-pine"
          />
          <p className="mt-1 text-xs text-neutral-500">
            Use o código da transportadora. ORD-... do Melhor Envio não é rastreio.
          </p>
        </label>

        <label className="block text-sm">
          <span className="mb-1 block text-neutral-500">Observações internas</span>
          <textarea
            value={internalNotes}
            onChange={(e) => setInternalNotes(e.target.value)}
            placeholder="Anotação interna..."
            rows={2}
            className="w-full resize-none rounded-lg border border-neutral-200 px-3 py-2.5 text-sm focus:border-iseul-pine focus:outline-none focus:ring-1 focus:ring-iseul-pine"
          />
        </label>
      </div>

      <div className="mt-4 space-y-2 rounded-lg border border-neutral-100 bg-neutral-50 p-3">
        <div className="text-xs font-medium uppercase tracking-wide text-neutral-500">E-mail da cliente</div>
        <button
          type="button"
          disabled={emailPending}
          onClick={() => handleSendEmail("confirmado")}
          className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-neutral-50 disabled:opacity-60"
        >
          {emailPending
            ? "Enviando..."
            : confirmationEmailSentAt
              ? "Reenviar pedido confirmado"
              : "Enviar pedido confirmado"}
        </button>
        <button
          type="button"
          disabled={emailPending}
          onClick={() => handleSendEmail("enviado")}
          className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-sm font-medium hover:bg-neutral-50 disabled:opacity-60"
        >
          {emailPending
            ? "Enviando..."
            : shippedEmailSentAt
              ? "Reenviar pedido enviado"
              : "Enviar pedido enviado"}
        </button>
      </div>

      <button
        type="submit"
        disabled={savePending}
        className="mt-4 w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
      >
        {savePending ? "Salvando..." : "Salvar alterações"}
      </button>
    </form>
  );
}
