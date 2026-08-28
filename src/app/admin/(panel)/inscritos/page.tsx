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
        title="Inscritos"
        description='E-mails coletados na landing "em breve"'
      />
      <AdminWaitlistPanel subscribers={subscribers} />
    </div>
  );
}
