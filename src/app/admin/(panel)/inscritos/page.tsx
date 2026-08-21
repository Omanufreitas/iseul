import { requireAdmin } from "@/actions/admin/auth";
import { AdminWaitlistPanel } from "@/components/admin/AdminWaitlistPanel";
import { listWaitlistSubscribers } from "@/lib/waitlist";

export default async function AdminWaitlistPage() {
  await requireAdmin();
  const subscribers = await listWaitlistSubscribers();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-iseul-ink">Inscritos</h1>
      <p className="mt-1 text-sm text-iseul-muted">
        E-mails coletados na landing &quot;em breve&quot;
      </p>

      <div className="mt-8">
        <AdminWaitlistPanel subscribers={subscribers} />
      </div>
    </div>
  );
}
