import Link from "next/link";
import { CardCondensation } from "@/components/store/landing/CardCondensation";
import { IseulDropIcon } from "@/components/store/landing/IseulDropIcon";

const CATEGORIES = [
  { title: "Limpeza", subtitle: "primeiro passo", slug: "limpeza" },
  { title: "Tratamento", subtitle: "sérum e ampola", slug: "serum" },
  { title: "Hidratação", subtitle: "creme e balm", slug: "hidratante" },
  { title: "Proteção", subtitle: "filtro solar", slug: "solar" },
] as const;

export function SelectionSection() {
  return (
    <section id="selecao" className="landing-section">
      <div className="wrap">
        <div className="cab reveal">
          <p className="eyebrow">a seleção</p>
          <h2>
            Poucos produtos, <em>escolhidos um a um.</em>
          </h2>
          <p>
            Cada produto entra por um motivo de formulação, e a seleção cobre os quatro passos da
            rotina.
          </p>
        </div>

        <div className="grade grid grid-cols-4 gap-3.5 max-[820px]:grid-cols-2 max-[460px]:grid-cols-1">
          {CATEGORIES.map((cat, i) => (
            <Link
              key={cat.title}
              href={`/?cat=${cat.slug}#catalogo`}
              className="card reveal group relative block overflow-hidden rounded-[2px] border border-iseul-line bg-[linear-gradient(168deg,var(--dew),transparent_62%),var(--paper)] px-[22px] pb-6 pt-[26px] text-center no-underline transition-[transform,border-color] duration-[250ms] hover:-translate-y-[3px] hover:border-iseul-sage"
            >
              <CardCondensation index={i} />
              <span className="gota relative mx-auto mb-[22px] block w-[22px] opacity-85">
                <IseulDropIcon className="block w-full text-iseul-sage" />
              </span>
              <h3 className="relative m-0 font-serif text-2xl font-normal text-iseul-ink">
                {cat.title}
              </h3>
              <span className="tag relative mb-5 mt-[5px] block text-[10px] uppercase tracking-[0.16em] text-iseul-muted">
                {cat.subtitle}
              </span>
              <span className="soon relative block font-handwriting text-[21px] font-semibold text-iseul-grafite">
                ver produtos
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
