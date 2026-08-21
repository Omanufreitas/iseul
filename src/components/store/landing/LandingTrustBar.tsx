"use client";

import { m, useReducedMotion } from "framer-motion";
import { CountUp } from "@/components/motion/CountUp";
import { useClientReady } from "@/hooks/use-client-ready";
import { EASE_OUT, popIn, stagger } from "@/lib/motion";
import type { StoreSettings } from "@/types";

type Props = {
  settings: StoreSettings;
};

export function LandingTrustBar({ settings }: Props) {
  const reduce = useReducedMotion();
  const ready = useClientReady();

  const items = [
    {
      label: "Nota média na nossa loja da Shopee",
      render: (active: boolean, i: number) => (
        <CountUp
          value={settings.trust_rating}
          decimals={2}
          suffix=" ★"
          active={active}
          delay={0.2 + i * 0.12}
          duration={2.4}
          className="font-serif text-[30px] leading-[1.1] tabular-nums"
        />
      ),
    },
    {
      label: "Envio, com estoque no Brasil",
      render: (active: boolean, i: number) => (
        <span className="font-serif text-[30px] leading-[1.1] tabular-nums">
          <CountUp value={24} suffix="h" active={active} delay={0.2 + i * 0.12} duration={2.2} />
        </span>
      ),
    },
    {
      label: "Originais, importados e lacrados",
      render: (active: boolean, i: number) => (
        <span className="font-serif text-[30px] leading-[1.1] tabular-nums">
          <CountUp value={100} suffix="%" active={active} delay={0.2 + i * 0.12} duration={2.6} />
        </span>
      ),
    },
  ];

  return (
    <div className="border-y border-iseul-line bg-iseul-card">
      <m.ul
        className="mx-auto grid max-w-store grid-cols-1 gap-px bg-iseul-line sm:grid-cols-3"
        initial={false}
        whileInView={ready && !reduce ? "show" : undefined}
        viewport={{ once: true, margin: "-40px" }}
        variants={stagger(0.12, 0.1)}
      >
        {items.map((item, index) => (
          <m.li
            key={item.label}
            variants={popIn}
            whileHover={reduce ? undefined : { y: -3 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="relative overflow-hidden bg-iseul-card px-[18px] py-6 text-center"
          >
            <m.div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-iseul-accent/35 to-transparent"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.3 + index * 0.1, ease: EASE_OUT }}
            />
            <div>{item.render(ready, index)}</div>
            <m.span
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.5 + index * 0.1, ease: EASE_OUT }}
              className="mt-1.5 block text-xs leading-snug text-iseul-muted"
            >
              {item.label}
            </m.span>
          </m.li>
        ))}
      </m.ul>
    </div>
  );
}
