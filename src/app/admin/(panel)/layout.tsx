import { requireAdmin } from "@/actions/admin/auth";
import { AdminShell } from "@/components/admin/AdminShell";
import { isOwnerAdmin } from "@/lib/admin-access";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return (
    <AdminShell userName={session.name} userEmail={session.email} isOwner={isOwnerAdmin(session)}>
      {children}
    </AdminShell>
  );
}
