const STEPS = [
  {
    n: "01",
    title: "Limpar",
    text: "Retira filtro solar e oleosidade sem agredir a barreira.",
  },
  {
    n: "02",
    title: "Tratar",
    text: "Sérum ou ampola. É aqui que os ativos trabalham.",
  },
  {
    n: "03",
    title: "Selar",
    text: "Creme ou bálsamo. Segura a água que você acabou de entregar.",
  },
  {
    n: "04",
    title: "Proteger",
    text: "Filtro solar, todo dia. Sem ele, os passos 2 e 3 se perdem.",
  },
] as const;

export function LandingRoutineSection() {
  return (
    <section id="rotina" className="rotina landing-section bg-iseul-pine text-iseul-sobre">
      <div className="wrap">
        <div className="cab reveal [&_p]:text-[#B6AFA3] [&_.eyebrow]:text-[#9DBAA9] [&_h2]:text-[#F4F0E9] [&_h2_em]:text-[#9DBAA9]">
          <p className="eyebrow">a rotina</p>
          <h2>
            Quatro passos, <em>nessa ordem.</em>
          </h2>
          <p>
            Rotina coreana não é ter dez frascos. É ter o passo certo no lugar certo.
          </p>
        </div>

        <ol className="m-0 grid list-none grid-cols-4 gap-px border border-white/[0.13] bg-white/[0.13] p-0 max-[820px]:grid-cols-2 max-[460px]:grid-cols-1">
          {STEPS.map((step) => (
            <li key={step.n} className="reveal bg-iseul-pine px-[22px] py-[30px]">
              <span className="n mb-3.5 block font-serif text-[19px] text-[#9DBAA9]">{step.n}</span>
              <h3 className="mb-2 mt-0 text-base font-medium text-[#F4F0E9]">{step.title}</h3>
              <p className="m-0 text-[13.5px] leading-[1.55] text-[#B6AFA3]">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
