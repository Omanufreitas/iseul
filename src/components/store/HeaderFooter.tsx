"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { m, AnimatePresence, useReducedMotion } from "framer-motion";
import { useCart } from "@/context/cart-context";
import { cn } from "@/lib/utils";
import type { StoreSettings } from "@/types";

export function AnnounceBar({ text }: { text: string }) {
  return (
    <div className="bg-iseul-accent px-4 py-2.5 text-center text-[12.5px] tracking-wide text-[#F2F6F3]">
      {text}
    </div>
  );
}

export function StoreHeader({ settings }: { settings: StoreSettings }) {
  const { count, openCart } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-iseul-paper/90 backdrop-blur-md transition-shadow duration-300",
        scrolled ? "border-iseul-line shadow-[0_4px_24px_rgba(28,26,22,.06)]" : "border-transparent"
      )}
    >
      <div className="mx-auto flex h-[72px] max-w-store items-center gap-7 px-6">
        <Link href="/" className="group flex flex-col leading-none gap-0.5">
          <span className="font-serif text-[27px] tracking-[0.26em] pl-[0.26em] transition-opacity duration-300 group-hover:opacity-80">
            {settings.store_name.toUpperCase()}
          </span>
          <span className="text-[9.5px] tracking-[0.42em] text-iseul-accent2 pl-[0.42em]">
            {settings.tagline}
          </span>
        </Link>

        <nav className="ml-auto hidden items-center gap-7 text-sm text-iseul-muted md:flex">
          {[
            { href: "/#catalogo", label: "Catálogo" },
            { href: "/#rotina", label: "Rotina" },
            { href: "/#sobre", label: "Sobre" },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors duration-200 hover:text-iseul-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <button
          type="button"
          onClick={openCart}
          className="flex items-center gap-2 rounded-full border border-iseul-line bg-iseul-card px-4 py-2 text-[13.5px] font-medium transition-all duration-200 hover:border-iseul-accent2 hover:shadow-sm"
        >
          Sacola
          <span className="relative grid min-w-[19px] h-[19px] place-items-center rounded-full bg-iseul-accent text-[11px] font-semibold text-white">
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
      </div>
    </header>
  );
}

export function StoreFooter({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="bg-iseul-ink text-[#CFC8BC] py-14 text-[13.5px]">
      <div className="mx-auto max-w-store px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <div className="mb-3 flex flex-col leading-none gap-0.5">
              <span className="font-serif text-[27px] tracking-[0.26em] text-iseul-paper pl-[0.26em]">
                {settings.store_name.toUpperCase()}
              </span>
              <span className="text-[9.5px] tracking-[0.42em] text-iseul-accent2 pl-[0.42em]">
                {settings.tagline}
              </span>
            </div>
            <p className="text-[#8E877B] max-w-xs">
              Skincare coreano original, com curadoria. Envio do Brasil em até 24h.
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
            <p className="py-1">Frete grátis acima de R$199</p>
            <p className="py-1">Envio em até 24h úteis</p>
          </div>
          <div>
            <h5 className="mb-3 text-xs font-semibold uppercase tracking-widest text-iseul-paper">
              Contato
            </h5>
            <p className="py-1">WhatsApp e e-mail no checkout</p>
          </div>
        </div>
        <div className="mt-10 flex flex-wrap justify-between gap-4 border-t border-white/10 pt-5 text-xs text-[#8E877B]">
          <span>
            © {new Date().getFullYear()} {settings.store_name}. Todos os direitos reservados.
          </span>
          <span>CNPJ a definir. Preços em BRL.</span>
        </div>
      </div>
    </footer>
  );
}
