import { requireAdmin } from "@/actions/admin/auth";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAdmin();
  return <AdminShell userName={session.name}>{children}</AdminShell>;
}
