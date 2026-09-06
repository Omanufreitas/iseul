import { requireAdmin } from "@/actions/admin/auth";
import { AdminWaitlistPanel } from "@/components/admin/AdminWaitlistPanel";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { listWaitlistSubscribers } from "@/lib/waitlist";

export default async function AdminWaitlistPage() {
  await requireAdmin();
  const subscribers = await listWaitlistSubscribers();

  return (
    <div>
      <PageHeader
        title="Interessados"
        description="Lista de espera da landing e cadastros Avise-me quando chegar por produto"
      />
      <AdminWaitlistPanel subscribers={subscribers} />
    </div>
  );
}
