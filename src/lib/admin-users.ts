import "server-only";

import { createAdminClient } from "@/lib/supabase/client";
import { isOwnerAdminEmail, type AdminUserRole } from "@/lib/admin-access";
import { isSupabaseConfigured } from "@/lib/config";

export type AdminUserRow = {
  id: string;
  email: string;
  name: string;
  created_at: string;
  role: AdminUserRole;
};

export async function listAdminUsers(): Promise<AdminUserRow[]> {
  if (!isSupabaseConfigured()) return [];

  const admin = createAdminClient();
  const { data } = await admin
    .from("admin_users")
    .select("id, email, name, created_at")
    .order("created_at", { ascending: true });

  return (data ?? []).map((u) => ({
    id: String(u.id),
    email: u.email,
    name: u.name,
    created_at: u.created_at,
    role: isOwnerAdminEmail(u.email) ? ("owner" as const) : ("admin" as const),
  }));
}
