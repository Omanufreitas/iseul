"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useCart } from "@/context/cart-context";
import { useClientReady } from "@/hooks/use-client-ready";
import { backdropFade, slideDown, slideFromRight } from "@/lib/motion";
import { cn, formatCurrency } from "@/lib/utils";
import type { StoreSettings } from "@/types";

const NAV_LINKS = [
  { href: "/#catalogo", label: "Catálogo" },
  { href: "/#rotina", label: "Rotina" },
  { href: "/#sobre", label: "Sobre" },
] as const;

export function AnnounceBar({ text }: { text: string }) {
  const reduce = useReducedMotion();
  const ready = useClientReady();

  return (
    <m.div
      initial={false}
      animate={ready && !reduce ? "show" : false}
      variants={slideDown}
      className="bg-iseul-accent px-4 py-2.5 text-center text-[12.5px] tracking-wide text-[#F2F6F3]"
    >
      {text}
    </m.div>
  );
}

function CartButton({ reduce }: { reduce: boolean | null }) {
  const { count, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      className="flex items-center gap-2 rounded-full border border-iseul-line bg-iseul-card px-4 py-2 text-[13.5px] font-medium transition-all duration-200 hover:border-iseul-accent2 hover:shadow-sm"
    >
      Sacola
      <span className="relative grid h-[19px] min-w-[19px] place-items-center rounded-full bg-iseul-accent text-[11px] font-semibold text-white">
        <AnimatePresence mode="popLayout" initial={false}>
          <m.span
            key={count}
            initial={reduce ? false : { scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={reduce ? undefined : { scale: 0.6, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 28 }}
            className="absolute inset-0 grid place-items-center"
          >
            {count}
          </m.span>
        </AnimatePresence>
      </span>
    </button>
  );
}

export function StoreHeader({ settings }: { settings: StoreSettings }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const reduce = useReducedMotion();
  const ready = useClientReady();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <m.header
        initial={false}
        animate={ready && !reduce ? "show" : false}
        variants={slideDown}
        transition={{ delay: 0.05 }}
        className={cn(
          "sticky top-0 z-50 border-b bg-iseul-paper/90 backdrop-blur-md transition-shadow duration-300",
          scrolled ? "border-iseul-line shadow-[0_4px_24px_rgba(28,26,22,.06)]" : "border-transparent"
        )}
      >
        <div className="mx-auto flex h-[72px] max-w-store items-center gap-3 px-6">
          <Link href="/" className="group flex shrink-0 flex-col gap-0.5 leading-none">
            <span className="pl-[0.26em] font-serif text-[27px] tracking-[0.26em] transition-opacity duration-300 group-hover:opacity-80">
              {settings.store_name.toUpperCase()}
            </span>
            <span className="pl-[0.42em] text-[9.5px] tracking-[0.42em] text-iseul-accent2">
              {settings.tagline}
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-7 text-sm text-iseul-muted md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="transition-colors duration-200 hover:text-iseul-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <button
              type="button"
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="grid h-10 w-10 place-items-center rounded-full border border-iseul-line bg-iseul-card text-iseul-ink md:hidden"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
            <CartButton reduce={reduce} />
          </div>
        </div>
      </m.header>

      <AnimatePresence>
        {menuOpen && (
          <>
            <m.button
              type="button"
              aria-label="Fechar menu"
              className="fixed inset-0 z-[60] bg-[rgba(24,22,18,.42)] backdrop-blur-[2px] md:hidden"
              variants={backdropFade}
              initial="hidden"
              animate="show"
              exit="exit"
              onClick={closeMenu}
            />
            <m.nav
              className="fixed right-0 top-0 z-[70] flex h-full w-full max-w-[300px] flex-col bg-iseul-paper shadow-[-10px_0_40px_rgba(0,0,0,.1)] md:hidden"
              variants={reduce ? undefined : slideFromRight}
              initial="hidden"
              animate="show"
              exit="exit"
            >
              <div className="flex items-center justify-between border-b border-iseul-line px-5 py-5">
                <span className="font-serif text-xl">Menu</span>
                <button
                  type="button"
                  onClick={closeMenu}
                  className="grid h-8 w-8 place-items-center rounded-full text-iseul-muted hover:bg-iseul-paper2"
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-col gap-1 p-4">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="rounded-iseul px-4 py-3.5 text-[15px] font-medium transition-colors hover:bg-iseul-dew/50"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </m.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

export function StoreFooter({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="bg-iseul-ink py-14 text-[13.5px] text-[#CFC8BC]">
      <div className="mx-auto max-w-store px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-3 flex flex-col gap-0.5 leading-none">
              <span className="pl-[0.26em] font-serif text-[27px] tracking-[0.26em] text-iseul-paper">
                {settings.store_name.toUpperCase()}
              </span>
              <span className="pl-[0.42em] text-[9.5px] tracking-[0.42em] text-iseul-accent2">
                {settings.tagline}
              </span>
            </div>
            <p className="max-w-xs text-[#8E877B]">
              Skincare coreano original, escolhido produto a produto. Envio do Brasil em até 24h.
            </p>
          </div>
          <div>
            <h5 className="mb-3 text-xs font-semibold uppercase tracking-widest text-iseul-paper">
              Loja
            </h5>
            <Link href="/#catalogo" className="block py-1 transition-colors hover:text-iseul-paper">
              Catálogo
            </Link>
            <Link href="/#rotina" className="block py-1 transition-colors hover:text-iseul-paper">
              Montar rotina
            </Link>
          </div>
          <div>
            <h5 className="mb-3 text-xs font-semibold uppercase tracking-widest text-iseul-paper">
              Ajuda
            </h5>
            <p className="py-1">
              Frete grátis acima de {formatCurrency(settings.free_shipping_threshold)}
            </p>
            <p className="py-1">Envio em até 24h úteis</p>
          </div>
          <div>
            <h5 className="mb-3 text-xs font-semibold uppercase tracking-widest text-iseul-paper">
              Contato
            </h5>
            <p className="py-1">
              <a href="mailto:contato@iseul.com.br" className="transition-colors hover:text-iseul-paper">
                contato@iseul.com.br
              </a>
            </p>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5 text-xs text-[#8E877B]">
          <span>
            © {new Date().getFullYear()} {settings.store_name}. Todos os direitos reservados.
          </span>
          <span>
            CNPJ 63.829.102/0001-34. Preços em BRL. · Desenvolvido por{" "}
            <a
              href="https://thraxis.app"
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors hover:text-iseul-paper"
            >
              Thraxis
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}
