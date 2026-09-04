import { createAdminClient } from "@/lib/supabase/client";
import { releaseExpiredReservations } from "@/lib/orders/fulfill";

/** Estoque disponível = saldo no banco − reservas ativas (checkout pendente). */
export async function getAvailableStock(
  productId: string,
  variantId?: string | null
): Promise<number> {
  await releaseExpiredReservations();

  const admin = createAdminClient();
  const now = new Date().toISOString();

  let stock = 0;

  if (variantId) {
    const { data } = await admin
      .from("product_variants")
      .select("stock, active")
      .eq("id", variantId)
      .maybeSingle();
    if (!data?.active) return 0;
    stock = Number(data.stock ?? 0);
  } else {
    const { data } = await admin.from("products").select("stock, active").eq("id", productId).maybeSingle();
    if (!data?.active) return 0;
    stock = Number(data.stock ?? 0);
  }

  let reservationQuery = admin
    .from("stock_reservations")
    .select("quantity")
    .eq("product_id", productId)
    .gt("expires_at", now);

  reservationQuery = variantId
    ? reservationQuery.eq("variant_id", variantId)
    : reservationQuery.is("variant_id", null);

  const { data: reservations } = await reservationQuery;
  const reserved = (reservations ?? []).reduce((sum, row) => sum + Number(row.quantity ?? 0), 0);

  return Math.max(0, stock - reserved);
}

export function stockErrorMessage(productName: string, available: number, requested: number): string {
  if (available <= 0) {
    return `${productName} está esgotado e foi removido da sacola.`;
  }
  return `Estoque insuficiente para ${productName}: restam ${available} unidade(s), você pediu ${requested}.`;
}
