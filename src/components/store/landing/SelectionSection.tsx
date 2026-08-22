import { CardCondensation } from "@/components/store/landing/CardCondensation";
import { IseulDropIcon } from "@/components/store/landing/IseulDropIcon";
import { Reveal } from "@/components/store/landing/ScrollReveal";

const CATEGORIES = [
  { title: "Limpeza", subtitle: "primeiro passo" },
  { title: "Tratamento", subtitle: "sérum e ampola" },
  { title: "Hidratação", subtitle: "creme e balm" },
  { title: "Proteção", subtitle: "filtro solar" },
] as const;

export function SelectionSection() {
  return (
    <section id="selecao" className="landing-section">
      <div className="wrap">
        <Reveal className="cab">
          <p className="eyebrow">a seleção</p>
          <h2>
            Está sendo <em>escolhida agora.</em>
          </h2>
          <p className="mt-3 text-iseul-muted">
            Cada produto entra por um motivo de formulação, e a seleção cobre os quatro passos da
            rotina.
          </p>
        </Reveal>

        <div className="grade grid grid-cols-4 gap-3.5 max-[820px]:grid-cols-2 max-[460px]:grid-cols-1">
          {CATEGORIES.map((cat, i) => (
            <Reveal
              key={cat.title}
              delay={i * 70}
              as="article"
              className="card group relative overflow-hidden rounded-[2px] border border-iseul-line bg-[linear-gradient(168deg,var(--dew),transparent_62%),var(--paper)] px-[22px] pb-6 pt-[26px] text-center transition-[transform,border-color] duration-[250ms] hover:-translate-y-[3px] hover:border-iseul-sage"
            >
              <CardCondensation />
              <span className="gota mx-auto mb-[22px] block w-[22px] opacity-85">
                <IseulDropIcon className="block w-full text-iseul-sage" />
              </span>
              <h3 className="m-0 font-serif text-2xl font-normal">{cat.title}</h3>
              <span className="tag mb-5 mt-[5px] block text-[10px] uppercase tracking-[0.16em] text-iseul-muted">
                {cat.subtitle}
              </span>
              <span className="soon block font-handwriting text-[21px] font-semibold text-iseul-grafite">
                em breve
              </span>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
