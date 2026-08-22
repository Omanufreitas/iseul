"use client";

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { SplitWords } from "@/components/motion/SplitWords";
import { useClientReady } from "@/hooks/use-client-ready";
import { EASE_OUT, fadeUp, fadeUpBlur, stagger } from "@/lib/motion";

export function HomeHero() {
  const reduce = useReducedMotion();
  const ready = useClientReady();

  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      <m.div
        aria-hidden
        className="pointer-events-none absolute -right-36 -top-16 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_35%_35%,#E6EFE9,transparent_66%)] opacity-85"
        initial={{ opacity: 0, scale: 0.85 }}
        animate={
          reduce
            ? undefined
            : {
                opacity: 0.85,
                scale: 1,
                x: [0, 18, -8, 0],
                y: [0, -12, 8, 0],
              }
        }
        transition={
          reduce
            ? undefined
            : {
                opacity: { duration: 1.2, ease: EASE_OUT },
                scale: { duration: 1.2, ease: EASE_OUT },
                x: { duration: 14, repeat: Infinity, ease: "easeInOut" },
                y: { duration: 14, repeat: Infinity, ease: "easeInOut" },
              }
        }
      />
      <m.div
        aria-hidden
        className="pointer-events-none absolute left-[8%] top-[55%] h-32 w-32 rounded-full bg-iseul-dew/40 blur-2xl"
        initial={{ opacity: 0 }}
        animate={reduce ? undefined : { opacity: [0.3, 0.55, 0.3], y: [0, -10, 0] }}
        transition={
          reduce
            ? undefined
            : {
                opacity: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
                y: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.3 },
              }
        }
      />
      <m.div
        aria-hidden
        className="pointer-events-none absolute right-[15%] bottom-[10%] h-24 w-24 rounded-full bg-iseul-accent/10 blur-3xl"
        animate={reduce ? undefined : { scale: [1, 1.2, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={reduce ? undefined : { duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto max-w-store px-6">
        <m.div
          className="max-w-2xl"
          initial={false}
          animate={ready && !reduce ? "show" : false}
          variants={stagger(0.11, 0.08)}
        >
          <m.div
            variants={fadeUp}
            className="text-[11px] font-medium uppercase tracking-[0.18em] text-iseul-muted"
          >
            이슬, orvalho
          </m.div>
          <m.div variants={stagger(0.07, 0.12)}>
            <h1 className="mt-4 font-serif text-4xl leading-[1.06] md:text-6xl">
              <SplitWords text="A pele que acorda" />
              <br />
              <SplitWords
                text="com orvalho."
                highlightLast
                highlightClassName="text-iseul-accent not-italic"
              />
            </h1>
          </m.div>
          <m.div variants={fadeUpBlur}>
            <p className="mt-5 max-w-lg text-[17px] text-iseul-muted">
              Skincare coreano original, escolhido produto a produto. Estoque no Brasil, envio em até
              24h, sem surpresa na alfândega.
            </p>
          </m.div>
          <m.div variants={fadeUp} className="mt-8 flex flex-wrap gap-2">
            <m.div whileHover={reduce ? undefined : { scale: 1.03 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
              <Link
                href="#catalogo"
                className="inline-flex items-center rounded-full bg-iseul-ink px-6 py-3.5 text-sm font-medium text-iseul-paper shadow-[0_8px_24px_rgba(28,26,22,.12)] transition-colors duration-300 hover:bg-iseul-accent"
              >
                Ver o catálogo
              </Link>
            </m.div>
            <m.div whileHover={reduce ? undefined : { scale: 1.03 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
              <Link
                href="#rotina"
                className="inline-flex items-center rounded-full border border-iseul-line bg-transparent px-6 py-3.5 text-sm font-medium backdrop-blur-sm transition-all duration-300 hover:border-iseul-accent2 hover:bg-iseul-card"
              >
                Montar minha rotina
              </Link>
            </m.div>
          </m.div>
        </m.div>
      </div>
    </section>
  );
}
