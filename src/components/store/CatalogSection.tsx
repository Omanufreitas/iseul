"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AnimatePresence, LayoutGroup, m, useReducedMotion } from "framer-motion";
import { ProductCard } from "@/components/store/ProductCard";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { CATEGORIES } from "@/lib/constants";
import type { Product } from "@/types";

type SortKey = "sold" | "price_asc" | "price_desc" | "new";

export function CatalogSection({ products }: { products: Product[] }) {
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState<SortKey>("sold");
  const reduce = useReducedMotion();

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

  return (
    <section id="catalogo" className="scroll-mt-20 py-16">
      <div className="mx-auto max-w-store px-6">
        <Reveal className="mb-7 flex flex-wrap items-end justify-between gap-6">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-iseul-muted">
              Catálogo
            </div>
            <h2 className="mt-1.5 font-serif text-3xl leading-tight md:text-4xl">
              Tudo que está em estoque agora
            </h2>
          </div>
          <p className="max-w-md text-sm text-iseul-muted">
            Curadoria de K-Beauty com estoque no Brasil. Filtre por etapa da rotina ou ordene por
            preço.
          </p>
        </Reveal>

        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          <LayoutGroup id="catalog-chips">
            <div className="flex flex-wrap gap-2">
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
                    className={`relative rounded-full border px-4 py-2 text-[13px] transition-all duration-200 ${
                      active
                        ? "border-iseul-ink text-iseul-paper"
                        : "border-iseul-line bg-iseul-card text-iseul-muted hover:border-iseul-accent2 hover:text-iseul-ink"
                    }`}
                  >
                    {active && !reduce && (
                      <m.span
                        layoutId="chip-active"
                        className="absolute inset-0 -z-10 rounded-full bg-iseul-ink"
                        transition={{ type: "spring", stiffness: 380, damping: 32 }}
                      />
                    )}
                    {active && reduce && (
                      <span className="absolute inset-0 -z-10 rounded-full bg-iseul-ink" />
                    )}
                    {c.label} <span className="opacity-50">{n}</span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="w-full rounded-full border border-iseul-line bg-iseul-card px-3.5 py-2 text-[13px] text-iseul-muted transition-shadow duration-200 focus:outline-none focus:ring-2 focus:ring-iseul-accent2/40 sm:ml-auto sm:w-auto"
          >
            <option value="sold">Mais vendidos</option>
            <option value="new">Novidades</option>
            <option value="price_asc">Menor preço</option>
            <option value="price_desc">Maior preço</option>
          </select>
        </div>

        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <m.p
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-16 text-center text-iseul-muted"
            >
              Nenhum produto nessa categoria ainda.
            </m.p>
          ) : (
            <m.div
              key={`grid-${filter}-${sort}`}
              layout
              className="grid grid-cols-[repeat(auto-fill,minmax(238px,1fr))] gap-5"
            >
              {filtered.map((p, i) => (
                <ProductCard key={p.id} product={p} allProducts={products} index={i} />
              ))}
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}

export function RoutineSection() {
  const steps = [
    { n: "01", title: "Limpar", text: "Óleo ou gel de limpeza. Retira filtro solar e oleosidade sem tirar a barreira junto.", cta: "Ver limpeza" },
    { n: "02", title: "Tratar", text: "Sérum, ampola ou essence. É aqui que retinal, peptídeo e vitamina C fazem o trabalho.", cta: "Ver séruns" },
    { n: "03", title: "Selar", text: "Creme ou balm. Segura a água que os passos anteriores entregaram à pele.", cta: "Ver hidratantes" },
    { n: "04", title: "Proteger", text: "Protetor solar, todo santo dia. Sem ele, os passos 2 e 3 viram desperdício de dinheiro.", cta: "Ver protetores" },
  ];

  return (
    <section id="rotina" className="scroll-mt-20 border-y border-iseul-line bg-iseul-card py-16">
      <div className="mx-auto max-w-store px-6">
        <Reveal className="mb-8">
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-iseul-muted">
            A rotina Iseul
          </div>
          <h2 className="mt-1.5 font-serif text-3xl md:text-4xl">Quatro passos. Nessa ordem.</h2>
        </Reveal>
        <Stagger className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((s) => (
            <StaggerItem
              key={s.n}
              className="rounded-iseul border border-transparent bg-iseul-paper/40 p-4 transition-colors duration-300 hover:border-iseul-line hover:bg-iseul-paper"
            >
              <div className="font-serif text-[15px] text-iseul-accent2">{s.n}</div>
              <h3 className="mt-1.5 text-[15px] font-semibold">{s.title}</h3>
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-iseul-muted">{s.text}</p>
              <Link
                href="/produtos"
                className="mt-3 inline-block text-[12.5px] text-iseul-accent transition-colors hover:text-iseul-ink"
              >
                {s.cta}
              </Link>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
