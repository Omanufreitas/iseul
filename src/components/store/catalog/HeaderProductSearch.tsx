"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { productMatchesQuery } from "@/lib/catalog-filter";
import { trackMetaSearch } from "@/lib/analytics/meta";
import type { Product } from "@/types";

type Props = {
  products: Product[];
};

export function HeaderProductSearch({ products }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debounced, setDebounced] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const lastTracked = useRef("");

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query), 200);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!open) return;
    const id = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const q = debounced.trim();
    if (!q || q === lastTracked.current) return;
    lastTracked.current = q;
    trackMetaSearch(q);
  }, [debounced]);

  const suggestions = useMemo(() => {
    const q = debounced.trim();
    if (!q) return [];
    return products.filter((p) => productMatchesQuery(p, q)).slice(0, 6);
  }, [products, debounced]);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setDebounced("");
    lastTracked.current = "";
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    function onClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // On desktop dropdown only — mobile overlay has its own backdrop
        if (window.matchMedia("(min-width: 1024px)").matches) close();
      }
    }
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open, close]);

  function goToCatalogSearch() {
    const q = query.trim();
    const href = q ? `/produtos?q=${encodeURIComponent(q)}` : "/produtos";
    close();
    router.push(href);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    goToCatalogSearch();
  }

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        aria-label="Buscar produtos"
        aria-expanded={open}
        aria-controls="header-product-search"
        onClick={() => setOpen((v) => !v)}
        className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-iseul-line bg-iseul-paper text-iseul-ink transition-colors hover:border-iseul-sage focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-iseul-sage/40"
      >
        <Search className="h-4 w-4" aria-hidden />
      </button>

      {/* Desktop dropdown */}
      {open && (
        <div
          id="header-product-search"
          className="absolute right-0 top-[calc(100%+10px)] z-50 hidden w-[min(100vw-2rem,360px)] overflow-hidden rounded-2xl border border-iseul-line bg-iseul-paper shadow-[0_20px_50px_-24px_rgba(28,26,22,0.35)] lg:block"
        >
          <form onSubmit={onSubmit} className="border-b border-iseul-line p-3">
            <label htmlFor="header-search-input" className="sr-only">
              Buscar produto, marca ou ativo
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-iseul-muted"
                aria-hidden
              />
              <input
                ref={inputRef}
                id="header-search-input"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar produto, marca ou ativo…"
                className="w-full rounded-full border border-iseul-line bg-white py-2.5 pl-9 pr-3 text-[13px] text-iseul-ink placeholder:text-iseul-muted/80 focus:border-iseul-sage focus:outline-none focus:ring-2 focus:ring-iseul-sage/25"
                autoComplete="off"
              />
            </div>
          </form>

          <SuggestionsList
            query={debounced}
            suggestions={suggestions}
            onPick={close}
            onSeeAll={goToCatalogSearch}
          />
        </div>
      )}

      {/* Mobile full overlay */}
      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-[color-mix(in_srgb,#FAF8F4_98%,transparent)] backdrop-blur-md lg:hidden">
          <div className="flex items-center gap-2 border-b border-iseul-line px-4 py-3">
            <form onSubmit={onSubmit} className="relative flex-1">
              <label htmlFor="header-search-input-mobile" className="sr-only">
                Buscar produto, marca ou ativo
              </label>
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-iseul-muted"
                aria-hidden
              />
              <input
                id="header-search-input-mobile"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar produto, marca ou ativo…"
                className="w-full rounded-full border border-iseul-line bg-white py-2.5 pl-9 pr-3 text-[14px] text-iseul-ink focus:border-iseul-sage focus:outline-none focus:ring-2 focus:ring-iseul-sage/25"
                autoComplete="off"
                // eslint-disable-next-line jsx-a11y/no-autofocus -- intentional when overlay opens
                autoFocus
              />
            </form>
            <button
              type="button"
              aria-label="Fechar busca"
              onClick={close}
              className="grid h-10 w-10 place-items-center rounded-full text-iseul-muted transition hover:bg-iseul-areia"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto">
            <SuggestionsList
              query={debounced}
              suggestions={suggestions}
              onPick={close}
              onSeeAll={goToCatalogSearch}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function SuggestionsList({
  query,
  suggestions,
  onPick,
  onSeeAll,
}: {
  query: string;
  suggestions: Product[];
  onPick: () => void;
  onSeeAll: () => void;
}) {
  const q = query.trim();

  if (!q) {
    return (
      <p className="px-4 py-6 text-center text-[13px] text-iseul-muted">
        Digite um produto, marca ou ativo.
      </p>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="px-4 py-8 text-center">
        <p className="text-[13px] text-iseul-muted">
          Nenhum produto encontrado para “{q}”
        </p>
        <button
          type="button"
          onClick={onSeeAll}
          className="mt-3 text-[13px] font-medium text-iseul-sage underline-offset-2 hover:underline"
        >
          Buscar no catálogo
        </button>
      </div>
    );
  }

  return (
    <ul className="max-h-[min(60vh,420px)] overflow-y-auto py-1">
      {suggestions.map((p) => (
        <li key={p.id}>
          <Link
            href={`/produtos/${p.slug}`}
            onClick={onPick}
            className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-iseul-areia/70 focus-visible:bg-iseul-areia/70 focus-visible:outline-none"
          >
            <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-iseul-paper2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image_url}
                alt=""
                className="h-full w-full object-cover"
                onError={(e) => {
                  if (p.image_fallback_url) {
                    (e.target as HTMLImageElement).src = p.image_fallback_url;
                  }
                }}
              />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium text-iseul-ink">
                {p.name}
              </span>
              <span className="block text-[11px] uppercase tracking-wide text-iseul-muted">
                {p.brand}
              </span>
            </span>
            <span className="shrink-0 text-[13px] font-medium tabular-nums text-iseul-ink">
              {formatCurrency(p.price)}
            </span>
          </Link>
        </li>
      ))}
      <li className="border-t border-iseul-line">
        <button
          type="button"
          onClick={onSeeAll}
          className="w-full px-4 py-3 text-left text-[13px] font-medium text-iseul-sage transition hover:bg-iseul-areia/50"
        >
          Ver todos os resultados →
        </button>
      </li>
    </ul>
  );
}
