"use client";

import { m, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";
import { EASE_OUT } from "@/lib/motion";

const STEPS = [
  {
    n: "01",
    title: "Limpar",
    text: "Retira filtro solar e oleosidade sem agredir a barreira.",
  },
  {
    n: "02",
    title: "Tratar",
    text: "Sérum ou ampola. É aqui que os ativos trabalham.",
  },
  {
    n: "03",
    title: "Selar",
    text: "Creme ou bálsamo. Segura a água que você acabou de entregar.",
  },
  {
    n: "04",
    title: "Proteger",
    text: "Filtro solar, todo dia. Sem ele, os passos 2 e 3 se perdem.",
  },
] as const;

export function LandingRoutineSection() {
  const reduce = useReducedMotion();

  return (
    <section id="rotina" className="rotina landing-section bg-iseul-pine text-iseul-sobre">
      <div className="wrap">
        <Reveal className="cab [&_p]:text-[#B6AFA3] [&_.eyebrow]:text-[#9DBAA9] [&_h2]:text-[#F4F0E9] [&_h2_em]:text-[#9DBAA9]">
          <p className="eyebrow">a rotina</p>
          <h2>
            Quatro passos, <em>nessa ordem.</em>
          </h2>
          <p className="mt-3">
            Rotina coreana não é ter dez frascos. É ter o passo certo no lugar certo.
          </p>
        </Reveal>

        <ol className="m-0 grid list-none grid-cols-4 gap-px border border-white/[0.13] bg-white/[0.13] p-0 max-[820px]:grid-cols-2 max-[460px]:grid-cols-1">
          {STEPS.map((step, i) => (
            <Reveal key={step.n} as="li" delay={i * 0.07} className="bg-iseul-pine px-[22px] py-[30px]">
              <m.div
                whileHover={reduce ? undefined : { x: 3 }}
                transition={{ duration: 0.25, ease: EASE_OUT }}
              >
                <m.span
                  initial={{ opacity: 0, scale: 0.85 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: i * 0.06, ease: EASE_OUT }}
                  className="n mb-3.5 block font-serif text-[19px] text-[#9DBAA9]"
                >
                  {step.n}
                </m.span>
                <h3 className="mb-2 mt-0 text-base font-medium text-[#F4F0E9]">{step.title}</h3>
                <p className="m-0 text-[13.5px] leading-[1.55] text-[#B6AFA3]">{step.text}</p>
              </m.div>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}
