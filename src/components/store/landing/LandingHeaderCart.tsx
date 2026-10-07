"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCart } from "@/context/cart-context";
import { HeaderProductSearch } from "@/components/store/catalog/HeaderProductSearch";
import type { Product } from "@/types";

const NAV_LINKS = [
  { href: "/produtos", label: "Produtos" },
  { href: "/#rotina", label: "A rotina" },
  { href: "/#sobre", label: "Sobre" },
  { href: "/trocas", label: "Políticas" },
  { href: "/#avisar", label: "Novidades" },
] as const;

function CartButton({ count, onClick }: { count: number; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Abrir sacola${count ? `, ${count} itens` : ""}`}
      className="relative shrink-0 rounded-full border border-iseul-line bg-iseul-paper px-3.5 py-1.5 text-[13px] font-medium text-iseul-ink transition-colors hover:border-iseul-sage"
    >
      Sacola
      {count > 0 && (
        <span className="ml-1.5 inline-grid h-[18px] min-w-[18px] place-items-center rounded-full bg-iseul-pine px-1 text-[10px] font-semibold text-white">
          {count}
        </span>
      )}
    </button>
  );
}

export function LandingHeaderCart({ products = [] }: { products?: Product[] }) {
  const { count, openCart } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (mq.matches) setMenuOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <nav id="navtopo" className="ml-auto flex items-center gap-x-3 lg:gap-x-4">
        <div className="hidden flex-wrap justify-end gap-5 text-[13.5px] lg:flex xl:gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-iseul-muted no-underline transition-colors hover:text-iseul-ink"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {products.length > 0 ? <HeaderProductSearch products={products} /> : null}

        <button
          type="button"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={menuOpen}
          aria-controls="landing-menu"
          onClick={() => setMenuOpen((v) => !v)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-iseul-line bg-iseul-paper text-[18px] leading-none text-iseul-ink transition-colors hover:border-iseul-sage lg:hidden"
        >
          {menuOpen ? "✕" : "☰"}
        </button>

        <CartButton count={count} onClick={openCart} />
      </nav>

      {menuOpen && (
        <>
          <button
            type="button"
            aria-label="Fechar menu"
            className="fixed inset-0 z-[45] bg-[rgba(24,22,18,0.42)] backdrop-blur-[2px] lg:hidden"
            onClick={closeMenu}
          />
          <nav
            id="landing-menu"
            className="fixed right-0 top-0 z-[46] flex h-full w-full max-w-[min(100%,300px)] flex-col border-l border-iseul-line bg-[color-mix(in_srgb,#FAF8F4_98%,transparent)] shadow-[-10px_0_40px_rgba(0,0,0,0.08)] backdrop-blur-md lg:hidden"
          >
            <div className="flex items-center justify-between border-b border-iseul-line px-5 py-4">
              <span className="font-serif text-xl text-iseul-ink">Menu</span>
              <button
                type="button"
                aria-label="Fechar menu"
                onClick={closeMenu}
                className="grid h-9 w-9 place-items-center rounded-full text-iseul-muted transition-colors hover:bg-iseul-areia/80"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-0.5 p-3">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="rounded-lg px-4 py-3.5 text-[15px] text-iseul-ink no-underline transition-colors hover:bg-iseul-dew/60"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}
    </>
  );
}
