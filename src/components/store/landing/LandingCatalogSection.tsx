"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import { SKIN_TYPES } from "@/lib/constants";
import type { ProductCategory } from "@/lib/categories";
import type { Product } from "@/types";

type SortKey = "sold" | "price_asc" | "price_desc" | "new";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "sold", label: "Mais vendidos" },
  { value: "new", label: "Novidades" },
  { value: "price_asc", label: "Menor preço" },
  { value: "price_desc", label: "Maior preço" },
];

const SELECTION_MAP: Record<string, string> = {
  limpeza: "limpeza",
  tratamento: "serum",
  hidratacao: "hidratante",
  hidratação: "hidratante",
  protecao: "solar",
  proteção: "solar",
};

function resolveCategory(raw: string | null): string {
  if (!raw) return "all";
  const lower = raw.toLowerCase();
  return SELECTION_MAP[lower] ?? lower;
}

type Props = {
  products: Product[];
  categories: ProductCategory[];
};

export function LandingCatalogSection({ products, categories }: Props) {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState("all");
  const [skinFilter, setSkinFilter] = useState("all");
  const [sort, setSort] = useState<SortKey>("sold");

  useEffect(() => {
    const cat = resolveCategory(searchParams.get("cat"));
    if (cat !== "all" && products.some((p) => p.category_slug === cat)) {
      setFilter(cat);
      requestAnimationFrame(() => {
        document.getElementById("catalogo")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [searchParams, products]);

  const categoryChips = useMemo(() => {
    const fromDb = categories.length
      ? categories
      : [...new Set(products.map((p) => p.category_slug))].map((slug) => {
          const product = products.find((p) => p.category_slug === slug);
          return { slug, label: product?.category_label ?? slug, sort_order: 0 };
        });

    return [{ slug: "all", label: "Tudo", sort_order: -1 }, ...fromDb];
  }, [categories, products]);

  const filtered = useMemo(() => {
    let list = filter === "all" ? products : products.filter((p) => p.category_slug === filter);

    if (skinFilter !== "all") {
      list = list.filter(
        (p) => p.skin_types.includes(skinFilter) || p.skin_types.includes("todos")
      );
    }

    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "new")
      list = [...list].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
    else list = [...list].sort((a, b) => b.sold_count - a.sold_count || b.review_count - a.review_count);

    return list;
  }, [products, filter, skinFilter, sort]);

  const chips = categoryChips.filter((c) => {
    if (c.slug === "all") return products.length > 0;
    return products.some((p) => p.category_slug === c.slug);
  });

  if (products.length === 0) return null;

  return (
    <section id="catalogo" className="landing-section scroll-mt-[70px] bg-iseul-areia/50">
      <div className="wrap">
        <div className="cab mb-8 sm:mb-9">
          <p className="eyebrow">produtos</p>
          <h2>
            Tudo que está <em>no catálogo.</em>
          </h2>
        </div>

        <div className="mb-7 rounded-[1.35rem] border border-iseul-line/80 bg-iseul-paper/90 p-3.5 shadow-[0_8px_32px_-20px_rgba(45,42,38,0.18)] sm:p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap justify-center gap-2 lg:justify-start">
              {chips.map((c) => {
                const n =
                  c.slug === "all"
                    ? products.length
                    : products.filter((p) => p.category_slug === c.slug).length;
                const active = filter === c.slug;
                return (
                  <button
                    key={c.slug}
                    type="button"
                    onClick={() => setFilter(c.slug)}
                    className={[
                      "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-[13px] transition-all duration-200",
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

            <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
              <div className="relative w-full sm:w-auto">
                <select
                  value={skinFilter}
                  onChange={(e) => setSkinFilter(e.target.value)}
                  aria-label="Filtrar por tipo de pele"
                  className="w-full appearance-none rounded-full border border-iseul-line/90 bg-white py-2.5 pl-4 pr-10 text-[13px] text-iseul-ink shadow-sm transition focus:border-iseul-sage focus:outline-none focus:ring-2 focus:ring-iseul-sage/25 sm:min-w-[190px]"
                >
                  <option value="all">Tipo de pele</option>
                  {SKIN_TYPES.map((skin) => (
                    <option key={skin.slug} value={skin.slug}>
                      {skin.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-iseul-muted"
                  aria-hidden
                />
              </div>

              <div className="relative w-full sm:w-auto">
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value as SortKey)}
                  aria-label="Ordenar produtos"
                  className="w-full appearance-none rounded-full border border-iseul-line/90 bg-white py-2.5 pl-4 pr-10 text-[13px] text-iseul-ink shadow-sm transition focus:border-iseul-sage focus:outline-none focus:ring-2 focus:ring-iseul-sage/25 sm:min-w-[168px]"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-iseul-muted"
                  aria-hidden
                />
              </div>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="py-16 text-center text-iseul-muted">Nenhum produto nessa categoria ainda.</p>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} allProducts={products} index={i} visible />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
