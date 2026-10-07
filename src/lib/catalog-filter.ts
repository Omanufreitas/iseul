import type { Product } from "@/types";

export type CatalogSortKey = "sold" | "new" | "price_asc" | "price_desc";

export const CATALOG_PAGE_SIZE = 16;

/** Quantos produtos entram no bloco “Mais vendidos” da home. */
export const HOME_BESTSELLERS_LIMIT = 12;

export const CATALOG_SORT_OPTIONS: { value: CatalogSortKey; label: string }[] = [
  { value: "sold", label: "Mais vendidos" },
  { value: "new", label: "Novidades" },
  { value: "price_asc", label: "Menor preço" },
  { value: "price_desc", label: "Maior preço" },
];

/** Aliases usados na rotina / links antigos (?cat=). */
export const CATEGORY_ALIASES: Record<string, string> = {
  limpeza: "limpeza",
  tratamento: "serum",
  serum: "serum",
  hidratacao: "hidratante",
  hidratação: "hidratante",
  hidratante: "hidratante",
  protecao: "solar",
  proteção: "solar",
  solar: "solar",
};

export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function resolveCategoryParam(raw: string | null | undefined): string {
  if (!raw) return "all";
  const lower = raw.toLowerCase().trim();
  if (!lower || lower === "all" || lower === "tudo") return "all";
  return CATEGORY_ALIASES[lower] ?? lower;
}

export function resolveSortParam(raw: string | null | undefined): CatalogSortKey {
  if (raw === "new" || raw === "novidades") return "new";
  if (raw === "price_asc" || raw === "menor") return "price_asc";
  if (raw === "price_desc" || raw === "maior") return "price_desc";
  return "sold";
}

/** Match parcial: todos os termos da busca precisam aparecer em algum dos campos. */
export function productMatchesQuery(product: Product, query: string): boolean {
  const q = normalizeSearchText(query);
  if (!q) return true;
  const terms = q.split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const haystack = normalizeSearchText(
    [
      product.name,
      product.full_name,
      product.brand,
      product.category_label,
      product.category_slug,
      product.pitch,
    ].join(" ")
  );

  return terms.every((term) => haystack.includes(term));
}

export function uniqueBrands(products: Product[]): string[] {
  const set = new Set<string>();
  for (const p of products) {
    const brand = p.brand?.trim();
    if (brand) set.add(brand);
  }
  return [...set].sort((a, b) => a.localeCompare(b, "pt-BR", { sensitivity: "base" }));
}

export type CatalogFilterState = {
  q: string;
  categoria: string;
  marca: string;
  pele: string;
  ordem: CatalogSortKey;
};

export function filterAndSortProducts(
  products: Product[],
  filters: CatalogFilterState
): Product[] {
  let list = products;

  if (filters.categoria && filters.categoria !== "all") {
    list = list.filter((p) => p.category_slug === filters.categoria);
  }

  if (filters.marca && filters.marca !== "all") {
    const brandNorm = normalizeSearchText(filters.marca);
    list = list.filter((p) => normalizeSearchText(p.brand) === brandNorm);
  }

  if (filters.pele && filters.pele !== "all") {
    list = list.filter(
      (p) => p.skin_types.includes(filters.pele) || p.skin_types.includes("todos")
    );
  }

  if (filters.q.trim()) {
    list = list.filter((p) => productMatchesQuery(p, filters.q));
  }

  if (filters.ordem === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
  else if (filters.ordem === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
  else if (filters.ordem === "new")
    list = [...list].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
  else
    list = [...list].sort(
      (a, b) => b.sold_count - a.sold_count || b.review_count - a.review_count
    );

  return list;
}

export function catalogFiltersActive(filters: CatalogFilterState): boolean {
  return Boolean(
    filters.q.trim() ||
      (filters.categoria && filters.categoria !== "all") ||
      (filters.marca && filters.marca !== "all") ||
      (filters.pele && filters.pele !== "all")
  );
}

export function buildCatalogSearchParams(filters: CatalogFilterState): URLSearchParams {
  const params = new URLSearchParams();
  if (filters.q.trim()) params.set("q", filters.q.trim());
  if (filters.categoria && filters.categoria !== "all") params.set("categoria", filters.categoria);
  if (filters.marca && filters.marca !== "all") params.set("marca", filters.marca);
  if (filters.pele && filters.pele !== "all") params.set("pele", filters.pele);
  if (filters.ordem && filters.ordem !== "sold") params.set("ordem", filters.ordem);
  return params;
}

export function parseCatalogSearchParams(
  searchParams: URLSearchParams | { get: (key: string) => string | null }
): CatalogFilterState {
  const catRaw = searchParams.get("categoria") ?? searchParams.get("cat");
  return {
    q: searchParams.get("q")?.trim() ?? "",
    categoria: resolveCategoryParam(catRaw),
    marca: searchParams.get("marca")?.trim() || "all",
    pele: searchParams.get("pele")?.trim() || "all",
    ordem: resolveSortParam(searchParams.get("ordem")),
  };
}

export function topSoldProducts(products: Product[], limit = 8): Product[] {
  return [...products]
    .sort((a, b) => b.sold_count - a.sold_count || b.review_count - a.review_count)
    .slice(0, limit);
}

/**
 * Produtos escolhidos no admin (`featured`) para a home.
 * Se ninguém estiver marcado, cai no ranking por vendas.
 */
export function homeBestsellers(
  products: Product[],
  limit = HOME_BESTSELLERS_LIMIT
): Product[] {
  const picked = products
    .filter((p) => p.featured && p.active)
    .sort(
      (a, b) =>
        a.sort_order - b.sort_order ||
        b.sold_count - a.sold_count ||
        b.review_count - a.review_count
    )
    .slice(0, limit);

  if (picked.length > 0) return picked;
  return topSoldProducts(
    products.filter((p) => p.active),
    limit
  );
}
