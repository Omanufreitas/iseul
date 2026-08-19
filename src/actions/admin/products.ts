"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/actions/admin/auth";
import { createAdminClient } from "@/lib/supabase/client";
import { productToDbPayload } from "@/lib/products";
import { productFormSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { isMockCatalogEnabled } from "@/lib/config";

export async function saveProduct(raw: unknown, id?: string) {
  await requireAdmin();

  if (isMockCatalogEnabled()) {
    return { error: "Cadastro indisponível no modo demo (sem Supabase)." };
  }

  const parsed = productFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const data = parsed.data;
  const payload = productToDbPayload({
    ...data,
    slug: data.slug?.trim() || slugify(data.name),
    full_name: data.full_name ?? data.name,
    compare_at_price: data.compare_at_price ?? null,
    image_url: data.image_url ?? "",
    featured: data.featured ?? false,
  });

  const admin = createAdminClient();

  if (id) {
    const { error } = await admin.from("products").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await admin.from("products").insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath("/");
  revalidatePath("/admin/produtos");
  return { success: true };
}

export async function deleteProduct(id: string) {
  await requireAdmin();
  if (isMockCatalogEnabled()) {
    return { error: "Indisponível no modo demo." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/produtos");
  return { success: true };
}

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin();
  if (isMockCatalogEnabled()) return { error: "Indisponível no modo demo." };

  const admin = createAdminClient();
  const { error } = await admin.from("orders").update({ status }).eq("id", orderId);
  if (error) return { error: error.message };

  revalidatePath("/admin/pedidos");
  return { success: true };
}

export async function updateStoreSettings(raw: {
  announcement?: string;
  free_shipping_threshold?: number;
  pix_discount_percent?: number;
}) {
  await requireAdmin();
  if (isMockCatalogEnabled()) return { error: "Indisponível no modo demo." };

  const admin = createAdminClient();
  const { error } = await admin.from("store_settings").update(raw).eq("id", 1);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/config");
  return { success: true };
}
