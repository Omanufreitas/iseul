"use client";

import Link from "next/link";
import { useCart } from "@/context/cart-context";

const NAV_LINKS: Array<{ href: string; label: string; optional?: boolean }> = [
  { href: "/#selecao", label: "A seleção" },
  { href: "/#catalogo", label: "Produtos" },
  { href: "/#rotina", label: "A rotina", optional: true },
  { href: "/#sobre", label: "Sobre", optional: true },
  { href: "/trocas", label: "Políticas" },
  { href: "/#avisar", label: "Novidades" },
];

export function LandingHeaderCart() {
  const { count, openCart } = useCart();

  return (
    <nav id="navtopo" className="ml-auto flex items-center gap-x-4 max-[620px]:gap-x-3.5">
      <div className="flex flex-wrap justify-end gap-6 text-[13.5px] max-[820px]:gap-4 max-[820px]:text-[12.5px] max-[620px]:gap-3.5">
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={[
              "text-iseul-muted no-underline transition-colors hover:text-iseul-ink",
              link.optional ? "opcional max-[620px]:hidden" : "",
            ].join(" ")}
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
