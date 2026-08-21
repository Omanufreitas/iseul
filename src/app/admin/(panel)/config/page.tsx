import { requireAdmin } from "@/actions/admin/auth";
import { IntegrationsPanel } from "@/components/admin/IntegrationsPanel";
import { StoreSettingsForm } from "@/components/admin/StoreSettingsForm";
import { getStoreSettings } from "@/lib/catalog";
import { isOwnerAdmin } from "@/lib/admin-access";

export default async function AdminConfigPage() {
  const session = await requireAdmin();
  const settings = await getStoreSettings();
  const owner = isOwnerAdmin(session);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Configurações</h1>

      <div className={`mt-6 grid gap-6 ${owner ? "lg:grid-cols-2" : "max-w-xl"}`}>
        <div>
          <h2 className="mb-4 font-medium">Loja</h2>
          <StoreSettingsForm settings={settings} />
        </div>

        {owner && <IntegrationsPanel />}
      </div>
    </div>
  );
}
