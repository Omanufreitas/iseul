"use client";

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";

export function HomeHero() {
  const reduce = useReducedMotion();

  return (
    <section className="relative overflow-hidden py-16 md:py-20">
      <m.div
        aria-hidden
        className="pointer-events-none absolute -right-36 -top-16 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle_at_35%_35%,#E6EFE9,transparent_66%)] opacity-85"
        animate={
          reduce
            ? undefined
            : {
                x: [0, 18, -8, 0],
                y: [0, -12, 8, 0],
                scale: [1, 1.04, 0.98, 1],
              }
        }
        transition={
          reduce
            ? undefined
            : {
                duration: 14,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      />
      <m.div
        aria-hidden
        className="pointer-events-none absolute left-[8%] top-[55%] h-32 w-32 rounded-full bg-iseul-dew/40 blur-2xl"
        animate={reduce ? undefined : { opacity: [0.3, 0.55, 0.3], y: [0, -10, 0] }}
        transition={reduce ? undefined : { duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 mx-auto max-w-store px-6">
        <m.div
          className="max-w-2xl"
          initial={reduce ? false : "hidden"}
          animate="show"
          variants={stagger(0.1, 0.05)}
        >
          <m.div
            variants={fadeUp}
            className="text-[11px] font-medium uppercase tracking-[0.18em] text-iseul-muted"
          >
            이슬, orvalho
          </m.div>
          <m.h1
            variants={fadeUp}
            className="mt-4 font-serif text-4xl leading-[1.06] md:text-6xl"
          >
            A pele que acorda
            <br />
            <em className="text-iseul-accent not-italic">com orvalho.</em>
          </m.h1>
          <m.p variants={fadeUp} className="mt-5 max-w-lg text-[17px] text-iseul-muted">
            Skincare coreano original, curado produto a produto. Estoque no Brasil, envio em até
            24h, sem surpresa na alfândega.
          </m.p>
          <m.div variants={fadeUp} className="mt-8 flex flex-wrap gap-2">
            <Link
              href="#catalogo"
              className="inline-flex items-center rounded-full bg-iseul-ink px-6 py-3.5 text-sm font-medium text-iseul-paper transition-colors duration-300 hover:bg-iseul-accent"
            >
              Ver o catálogo
            </Link>
            <Link
              href="#rotina"
              className="inline-flex items-center rounded-full border border-iseul-line bg-transparent px-6 py-3.5 text-sm font-medium transition-all duration-300 hover:border-iseul-accent2 hover:bg-iseul-card"
            >
              Montar minha rotina
            </Link>
          </m.div>
        </m.div>
      </div>
    </section>
  );
}
