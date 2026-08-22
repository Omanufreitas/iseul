"use client";

import { m, useReducedMotion } from "framer-motion";
import { CountUp } from "@/components/motion/CountUp";
import { useClientReady } from "@/hooks/use-client-ready";
import { EASE_OUT, popIn, stagger } from "@/lib/motion";

export function LandingTrustBar() {
  const reduce = useReducedMotion();
  const ready = useClientReady();

  const items = [
    {
      label: "na Shopee",
      render: (active: boolean, i: number) => (
        <CountUp
          value={4.98}
          decimals={2}
          suffix=" ★"
          active={active}
          delay={0.2 + i * 0.12}
          duration={2.4}
          className="v block font-serif text-2xl leading-[1.15] tabular-nums"
        />
      ),
    },
    {
      label: "para enviar",
      render: (active: boolean, i: number) => (
        <span className="v block font-serif text-2xl leading-[1.15] tabular-nums">
          <CountUp value={24} suffix="h" active={active} delay={0.2 + i * 0.12} duration={2.2} />
        </span>
      ),
    },
    {
      label: "estoque local",
      render: () => (
        <span className="v block font-serif text-2xl leading-[1.15] tabular-nums">Brasil</span>
      ),
    },
    {
      label: "para desistir",
      render: () => (
        <span className="v block font-serif text-2xl leading-[1.15] tabular-nums">7 dias</span>
      ),
    },
  ] as const;

  return (
    <div className="tira border-y border-iseul-line bg-iseul-areia">
      <div className="wrap">
        <m.ul
          className="m-0 flex list-none flex-wrap justify-center gap-[clamp(24px,7vw,72px)] py-5 text-center"
          initial={false}
          whileInView={ready && !reduce ? "show" : undefined}
          viewport={{ once: true, margin: "-40px" }}
          variants={stagger(0.1, 0.08)}
        >
          {items.map((item, index) => (
            <m.li
              key={item.label}
              variants={popIn}
              whileHover={reduce ? undefined : { y: -3 }}
              transition={{ duration: 0.25, ease: EASE_OUT }}
            >
              <m.div
                aria-hidden
                className="pointer-events-none mx-auto mb-1 h-px w-8 bg-gradient-to-r from-transparent via-iseul-sage/40 to-transparent"
                initial={{ scaleX: 0, opacity: 0 }}
                whileInView={{ scaleX: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.25 + index * 0.08, ease: EASE_OUT }}
              />
              <div>{item.render(ready, index)}</div>
              <m.span
                initial={{ opacity: 0, y: 6 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: 0.4 + index * 0.08, ease: EASE_OUT }}
                className="l mt-[3px] block text-[11px] uppercase tracking-[0.1em] text-iseul-muted"
              >
                {item.label}
              </m.span>
            </m.li>
          ))}
        </m.ul>
      </div>
    </div>
  );
}
