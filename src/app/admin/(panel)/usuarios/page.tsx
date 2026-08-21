import { requireOwnerAdmin } from "@/actions/admin/auth";
import { AdminUsersPanel } from "@/components/admin/AdminUsersPanel";
import { listAdminUsers } from "@/lib/admin-users";

export default async function AdminUsersPage() {
  const session = await requireOwnerAdmin();
  const users = await listAdminUsers();

  return (
    <div>
      <h1 className="text-2xl font-semibold text-iseul-ink">Usuários</h1>
      <p className="mt-1 text-sm text-iseul-muted">Gerencie quem acessa o painel Iseul</p>

      <div className="mt-8">
        <AdminUsersPanel users={users} currentEmail={session.email} />
      </div>
    </div>
  );
}
