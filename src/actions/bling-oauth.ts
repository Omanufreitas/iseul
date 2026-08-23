"use server";

import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { requireOwnerAdmin } from "@/actions/admin/auth";
import { getBlingAuthorizeUrl } from "@/lib/bling/oauth";

const STATE_COOKIE = "bling_oauth_state";

export async function startBlingOAuth() {
  await requireOwnerAdmin();

  const clientId = process.env.BLING_CLIENT_ID?.trim();
  if (!clientId) {
    redirect("/admin/config?bling=error&msg=BLING_CLIENT_ID_ausente");
  }

  const state = randomBytes(16).toString("hex");
  const url = getBlingAuthorizeUrl(state);
  if (!url) {
    redirect("/admin/config?bling=error&msg=url_oauth_invalida");
  }

  const cookieStore = await cookies();
  cookieStore.set(STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  redirect(url);
}
