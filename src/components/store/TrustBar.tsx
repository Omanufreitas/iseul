"use client";

import { m, useReducedMotion } from "framer-motion";
import { fadeUp, stagger } from "@/lib/motion";
import type { StoreSettings } from "@/types";

type Props = {
  settings: StoreSettings;
  total: number;
};

export function TrustBar({ settings, total }: Props) {
  const reduce = useReducedMotion();
  const items = [
    { v: `${settings.trust_rating} ★`, l: settings.trust_rating_label },
    { v: String(total), l: "Produtos com curadoria" },
    { v: "24h", l: "Envio, estoque no Brasil" },
    { v: "100%", l: "Originais e lacrados" },
  ];

  return (
    <section className="border-y border-iseul-line bg-iseul-card">
      <m.div
        className="mx-auto grid max-w-store grid-cols-2 gap-px bg-iseul-line md:grid-cols-4"
        initial={reduce ? false : "hidden"}
        whileInView="show"
        viewport={{ once: true, margin: "-20px" }}
        variants={stagger(0.08)}
      >
        {items.map((item) => (
          <m.div
            key={item.l}
            variants={fadeUp}
            className="bg-iseul-card px-5 py-5 text-center transition-colors duration-300 hover:bg-iseul-paper"
          >
            <div className="font-serif text-2xl leading-tight">{item.v}</div>
            <div className="mt-1 text-[11.5px] tracking-wide text-iseul-muted">{item.l}</div>
          </m.div>
        ))}
      </m.div>
    </section>
  );
}
