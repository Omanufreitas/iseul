import Link from "next/link";
import { AnnounceBar, StoreHeader } from "@/components/store/HeaderFooter";
import { LandingFooter } from "@/components/store/landing/LandingHeaderFooter";
import { getStoreSettings } from "@/lib/catalog";
import { buildAnnounceBarText } from "@/lib/store-announcement";

export default async function NotFound() {
  const settings = await getStoreSettings();

  return (
    <>
      <AnnounceBar text={buildAnnounceBarText(settings)} />
      <StoreHeader settings={settings} />
      <main className="mx-auto flex min-h-[55vh] max-w-lg flex-col items-center justify-center px-6 py-20 text-center">
        <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-iseul-muted">
          404
        </p>
        <h1 className="mt-3 font-serif text-4xl text-iseul-ink">Página não encontrada</h1>
        <p className="mt-4 text-[15px] leading-relaxed text-iseul-muted">
          Esse endereço não existe ou o produto saiu do catálogo. Volte para a loja e continue
          explorando nossos produtos.
        </p>
        <Link
          href="/produtos"
          className="mt-8 rounded-full bg-iseul-ink px-8 py-3.5 text-sm font-medium text-iseul-paper transition-colors hover:bg-iseul-accent"
        >
          Ir para o catálogo
        </Link>
      </main>
      <LandingFooter />
    </>
  );
}
