"use client";

import { m, useReducedMotion } from "framer-motion";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { SplitWords } from "@/components/motion/SplitWords";

const PILLARS = [
  {
    title: "Estoque no Brasil",
    text: "Nada de espera internacional ou taxação na alfândega. Sai daqui em 24h úteis.",
  },
  {
    title: "Curadoria fechada",
    text: "Catálogo curto, critério longo. Cada item entra por um motivo de formulação.",
  },
  {
    title: "Original e lacrado",
    text: "Importação direta com nota. Sem recondicionado, sem frasco aberto.",
  },
] as const;

export function LandingAboutSection() {
  const reduce = useReducedMotion();

  return (
    <section id="sobre" className="scroll-mt-20 py-[70px]">
      <div className="mx-auto grid max-w-store items-start gap-[52px] px-[22px] md:grid-cols-[1.05fr_0.95fr]">
        <Reveal>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-iseul-accent2">
            sobre
          </p>
          <h2 className="mt-2.5 font-serif text-[clamp(1.75rem,5vw,2.5rem)] leading-[1.12]">
            <SplitWords text="Iseul quer dizer orvalho." />
          </h2>
          <p className="mt-[18px] text-iseul-muted">
            É a palavra coreana para aquela camada fina de água que aparece de manhã e deixa tudo
            com aparência viva. É exatamente o efeito que a rotina coreana persegue, e por isso a
            marca tem esse nome.
          </p>
          <p className="mt-3.5 text-iseul-muted">
            A gente importa em pequenos lotes, testa antes de listar e mantém estoque no Brasil,
            para você não esperar quarenta dias nem pagar imposto surpresa na entrega. O que não
            passaria na nossa própria pele não entra no catálogo.
          </p>
        </Reveal>

        <Stagger className="overflow-hidden rounded-2xl border border-iseul-line bg-iseul-card">
          {PILLARS.map((pillar, i) => (
            <StaggerItem
              key={pillar.title}
              className={`px-5 py-[18px] transition-colors duration-300 hover:bg-iseul-paper/80 ${
                i < PILLARS.length - 1 ? "border-b border-iseul-line" : ""
              }`}
            >
              <m.div whileHover={reduce ? undefined : { x: 3 }} transition={{ duration: 0.2 }}>
                <h4 className="text-[14.5px] font-semibold">{pillar.title}</h4>
                <p className="mt-1 text-[13.5px] text-iseul-muted">{pillar.text}</p>
              </m.div>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
