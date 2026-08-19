"use client";

import Link from "next/link";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/Reveal";

type Props = { total: number };

export function AboutSection({ total }: Props) {
  const pillars = [
    ["Estoque no Brasil", "Nada de espera internacional ou taxação na alfândega."],
    ["Curadoria de verdade", `${total} produtos, não 5 mil. Cada um entrou por um motivo.`],
    ["Original e lacrado", "Importação direta com nota. Sem recondicionado."],
    ["4,98 de 5", "Nota das clientes que compraram na Shopee."],
  ] as const;

  return (
    <section id="sobre" className="scroll-mt-20 py-16">
      <div className="mx-auto grid max-w-store items-start gap-14 px-6 md:grid-cols-2">
        <Reveal>
          <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-iseul-muted">
            Sobre
          </div>
          <h2 className="mt-2 font-serif text-3xl leading-tight md:text-4xl">
            Iseul quer dizer orvalho.
          </h2>
          <p className="mt-4 text-iseul-muted">
            A operação começou na Shopee, com curadoria real e nota 4,98 das clientes. Agora a mesma
            seleção numa loja própria, mais rápida e com checkout direto.
          </p>
          <Link
            href="#catalogo"
            className="mt-6 inline-flex rounded-full bg-iseul-ink px-6 py-3 text-sm font-medium text-iseul-paper transition-colors duration-300 hover:bg-iseul-accent"
          >
            Começar pelo catálogo
          </Link>
        </Reveal>

        <Stagger className="overflow-hidden rounded-iseul border border-iseul-line bg-iseul-card">
          {pillars.map(([title, text], i) => (
            <StaggerItem
              key={title}
              className={`px-5 py-4 transition-colors duration-300 hover:bg-iseul-paper ${
                i < pillars.length - 1 ? "border-b border-iseul-line" : ""
              }`}
            >
              <h4 className="text-sm font-semibold">{title}</h4>
              <p className="mt-1 text-[13.5px] text-iseul-muted">{text}</p>
            </StaggerItem>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
