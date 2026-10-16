import { NextResponse } from "next/server";
import { isRoboAuthorized } from "@/lib/abandoned-cart/auth";
import { gerarCupomCarrinho } from "@/lib/abandoned-cart/coupon";
import { selectAbandonedCarts, type AbandonedCheckoutRow } from "@/lib/abandoned-cart/select";
import { SITE_URL } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/client";

export const dynamic = "force-dynamic";

function robotItens(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const item = raw as Record<string, unknown>;
    const nome = String(item.nome ?? "").trim();
    if (!nome) return [];
    return [
      {
        nome,
        quantidade: Number(item.quantidade ?? 1),
        preco: Number(item.preco ?? 0),
        url: String(item.url ?? ""),
      },
    ];
  });
}

export async function GET(req: Request) {
  if (!isRoboAuthorized(req.headers.get("authorization"))) {
    return NextResponse.json({ erro: "não autorizado" }, { status: 401 });
  }

  const now = Date.now();
  const oneHourAgo = new Date(now - 60 * 60 * 1000).toISOString();
  const twoDaysAgo = new Date(now - 48 * 60 * 60 * 1000).toISOString();
  const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
  const admin = createAdminClient();

  const { data: candidates, error } = await admin
    .from("checkouts_iniciados")
    .select("id, nome, telefone, email, itens, total, criado_em, cupom_codigo, cupom_expira_em")
    .eq("aceita_whatsapp", true)
    .is("robo_status", null)
    .lte("criado_em", oneHourAgo)
    .gte("criado_em", twoDaysAgo)
    .order("criado_em", { ascending: false });
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 });

  const { data: recent } = await admin
    .from("checkouts_iniciados")
    .select("telefone")
    .eq("robo_status", "enviado")
    .gte("robo_em", thirtyDaysAgo);
  const recentlySent = (recent ?? []).map((row) => String(row.telefone ?? ""));

  const { data: paid } = await admin
    .from("orders")
    .select("customer_phone, customer_email, ordered_at")
    .eq("payment_status", "aprovado")
    .gte("ordered_at", twoDaysAgo);
  const paidOrders = (paid ?? []).map((row) => ({
    phone: row.customer_phone ? String(row.customer_phone) : null,
    email: row.customer_email ? String(row.customer_email) : null,
    orderedAt: String(row.ordered_at),
  }));

  const rows: AbandonedCheckoutRow[] = (candidates ?? []).map((raw) => ({
    id: String(raw.id),
    nome: String(raw.nome),
    telefone: String(raw.telefone),
    email: raw.email ? String(raw.email) : null,
    itens: raw.itens,
    total: raw.total,
    criado_em: String(raw.criado_em),
    cupom_codigo: raw.cupom_codigo ? String(raw.cupom_codigo) : null,
    cupom_expira_em: raw.cupom_expira_em ? String(raw.cupom_expira_em) : null,
  }));
  const { pending, paidIds } = selectAbandonedCarts(rows, recentlySent, paidOrders);
  for (const id of paidIds) {
    await admin
      .from("checkouts_iniciados")
      .update({ robo_status: "ignorado", robo_motivo: "pagou", robo_em: new Date().toISOString() })
      .eq("id", id);
  }

  const lista = [];
  for (const row of pending) {
    if (!row.cupom_codigo) {
      const cupom = await gerarCupomCarrinho(row.nome);
      row.cupom_codigo = cupom.codigo;
      row.cupom_expira_em = cupom.expira_em;
      await admin
        .from("checkouts_iniciados")
        .update({ cupom_codigo: row.cupom_codigo, cupom_expira_em: row.cupom_expira_em })
        .eq("id", row.id);
    }

    lista.push({
      id: row.id,
      nome: row.nome,
      telefone: row.telefone,
      itens: robotItens(row.itens),
      total: Number(row.total),
      criado_em: row.criado_em,
      link_checkout: `${SITE_URL}/checkout?recuperar=${row.id}`,
      cupom: {
        codigo: row.cupom_codigo,
        desconto_percentual: 10,
        expira_em: row.cupom_expira_em,
      },
    });
  }

  return NextResponse.json(lista);
}
