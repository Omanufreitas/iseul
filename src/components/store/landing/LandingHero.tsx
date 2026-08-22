"use client";

import Link from "next/link";
import { m, useReducedMotion } from "framer-motion";
import { SplitWords } from "@/components/motion/SplitWords";
import { DewCanvas } from "@/components/store/landing/DewCanvas";
import { DropLustro } from "@/components/store/landing/DropLustro";
import { useClientReady } from "@/hooks/use-client-ready";
import { EASE_OUT, fadeUp, fadeUpBlur, stagger } from "@/lib/motion";

export function LandingHero() {
  const reduce = useReducedMotion();
  const ready = useClientReady();

  return (
    <div className="hero relative overflow-hidden bg-[radial-gradient(120%_80%_at_50%_-10%,var(--dew)_0%,transparent_62%),linear-gradient(180deg,transparent_60%,var(--paper)_100%)] py-24 pb-[84px] pt-[96px] text-center">
      <DewCanvas />
      <m.div
        aria-hidden
        className="marca-dagua pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[clamp(230px,42vw,430px)] font-semibold leading-[0.8] tracking-[-0.02em] text-iseul-sage opacity-[0.09]"
        initial={{ opacity: 0, scale: 0.96 }}
        animate={reduce ? { opacity: 0.09, scale: 1 } : { opacity: 0.09, scale: 1 }}
        transition={{ duration: 1.4, ease: EASE_OUT }}
      />
      <m.div
        aria-hidden
        className="pointer-events-none absolute left-[8%] top-[62%] h-32 w-32 rounded-full bg-iseul-dew/40 blur-2xl"
        animate={reduce ? undefined : { opacity: [0.3, 0.55, 0.3], y: [0, -10, 0] }}
        transition={reduce ? undefined : { duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <m.div
        aria-hidden
        className="pointer-events-none absolute bottom-[12%] right-[10%] h-24 w-24 rounded-full bg-iseul-sage/10 blur-3xl"
        animate={reduce ? undefined : { scale: [1, 1.15, 1], opacity: [0.3, 0.55, 0.3] }}
        transition={reduce ? undefined : { duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="wrap in relative">
        <m.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1, ease: EASE_OUT }}
        >
          <DropLustro />
        </m.div>

        <m.div
          className="relative"
          initial={false}
          animate={ready && !reduce ? "show" : false}
          variants={stagger(0.11, 0.08)}
        >
          <m.p variants={fadeUp} className="eyebrow">
            이슬 · orvalho
          </m.p>
          <m.div variants={fadeUp}>
            <h1 aria-label="A pele que acorda com orvalho.">
              <span aria-hidden="true" className="[perspective:600px]">
                <SplitWords text="A pele que acorda" />
                <br />
                <SplitWords
                  text="com orvalho."
                  highlightLast
                  highlightClassName="italic text-iseul-sage"
                />
              </span>
            </h1>
          </m.div>
          <m.p variants={fadeUpBlur} className="lead mx-auto mb-8 mt-0 max-w-[40ch] text-[17px] text-iseul-muted">
            Skincare coreano original, escolhido produto a produto. A seleção abre em breve.
          </m.p>
          <m.div variants={fadeUp} className="acoes flex flex-wrap justify-center gap-2.5">
            <m.div whileHover={reduce ? undefined : { y: -2 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
              <Link className="btn" href="#avisar">
                Quero saber quando abrir
              </Link>
            </m.div>
            <m.div whileHover={reduce ? undefined : { y: -2 }} whileTap={reduce ? undefined : { scale: 0.98 }}>
              <Link className="btn ghost" href="#rotina">
                Ver a rotina
              </Link>
            </m.div>
          </m.div>
        </m.div>
      </div>
    </div>
  );
}
