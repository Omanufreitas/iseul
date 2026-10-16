import { isAsaasConfigured, isSupabaseConfigured } from "@/lib/config";
import { isTransactionalEmailConfigured } from "@/lib/email/mailer";
import { isBlingConfigured } from "@/lib/bling/client";
import { isTotalExpressConfigured } from "@/lib/total-express/config";
import {
  getBlingAccessToken,
  getBlingTokenExpiry,
  hasBlingAppCredentials,
  isBlingOAuthConnected,
} from "@/lib/bling/token-store";
import { getBlingRedirectUri } from "@/lib/bling/oauth";
import { BlingConnectForm } from "@/components/admin/BlingConnectForm";

type Props = {
  blingMessage?: string | null;
};

export async function IntegrationsPanel({ blingMessage }: Props) {
  const hasApp = hasBlingAppCredentials();
  const blingReady = isBlingConfigured();
  let blingTokenLabel = "Pendente";
  let blingTokenOk = false;
  let blingConnected = false;
  let blingNeedsReconnect = false;
  let accessExpiresAt: string | null = null;

  if (blingReady && isSupabaseConfigured()) {
    try {
      blingConnected = await isBlingOAuthConnected();
      accessExpiresAt = await getBlingTokenExpiry();

      if (blingConnected) {
        try {
          await getBlingAccessToken();
          blingTokenOk = true;
          blingTokenLabel = "Conectado · renovação automática";
        } catch {
          blingNeedsReconnect = true;
          blingTokenLabel = "Token expirado — reconecte abaixo";
        }
      } else if (hasApp) {
        blingTokenLabel = "Desconectado — autorize abaixo";
      } else if (process.env.BLING_API_KEY?.trim()) {
        blingTokenOk = true;
        blingTokenLabel = "Access token via env";
      }
    } catch {
      blingTokenLabel = "Erro ao verificar token";
    }
  }

  return (
    <div className="rounded-2xl border border-iseul-line/80 bg-gradient-to-br from-white to-iseul-dew/20 p-6 text-sm shadow-card">
      <h2 className="font-medium text-iseul-ink">Integrações</h2>
      <p className="mt-1 text-xs text-iseul-muted">Visível apenas para o proprietário</p>

      {blingMessage && (
        <p className="mt-3 rounded-lg bg-neutral-100 px-3 py-2 text-xs text-neutral-700">{blingMessage}</p>
      )}

      <ul className="mt-4 space-y-3 text-neutral-600">
        <li className="flex items-center justify-between gap-3 rounded-xl bg-white/80 px-3 py-2.5">
          <span>Supabase</span>
          <span className={isSupabaseConfigured() ? "text-green-700" : "text-amber-700"}>
            {isSupabaseConfigured() ? "Configurado" : "Pendente"}
          </span>
        </li>
        <li className="flex items-center justify-between gap-3 rounded-xl bg-white/80 px-3 py-2.5">
          <span>E-mail (Zoho)</span>
          <span className={isTransactionalEmailConfigured() ? "text-green-700" : "text-amber-700"}>
            {isTransactionalEmailConfigured() ? "Configurado" : "Pendente — SMTP_PASS"}
          </span>
        </li>
        <li className="flex items-center justify-between gap-3 rounded-xl bg-white/80 px-3 py-2.5">
          <span>Total Express</span>
          <span className={isTotalExpressConfigured() ? "text-green-700" : "text-amber-700"}>
            {isTotalExpressConfigured() ? "Contrato configurado" : "Pendente"}
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
        <li className="rounded-xl bg-white/80 px-3 py-2.5">
          <div className="flex items-center justify-between gap-3">
            <span>Bling (NF-e)</span>
            <span className={blingTokenOk ? "text-green-700" : blingReady ? "text-amber-700" : "text-amber-700"}>
              {blingReady ? blingTokenLabel : "Pendente"}
            </span>
          </div>
          <p className="mt-2 text-xs text-neutral-500">
            Após pagamento: cria pedido de venda no Bling e chama a API de emissão de NF-e
            (POST /nfe + envio à SEFAZ).
          </p>
          {blingNeedsReconnect && (
            <p className="mt-2 text-xs text-red-700">
              A autorização do Bling expirou ou foi revogada. Clique em &quot;Reconectar Bling&quot; e
              autorize de novo no site do Bling (mesma conta de sempre).
            </p>
          )}
          {!blingConnected && hasApp && !blingNeedsReconnect && (
            <p className="mt-2 text-xs text-red-700">
              Nenhum token salvo no momento (pode ter expirado após um deploy). Clique em
              &quot;Conectar conta Bling&quot; uma vez — depois o site renova sozinho.
            </p>
          )}
          {blingConnected && (
            <p className="mt-2 text-xs text-neutral-500">
              Você autorizou uma vez. O access token do Bling expira em algumas horas, mas o site
              renova sozinho — não precisa conectar de novo no dia a dia.
            </p>
          )}
          {blingConnected && accessExpiresAt && (
            <p className="mt-1 text-[11px] text-neutral-400">
              Próxima renovação automática antes de{" "}
              {new Date(accessExpiresAt).toLocaleString("pt-BR")}.
            </p>
          )}
          <code className="mt-2 block rounded-lg bg-neutral-100 px-2 py-1 text-xs">
            OAuth callback: {getBlingRedirectUri()}
          </code>
          {hasApp ? (
            <>
              <BlingConnectForm connected={blingConnected} />
              {!blingConnected && (
                <p className="mt-2 text-xs text-neutral-500">
                  Clique em conectar e autorize o app &quot;Iseul Loja&quot; no Bling (mesma aba).
                  Depois disso, só reconecte se revogar o app ou trocar de conta.
                </p>
              )}
            </>
          ) : (
            <p className="mt-2 text-xs text-amber-700">
              Configure BLING_CLIENT_ID e BLING_CLIENT_SECRET na Vercel e faça redeploy.
            </p>
          )}
        </li>
      </ul>
    </div>
  );
}
