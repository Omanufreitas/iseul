import { StoreSettingsForm } from "@/components/admin/StoreSettingsForm";
import { getStoreSettings } from "@/lib/catalog";
import { isMercadoPagoConfigured, isSupabaseConfigured } from "@/lib/config";

export default async function AdminConfigPage() {
  const settings = await getStoreSettings();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Configurações</h1>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-4 font-medium">Loja</h2>
          <StoreSettingsForm settings={settings} />
        </div>

        <div className="rounded-xl border bg-white p-6 text-sm">
          <h2 className="mb-4 font-medium">Integrações</h2>
          <ul className="space-y-2 text-neutral-600">
            <li>
              Supabase:{" "}
              <span className={isSupabaseConfigured() ? "text-green-700" : "text-amber-700"}>
                {isSupabaseConfigured() ? "Configurado" : "Pendente (.env.local)"}
              </span>
            </li>
            <li>
              Mercado Pago:{" "}
              <span className={isMercadoPagoConfigured() ? "text-green-700" : "text-amber-700"}>
                {isMercadoPagoConfigured() ? "Token presente" : "Pendente (MERCADOPAGO_ACCESS_TOKEN)"}
              </span>
            </li>
            <li>
              Webhook MP:{" "}
              <code className="rounded bg-neutral-100 px-1 text-xs">
                /api/webhooks/mercadopago
              </code>
            </li>
          </ul>
          <p className="mt-4 text-xs text-neutral-500">
            Copie as variáveis de ambiente do Bazika, EB_MED ou Zepfit quando for configurar tokens
            de produção.
          </p>
        </div>
      </div>
    </div>
  );
}
