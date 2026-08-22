import { WaitlistForm } from "@/components/store/landing/WaitlistForm";
import { Reveal } from "@/components/store/landing/ScrollReveal";

export function WaitlistSection() {
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
        <Reveal delay={70}>
          <WaitlistForm />
          <p className="mini mt-4 text-[12.5px] text-iseul-muted">
            Ao enviar, você concorda em receber um e-mail sobre a abertura. Sem spam.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
