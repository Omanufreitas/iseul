"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { m, useReducedMotion } from "framer-motion";
import { useClientReady } from "@/hooks/use-client-ready";
import { slideDown } from "@/lib/motion";
import { cn } from "@/lib/utils";
import type { StoreSettings } from "@/types";

const NAV_LINKS = [
  { href: "/#selecao", label: "A seleção" },
  { href: "/#rotina", label: "A rotina" },
  { href: "/#sobre", label: "Sobre" },
  { href: "/#contato", label: "Contato" },
] as const;

function IseulLogo({ dark = false }: { dark?: boolean }) {
  const ink = dark ? "#FAF8F4" : "#1C1A16";
  const drop = dark ? "#FAF8F4" : "#3F5C4E";

  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 390 152" role="img" aria-label="Iseul" className="h-8 w-auto">
      <path
        d="M59.88,35.56 Q63.12,30.00 66.36,35.56 L89.74,75.65 A30.82,30.82 0 1 1 36.50,75.65 Z"
        fill={drop}
      />
      <path
        d="M128.824 103.36Q127.684 103.36 127.684 102.524Q127.684 101.84 128.672 101.612L130.42 101.308Q132.016 101.004 132.51 100.472Q133.004 99.94 133.004 98.344V53.656Q133.004 52.06 132.51 51.528Q132.016 50.996 130.42 50.692L128.672 50.388Q127.684 50.16 127.684 49.476Q127.684 48.64 128.824 48.64H142.58Q143.72 48.64 143.72 49.476Q143.72 50.16 142.732 50.388L140.984 50.692Q139.388 50.996 138.894 51.528Q138.4 52.06 138.4 53.656V98.344Q138.4 99.94 138.894 100.472Q139.388 101.004 140.984 101.308L142.732 101.612Q143.72 101.84 143.72 102.524Q143.72 103.36 142.58 103.36ZM178.528 104.044Q177.008 104.044 175.146 103.74Q173.284 103.436 171.65 102.98Q170.016 102.524 169.104 101.992Q168.572 101.688 168.306 101.346Q168.04 101.004 168.04 100.168L167.66 88.236Q167.66 86.716 168.648 86.716Q169.484 86.716 169.788 88.084L170.472 90.972Q173.056 101.84 180.124 101.84Q183.924 101.84 186.166 99.294Q188.408 96.748 188.408 92.112Q188.408 87.628 186.09 83.752Q183.772 79.876 178.68 76.076Q173.056 72.048 170.472 68.286Q167.888 64.524 167.888 60.268Q167.888 54.644 171.802 51.262Q175.716 47.88 181.796 47.88Q184.076 47.88 186.204 48.412Q188.332 48.944 189.7 49.932Q190.156 50.236 190.422 50.616Q190.688 50.996 190.688 51.604L190.916 63.08Q190.916 64.372 189.928 64.372Q189.244 64.372 188.94 63.308L188.408 61.408Q186.736 55.556 184.95 52.858Q183.164 50.16 179.82 50.16Q176.552 50.16 174.614 52.288Q172.676 54.416 172.676 58.292Q172.676 61.56 174.804 64.524Q176.932 67.488 182.252 71.744Q187.952 76.38 190.574 80.674Q193.196 84.968 193.196 89.832Q193.196 94.088 191.296 97.28Q189.396 100.472 186.09 102.258Q182.784 104.044 178.528 104.044ZM217.44 103.36Q216.3 103.36 216.3 102.524Q216.3 101.84 217.288 101.612L219.036 101.308Q220.632 101.004 221.126 100.472Q221.62 99.94 221.62 98.344V53.656Q221.62 52.06 221.126 51.528Q220.632 50.996 219.036 50.692L217.288 50.388Q216.3 50.16 216.3 49.476Q216.3 48.64 217.44 48.64H242.976Q244.724 48.64 244.876 50.388L245.484 63.004Q245.636 64.296 244.496 64.296Q243.584 64.296 243.432 63.308L242.976 60.496Q242.14 55.328 239.556 52.934Q236.972 50.54 232.412 50.54Q229.372 50.54 228.194 51.414Q227.016 52.288 227.016 54.492V72.808Q227.016 73.872 228.08 73.872H231.88Q235.224 73.872 235.984 70.3L236.744 66.5Q237.048 65.36 238.036 65.512Q238.872 65.664 238.872 66.804V83.904Q238.872 85.044 238.036 85.196Q237.048 85.348 236.744 84.208L235.984 80.484Q235.452 77.824 234.502 76.988Q233.552 76.152 231.804 76.152H228.08Q227.016 76.152 227.016 77.216V96.292Q227.016 99.028 228.422 100.244Q229.828 101.46 233.552 101.46Q237.352 101.46 240.05 99.522Q242.748 97.584 243.812 92.264L244.724 87.78Q244.952 86.792 245.864 86.792Q246.928 86.792 246.776 88.084L246.016 101.612Q245.864 103.36 244.116 103.36Z M289.564 104.044Q285.46 104.044 282.306 102.106Q279.152 100.168 277.404 96.71Q275.656 93.252 275.656 88.768V53.656Q275.656 52.06 275.162 51.528Q274.668 50.996 273.072 50.692L271.324 50.388Q270.336 50.16 270.336 49.476Q270.336 48.64 271.476 48.64H285.384Q286.524 48.64 286.524 49.552Q286.524 50.236 285.688 50.388L283.636 50.692Q282.116 50.92 281.584 51.528Q281.052 52.136 281.052 53.732V88.844Q281.052 94.62 283.636 97.812Q286.22 101.004 290.856 101.004Q295.568 101.004 298.152 97.812Q300.736 94.62 300.736 88.844V55.252Q300.736 51.148 298.152 50.692L296.1 50.388Q295.264 50.236 295.264 49.552Q295.264 48.64 296.404 48.64H307.348Q308.488 48.64 308.488 49.476Q308.488 50.16 307.5 50.388L305.752 50.692Q303.168 51.148 303.168 55.176V88.768Q303.168 95.684 299.444 99.864Q295.72 104.044 289.564 104.044ZM331.364 103.36Q330.224 103.36 330.224 102.524Q330.224 101.84 331.212 101.612L332.96 101.308Q334.556 101.004 335.05 100.472Q335.544 99.94 335.544 98.344V53.656Q335.544 52.06 335.05 51.528Q334.556 50.996 332.96 50.692L331.212 50.388Q330.224 50.16 330.224 49.476Q330.224 48.64 331.364 48.64H345.272Q346.412 48.64 346.412 49.552Q346.412 50.236 345.576 50.388L343.524 50.692Q341.928 50.92 341.434 51.528Q340.94 52.136 340.94 53.732V96.292Q340.94 99.028 342.498 100.244Q344.056 101.46 346.412 101.46Q348.16 101.46 350.022 100.738Q351.884 100.016 353.404 98.002Q354.924 95.988 355.684 92.112L356.672 87.02Q356.9 86.032 357.812 86.032Q358.876 86.032 358.724 87.324L357.812 101.612Q357.66 103.36 355.912 103.36Z"
        fill={ink}
      />
    </svg>
  );
}

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);
  const reduce = useReducedMotion();
  const ready = useClientReady();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <m.header
      initial={false}
      animate={ready && !reduce ? "show" : false}
      variants={slideDown}
      className={cn(
        "sticky top-0 z-40 border-b backdrop-blur-[14px] transition-shadow duration-300",
        scrolled
          ? "border-iseul-line bg-[color-mix(in_srgb,#FAF8F4_94%,transparent)] shadow-[0_4px_24px_rgba(28,26,22,.06)]"
          : "border-iseul-line/80 bg-[color-mix(in_srgb,#FAF8F4_88%,transparent)]"
      )}
    >
      <div className="mx-auto flex h-[70px] max-w-store items-center gap-6 px-[22px]">
        <Link href="/#topo" className="w-[132px] shrink-0" aria-label="Iseul, página inicial">
          <IseulLogo />
        </Link>
        <nav className="ml-auto hidden items-center gap-[22px] text-sm text-iseul-muted sm:flex">
          {NAV_LINKS.map((link) => (
            <m.div key={link.href} whileHover={reduce ? undefined : { y: -1 }} transition={{ duration: 0.2 }}>
              <Link href={link.href} className="transition-colors hover:text-iseul-ink">
                {link.label}
              </Link>
            </m.div>
          ))}
        </nav>
      </div>
    </m.header>
  );
}

export function LandingFooter({ settings }: { settings: StoreSettings }) {
  return (
    <footer className="bg-iseul-ink py-14 text-sm text-[#CFC8BC]">
      <div className="mx-auto max-w-store px-[22px]">
        <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr]">
          <div>
            <div className="mb-3 w-[140px]">
              <IseulLogo dark />
            </div>
            <p className="max-w-xs text-[12.5px] text-[#8E877B]">
              Skincare coreano com curadoria, estoque no Brasil e envio rápido.
            </p>
          </div>
          <div>
            <h5 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-iseul-paper">
              Loja
            </h5>
            <Link href="/#selecao" className="block py-1 transition-colors hover:text-white">
              A seleção
            </Link>
            <Link href="/#rotina" className="block py-1 transition-colors hover:text-white">
              A rotina
            </Link>
            <Link href="/#sobre" className="block py-1 transition-colors hover:text-white">
              Sobre
            </Link>
          </div>
          <div>
            <h5 className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-iseul-paper">
              Ajuda
            </h5>
            <p className="py-1 text-[#CFC8BC]">Trocas e devoluções</p>
            <p className="py-1 text-[#CFC8BC]">Política de privacidade</p>
            <p className="py-1 text-[#CFC8BC]">Prazo e forma de entrega</p>
            <Link href="/#contato" className="block py-1 transition-colors hover:text-white">
              Fale com a gente
            </Link>
          </div>
        </div>
        <div className="mt-9 flex flex-wrap justify-between gap-3.5 border-t border-white/10 pt-5 text-xs text-[#8E877B]">
          <span>
            © {new Date().getFullYear()} {settings.store_name}. Todos os direitos reservados.
          </span>
          <span>Preços em BRL</span>
        </div>
      </div>
    </footer>
  );
}
