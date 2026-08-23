"use client";

import Link from "next/link";
import { useCart } from "@/context/cart-context";

const NAV_LINKS = [
  { href: "/#selecao", label: "A seleção" },
  { href: "/#catalogo", label: "Produtos" },
  { href: "/#rotina", label: "A rotina" },
  { href: "/#sobre", label: "Sobre" },
  { href: "/trocas", label: "Políticas" },
  { href: "/#avisar", label: "Avise-me" },
] as const;

export function LandingHeaderCart() {
  const { count, openCart } = useCart();

  return (
    <nav className="ml-auto flex items-center gap-x-4 gap-y-1 max-[660px]:gap-x-3">
      <div className="flex max-w-[62vw] flex-wrap justify-end gap-x-6 gap-y-1 text-[13.5px] max-[660px]:max-w-none max-[660px]:gap-x-[15px] max-[660px]:text-[12.5px]">
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
      <button
        type="button"
        onClick={openCart}
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
    </nav>
  );
}
