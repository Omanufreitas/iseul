import { WaitlistForm } from "@/components/store/landing/WaitlistForm";

export function WaitlistSection() {
  return (
    <section id="avisar" className="avisar landing-section scroll-mt-[70px] text-center">
      <div className="wrap">
        <div className="cab reveal">
          <p className="eyebrow">novidades</p>
          <h2>
            Avisamos quando <em>chegar.</em>
          </h2>
          <p>
            Um aviso quando entrar produto novo ou voltar o que esgotou, e mais nada.
          </p>
        </div>
        <div className="reveal">
          <WaitlistForm />
          <p className="mini mt-4 text-[12.5px] text-iseul-muted">
            Sem disparo diário. Sem promoção genérica.
          </p>
        </div>
      </div>
    </section>
  );
}
