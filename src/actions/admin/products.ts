"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/actions/admin/auth";
import { getProductById } from "@/lib/catalog";
import { createAdminClient } from "@/lib/supabase/client";
import {
  deleteMockProduct,
  toggleMockProductActive,
  upsertMockProduct,
} from "@/lib/mock-catalog-store";
import { productToDbPayload } from "@/lib/products";
import { productFormSchema } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import { isMockCatalogEnabled } from "@/lib/config";
import type { Product } from "@/types";
import type { z } from "zod";

type ProductFormData = z.infer<typeof productFormSchema>;

function parseProduct(raw: unknown) {
  const parsed = productFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" } as const;
  }
  return { data: parsed.data } as const;
}

function toProductPayload(data: ProductFormData, existing?: Product | null) {
  return {
    name: data.name,
    full_name: data.full_name ?? data.name,
    slug: data.slug?.trim() || slugify(data.name),
    brand: data.brand ?? "",
    category_slug: data.category_slug,
    category_label: data.category_label,
    price: data.price,
    compare_at_price: data.compare_at_price ?? null,
    pitch: data.pitch ?? "",
    image_url: data.image_url ?? "",
    image_fallback_url: data.image_fallback_url || null,
    shopee_url: existing?.shopee_url ?? null,
    shopee_id: existing?.shopee_id ?? null,
    sold_count: data.sold_count ?? 0,
    rating: data.rating ?? 0,
    review_count: data.review_count ?? 0,
    stock: data.stock,
    active: data.active,
    featured: data.featured ?? false,
    sort_order: existing?.sort_order ?? 0,
  };
}

export async function saveProduct(raw: unknown, id?: string) {
  await requireAdmin();
  const parsed = parseProduct(raw);
  if ("error" in parsed) return parsed;

  const existing = id ? await getProductById(id) : null;

  if (isMockCatalogEnabled()) {
    try {
      const saved = upsertMockProduct(toProductPayload(parsed.data, existing), id);
      revalidateAll();
      return { success: true, id: saved.id };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Erro ao salvar produto" };
    }
  }

  const payload = productToDbPayload(toProductPayload(parsed.data, existing));
  const admin = createAdminClient();

  if (id) {
    const { error } = await admin.from("products").update(payload).eq("id", id);
    if (error) return { error: error.message };
  } else {
    const { error } = await admin.from("products").insert(payload);
    if (error) return { error: error.message };
  }

  revalidateAll();
  return { success: true, id };
}

export async function deleteProduct(id: string) {
  await requireAdmin();

  if (isMockCatalogEnabled()) {
    try {
      deleteMockProduct(id);
      revalidateAll();
      return { success: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Erro ao excluir produto" };
    }
  }

  const admin = createAdminClient();
  const { error } = await admin.from("products").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidateAll();
  return { success: true };
}

export async function toggleProductActive(id: string, active: boolean) {
  await requireAdmin();

  if (isMockCatalogEnabled()) {
    try {
      toggleMockProductActive(id, active);
      revalidateAll();
      return { success: true };
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Erro ao atualizar status" };
    }
  }

  const admin = createAdminClient();
  const { error } = await admin.from("products").update({ active }).eq("id", id);
  if (error) return { error: error.message };

  revalidateAll();
  return { success: true };
}

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin();
  if (isMockCatalogEnabled()) return { error: "Pedidos disponíveis apenas com Supabase." };

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
  if (isMockCatalogEnabled()) return { error: "Configurações editáveis apenas com Supabase." };

  const admin = createAdminClient();
  const { error } = await admin.from("store_settings").update(raw).eq("id", 1);
  if (error) return { error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/config");
  return { success: true };
}

function revalidateAll() {
  revalidatePath("/");
  revalidatePath("/admin/produtos");
  revalidatePath("/admin");
  revalidatePath("/produtos", "layout");
}
