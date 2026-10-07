import Link from "next/link";
import { ROUTINE_STEPS } from "@/lib/constants";

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
          <button
            type="button"
            data-iseul-rotina
            className="mt-6 rounded-full bg-[#F4F0E9] px-5 py-2.5 text-sm font-medium text-iseul-pine transition hover:bg-white"
          >
            Montar minha rotina
          </button>
        </div>

        <ol className="m-0 grid list-none grid-cols-4 gap-px border border-white/[0.13] bg-white/[0.13] p-0 max-[820px]:grid-cols-2 max-[460px]:grid-cols-1">
          {ROUTINE_STEPS.map((step) => (
            <li key={step.n} className="reveal bg-iseul-pine px-[22px] py-[30px]">
              <Link
                href={`/produtos?categoria=${step.category}`}
                className="block no-underline transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9DBAA9]/ring-offset-2 focus-visible:ring-offset-iseul-pine"
              >
                <span className="n mb-3.5 block font-serif text-[19px] text-[#9DBAA9]">
                  {step.n}
                </span>
                <h3 className="mb-2 mt-0 text-base font-medium text-[#F4F0E9]">{step.title}</h3>
                <p className="m-0 text-[13.5px] leading-[1.55] text-[#B6AFA3]">{step.text}</p>
                <span className="mt-4 inline-block text-[12px] font-medium tracking-wide text-[#9DBAA9]">
                  {step.cta} →
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
