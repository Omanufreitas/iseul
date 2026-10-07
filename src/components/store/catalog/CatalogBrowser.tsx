"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Search, X } from "lucide-react";
import { ProductCard } from "@/components/store/ProductCard";
import { trackMetaSearch } from "@/lib/analytics/meta";
import { SKIN_TYPES } from "@/lib/constants";
import type { ProductCategory } from "@/lib/categories";
import {
  CATALOG_PAGE_SIZE,
  CATALOG_SORT_OPTIONS,
  type CatalogFilterState,
  type CatalogSortKey,
  buildCatalogSearchParams,
  catalogFiltersActive,
  filterAndSortProducts,
  parseCatalogSearchParams,
  uniqueBrands,
} from "@/lib/catalog-filter";
import type { Product } from "@/types";

type Props = {
  products: Product[];
  categories: ProductCategory[];
  /** Título / eyebrow da seção */
  heading?: { eyebrow: string; title: ReactNode; subtitle?: string };
  sectionId?: string;
};

export function CatalogBrowser({
  products,
  categories,
  heading = {
    eyebrow: "produtos",
    title: (
      <>
        Tudo que está <em>no catálogo.</em>
      </>
    ),
  },
  sectionId = "catalogo",
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const initial = useMemo(
    () => parseCatalogSearchParams(searchParams),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync from URL on mount / external nav
    [searchParams.toString()]
  );

  const [qInput, setQInput] = useState(initial.q);
  const [q, setQ] = useState(initial.q);
  const [categoria, setCategoria] = useState(initial.categoria);
  const [marca, setMarca] = useState(initial.marca);
  const [pele, setPele] = useState(initial.pele);
  const [ordem, setOrdem] = useState<CatalogSortKey>(initial.ordem);
  const [visibleCount, setVisibleCount] = useState(CATALOG_PAGE_SIZE);
  const skipUrlWrite = useRef(false);
  const lastTrackedQuery = useRef("");

  // Sync state when URL changes externally (ads, back/forward, rotina links)
  useEffect(() => {
    skipUrlWrite.current = true;
    setQInput(initial.q);
    setQ(initial.q);
    setCategoria(initial.categoria);
    setMarca(initial.marca);
    setPele(initial.pele);
    setOrdem(initial.ordem);
    setVisibleCount(CATALOG_PAGE_SIZE);
  }, [initial]);

  // Debounce search input → query
  useEffect(() => {
    const t = window.setTimeout(() => setQ(qInput), 200);
    return () => window.clearTimeout(t);
  }, [qInput]);

  const filters: CatalogFilterState = useMemo(
    () => ({ q, categoria, marca, pele, ordem }),
    [q, categoria, marca, pele, ordem]
  );

  // Write filters to URL
  useEffect(() => {
    if (skipUrlWrite.current) {
      skipUrlWrite.current = false;
      return;
    }
    const next = buildCatalogSearchParams(filters);
    const current = new URLSearchParams(searchParams.toString());
    // Ignore legacy `cat` when comparing
    current.delete("cat");
    if (next.toString() === current.toString()) return;
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [filters, pathname, router, searchParams]);

  // Meta Search (once per distinct query after debounce)
  useEffect(() => {
    const trimmed = q.trim();
    if (!trimmed || trimmed === lastTrackedQuery.current) return;
    lastTrackedQuery.current = trimmed;
    trackMetaSearch(trimmed);
  }, [q]);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(CATALOG_PAGE_SIZE);
  }, [q, categoria, marca, pele, ordem]);

  const brands = useMemo(() => uniqueBrands(products), [products]);

  const categoryChips = useMemo(() => {
    const fromDb = categories.length
      ? categories
      : [...new Set(products.map((p) => p.category_slug))].map((slug) => {
          const product = products.find((p) => p.category_slug === slug);
          return { slug, label: product?.category_label ?? slug, sort_order: 0 };
        });
    return [{ slug: "all", label: "Tudo", sort_order: -1 }, ...fromDb];
  }, [categories, products]);

  const chips = categoryChips.filter((c) => {
    if (c.slug === "all") return products.length > 0;
    return products.some((p) => p.category_slug === c.slug);
  });

  const filtered = useMemo(
    () => filterAndSortProducts(products, filters),
    [products, filters]
  );

  const visible = filtered.slice(0, visibleCount);
  const remaining = Math.max(0, filtered.length - visible.length);
  const hasActiveFilters = catalogFiltersActive(filters);

  const clearFilters = useCallback(() => {
    setQInput("");
    setQ("");
    setCategoria("all");
    setMarca("all");
    setPele("all");
    setOrdem("sold");
    lastTrackedQuery.current = "";
  }, []);

  if (products.length === 0) return null;

  return (
    <section
      id={sectionId}
      className="landing-section scroll-mt-[70px] bg-iseul-areia/50"
    >
      <div className="wrap">
        <div className="cab mb-8 sm:mb-9">
          <p className="eyebrow">{heading.eyebrow}</p>
          <h2>{heading.title}</h2>
          {heading.subtitle ? (
            <p className="mt-2 max-w-xl text-[15px] text-iseul-muted">{heading.subtitle}</p>
          ) : null}
        </div>

        <div className="relative z-0 mb-7 space-y-3 lg:sticky lg:top-16 lg:z-30 lg:-mx-1 lg:bg-iseul-areia/95 lg:px-1 lg:py-3 lg:backdrop-blur-md lg:supports-[backdrop-filter]:bg-iseul-areia/85">
          <div className="rounded-[1.35rem] border border-iseul-line/80 bg-iseul-paper p-3.5 shadow-[0_8px_32px_-20px_rgba(45,42,38,0.18)] sm:p-4">
            <div className="mb-3">
              <label htmlFor="catalog-search" className="sr-only">
                Buscar produto, marca ou ativo
              </label>
              <div className="relative">
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-iseul-muted"
                  aria-hidden
                />
                <input
                  id="catalog-search"
                  type="search"
                  value={qInput}
                  onChange={(e) => setQInput(e.target.value)}
                  placeholder="Buscar produto, marca ou ativo…"
                  className="w-full rounded-full border border-iseul-line/90 bg-white py-2.5 pl-10 pr-10 text-[13.5px] text-iseul-ink shadow-sm transition placeholder:text-iseul-muted/80 focus:border-iseul-sage focus:outline-none focus:ring-2 focus:ring-iseul-sage/25"
                  autoComplete="off"
                />
                {qInput ? (
                  <button
                    type="button"
                    onClick={() => {
                      setQInput("");
                      setQ("");
                    }}
                    aria-label="Limpar busca"
                    className="absolute right-2.5 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-iseul-muted transition hover:bg-iseul-areia hover:text-iseul-ink"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mb-3 flex items-center justify-between gap-2 lg:hidden">
              <p className="text-[13px] text-iseul-muted tabular-nums">
                <span className="font-medium text-iseul-ink">{filtered.length}</span>{" "}
                {filtered.length === 1 ? "produto" : "produtos"}
              </p>
              {hasActiveFilters ? (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-full border border-iseul-line bg-white px-3 py-1.5 text-[12.5px] font-medium text-iseul-ink transition hover:border-iseul-sage"
                >
                  Limpar
                </button>
              ) : null}
            </div>

            <div className="space-y-4">
              <div
                className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] lg:flex-wrap lg:justify-center lg:overflow-visible lg:pb-0 [&::-webkit-scrollbar]:hidden"
                role="group"
                aria-label="Categorias"
              >
                {chips.map((c) => {
                  const n =
                    c.slug === "all"
                      ? products.length
                      : products.filter((p) => p.category_slug === c.slug).length;
                  const active = categoria === c.slug;
                  return (
                    <button
                      key={c.slug}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setCategoria(c.slug)}
                      className={[
                        "inline-flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iseul-sage/40",
                        active
                          ? "border-iseul-sage bg-iseul-sage text-white shadow-sm"
                          : "border-iseul-line/90 bg-white text-iseul-muted hover:border-iseul-sage/50 hover:text-iseul-ink",
                      ].join(" ")}
                    >
                      <span>{c.label}</span>
                      <span
                        className={[
                          "min-w-[1.25rem] rounded-full px-1.5 py-0.5 text-center text-[10px] font-medium tabular-nums",
                          active ? "bg-white/20 text-white" : "bg-iseul-areia text-iseul-muted",
                        ].join(" ")}
                      >
                        {n}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col items-stretch gap-2 border-t border-iseul-line/70 pt-3.5 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center">
                <div className="relative w-full sm:w-auto sm:min-w-[168px]">
                  <label htmlFor="catalog-brand" className="sr-only">
                    Filtrar por marca
                  </label>
                  <select
                    id="catalog-brand"
                    value={marca}
                    onChange={(e) => setMarca(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-iseul-line/80 bg-iseul-areia/60 py-2.5 pl-3.5 pr-10 text-[13px] text-iseul-ink transition focus:border-iseul-sage focus:bg-white focus:outline-none focus:ring-2 focus:ring-iseul-sage/25"
                  >
                    <option value="all">Todas as marcas</option>
                    {brands.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-iseul-muted"
                    aria-hidden
                  />
                </div>

                <div className="relative w-full sm:w-auto sm:min-w-[168px]">
                  <label htmlFor="catalog-skin" className="sr-only">
                    Filtrar por tipo de pele
                  </label>
                  <select
                    id="catalog-skin"
                    value={pele}
                    onChange={(e) => setPele(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-iseul-line/80 bg-iseul-areia/60 py-2.5 pl-3.5 pr-10 text-[13px] text-iseul-ink transition focus:border-iseul-sage focus:bg-white focus:outline-none focus:ring-2 focus:ring-iseul-sage/25"
                  >
                    <option value="all">Tipo de pele</option>
                    {SKIN_TYPES.map((skin) => (
                      <option key={skin.slug} value={skin.slug}>
                        {skin.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-iseul-muted"
                    aria-hidden
                  />
                </div>

                <div className="relative w-full sm:w-auto sm:min-w-[158px]">
                  <label htmlFor="catalog-sort" className="sr-only">
                    Ordenar produtos
                  </label>
                  <select
                    id="catalog-sort"
                    value={ordem}
                    onChange={(e) => setOrdem(e.target.value as CatalogSortKey)}
                    className="w-full appearance-none rounded-xl border border-iseul-line/80 bg-iseul-areia/60 py-2.5 pl-3.5 pr-10 text-[13px] text-iseul-ink transition focus:border-iseul-sage focus:bg-white focus:outline-none focus:ring-2 focus:ring-iseul-sage/25"
                  >
                    {CATALOG_SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-iseul-muted"
                    aria-hidden
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="hidden flex-wrap items-center justify-between gap-2 px-1 text-[13px] text-iseul-muted lg:flex">
            <p className="tabular-nums">
              <span className="font-medium text-iseul-ink">{filtered.length}</span>{" "}
              {filtered.length === 1 ? "produto" : "produtos"}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-full border border-iseul-line bg-white px-3 py-1.5 text-[12.5px] font-medium text-iseul-ink transition hover:border-iseul-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iseul-sage/40"
              >
                Limpar filtros
              </button>
            ) : null}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-iseul-muted">
              {q.trim()
                ? `Nenhum produto encontrado para “${q.trim()}”`
                : "Nenhum produto com esses filtros."}
            </p>
            {hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 rounded-full border border-iseul-ink px-4 py-2 text-sm font-medium text-iseul-ink transition hover:bg-iseul-ink hover:text-iseul-paper"
              >
                Limpar busca e filtros
              </button>
            ) : null}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-3.5 xl:grid-cols-4">
              {visible.map((p, i) => (
                <ProductCard
                  key={p.id}
                  product={p}
                  allProducts={products}
                  index={i}
                  visible
                  compact
                />
              ))}
            </div>

            {remaining > 0 ? (
              <div className="mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() =>
                    setVisibleCount((n) => n + CATALOG_PAGE_SIZE)
                  }
                  className="rounded-full border border-iseul-ink bg-white px-5 py-2.5 text-sm font-medium text-iseul-ink shadow-sm transition hover:bg-iseul-ink hover:text-iseul-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iseul-sage/40"
                >
                  Ver mais ({remaining} {remaining === 1 ? "restante" : "restantes"})
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>
    </section>
  );
}
