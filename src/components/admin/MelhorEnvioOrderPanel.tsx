"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { generateMelhorEnvioLabel, getMelhorEnvioLabelPdfUrl } from "@/actions/melhor-envio";
import type { OrderStatus } from "@/types";

type Props = {
  orderId: string;
  status: OrderStatus;
  hasShippingAddress: boolean;
  melhorEnvioStatus: string | null;
  melhorEnvioError: string | null;
  melhorEnvioLabelUrl: string | null;
};

export function MelhorEnvioOrderPanel({
  orderId,
  status,
  hasShippingAddress,
  melhorEnvioStatus,
  melhorEnvioError,
  melhorEnvioLabelUrl,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (!hasShippingAddress) return null;

  const hasLabel = melhorEnvioStatus === "generated" || !!melhorEnvioLabelUrl;

  return (
    <div className="rounded-xl border bg-white p-5">
      <h2 className="font-semibold">Melhor Envio</h2>
      <p className="mt-1 text-sm text-neutral-500">
        Gere a etiqueta de postagem após o pagamento confirmado.
      </p>

      {melhorEnvioError && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {melhorEnvioError}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        {hasLabel ? (
          <button
            type="button"
            disabled={pending}
            onClick={() => {
              startTransition(async () => {
                const result = await getMelhorEnvioLabelPdfUrl(orderId);
                if ("error" in result && result.error) {
                  toast.error(result.error);
                  return;
                }
                if ("labelUrl" in result && result.labelUrl) {
                  window.open(result.labelUrl, "_blank", "noopener,noreferrer");
                }
              });
            }}
            className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-60"
          >
            {pending ? "Abrindo..." : "Imprimir etiqueta"}
          </button>
        ) : (
          <button
            type="button"
            disabled={pending || !["pago", "separando"].includes(status)}
            onClick={() => {
              startTransition(async () => {
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
            }}
            className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
          >
            {pending ? "Gerando..." : "Gerar etiqueta"}
          </button>
        )}
      </div>

      {!["pago", "separando"].includes(status) && !hasLabel && (
        <p className="mt-2 text-xs text-neutral-500">
          Disponível quando o pedido estiver como Pago ou Separando.
        </p>
      )}
    </div>
  );
}
