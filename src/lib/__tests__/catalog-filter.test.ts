import { describe, expect, it } from "vitest";
import {
  HOME_BESTSELLERS_LIMIT,
  buildCatalogSearchParams,
  filterAndSortProducts,
  homeBestsellers,
  normalizeSearchText,
  parseCatalogSearchParams,
  productMatchesQuery,
  resolveCategoryParam,
} from "@/lib/catalog-filter";
import type { Product } from "@/types";

function product(partial: Partial<Product> & Pick<Product, "id" | "name" | "slug">): Product {
  return {
    shopee_id: null,
    sku: null,
    ncm: null,
    tax_origin: 0,
    unit: "UN",
    bling_product_id: null,
    bling_sync_status: null,
    bling_sync_error: null,
    full_name: partial.name,
    brand: "Celimax",
    category_slug: "serum",
    category_label: "Sérum",
    price: 100,
    compare_at_price: null,
    pitch: "Com retinal",
    image_url: "/x.jpg",
    image_urls: [],
    image_fallback_url: null,
    shopee_url: null,
    sold_count: 10,
    rating: 5,
    review_count: 1,
    stock: 5,
    active: true,
    featured: false,
    sort_order: 0,
    skin_types: [],
    ...partial,
  };
}

describe("catalog-filter", () => {
  it("normaliza acentos e maiúsculas", () => {
    expect(normalizeSearchText("Sérum Retinál")).toBe("serum retinal");
  });

  it("faz match parcial por termos", () => {
    const p = product({
      id: "1",
      slug: "a",
      name: "Eye Cream",
      brand: "Abib",
      pitch: "Retinal para olhos",
      category_label: "Área dos olhos",
    });
    expect(productMatchesQuery(p, "retinal olhos")).toBe(true);
    expect(productMatchesQuery(p, "celimax")).toBe(false);
  });

  it("combina filtros e lê URL", () => {
    const list = [
      product({ id: "1", slug: "a", name: "Serum A", brand: "Celimax", category_slug: "serum", price: 80 }),
      product({
        id: "2",
        slug: "b",
        name: "Gel",
        brand: "Creamy",
        category_slug: "limpeza",
        price: 40,
        skin_types: ["oleosa"],
      }),
    ];
    const filtered = filterAndSortProducts(list, {
      q: "gel",
      categoria: "limpeza",
      marca: "Creamy",
      pele: "oleosa",
      ordem: "price_asc",
    });
    expect(filtered.map((p) => p.id)).toEqual(["2"]);

    expect(resolveCategoryParam("protecao")).toBe("solar");
    const parsed = parseCatalogSearchParams(
      new URLSearchParams("q=retinal&categoria=serum&marca=Celimax&pele=seca&ordem=price_desc")
    );
    expect(parsed.q).toBe("retinal");
    expect(parsed.categoria).toBe("serum");
    expect(parsed.ordem).toBe("price_desc");

    const built = buildCatalogSearchParams(parsed);
    expect(built.get("q")).toBe("retinal");
    expect(built.get("marca")).toBe("Celimax");
  });

  it("não trata o slug todos como todos os filtros", () => {
    const list = [
      product({ id: "1", slug: "a", name: "A", skin_types: ["todos"] }),
      product({ id: "2", slug: "b", name: "B", skin_types: ["oleosa"] }),
    ];
    const filtered = filterAndSortProducts(list, {
      q: "",
      categoria: "all",
      marca: "all",
      pele: "oleosa",
      ordem: "sold",
    });
    expect(filtered.map((p) => p.id)).toEqual(["2"]);
  });

  it("prioriza featured na home e limita a 12", () => {
    const list = Array.from({ length: 15 }, (_, i) =>
      product({
        id: String(i),
        slug: `p-${i}`,
        name: `P ${i}`,
        featured: i < 5,
        sold_count: 15 - i,
        active: true,
      })
    );
    const home = homeBestsellers(list, HOME_BESTSELLERS_LIMIT);
    expect(home).toHaveLength(5);
    expect(home.every((p) => p.featured)).toBe(true);

    const noneFeatured = list.map((p) => ({ ...p, featured: false }));
    expect(homeBestsellers(noneFeatured, 12)).toHaveLength(12);
  });
});
