import { describe, expect, it } from "vitest";
import { FACEBOOK_DOMAIN_VERIFICATION } from "@/lib/site";
import { buildProductJsonLd, productMetadata } from "@/lib/metadata";
import type { Product } from "@/types";

const sampleProduct: Product = {
  id: "p1",
  shopee_id: null,
  sku: "ISEUL-TEST-01",
  ncm: null,
  tax_origin: 1,
  unit: "UN",
  bling_product_id: null,
  bling_sync_status: null,
  bling_sync_error: null,
  slug: "serum-teste",
  name: "Sérum Teste",
  full_name: "Sérum Teste\nSegunda linha",
  brand: "Anua",
  category_slug: "serum",
  category_label: "Sérum & ampola",
  price: 89.9,
  compare_at_price: 109.9,
  pitch: "Texto curto do produto.",
  image_url: "https://iseul.com.br/img/test.jpg",
  image_urls: ["https://iseul.com.br/img/test.jpg"],
  image_fallback_url: null,
  shopee_url: null,
  sold_count: 10,
  rating: 4.8,
  review_count: 5,
  stock: 3,
  active: true,
  featured: false,
  sort_order: 0,
  skin_types: ["oleosa"],
};

describe("facebook domain verification", () => {
  it("mantém a tag do BM iseul.br", () => {
    expect(FACEBOOK_DOMAIN_VERIFICATION).toBe("jfdasg3ei8a84chggdaln5cweoc4f4");
  });
});

describe("productMetadata", () => {
  it("gera canonical e og:image por produto", () => {
    const meta = productMetadata(sampleProduct);
    expect(meta.title).toBe("Sérum Teste | Iseul");
    expect(meta.alternates?.canonical).toBe("/produtos/serum-teste");
    expect(meta.openGraph?.url).toBe("https://iseul.com.br/produtos/serum-teste");
    expect(meta.openGraph?.images?.[0]).toEqual({
      url: "https://iseul.com.br/img/test.jpg",
      alt: "Sérum Teste",
    });
  });
});

describe("buildProductJsonLd", () => {
  it("inclui Product schema com estoque", () => {
    const json = buildProductJsonLd(sampleProduct);
    expect(json["@type"]).toBe("Product");
    expect(json.name).toBe("Sérum Teste");
    expect(json.sku).toBe("ISEUL-TEST-01");
    expect(json.offers.priceCurrency).toBe("BRL");
    expect(json.offers.availability).toBe("https://schema.org/InStock");
  });

  it("marca OutOfStock quando sem estoque", () => {
    const json = buildProductJsonLd({ ...sampleProduct, stock: 0 });
    expect(json.offers.availability).toBe("https://schema.org/OutOfStock");
  });
});
