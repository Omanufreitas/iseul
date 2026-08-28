import { requireAdmin } from "@/actions/admin/auth";
import { listCouponsAdmin } from "@/actions/admin/coupons";
import { ConfigAdminLayout } from "@/components/admin/ConfigAdminLayout";
import { CouponsAdminPanel } from "@/components/admin/CouponsAdminPanel";
import { IntegrationsPanel } from "@/components/admin/IntegrationsPanel";
import { StoreSettingsForm } from "@/components/admin/StoreSettingsForm";
import { PageHeader } from "@/components/admin/ui/PageHeader";
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
      <PageHeader
        title="Configurações"
        description="Loja, cupons e integrações em um só lugar"
      />

      <ConfigAdminLayout
        owner={owner}
        store={<StoreSettingsForm settings={settings} />}
        coupons={<CouponsAdminPanel coupons={coupons} />}
        integrations={owner ? <IntegrationsPanel blingMessage={blingMessage} /> : undefined}
      />
    </div>
  );
}
