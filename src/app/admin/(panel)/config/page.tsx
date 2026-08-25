import { requireAdmin } from "@/actions/admin/auth";
import { listCouponsAdmin } from "@/actions/admin/coupons";
import { CouponsAdminPanel } from "@/components/admin/CouponsAdminPanel";
import { IntegrationsPanel } from "@/components/admin/IntegrationsPanel";
import { StoreSettingsForm } from "@/components/admin/StoreSettingsForm";
import { getStoreSettings } from "@/lib/catalog";
import { isOwnerAdmin } from "@/lib/admin-access";

export default async function AdminConfigPage({
  searchParams,
}: {
  searchParams: Promise<{ bling?: string; msg?: string }>;
}) {
  const session = await requireAdmin();
  const settings = await getStoreSettings();
  const coupons = await listCouponsAdmin();
  const owner = isOwnerAdmin(session);
  const params = await searchParams;

  let blingMessage: string | null = null;
  if (params.bling === "connected") blingMessage = "Bling conectado com sucesso.";
  if (params.bling === "error") {
    blingMessage = params.msg ? `Erro ao conectar Bling: ${params.msg}` : "Erro ao conectar Bling.";
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold">Configurações</h1>

      <div className={`mt-6 grid gap-6 ${owner ? "lg:grid-cols-2" : "max-w-xl"}`}>
        <div className="space-y-6">
          <div>
            <h2 className="mb-4 font-medium">Loja</h2>
            <StoreSettingsForm settings={settings} />
          </div>
          <CouponsAdminPanel coupons={coupons} />
        </div>

        {owner && <IntegrationsPanel blingMessage={blingMessage} />}
      </div>
    </div>
  );
}
