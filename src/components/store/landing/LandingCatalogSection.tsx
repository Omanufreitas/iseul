"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/components/store/ProductCard";
import { CATEGORIES } from "@/lib/constants";
import type { Product } from "@/types";

type SortKey = "sold" | "price_asc" | "price_desc" | "new";

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

export function LandingCatalogSection({ products }: { products: Product[] }) {
  const searchParams = useSearchParams();
  const [filter, setFilter] = useState("all");
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

  const filtered = useMemo(() => {
    let list =
      filter === "all" ? products : products.filter((p) => p.category_slug === filter);

    if (sort === "price_asc") list = [...list].sort((a, b) => a.price - b.price);
    else if (sort === "price_desc") list = [...list].sort((a, b) => b.price - a.price);
    else if (sort === "new")
      list = [...list].sort((a, b) => (b.created_at ?? "").localeCompare(a.created_at ?? ""));
    else list = [...list].sort((a, b) => b.sold_count - a.sold_count || b.review_count - a.review_count);

    return list;
  }, [products, filter, sort]);

  const chips = CATEGORIES.filter((c) => {
    if (c.slug === "all") return products.length > 0;
    return products.some((p) => p.category_slug === c.slug);
  });

  if (products.length === 0) return null;

  return (
    <section id="catalogo" className="landing-section scroll-mt-[70px] bg-iseul-areia/50">
      <div className="wrap">
        <div className="cab reveal">
          <p className="eyebrow">produtos</p>
          <h2>
            Tudo que está <em>em estoque agora.</em>
          </h2>
          <p>Filtre por etapa da rotina ou ordene por preço.</p>
        </div>

        <div className="reveal mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="flex flex-wrap justify-center gap-2 sm:justify-start">
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
                    "rounded-full border px-4 py-2 text-[13px] transition-colors duration-200",
                    active
                      ? "border-iseul-ink bg-iseul-ink text-iseul-paper"
                      : "border-iseul-line bg-iseul-paper text-iseul-muted hover:border-iseul-sage hover:text-iseul-ink",
                  ].join(" ")}
                >
                  {c.label} <span className="opacity-50">{n}</span>
                </button>
              );
            })}
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="w-full rounded-full border border-iseul-line bg-iseul-paper px-3.5 py-2 text-[13px] text-iseul-muted focus:outline-none focus:ring-2 focus:ring-iseul-sage/40 sm:ml-auto sm:w-auto"
          >
            <option value="sold">Mais vendidos</option>
            <option value="new">Novidades</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
          </select>
        </div>

        {filtered.length === 0 ? (
          <p className="py-16 text-center text-iseul-muted">Nenhum produto nessa categoria ainda.</p>
        ) : (
          <div className="reveal grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3.5">
            {filtered.map((p, i) => (
              <ProductCard key={p.id} product={p} allProducts={products} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
