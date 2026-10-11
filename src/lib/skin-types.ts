import { SKIN_TYPES } from "@/lib/constants";
import { isMockCatalogEnabled, isSupabaseConfigured } from "@/lib/config";
import { createAdminClient, createServerStoreClient } from "@/lib/supabase/client";
import { slugify } from "@/lib/utils";

export type SkinTypeOption = {
  slug: string;
  label: string;
  sort_order: number;
};

export function fallbackSkinTypes(): SkinTypeOption[] {
  return SKIN_TYPES.map((skin, index) => ({
    slug: skin.slug,
    label: skin.label,
    sort_order: index + 1,
  }));
}

export async function listSkinTypes(): Promise<SkinTypeOption[]> {
  if (isMockCatalogEnabled() || !isSupabaseConfigured()) {
    return fallbackSkinTypes();
  }

  const supabase = createServerStoreClient();
  const { data, error } = await supabase
    .from("skin_types")
    .select("slug, label, sort_order")
    .order("sort_order")
    .order("label");

  if (error || !data?.length) return fallbackSkinTypes();
  return data.map((row) => ({
    slug: String(row.slug),
    label: String(row.label),
    sort_order: Number(row.sort_order ?? 0),
  }));
}

/** Cria tipos novos e atualiza o nome dos que já existem. O slug não muda. */
export async function syncSkinTypes(
  items: { slug: string; label: string }[]
): Promise<{ error?: string }> {
  if (isMockCatalogEnabled() || !isSupabaseConfigured() || items.length === 0) {
    return {};
  }

  const admin = createAdminClient();

  for (const item of items) {
    const normalizedLabel = item.label.trim();
    const normalizedSlug = (item.slug.trim() || slugify(normalizedLabel)).slice(0, 80);
    if (!normalizedSlug || !normalizedLabel) continue;

    const { data: existing, error: readError } = await admin
      .from("skin_types")
      .select("slug, label")
      .eq("slug", normalizedSlug)
      .maybeSingle();

    if (readError) return { error: readError.message };

    if (existing) {
      if (String(existing.label) === normalizedLabel) continue;
      const { error } = await admin
        .from("skin_types")
        .update({ label: normalizedLabel })
        .eq("slug", normalizedSlug);
      if (error) return { error: error.message };
      continue;
    }

    const { data: last } = await admin
      .from("skin_types")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error } = await admin.from("skin_types").insert({
      slug: normalizedSlug,
      label: normalizedLabel,
      sort_order: Number(last?.sort_order ?? 0) + 1,
    });
    if (error) return { error: error.message };
  }

  return {};
}
