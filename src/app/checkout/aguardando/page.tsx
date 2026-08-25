import Link from "next/link";
import { AnnounceBar, StoreHeader } from "@/components/store/HeaderFooter";
import { LandingFooter } from "@/components/store/landing/LandingHeaderFooter";
import { getStoreSettings } from "@/lib/catalog";

export default async function AguardandoPage() {
  const settings = await getStoreSettings();

  return (
    <>
      <AnnounceBar text={settings.announcement} />
      <StoreHeader settings={settings} />
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <h1 className="font-serif text-3xl">Aguardando pagamento</h1>
        <p className="mt-4 text-iseul-muted">
          Assim que o pagamento for confirmado, você receberá um e-mail com os detalhes do pedido.
        </p>
        <Link href="/" className="mt-8 inline-block text-iseul-accent underline">
          Voltar para a loja
        </Link>
      </div>
      <LandingFooter />
    </>
  );
}
