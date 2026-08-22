"use client";

import { m, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/motion/Reveal";
import { WaitlistForm } from "@/components/store/landing/WaitlistForm";
import { EASE_OUT } from "@/lib/motion";

export function WaitlistSection() {
  const reduce = useReducedMotion();

  return (
    <section id="avisar" className="avisar landing-section scroll-mt-[70px] text-center">
      <div className="wrap">
        <Reveal className="cab">
          <p className="eyebrow">lista de abertura</p>
          <h2>
            Quero saber <em>quando abrir.</em>
          </h2>
          <p className="mt-3 text-iseul-muted">
            Sem disparo diário e sem promoção genérica. Um aviso quando a loja abrir, e só.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <m.div
            whileHover={reduce ? undefined : { y: -2 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
          >
            <WaitlistForm />
          </m.div>
          <p className="mini mt-4 text-[12.5px] text-iseul-muted">
            Ao enviar, você concorda em receber um e-mail sobre a abertura. Sem spam.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
