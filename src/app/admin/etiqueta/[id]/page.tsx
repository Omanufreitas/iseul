import { notFound } from "next/navigation";
import { requireAdmin } from "@/actions/admin/auth";
import { PrintLabelButton } from "@/app/admin/etiqueta/print-button";
import { getOrderById } from "@/lib/admin-orders";
import { code128Bars } from "@/lib/total-express/barcode";
import { TOTAL_EXPRESS_LABEL_STATUS } from "@/lib/total-express/shipment";

type Props = { params: Promise<{ id: string }> };

function formatZip(zip: string): string {
  const digits = zip.replace(/\D/g, "");
  if (digits.length !== 8) return zip;
  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export default async function TotalExpressLabelPage({ params }: Props) {
  await requireAdmin();
  const { id } = await params;
  const data = await getOrderById(decodeURIComponent(id));
  if (!data) notFound();

  const { order } = data;
  const awb = order.tracking_code?.trim() ?? "";
  const ready = order.melhor_envio_status === TOTAL_EXPRESS_LABEL_STATUS && awb.length > 0;
  if (!ready) {
    return (
      <main className="mx-auto max-w-md p-8 text-sm text-neutral-700">
        Este pedido ainda não tem envio registrado na Total Express.
      </main>
    );
  }

  const address = order.shipping_address ?? {};
  const barcode = code128Bars(awb);
  const rota = order.melhor_envio_cart_id?.trim() || "";

  return (
    <main className="min-h-screen bg-neutral-100 p-6 print:bg-white print:p-0">
      <style>{`
        @media print {
          @page { size: 100mm 150mm; margin: 4mm; }
          body * { visibility: hidden; }
          .te-label, .te-label * { visibility: visible; }
          .te-label { position: absolute; inset: 0; }
        }
      `}</style>
      <div className="mx-auto mb-4 flex max-w-[100mm] justify-end">
        <PrintLabelButton />
      </div>
      <article className="te-label mx-auto flex h-[150mm] w-[100mm] flex-col border border-black bg-white p-3 text-black">
        <div className="flex items-start justify-between gap-2 border-b border-black pb-2">
          <div>
            <p className="text-[10px] uppercase tracking-wide">Total Express</p>
            <p className="text-lg font-semibold leading-none">EXP</p>
          </div>
          <div className="text-right text-[10px]">
            <p>Pedido {order.order_number}</p>
            {order.nfe_number ? <p>NF-e {order.nfe_number}</p> : null}
          </div>
        </div>

        <div className="mt-2">
          <p className="text-[10px] uppercase">Destinatário</p>
          <p className="text-sm font-semibold leading-tight">
            {address.full_name || order.customer_name}
          </p>
          <p className="text-xs leading-snug">
            {address.street}
            {address.number ? `, ${address.number}` : ""}
            {address.complement ? ` — ${address.complement}` : ""}
          </p>
          <p className="text-xs leading-snug">
            {address.neighborhood} · {address.city}/{address.state}
          </p>
          <p className="text-sm font-semibold">{formatZip(address.zip ?? "")}</p>
        </div>

        <div className="mt-auto pt-3">
          {rota ? <p className="mb-1 text-center text-xs font-medium">{rota}</p> : null}
          <svg
            viewBox={`0 0 ${barcode.width} 70`}
            className="h-[22mm] w-full"
            role="img"
            aria-label={awb}
          >
            <rect width={barcode.width} height="70" fill="white" />
            {barcode.bars.map((bar) => (
              <rect key={`${bar.x}-${bar.width}`} x={bar.x} y="0" width={bar.width} height="70" fill="black" />
            ))}
          </svg>
          <p className="mt-1 text-center font-mono text-sm font-semibold tracking-wide">{awb}</p>
        </div>
      </article>
    </main>
  );
}
