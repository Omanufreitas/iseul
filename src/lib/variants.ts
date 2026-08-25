import type { ProductVariant } from "@/types";

export function mapDbVariant(row: Record<string, unknown>): ProductVariant {
  return {
    id: String(row.id),
    product_id: String(row.product_id),
    label: String(row.label),
    sku: row.sku ? String(row.sku) : null,
    price: Number(row.price),
    compare_at_price: row.compare_at_price != null ? Number(row.compare_at_price) : null,
    stock: Number(row.stock ?? 0),
    image_url: row.image_url ? String(row.image_url) : null,
    sort_order: Number(row.sort_order ?? 0),
    active: Boolean(row.active ?? true),
  };
}

export function aggregateFromVariants(variants: ProductVariant[]) {
  const active = variants.filter((v) => v.active);
  if (active.length === 0) return null;

  const price = Math.min(...active.map((v) => v.price));
  const compareCandidates = active
    .map((v) => v.compare_at_price)
    .filter((v): v is number => v != null && v > 0);
  const compare_at_price =
    compareCandidates.length > 0 ? Math.max(...compareCandidates) : null;
  const stock = active.reduce((sum, v) => sum + v.stock, 0);
  const primaryImage = active.find((v) => v.image_url)?.image_url ?? null;

  return { price, compare_at_price, stock, primaryImage };
}
