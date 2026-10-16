import { createAdminClient } from "@/lib/supabase/client";
import type { CartItem } from "@/types";
import { displayPhone } from "./phone";

export type AbandonedCheckoutRecovery = {
  id: string;
  nome: string;
  email: string;
  phone: string;
  aceitaWhatsapp: boolean;
  couponCode: string | null;
  items: CartItem[];
};

function asItems(value: unknown): CartItem[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((raw) => {
    if (!raw || typeof raw !== "object") return [];
    const item = raw as Record<string, unknown>;
    const productId = String(item.productId ?? "");
    const slug = String(item.slug ?? "");
    const name = String(item.nome ?? item.name ?? "").trim();
    if (!productId || !slug || !name) return [];
    return [
      {
        productId,
        variantId: item.variantId ? String(item.variantId) : null,
        variantLabel: item.variantLabel ? String(item.variantLabel) : null,
        slug,
        name,
        brand: String(item.brand ?? ""),
        price: Number(item.preco ?? item.price ?? 0),
        listPrice: item.listPrice != null ? Number(item.listPrice) : undefined,
        image_url: String(item.image_url ?? ""),
        image_fallback_url: item.image_fallback_url ? String(item.image_fallback_url) : null,
        quantity: Math.max(1, Number(item.quantidade ?? item.quantity ?? 1)),
      },
    ];
  });
}

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function loadAbandonedCheckout(id: string): Promise<AbandonedCheckoutRecovery | null> {
  if (!UUID.test(id)) return null;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("checkouts_iniciados")
    .select("id, nome, telefone, email, itens, aceita_whatsapp, cupom_codigo")
    .eq("id", id)
    .maybeSingle();
  if (error || !data) return null;
  const items = asItems(data.itens);
  if (!items.length) return null;
  return {
    id: String(data.id),
    nome: String(data.nome ?? ""),
    email: String(data.email ?? ""),
    phone: displayPhone(String(data.telefone ?? "")),
    aceitaWhatsapp: Boolean(data.aceita_whatsapp),
    couponCode: data.cupom_codigo ? String(data.cupom_codigo) : null,
    items,
  };
}
