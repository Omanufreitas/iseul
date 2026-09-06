import type { Product } from "@/types";
import { productImagesFromRow, primaryProductImageUrl } from "@/lib/product-image";
import { slugify } from "@/lib/utils";

export function mapDbProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    shopee_id: row.shopee_id != null ? Number(row.shopee_id) : null,
    sku: row.sku ? String(row.sku) : null,
    ncm: row.ncm ? String(row.ncm) : null,
    tax_origin: Number(row.tax_origin ?? 1),
    unit: String(row.unit ?? "UN"),
    bling_product_id: row.bling_product_id ? String(row.bling_product_id) : null,
    bling_sync_status: row.bling_sync_status ? String(row.bling_sync_status) : null,
    bling_sync_error: row.bling_sync_error ? String(row.bling_sync_error) : null,
    slug: String(row.slug),
    name: String(row.name),
    full_name: String(row.full_name ?? ""),
    brand: String(row.brand ?? ""),
    category_slug: String(row.category_slug),
    category_label: String(row.category_label),
    price: Number(row.price),
    compare_at_price: row.compare_at_price != null ? Number(row.compare_at_price) : null,
    pitch: String(row.pitch ?? ""),
    image_url: String(row.image_url ?? ""),
    image_urls: productImagesFromRow(row),
    image_fallback_url: row.image_fallback_url ? String(row.image_fallback_url) : null,
    shopee_url: row.shopee_url ? String(row.shopee_url) : null,
    sold_count: Number(row.sold_count ?? 0),
    rating: Number(row.rating ?? 0),
    review_count: Number(row.review_count ?? 0),
    stock: Number(row.stock ?? 0),
    active: Boolean(row.active),
    featured: Boolean(row.featured),
    sort_order: Number(row.sort_order ?? 0),
    skin_types: Array.isArray(row.skin_types)
      ? row.skin_types.map(String)
      : [],
    created_at: row.created_at ? String(row.created_at) : undefined,
    updated_at: row.updated_at ? String(row.updated_at) : undefined,
  };
}

export function productToDbPayload(
  input: Partial<Product> & {
    name: string;
    slug: string;
    category_slug: string;
    category_label: string;
    price: number;
  }
) {
  return {
    shopee_id: input.shopee_id ?? null,
    sku: input.sku?.trim() || null,
    ncm: input.ncm?.replace(/\D/g, "") || null,
    tax_origin: input.tax_origin ?? 1,
    unit: input.unit?.trim() || "UN",
    slug: input.slug || slugify(input.name),
    name: input.name,
    full_name: input.full_name ?? input.name,
    brand: input.brand ?? "",
    category_slug: input.category_slug,
    category_label: input.category_label,
    price: input.price,
    compare_at_price: input.compare_at_price ?? null,
    pitch: input.pitch ?? "",
    image_url: primaryProductImageUrl(input.image_urls ?? []) || input.image_url || "",
    image_urls: input.image_urls ?? (input.image_url ? [input.image_url] : []),
    image_fallback_url: input.image_fallback_url ?? null,
    shopee_url: input.shopee_url ?? null,
    sold_count: input.sold_count ?? 0,
    rating: input.rating ?? 0,
    review_count: input.review_count ?? 0,
    stock: input.stock ?? 0,
    active: input.active ?? true,
    featured: input.featured ?? false,
    sort_order: input.sort_order ?? 0,
    skin_types: input.skin_types ?? [],
  };
}

export function getHotProductIds(products: Product[], limit = 3): Set<string> {
  const hot = [...products]
    .filter((p) => p.sold_count > 0)
    .sort((a, b) => b.sold_count - a.sold_count)
    .slice(0, limit)
    .map((p) => p.id);
  return new Set(hot);
}
