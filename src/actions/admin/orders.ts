"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/actions/admin/auth";
import { createAdminClient } from "@/lib/supabase/client";
import { isMockCatalogEnabled } from "@/lib/config";
import type { OrderStatus } from "@/types";

export async function updateOrderFulfillment(
  orderId: string,
  input: {
    status: OrderStatus;
    tracking_code?: string | null;
    notes?: string | null;
  }
) {
  await requireAdmin();
  if (isMockCatalogEnabled()) return { error: "Pedidos disponíveis apenas com Supabase." };

  const admin = createAdminClient();
  const { error } = await admin
    .from("orders")
    .update({
      status: input.status,
      tracking_code: input.tracking_code?.trim() || null,
      notes: input.notes?.trim() || null,
    })
    .eq("id", orderId);

  if (error) return { error: error.message };

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  return { success: true };
}
