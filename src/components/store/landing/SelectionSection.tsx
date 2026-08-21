"use client";

import { m, useReducedMotion } from "framer-motion";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { IseulDropIcon } from "@/components/store/landing/IseulDropIcon";
import { WaitlistForm } from "@/components/store/landing/WaitlistForm";
import { EASE_OUT } from "@/lib/motion";

const CATEGORIES = [
  { title: "Limpeza", subtitle: "primeiro passo" },
  { title: "Tratamento", subtitle: "sérum e ampola" },
  { title: "Hidratação", subtitle: "creme e balm" },
  { title: "Proteção", subtitle: "filtro solar" },
] as const;

export function SelectionSection() {
  const reduce = useReducedMotion();

  return (
    <section id="selecao" className="scroll-mt-20 py-[70px]">
      <div className="mx-auto max-w-store px-[22px]">
        <Reveal className="mb-[38px] max-w-[52ch]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-iseul-accent2">
            a seleção
          </p>
          <h2 className="mt-2.5 font-serif text-[clamp(1.75rem,5vw,2.625rem)] leading-[1.12] text-balance">
            Está sendo escolhida agora.
          </h2>
          <p className="mt-3 text-base text-iseul-muted">
            Cada produto entra por um motivo específico de formulação, e a seleção cobre os quatro
            passos da rotina. Enquanto ela não abre, dá pra entrar na lista e ser avisada primeiro.
          </p>
        </Reveal>

        <Stagger className="grid grid-cols-[repeat(auto-fit,minmax(230px,1fr))] gap-[18px]">
          {CATEGORIES.map((cat, i) => (
            <StaggerItem key={cat.title}>
              <article className="group relative h-full overflow-hidden rounded-2xl border border-iseul-line bg-iseul-card px-6 pb-7 pt-[26px] transition-shadow duration-300 hover:shadow-[0_16px_40px_rgba(28,26,22,.08)]">
                <m.div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_78%_12%,#E6EFE9,transparent_58%)] opacity-70"
                  animate={
                    reduce
                      ? undefined
                      : {
                          opacity: [0.55, 0.85, 0.55],
                        }
                  }
                  transition={
                    reduce
                      ? undefined
                      : { duration: 5 + i * 0.4, repeat: Infinity, ease: "easeInOut" }
                  }
                />
                <div className="relative mb-[26px] flex items-center justify-between">
                  <m.div
                    animate={reduce ? undefined : { y: [0, -4, 0] }}
                    transition={
                      reduce
                        ? undefined
                        : { duration: 3.2 + i * 0.3, repeat: Infinity, ease: "easeInOut" }
                    }
                  >
                    <IseulDropIcon className="h-[30px] w-[30px] text-iseul-accent opacity-90 transition-transform duration-300 group-hover:scale-110" />
                  </m.div>
                  <m.span
                    initial={{ opacity: 0, rotate: -8, x: 12 }}
                    whileInView={{ opacity: 1, rotate: -4, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.55, delay: 0.15 + i * 0.08, ease: EASE_OUT }}
                    className="font-handwriting text-[26px] font-semibold text-[#4A453D]"
                  >
                    em breve
                  </m.span>
                </div>
                <h3 className="relative font-serif text-[27px] leading-none transition-transform duration-300 group-hover:translate-x-0.5">
                  {cat.title}
                </h3>
                <p className="relative mt-1.5 text-[13.5px] tracking-wide text-iseul-muted">
                  {cat.subtitle}
                </p>
              </article>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.08} className="mt-[34px] scroll-mt-24">
          <div
            id="avisar"
            className="rounded-2xl border border-iseul-line bg-iseul-paper2 p-7 transition-shadow duration-300 hover:shadow-[0_12px_32px_rgba(28,26,22,.06)]"
          >
            <h3 className="text-[17px] font-semibold">Quero saber quando abrir</h3>
            <p className="mt-1.5 max-w-[46ch] text-sm text-iseul-muted">
              Sem disparo diário e sem promoção genérica. Um aviso quando a loja abrir, e só.
            </p>
            <div className="mt-[18px]">
              <WaitlistForm />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
