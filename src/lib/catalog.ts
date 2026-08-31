import { isMockCatalogEnabled, isSupabaseConfigured } from "@/lib/config";
import { createServerStoreClient } from "@/lib/supabase/client";
import {
  getMockProductById,
  getMockProductBySlug,
  getMockProducts,
  getMockSettings,
} from "@/lib/mock-catalog";
import { mapDbProduct } from "@/lib/products";
import { mapDbVariant } from "@/lib/variants";
import type { Product, ProductVariant, StoreSettings } from "@/types";

export async function getStoreSettings(): Promise<StoreSettings> {
  if (isMockCatalogEnabled()) return getMockSettings();
  if (!isSupabaseConfigured()) return getMockSettings();

  const supabase = createServerStoreClient();
  const { data } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
  if (!data) return getMockSettings();
  return data as StoreSettings;
}

export async function listProducts(options?: {
  category?: string;
  sort?: "sold" | "price_asc" | "price_desc" | "new";
  includeInactive?: boolean;
}): Promise<Product[]> {
  if (isMockCatalogEnabled()) {
    let list = getMockProducts();
    if (!options?.includeInactive) {
      list = list.filter((p) => p.active);
    }
    if (options?.category && options.category !== "all") {
      list = list.filter((p) => p.category_slug === options.category);
    }
    return sortProducts(list, options?.sort ?? "sold");
  }

  const supabase = createServerStoreClient();
  let query = supabase.from("products").select("*");

  if (!options?.includeInactive) {
    query = query.eq("active", true);
  }

  if (options?.category && options.category !== "all") {
    query = query.eq("category_slug", options.category);
  }

  const { data, error } = await query;
  if (error || !data) return getMockProducts();

  const products = data.map((row) => mapDbProduct(row));
  return attachVariantFlags(sortProducts(products, options?.sort ?? "sold"));
}

async function attachVariantFlags(products: Product[]): Promise<Product[]> {
  if (isMockCatalogEnabled() || !isSupabaseConfigured() || products.length === 0) {
    return products;
  }

  const supabase = createServerStoreClient();
  const ids = products.map((p) => p.id).filter((id) => !id.startsWith("seed-"));
  if (!ids.length) return products;

  const { data } = await supabase
    .from("product_variants")
    .select("product_id")
    .in("product_id", ids)
    .eq("active", true);

  const withVariants = new Set((data ?? []).map((row) => String(row.product_id)));
  return products.map((product) => ({
    ...product,
    has_variants: withVariants.has(product.id),
  }));
}

function sortProducts(products: Product[], sort: string): Product[] {
  const list = [...products];
  if (sort === "price_asc") return list.sort((a, b) => a.price - b.price);
  if (sort === "price_desc") return list.sort((a, b) => b.price - a.price);
  if (sort === "new") return list.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  return list.sort((a, b) => b.sold_count - a.sold_count || b.review_count - a.review_count);
}

async function attachVariants(product: Product): Promise<Product> {
  if (isMockCatalogEnabled() || !isSupabaseConfigured()) return product;

  const supabase = createServerStoreClient();
  const { data } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", product.id)
    .order("sort_order")
    .order("label");

  const variants = (data ?? []).map((row) => mapDbVariant(row));
  return variants.length > 0 ? { ...product, variants } : product;
}

export async function getProductVariants(productId: string): Promise<ProductVariant[]> {
  if (isMockCatalogEnabled() || !isSupabaseConfigured()) return [];

  const supabase = createServerStoreClient();
  const { data } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order")
    .order("label");

  return (data ?? []).map((row) => mapDbVariant(row));
}

export async function getVariantById(variantId: string): Promise<ProductVariant | null> {
  if (isMockCatalogEnabled() || !isSupabaseConfigured()) return null;

  const supabase = createServerStoreClient();
  const { data } = await supabase.from("product_variants").select("*").eq("id", variantId).maybeSingle();
  if (!data) return null;
  return mapDbVariant(data);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isMockCatalogEnabled()) {
    const p = getMockProductBySlug(slug);
    return p?.active ? p : null;
  }

  const supabase = createServerStoreClient();
  const { data } = await supabase.from("products").select("*").eq("slug", slug).eq("active", true).maybeSingle();
  if (!data) {
    const mock = getMockProductBySlug(slug);
    return mock?.active ? mock : null;
  }
  return attachVariants(mapDbProduct(data));
}

export async function getProductById(id: string): Promise<Product | null> {
  if (isMockCatalogEnabled()) return getMockProductById(id);

  const supabase = createServerStoreClient();
  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (!data) return getMockProductById(id);
  return attachVariants(mapDbProduct(data));
}

export async function listAllProductsAdmin(): Promise<Product[]> {
  if (isMockCatalogEnabled()) return getMockProducts();

  const supabase = createServerStoreClient();
  const { data } = await supabase.from("products").select("*").order("sort_order").order("name");
  return (data ?? []).map((row) => mapDbProduct(row));
}

export async function countProducts(): Promise<number> {
  const products = await listProducts();
  return products.length;
}
