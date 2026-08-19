import { isMockCatalogEnabled, isSupabaseConfigured } from "@/lib/config";
import { createServerStoreClient } from "@/lib/supabase/client";
import {
  getMockProductById,
  getMockProductBySlug,
  getMockProducts,
  getMockSettings,
} from "@/lib/mock-catalog";
import { mapDbProduct } from "@/lib/products";
import type { Product, StoreSettings } from "@/types";

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
  return sortProducts(products, options?.sort ?? "sold");
}

function sortProducts(products: Product[], sort: string): Product[] {
  const list = [...products];
  if (sort === "price_asc") return list.sort((a, b) => a.price - b.price);
  if (sort === "price_desc") return list.sort((a, b) => b.price - a.price);
  if (sort === "new") return list.sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  return list.sort((a, b) => b.sold_count - a.sold_count || b.review_count - a.review_count);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (isMockCatalogEnabled()) {
    const p = getMockProductBySlug(slug);
    return p?.active ? p : null;
  }

  const supabase = createServerStoreClient();
  const { data } = await supabase.from("products").select("*").eq("slug", slug).eq("active", true).maybeSingle();
  if (!data) return getMockProductBySlug(slug);
  return mapDbProduct(data);
}

export async function getProductById(id: string): Promise<Product | null> {
  if (isMockCatalogEnabled()) return getMockProductById(id);

  const supabase = createServerStoreClient();
  const { data } = await supabase.from("products").select("*").eq("id", id).maybeSingle();
  if (!data) return getMockProductById(id);
  return mapDbProduct(data);
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
