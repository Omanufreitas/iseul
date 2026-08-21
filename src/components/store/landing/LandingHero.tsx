"use client";

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { SplitWords } from "@/components/motion/SplitWords";
import { useClientReady } from "@/hooks/use-client-ready";
import { EASE_OUT, fadeUp, fadeUpBlur, stagger } from "@/lib/motion";

export function LandingHero() {
  const reduce = useReducedMotion();
  const ready = useClientReady();

  return (
    <section className="relative overflow-hidden py-[78px] pb-[60px] md:py-24">
      <m.div
        aria-hidden
        className="pointer-events-none absolute -right-40 -top-20 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_38%_38%,#E6EFE9,transparent_66%)]"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={
          reduce
            ? { opacity: 1, scale: 1 }
            : {
                opacity: 1,
                scale: 1,
                x: [0, 20, -10, 0],
                y: [0, -14, 10, 0],
              }
        }
        transition={
          reduce
            ? { duration: 1.2, ease: EASE_OUT }
            : {
                opacity: { duration: 1.2, ease: EASE_OUT },
                scale: { duration: 1.2, ease: EASE_OUT },
                x: { duration: 16, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 16, repeat: Infinity, ease: "easeInOut" },
              }
        }
      />
      <m.div
        aria-hidden
        className="pointer-events-none absolute left-[6%] top-[58%] h-36 w-36 rounded-full bg-iseul-dew/50 blur-2xl"
        animate={reduce ? undefined : { opacity: [0.35, 0.65, 0.35], y: [0, -12, 0] }}
        transition={reduce ? undefined : { duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <m.div
        aria-hidden
        className="pointer-events-none absolute right-[12%] bottom-[8%] h-28 w-28 rounded-full bg-iseul-accent/10 blur-3xl"
        animate={reduce ? undefined : { scale: [1, 1.18, 1], opacity: [0.35, 0.7, 0.35] }}
        transition={reduce ? undefined : { duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto max-w-store px-[22px]">
        <m.div
          className="max-w-[640px]"
          initial={false}
          animate={ready && !reduce ? "show" : false}
          variants={stagger(0.11, 0.08)}
        >
          <m.p
            variants={fadeUp}
            className="text-[11px] font-semibold uppercase tracking-[0.24em] text-iseul-accent2"
          >
            이슬 · orvalho
          </m.p>
          <m.div variants={stagger(0.07, 0.12)}>
            <h1 className="mt-4 font-serif text-[clamp(2.5rem,8vw,4.625rem)] leading-[1.04] text-balance [perspective:600px]">
              <SplitWords text="A pele que acorda" />
              <br />
              <SplitWords
                text="com orvalho."
                highlightLast
                highlightClassName="text-iseul-accent italic"
              />
            </h1>
          </m.div>
          <m.p variants={fadeUpBlur} className="mt-[22px] max-w-[44ch] text-lg text-iseul-muted">
            Skincare coreano original, escolhido produto a produto. Estoque no Brasil, envio em 24h
            úteis, sem surpresa na alfândega.
          </m.p>
          <m.div variants={fadeUp} className="mt-8 flex flex-wrap gap-2.5">
            <m.div whileHover={reduce ? undefined : { scale: 1.03, y: -2 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
              <Link
                href="#avisar"
                className="inline-flex items-center rounded-full bg-iseul-ink px-[26px] py-3.5 text-[15px] font-medium text-iseul-paper shadow-[0_10px_28px_rgba(28,26,22,.14)] transition-colors duration-300 hover:bg-iseul-accent"
              >
                Quero saber quando abrir
              </Link>
            </m.div>
            <m.div whileHover={reduce ? undefined : { scale: 1.03, y: -2 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
              <Link
                href="#rotina"
                className="inline-flex items-center rounded-full border border-iseul-line bg-transparent px-[26px] py-3.5 text-[15px] font-medium backdrop-blur-sm transition-all duration-300 hover:border-iseul-accent2 hover:bg-iseul-card"
              >
                Ver a rotina
              </Link>
            </m.div>
          </m.div>
        </m.div>
      </div>
    </section>
  );
}
