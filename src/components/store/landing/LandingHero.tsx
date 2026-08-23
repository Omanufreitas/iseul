import Link from "next/link";
import { CentellaBranch } from "@/components/store/landing/CentellaBranch";
import { DropLustro } from "@/components/store/landing/DropLustro";

export function LandingHero() {
  return (
    <div className="hero relative overflow-hidden bg-[radial-gradient(120%_80%_at_50%_-10%,var(--dew)_0%,transparent_62%),linear-gradient(180deg,transparent_60%,var(--paper)_100%)] py-24 pb-[84px] pt-[96px] text-center">
      <CentellaBranch />
      <div className="wrap in relative">
        <DropLustro />
        <p className="eyebrow">이슬 · orvalho</p>
        <h1>
          A pele que acorda
          <br />
          <em>com orvalho.</em>
        </h1>
        <p className="lead mx-auto mb-8 mt-0 max-w-[40ch] text-[17px] text-iseul-muted">
          Skincare coreano original, escolhido produto a produto. Estoque no Brasil, envio em 24h
          úteis.
        </p>
        <div className="acoes flex flex-wrap justify-center gap-2.5">
          <Link className="btn" href="#selecao">
            Ver a seleção
          </Link>
          <Link className="btn ghost" href="#rotina">
            Ver a rotina
          </Link>
        </div>
      </div>
    </div>
  );
}
