import "server-only";

import { isSupabaseConfigured } from "@/lib/config";
import { createAdminClient } from "@/lib/supabase/client";

export type AdminNavCounts = {
  pendingOrders: number;
  blingErrors: number;
  lowStock: number;
};

export async function fetchAdminNavCounts(): Promise<AdminNavCounts> {
  if (!isSupabaseConfigured()) {
    return { pendingOrders: 0, blingErrors: 0, lowStock: 0 };
  }

  const admin = createAdminClient();

  const [pendingRes, blingRes, productsRes] = await Promise.all([
    admin
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("payment_status", "pendente"),
    admin
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("bling_sync_status", "error"),
    admin.from("products").select("stock, active").eq("active", true),
  ]);

  const products = productsRes.data ?? [];
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;

  return {
    pendingOrders: pendingRes.count ?? 0,
    blingErrors: blingRes.count ?? 0,
    lowStock,
  };
}
