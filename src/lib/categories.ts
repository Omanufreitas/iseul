import { CATEGORIES } from "@/lib/constants";
import { isMockCatalogEnabled, isSupabaseConfigured } from "@/lib/config";
import { createAdminClient, createServerStoreClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";

export type ProductCategory = {
  slug: string;
  label: string;
  sort_order: number;
};

function fallbackCategories(): ProductCategory[] {
  return CATEGORIES.filter((c) => c.slug !== "all").map((c, i) => ({
    slug: c.slug,
    label: c.label,
    sort_order: i + 1,
  }));
}

export async function listProductCategories(): Promise<ProductCategory[]> {
  if (isMockCatalogEnabled() || !isSupabaseConfigured()) {
    return fallbackCategories();
  }

  const supabase = createServerStoreClient();
  const { data, error } = await supabase
    .from("product_categories")
    .select("slug, label, sort_order")
    .order("sort_order")
    .order("label");

  if (error || !data?.length) return fallbackCategories();
  return data.map((row) => ({
    slug: String(row.slug),
    label: String(row.label),
    sort_order: Number(row.sort_order ?? 0),
  }));
}

export async function ensureProductCategory(slug: string, label: string): Promise<void> {
  if (isMockCatalogEnabled() || !isSupabaseConfigured()) return;

  const normalizedSlug = slug.trim() || slugify(label);
  const normalizedLabel = label.trim() || normalizedSlug;
  if (!normalizedSlug) return;

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("product_categories")
    .select("slug")
    .eq("slug", normalizedSlug)
    .maybeSingle();

  if (existing) return;

  const { data: last } = await admin
    .from("product_categories")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  await admin.from("product_categories").insert({
    slug: normalizedSlug,
    label: normalizedLabel,
    sort_order: Number(last?.sort_order ?? 0) + 1,
  });
}
