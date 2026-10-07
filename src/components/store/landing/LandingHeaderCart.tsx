"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Menu, X } from "lucide-react";
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
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

  const menu =
    mounted && menuOpen
      ? createPortal(
          <div className="lg:hidden" role="presentation">
            <button
              type="button"
              aria-label="Fechar menu"
              className="fixed inset-0 z-[95] bg-[rgba(24,22,18,0.52)]"
              onClick={closeMenu}
            />
            <nav
              id="landing-menu"
              aria-label="Menu principal"
              className="fixed inset-y-0 right-0 z-[96] flex w-[min(100%,304px)] flex-col bg-iseul-paper shadow-[-16px_0_48px_rgba(24,22,18,0.18)]"
            >
              <div className="flex items-center justify-between border-b border-iseul-line px-5 py-4 pt-[max(1rem,env(safe-area-inset-top))]">
                <span className="font-serif text-xl tracking-wide text-iseul-ink">
                  Menu
                </span>
                <button
                  type="button"
                  aria-label="Fechar menu"
                  onClick={closeMenu}
                  className="grid h-10 w-10 place-items-center rounded-full text-iseul-muted transition-colors hover:bg-iseul-areia hover:text-iseul-ink"
                >
                  <X className="h-5 w-5" aria-hidden />
                </button>
              </div>
              <div className="flex flex-1 flex-col gap-0.5 overflow-y-auto p-3 pb-[max(1rem,env(safe-area-inset-bottom))]">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="rounded-xl px-4 py-3.5 text-[15px] font-medium text-iseul-ink no-underline transition-colors hover:bg-iseul-areia"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </nav>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      <nav id="navtopo" className="ml-auto flex items-center gap-x-2.5 sm:gap-x-3 lg:gap-x-4">
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
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-iseul-line bg-iseul-paper text-iseul-ink transition-colors hover:border-iseul-sage lg:hidden"
        >
          {menuOpen ? (
            <X className="h-[18px] w-[18px]" aria-hidden />
          ) : (
            <Menu className="h-[18px] w-[18px]" aria-hidden />
          )}
        </button>

        <CartButton count={count} onClick={openCart} />
      </nav>

      {menu}
    </>
  );
}
