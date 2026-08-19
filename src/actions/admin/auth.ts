"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  createSessionToken,
  getAdminSession,
  verifyPassword,
} from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";

export async function loginAdmin(formData: FormData): Promise<{ error: string } | void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." };
  }

  if (!isSupabaseConfigured()) {
    if (email === "admin@iseul.com.br" && password === "iseul2026") {
      const token = await createSessionToken({
        adminId: "demo-admin",
        email,
        name: "Admin Demo",
      });
      (await cookies()).set(SESSION_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: SESSION_MAX_AGE,
        path: "/",
      });
      redirect("/admin");
    }
    return { error: "Configure Supabase ou use admin@iseul.com.br / iseul2026 no modo demo." };
  }

  const admin = createAdminClient();
  const { data: user } = await admin
    .from("admin_users")
    .select("id, email, name, password_hash")
    .eq("email", email)
    .maybeSingle();

  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return { error: "Credenciais inválidas." };
  }

  const token = await createSessionToken({
    adminId: user.id,
    email: user.email,
    name: user.name,
  });

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });

  redirect("/admin");
}

export async function logoutAdmin() {
  (await cookies()).delete(SESSION_COOKIE);
  redirect("/admin/login");
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");
  return session;
}
