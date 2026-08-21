import { isAsaasConfigured, isSupabaseConfigured } from "@/lib/config";

export function IntegrationsPanel() {
  return (
    <div className="rounded-2xl border border-iseul-line/80 bg-gradient-to-br from-white to-iseul-dew/20 p-6 text-sm shadow-card">
      <h2 className="font-medium text-iseul-ink">Integrações</h2>
      <p className="mt-1 text-xs text-iseul-muted">Visível apenas para o proprietário</p>
      <ul className="mt-4 space-y-3 text-neutral-600">
        <li className="flex items-center justify-between gap-3 rounded-xl bg-white/80 px-3 py-2.5">
          <span>Supabase</span>
          <span className={isSupabaseConfigured() ? "text-green-700" : "text-amber-700"}>
            {isSupabaseConfigured() ? "Configurado" : "Pendente"}
          </span>
        </li>
        <li className="flex items-center justify-between gap-3 rounded-xl bg-white/80 px-3 py-2.5">
          <span>Asaas</span>
          <span className={isAsaasConfigured() ? "text-green-700" : "text-amber-700"}>
            {isAsaasConfigured() ? "API key presente" : "Pendente"}
          </span>
        </li>
        <li className="rounded-xl bg-white/80 px-3 py-2.5">
          <span className="text-neutral-500">Webhook Asaas</span>
          <code className="mt-1 block rounded-lg bg-neutral-100 px-2 py-1 text-xs">
            /api/webhooks/asaas
          </code>
        </li>
      </ul>
    </div>
  );
}
