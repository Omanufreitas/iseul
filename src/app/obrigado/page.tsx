import Link from "next/link";
import { AnnounceBar, StoreFooter, StoreHeader } from "@/components/store/HeaderFooter";
import { getStoreSettings } from "@/lib/catalog";
import { syncOrderByReference } from "@/lib/orders/fulfill";
import { isSupabaseConfigured } from "@/lib/config";

type Props = { searchParams: Promise<{ order?: string }> };

export default async function ObrigadoPage({ searchParams }: Props) {
  const { order } = await searchParams;
  const settings = await getStoreSettings();

  if (order && isSupabaseConfigured()) {
    try {
      await syncOrderByReference(order);
    } catch {
      /* webhook may handle later */
    }
  }

  return (
    <>
      <AnnounceBar text={settings.announcement} />
      <StoreHeader settings={settings} />
      <div className="mx-auto max-w-lg px-6 py-24 text-center">
        <div className="mx-auto mb-6 grid h-16 w-16 place-items-center rounded-full bg-iseul-dew text-2xl text-iseul-accent">
          ✓
        </div>
        <h1 className="font-serif text-4xl">Pedido registrado</h1>
        <p className="mt-4 text-iseul-muted">
          Obrigada pela compra! Você receberá a confirmação e o código de rastreio no e-mail e
          WhatsApp informados.
        </p>
        {order && (
          <p className="mt-6 font-mono text-sm tracking-wider text-iseul-accent">
            #{order.slice(0, 8).toUpperCase()}
          </p>
        )}
        <Link
          href="/"
          className="mt-10 inline-flex rounded-full bg-iseul-ink px-8 py-3.5 text-sm font-medium text-iseul-paper"
        >
          Voltar para a loja
        </Link>
      </div>
      <StoreFooter settings={settings} />
    </>
  );
}
