import "server-only";

import { randomUUID } from "crypto";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import type { Product, SeedProduct } from "@/types";
import { uniqueSlug, slugify } from "@/lib/utils";

const LOCAL_FILE = path.join(process.cwd(), "data", "products.local.json");
const SEED_FILE = path.join(process.cwd(), "data", "products.seed.json");

let cache: Product[] | null = null;

function seedToProduct(row: SeedProduct, slug: string): Product {
  return {
    id: `seed-${row.id}`,
    shopee_id: row.id,
    sku: null,
    ncm: null,
    tax_origin: 1,
    unit: "UN",
    bling_product_id: null,
    bling_sync_status: null,
    bling_sync_error: null,
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
    image_urls: row.img ? [row.img] : [],
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

function loadSeedProducts(): Product[] {
  const raw = readFileSync(SEED_FILE, "utf-8");
  const rows = JSON.parse(raw) as SeedProduct[];
  const slugs = new Set<string>();
  return rows.map((row) => {
    const slug = uniqueSlug(row.name, slugs);
    slugs.add(slug);
    return seedToProduct(row, slug);
  });
}

export function loadMockProducts(): Product[] {
  if (cache) return cache;

  if (existsSync(LOCAL_FILE)) {
    const raw = readFileSync(LOCAL_FILE, "utf-8");
    cache = JSON.parse(raw) as Product[];
    return cache;
  }

  cache = loadSeedProducts();
  return cache;
}

export function persistMockProducts(products: Product[]) {
  writeFileSync(LOCAL_FILE, JSON.stringify(products, null, 2), "utf-8");
  cache = products;
}

export function invalidateMockCache() {
  cache = null;
}

export function isUsingLocalCatalog(): boolean {
  return existsSync(LOCAL_FILE);
}

export function createMockProductId() {
  return `local-${randomUUID()}`;
}

export function ensureUniqueSlug(name: string, products: Product[], excludeId?: string) {
  const slugs = new Set(products.filter((p) => p.id !== excludeId).map((p) => p.slug));
  const base = slugify(name);
  if (!slugs.has(base)) return base;
  let i = 2;
  while (slugs.has(`${base}-${i}`)) i++;
  return `${base}-${i}`;
}

export type MockProductInput = Omit<
  Product,
  "id" | "created_at" | "updated_at" | "shopee_id" | "shopee_url"
> & {
  shopee_id?: number | null;
  shopee_url?: string | null;
};

export function upsertMockProduct(input: MockProductInput, id?: string): Product {
  const products = [...loadMockProducts()];
  const now = new Date().toISOString();
  const slug = input.slug?.trim() || ensureUniqueSlug(input.name, products, id);

  if (id) {
    const idx = products.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error("Produto não encontrado");
    const updated: Product = {
      ...products[idx],
      ...input,
      slug,
      updated_at: now,
    };
    products[idx] = updated;
    persistMockProducts(products);
    return updated;
  }

  const created: Product = {
    ...input,
    id: createMockProductId(),
    slug,
    shopee_id: input.shopee_id ?? null,
    shopee_url: input.shopee_url ?? null,
    created_at: now,
    updated_at: now,
  };
  products.unshift(created);
  persistMockProducts(products);
  return created;
}

export function deleteMockProduct(id: string) {
  const products = loadMockProducts().filter((p) => p.id !== id);
  if (products.length === loadMockProducts().length) {
    throw new Error("Produto não encontrado");
  }
  persistMockProducts(products);
}

export function toggleMockProductActive(id: string, active: boolean) {
  const products = [...loadMockProducts()];
  const idx = products.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Produto não encontrado");
  products[idx] = { ...products[idx], active, updated_at: new Date().toISOString() };
  persistMockProducts(products);
}
