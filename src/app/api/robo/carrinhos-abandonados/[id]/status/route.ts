import { NextResponse } from "next/server";
import { isRoboAuthorized } from "@/lib/abandoned-cart/auth";
import { createAdminClient } from "@/lib/supabase/client";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  if (!isRoboAuthorized(req.headers.get("authorization"))) {
    return NextResponse.json({ erro: "não autorizado" }, { status: 401 });
  }

  const { id } = await params;
  let body: { status?: string; motivo?: string };
  try {
    body = (await req.json()) as { status?: string; motivo?: string };
  } catch {
    return NextResponse.json({ erro: "status inválido" }, { status: 400 });
  }
  if (body.status !== "enviado" && body.status !== "ignorado") {
    return NextResponse.json({ erro: "status inválido" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("checkouts_iniciados")
    .update({
      robo_status: body.status,
      robo_motivo: body.motivo ?? null,
      robo_em: new Date().toISOString(),
    })
    .eq("id", id);
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
