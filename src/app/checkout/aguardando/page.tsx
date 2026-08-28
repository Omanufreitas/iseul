import Link from "next/link";
import { AnnounceBar, StoreHeader } from "@/components/store/HeaderFooter";
import { LandingFooter } from "@/components/store/landing/LandingHeaderFooter";
import { getStoreSettings } from "@/lib/catalog";
import { buildAnnounceBarText } from "@/lib/store-announcement";
import { syncOrderByReference } from "@/lib/orders/fulfill";
import { isSupabaseConfigured } from "@/lib/config";

type Props = { searchParams: Promise<{ order?: string }> };

export default async function AguardandoPage({ searchParams }: Props) {
  const { order } = await searchParams;
  const settings = await getStoreSettings();

  if (order && isSupabaseConfigured()) {
    try {
      await syncOrderByReference(order);
    } catch {
      /* webhook pode confirmar depois */
    }
  }

  return (
    <>
      <AnnounceBar text={buildAnnounceBarText(settings)} />
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
