import "server-only";
import { readFileSync } from "fs";
import path from "path";
import type { Product, SeedProduct, StoreSettings } from "@/types";
import { DEFAULT_STORE_SETTINGS } from "@/lib/constants";
import { uniqueSlug } from "@/lib/utils";

function seedPath() {
  return path.join(process.cwd(), "data", "products.seed.json");
}

function seedToProduct(row: SeedProduct, slug: string): Product {
  return {
    id: `seed-${row.id}`,
    shopee_id: row.id,
    slug,
    name: row.name,
    full_name: row.full,
    brand: row.brand,
    category_slug: row.cat,
    category_label: row.catLabel,
    price: row.price,
    compare_at_price: row.before > 0 ? row.before : null,
    pitch: row.pitch,
    image_url: row.img,
    image_fallback_url: row.fallback || null,
    shopee_url: row.shopee || null,
    sold_count: row.sold,
    rating: row.rating,
    review_count: row.rcount,
    stock: 10,
    active: true,
    featured: false,
    sort_order: 0,
  };
}

let cachedMockProducts: Product[] | null = null;

export function getMockProducts(): Product[] {
  if (cachedMockProducts) return cachedMockProducts;
  const raw = readFileSync(seedPath(), "utf-8");
  const rows = JSON.parse(raw) as SeedProduct[];
  const slugs = new Set<string>();
  cachedMockProducts = rows.map((row) => {
    const slug = uniqueSlug(row.name, slugs);
    slugs.add(slug);
    return seedToProduct(row, slug);
  });
  return cachedMockProducts;
}

export function getMockProductBySlug(slug: string): Product | null {
  return getMockProducts().find((p) => p.slug === slug) ?? null;
}

export function getMockProductById(id: string): Product | null {
  return getMockProducts().find((p) => p.id === id) ?? null;
}

export function getMockSettings(): StoreSettings {
  return { id: 1, ...DEFAULT_STORE_SETTINGS };
}
