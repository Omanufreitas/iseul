import { AlertTriangle } from "lucide-react";

type Props = {
  blingSyncError?: string | null;
  blingSyncStatus?: string | null;
  melhorEnvioError?: string | null;
  melhorEnvioStatus?: string | null;
  paymentStatus: string;
};

export function OrderAlertsBanner({
  blingSyncError,
  blingSyncStatus,
  melhorEnvioError,
  melhorEnvioStatus,
  paymentStatus,
}: Props) {
  const alerts: { message: string; tone: "amber" | "red" }[] = [];

  if (paymentStatus === "pendente") {
    alerts.push({ message: "Pagamento ainda pendente — aguarde confirmação antes de separar.", tone: "amber" });
  }

  if (blingSyncStatus === "error" || blingSyncError) {
    alerts.push({
      message: blingSyncError ?? "Erro ao sincronizar pedido com o Bling.",
      tone: "red",
    });
  }

  if (melhorEnvioStatus === "error" || melhorEnvioError) {
    alerts.push({
      message: melhorEnvioError ?? "Erro ao gerar etiqueta no Melhor Envio.",
      tone: "red",
    });
  }

  if (!alerts.length) return null;

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div
          key={alert.message}
          className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm ${
            alert.tone === "red"
              ? "border-red-200 bg-red-50 text-red-900"
              : "border-amber-200 bg-amber-50 text-amber-900"
          }`}
        >
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <p>{alert.message}</p>
        </div>
      ))}
    </div>
  );
}
