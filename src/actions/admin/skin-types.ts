"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/actions/admin/auth";
import { createAdminClient } from "@/lib/supabase/client";

export async function countProductsWithSkinType(slug: string) {
  await requireAdmin();
  const normalized = slug.trim();
  if (!normalized) return { count: 0 };

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("products")
    .select("id")
    .contains("skin_types", [normalized]);

  if (error) return { error: error.message };
  return { count: data?.length ?? 0 };
}

export async function deleteSkinType(slug: string) {
  await requireAdmin();
  const normalized = slug.trim();
  if (!normalized) return { error: "Tipo inválido." };

  const admin = createAdminClient();
  const { data: products, error: readError } = await admin
    .from("products")
    .select("id, skin_types")
    .contains("skin_types", [normalized]);

  if (readError) return { error: readError.message };

  for (const row of products ?? []) {
    const next = (Array.isArray(row.skin_types) ? row.skin_types : [])
      .map(String)
      .filter((value) => value !== normalized);
    const { error } = await admin.from("products").update({ skin_types: next }).eq("id", row.id);
    if (error) return { error: error.message };
  }

  const { data: removed, error } = await admin
    .from("skin_types")
    .delete()
    .eq("slug", normalized)
    .select("slug");

  if (error) return { error: error.message };
  if (!removed?.length) return { error: "Esse tipo de pele já não está na lista." };

  revalidatePath("/produtos", "layout");
  revalidatePath("/admin/produtos");
  return { success: true as const, removedFrom: products?.length ?? 0 };
}
