import { isMockCatalogEnabled, isSupabaseConfigured } from "@/lib/config";
import { createAdminClient } from "@/lib/supabase/client";

export type OrderPixelPayload = {
  orderId: string;
  value: number;
  numItems: number;
  contentIds: string[];
};

export async function getOrderPixelPayload(orderId: string): Promise<OrderPixelPayload | null> {
  if (!orderId || isMockCatalogEnabled() || !isSupabaseConfigured()) return null;

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, total")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return null;

  const { data: items } = await admin
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);

  const contentIds = (items ?? [])
    .map((item) => (item.product_id ? String(item.product_id) : ""))
    .filter(Boolean);

  const numItems = (items ?? []).reduce((sum, item) => sum + Number(item.quantity ?? 0), 0);

  return {
    orderId: String(order.id),
    value: Number(order.total),
    numItems,
    contentIds,
  };
}
