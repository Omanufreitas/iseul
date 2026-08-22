import Link from "next/link";
import { DewCanvas } from "@/components/store/landing/DewCanvas";
import { DropLustro } from "@/components/store/landing/DropLustro";

export function LandingHero() {
  return (
    <div className="hero relative overflow-hidden bg-[radial-gradient(120%_80%_at_50%_-10%,var(--dew)_0%,transparent_62%),linear-gradient(180deg,transparent_60%,var(--paper)_100%)] py-24 pb-[84px] pt-[96px] text-center">
      <DewCanvas />
      <div
        className="marca-dagua pointer-events-none absolute left-1/2 top-[46%] -translate-x-1/2 -translate-y-1/2 select-none whitespace-nowrap text-[clamp(230px,42vw,430px)] font-semibold leading-[0.8] tracking-[-0.02em] text-iseul-sage opacity-[0.09]"
        aria-hidden
      >
        이슬
      </div>
      <div className="wrap in relative">
        <DropLustro />
        <p className="eyebrow">이슬 · orvalho</p>
        <h1 aria-label="A pele que acorda com orvalho.">
          A pele que acorda <em>com orvalho.</em>
        </h1>
        <p className="lead mx-auto mb-8 mt-0 max-w-[40ch] text-[17px] text-iseul-muted">
          Skincare coreano original, escolhido produto a produto. A seleção abre em breve.
        </p>
        <div className="acoes flex flex-wrap justify-center gap-2.5">
          <Link className="btn" href="#avisar">
            Quero saber quando abrir
          </Link>
          <Link className="btn ghost" href="#rotina">
            Ver a rotina
          </Link>
        </div>
      </div>
    </div>
  );
}
