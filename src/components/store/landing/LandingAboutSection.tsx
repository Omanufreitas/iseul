import { Reveal } from "@/components/store/landing/ScrollReveal";

export function LandingAboutSection() {
  return (
    <section id="sobre" className="sobre landing-section border-y border-iseul-line bg-iseul-areia">
      <div className="wrap">
        <div className="sg grid grid-cols-2 items-center gap-14 max-[820px]:grid-cols-1 max-[820px]:gap-[34px]">
          <Reveal className="cab m-0 max-w-none text-left">
            <p className="eyebrow">sobre</p>
            <h2>
              Iseul quer dizer <em>orvalho.</em>
            </h2>
            <p className="txt mt-4 text-[15.5px] text-iseul-muted">
              É a palavra coreana para aquela camada fina de água que aparece de manhã e deixa tudo
              com aparência viva. É exatamente o efeito que a rotina coreana persegue, e por isso a
              marca tem esse nome.
            </p>
            <p className="txt mt-4 text-[15.5px] text-iseul-muted">
              A gente importa em pequenos lotes, testa antes de listar e mantém estoque no Brasil,
              para você não esperar quarenta dias nem pagar imposto surpresa na entrega. O que não
              passaria na nossa própria pele não entra no catálogo.
            </p>
          </Reveal>

          <Reveal delay={80} className="glifo relative text-center">
            <span
              className="glifo-kr block text-[clamp(96px,15vw,148px)] font-semibold leading-[0.9] text-iseul-sage opacity-50"
              aria-hidden
            >
              이슬
            </span>
            <span
              aria-hidden
              className="gotinha g1 absolute right-[14%] top-[6%] h-3.5 w-3.5 rounded-full bg-[radial-gradient(circle_at_34%_30%,rgba(255,255,255,.95),rgba(143,168,154,.34)_60%,transparent_100%)]"
            />
            <span
              aria-hidden
              className="gotinha g2 absolute right-[6%] top-[22%] h-2 w-2 rounded-full bg-[radial-gradient(circle_at_34%_30%,rgba(255,255,255,.95),rgba(143,168,154,.34)_60%,transparent_100%)]"
            />
            <span
              aria-hidden
              className="gotinha g3 absolute bottom-[26%] left-[8%] h-2.5 w-2.5 rounded-full bg-[radial-gradient(circle_at_34%_30%,rgba(255,255,255,.95),rgba(143,168,154,.34)_60%,transparent_100%)]"
            />
            <p className="rom mt-4 font-serif text-[26px] tracking-[0.28em] pl-[0.28em]">ISEUL</p>
            <p className="tr mt-2 text-[11px] font-medium uppercase tracking-[0.24em] text-iseul-sage">
              orvalho · dew
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
