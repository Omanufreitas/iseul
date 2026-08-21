"use client";

import { m, useReducedMotion } from "framer-motion";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";
import { EASE_OUT } from "@/lib/motion";

const CHANNELS = [
  {
    label: "WhatsApp",
    href: "https://wa.me/5500000000000",
    value: "(00) 00000-0000",
    note: "Seg a sex, 9h às 18h",
  },
  {
    label: "E-mail",
    href: "mailto:contato@iseul.com.br",
    value: "contato@iseul.com.br",
    note: "Resposta em até 1 dia útil",
  },
  {
    label: "Instagram",
    href: "https://instagram.com/iseul.br",
    value: "@iseul.br",
    note: "Bastidor e conteúdo de rotina",
  },
] as const;

export function LandingContactSection() {
  const reduce = useReducedMotion();

  return (
    <div id="contato" className="scroll-mt-20 bg-iseul-paper2">
      <section className="py-[70px]">
        <div className="mx-auto max-w-store px-[22px]">
          <Reveal className="mb-[38px] max-w-[52ch]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-iseul-accent2">
              contato
            </p>
            <h2 className="mt-2.5 font-serif text-[clamp(1.75rem,5vw,2.625rem)] leading-[1.12] text-balance">
              Fala com a gente antes de comprar.
            </h2>
            <p className="mt-3 text-base text-iseul-muted">
              Dúvida de rotina, de ativo ou de prazo. Respondemos em horário comercial.
            </p>
          </Reveal>

          <Stagger className="grid grid-cols-[repeat(auto-fit,minmax(210px,1fr))] gap-4">
            {CHANNELS.map((channel) => (
              <StaggerItem key={channel.label}>
                <m.div
                  whileHover={reduce ? undefined : { y: -4 }}
                  transition={{ duration: 0.28, ease: EASE_OUT }}
                  className="h-full rounded-2xl border border-iseul-line bg-iseul-card p-[22px] transition-shadow duration-300 hover:shadow-[0_14px_36px_rgba(28,26,22,.07)]"
                >
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.18em] text-iseul-accent2">
                    {channel.label}
                  </span>
                  <a
                    href={channel.href}
                    className="mt-2 block text-base font-medium transition-colors hover:text-iseul-accent"
                    target={channel.label === "E-mail" ? undefined : "_blank"}
                    rel={channel.label === "E-mail" ? undefined : "noopener noreferrer"}
                  >
                    {channel.value}
                  </a>
                  <span className="mt-1.5 block text-[13px] text-iseul-muted">{channel.note}</span>
                </m.div>
              </StaggerItem>
            ))}
          </Stagger>
        </div>
      </section>
    </div>
  );
}
