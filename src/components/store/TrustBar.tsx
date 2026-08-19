"use client";

import { m, useReducedMotion } from "framer-motion";
import { CountUp } from "@/components/motion/CountUp";
import { useClientReady } from "@/hooks/use-client-ready";
import { EASE_OUT, popIn, stagger } from "@/lib/motion";
import type { StoreSettings } from "@/types";
import type { ReactNode } from "react";

type Props = {
  settings: StoreSettings;
  total: number;
};

type StatItem = {
  label: string;
  render: (active: boolean, index: number) => ReactNode;
};

export function TrustBar({ settings, total }: Props) {
  const reduce = useReducedMotion();
  const ready = useClientReady();

  const items: StatItem[] = [
    {
      label: settings.trust_rating_label,
      render: (active, i) => (
        <CountUp
          value={settings.trust_rating}
          decimals={2}
          suffix=" ★"
          active={active}
          delay={0.5 + i * 0.15}
          duration={2.8}
          className="font-serif text-2xl leading-tight tabular-nums"
        />
      ),
    },
    {
      label: "Produtos com curadoria",
      render: (active, i) => (
        <CountUp
          value={total}
          active={active}
          delay={0.5 + i * 0.15}
          duration={2.6}
          className="font-serif text-2xl leading-tight tabular-nums"
        />
      ),
    },
    {
      label: "Envio, estoque no Brasil",
      render: (active, i) => (
        <span className="font-serif text-2xl leading-tight tabular-nums">
          <CountUp value={24} suffix="h" active={active} delay={0.5 + i * 0.15} duration={2.4} />
        </span>
      ),
    },
    {
      label: "Originais e lacrados",
      render: (active, i) => (
        <span className="font-serif text-2xl leading-tight tabular-nums">
          <CountUp value={100} suffix="%" active={active} delay={0.5 + i * 0.15} duration={2.8} />
        </span>
      ),
    },
  ];

  return (
    <section className="border-y border-iseul-line bg-iseul-card">
      <m.div
        className="mx-auto grid max-w-store grid-cols-2 gap-px bg-iseul-line md:grid-cols-4"
        initial={false}
        animate={ready && !reduce ? "show" : false}
        variants={stagger(0.14, 0.45)}
      >
        {items.map((item, index) => (
          <m.div
            key={item.label}
            variants={popIn}
            whileHover={reduce ? undefined : { y: -2 }}
            transition={{ duration: 0.25, ease: EASE_OUT }}
            className="relative overflow-hidden bg-iseul-card px-5 py-5 text-center transition-colors duration-300 hover:bg-iseul-paper"
          >
            <m.div
              aria-hidden
              className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-iseul-accent/40 to-transparent"
              initial={{ scaleX: 0, opacity: 0 }}
              animate={ready && !reduce ? { scaleX: 1, opacity: 1 } : false}
              transition={{ duration: 0.6, delay: 0.7 + index * 0.14, ease: EASE_OUT }}
            />
            <div>{item.render(ready, index)}</div>
            <m.div
              initial={{ opacity: 0, y: 8 }}
              animate={ready && !reduce ? { opacity: 1, y: 0 } : false}
              transition={{ duration: 0.5, delay: 1.1 + index * 0.14, ease: EASE_OUT }}
              className="mt-1 text-[11.5px] tracking-wide text-iseul-muted"
            >
              {item.label}
            </m.div>
          </m.div>
        ))}
      </m.div>
    </section>
  );
}
