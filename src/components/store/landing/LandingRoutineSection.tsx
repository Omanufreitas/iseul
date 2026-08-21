"use client";

import { m, useReducedMotion } from "framer-motion";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { EASE_OUT } from "@/lib/motion";

const STEPS = [
  {
    n: "01",
    title: "Limpar",
    text: "Óleo ou gel de limpeza. Retira filtro solar e oleosidade sem levar a barreira junto.",
  },
  {
    n: "02",
    title: "Tratar",
    text: "Sérum, ampola ou essence. É aqui que retinal, peptídeo e vitamina C fazem o trabalho.",
  },
  {
    n: "03",
    title: "Selar",
    text: "Creme ou balm. Segura a água que os passos anteriores entregaram à pele.",
  },
  {
    n: "04",
    title: "Proteger",
    text: "Protetor solar, todo dia. Sem ele, os passos 2 e 3 viram desperdício de dinheiro.",
  },
] as const;

export function LandingRoutineSection() {
  const reduce = useReducedMotion();

  return (
    <div id="rotina" className="scroll-mt-20 border-y border-iseul-line bg-iseul-card">
      <section className="py-[70px]">
        <div className="mx-auto max-w-store px-[22px]">
          <Reveal className="mb-[38px] max-w-[52ch]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-iseul-accent2">
              a rotina
            </p>
            <h2 className="mt-2.5 font-serif text-[clamp(1.75rem,5vw,2.625rem)] leading-[1.12] text-balance">
              Quatro passos, nessa ordem.
            </h2>
            <p className="mt-3 text-base text-iseul-muted">
              Rotina coreana não é ter dez frascos. É ter o passo certo no lugar certo.
            </p>
          </Reveal>

          <Stagger className="grid list-none grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-[26px] p-0">
            {STEPS.map((step, i) => (
              <StaggerItem key={step.n}>
                <m.div
                  className="group flex items-start gap-4 border-l-2 border-iseul-dew pl-[18px] transition-colors duration-300 hover:border-iseul-accent2"
                  whileHover={reduce ? undefined : { x: 4 }}
                  transition={{ duration: 0.25, ease: EASE_OUT }}
                >
                  <m.span
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.45, delay: i * 0.06, ease: EASE_OUT }}
                    className="shrink-0 font-serif text-[19px] text-iseul-accent2"
                  >
                    {step.n}
                  </m.span>
                  <div>
                    <h3 className="text-base font-semibold">{step.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-iseul-muted">{step.text}</p>
                  </div>
                </m.div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </div>
  );
}
