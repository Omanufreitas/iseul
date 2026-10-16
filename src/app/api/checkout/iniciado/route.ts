import { NextResponse } from "next/server";
import { normalizarTelefone } from "@/lib/abandoned-cart/phone";
import { SITE_URL } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/client";

type IncomingItem = {
  nome?: string;
  name?: string;
  quantidade?: number;
  quantity?: number;
  preco?: number;
  price?: number;
  url?: string;
  slug?: string;
  productId?: string;
  variantId?: string | null;
  variantLabel?: string | null;
  brand?: string;
  listPrice?: number;
  image_url?: string;
  image_fallback_url?: string | null;
};

function itensDoPedido(value: unknown) {
  if (!Array.isArray(value)) return null;
  const itens = value.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const item = raw as IncomingItem;
    const nome = String(item.nome ?? item.name ?? "").trim();
    const slug = String(item.slug ?? "").trim();
    const productId = String(item.productId ?? "").trim();
    if (!nome || !slug || !productId) return [];
    const quantidade = Math.max(1, Number(item.quantidade ?? item.quantity ?? 1));
    const preco = Number(item.preco ?? item.price ?? 0);
    if (!Number.isFinite(preco) || preco < 0) return [];
    return [
      {
        nome,
        quantidade,
        preco,
        url: `${SITE_URL}/produtos/${slug}`,
        slug,
        productId,
        variantId: item.variantId ?? null,
        variantLabel: item.variantLabel ?? null,
        brand: item.brand ?? "",
        listPrice: item.listPrice ?? null,
        image_url: item.image_url ?? "",
        image_fallback_url: item.image_fallback_url ?? null,
      },
    ];
  });
  return itens.length ? itens : null;
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ erro: "dados incompletos" }, { status: 400 });
  }

  const itens = itensDoPedido(body.itens);
  const registro = {
    nome: String(body.nome ?? "").trim(),
    telefone: normalizarTelefone(String(body.telefone ?? "")),
    email: body.email ? String(body.email).trim().toLowerCase() : null,
    itens,
    total: Number(body.total),
    aceita_whatsapp: Boolean(body.aceita_whatsapp),
  };

  if (
    !registro.nome ||
    registro.telefone.length < 12 ||
    !registro.itens ||
    !Number.isFinite(registro.total)
  ) {
    return NextResponse.json({ erro: "dados incompletos" }, { status: 400 });
  }

  const admin = createAdminClient();
  const id = typeof body.id === "string" ? body.id : "";
  const query = id
    ? admin.from("checkouts_iniciados").update(registro).eq("id", id).select("id").single()
    : admin.from("checkouts_iniciados").insert(registro).select("id").single();
  const { data, error } = await query;
  if (error || !data) {
    return NextResponse.json({ erro: error?.message ?? "não foi possível salvar" }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
