import type { AdminSession } from "@/lib/auth";

/** Proprietário — único que vê integrações e gerencia usuários admin. */
export function getOwnerAdminEmail(): string {
  return (process.env.OWNER_ADMIN_EMAIL ?? "manu.oficial93@gmail.com").trim().toLowerCase();
}

export function isOwnerAdminEmail(email: string): boolean {
  return email.trim().toLowerCase() === getOwnerAdminEmail();
}

export function isOwnerAdmin(session: Pick<AdminSession, "email">): boolean {
  return isOwnerAdminEmail(session.email);
}

export type AdminUserRole = "owner" | "admin";

export function adminUserRoleLabel(role: AdminUserRole): string {
  return role === "owner" ? "Proprietário" : "Administrador";
}
