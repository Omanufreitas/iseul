"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/actions/admin/auth";
import { syncOrderToBling } from "@/lib/bling/sync-order";
import { isBlingConfigured } from "@/lib/bling/client";

export async function retryBlingSync(orderId: string) {
  await requireAdmin();

  if (!isBlingConfigured()) {
    return { error: "Bling não configurado." };
  }

  try {
    await syncOrderToBling(orderId);
    revalidatePath(`/admin/pedidos/${orderId}`);
    revalidatePath("/admin/pedidos");
    return { success: true };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao sincronizar com Bling" };
  }
}
