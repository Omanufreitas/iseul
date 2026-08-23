export function LandingAboutSection() {
  return (
    <section id="sobre" className="sobre landing-section border-y border-iseul-line bg-iseul-areia">
      <div className="wrap">
        <div className="sg grid grid-cols-2 items-center gap-14 max-[820px]:grid-cols-1 max-[820px]:gap-[34px]">
          <div className="cab reveal m-0 max-w-none text-left">
            <p className="eyebrow">sobre</p>
            <h2>
              Iseul quer dizer <em>orvalho.</em>
            </h2>
            <p className="txt mt-4 text-[15.5px] text-iseul-muted">
              É a palavra coreana para aquela camada fina de água que aparece de manhã e deixa tudo
              com aparência viva. É o efeito que a rotina coreana persegue, e por isso a marca tem
              esse nome.
            </p>
            <p className="txt mt-4 text-[15.5px] text-iseul-muted">
              A gente importa em pequenos lotes, testa antes de listar e mantém estoque no Brasil. O
              que não passaria na nossa própria pele não entra.
            </p>
          </div>

          <div className="glifo reveal text-center">
            <span
              className="kr block text-[clamp(96px,15vw,148px)] font-semibold leading-[0.9] text-iseul-sage opacity-50"
              aria-hidden
            >
              이슬
            </span>
            <p className="rom mt-4 font-serif text-[26px] tracking-[0.28em] pl-[0.28em]">ISEUL</p>
            <p className="tr mt-2 text-[11px] font-medium uppercase tracking-[0.24em] text-iseul-sage">
              orvalho · dew
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
