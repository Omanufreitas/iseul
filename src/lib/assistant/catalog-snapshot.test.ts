import { describe, expect, it } from "vitest";
import { formatCatalogSnapshot, formatStoreFacts, toAssistantProductLine } from "./catalog-snapshot";
import type { Product } from "@/types";

function product(partial: Partial<Product> & Pick<Product, "name" | "slug">): Product {
  return {
    id: partial.id ?? "p1",
    shopee_id: null,
    sku: null,
    ncm: null,
    tax_origin: 0,
    unit: "UN",
    bling_product_id: null,
    bling_sync_status: null,
    bling_sync_error: null,
    full_name: partial.name,
    brand: "Beauty of Joseon",
    category_slug: "serum",
    category_label: "Sérum",
    price: 89,
    compare_at_price: null,
    pitch: "Hidrata sem pesar.",
    image_url: "/x.jpg",
    image_urls: [],
    image_fallback_url: null,
    shopee_url: null,
    sold_count: 0,
    rating: 0,
    review_count: 0,
    stock: 3,
    active: true,
    featured: false,
    sort_order: 0,
    skin_types: ["oleosa"],
    ...partial,
  };
}

describe("assistant catalog snapshot", () => {
  it("inclui slug, preço e estoque", () => {
    const line = toAssistantProductLine(product({ name: "Relief Sun", slug: "relief-sun", stock: 2 }));
    expect(line.slug).toBe("relief-sun");
    expect(line.stock).toBe("em estoque");
    expect(line.price).toContain("89");
  });

  it("marca esgotado e lista o slug no texto", () => {
    const text = formatCatalogSnapshot([
      product({ name: "Relief Sun", slug: "relief-sun", stock: 0 }),
    ]);
    expect(text).toContain("esgotado");
    expect(text).toContain("/produtos/relief-sun");
    expect(text).not.toContain("slug:");
    expect(text).not.toContain("produto inventado");
  });

  it("ensina o desconto de Pix do checkout sem tratar como cupom", () => {
    const facts = formatStoreFacts({
      id: 1,
      store_name: "Iseul",
      tagline: "",
      announcement: "",
      free_shipping_threshold: 199,
      pix_discount_percent: 5,
      trust_rating: 5,
      trust_rating_label: "",
    });
    expect(facts).toMatch(/Pix tem 5%/);
    expect(facts).toContain("Não é cupom");
    expect(facts).toContain("Não invente cupom, percentual extra");
  });
});
