import { notFound } from "next/navigation";
import { OrderActionsPanel } from "@/components/admin/OrderActionsPanel";
import { OrderDetailHeader } from "@/components/admin/OrderDetailHeader";
import { OrderIntegrationsPanel } from "@/components/admin/OrderIntegrationsPanel";
import { getOrderById } from "@/lib/admin-orders";
import { formatCurrency } from "@/lib/utils";

type Props = { params: Promise<{ id: string }> };

function shippingMethodLabel(order: {
  shipping_method: string | null;
  shipping_address: Record<string, string> | null;
}): string | null {
  if (order.shipping_method?.trim()) return order.shipping_method;
  const addr = order.shipping_address;
  if (!addr) return null;
  const fromParts = [addr.shipping_carrier, addr.shipping_service].filter(Boolean).join(" ");
  return fromParts || null;
}

export default async function AdminOrderDetailPage({ params }: Props) {
  const { id } = await params;
  const data = await getOrderById(decodeURIComponent(id));
  if (!data) notFound();

  const { order, items } = data;
  const address = order.shipping_address;
  const shippingLabel = shippingMethodLabel(order);

  return (
    <div className="space-y-6">
      <OrderDetailHeader
        orderNumber={order.order_number}
        orderedAt={order.ordered_at}
        total={order.total}
        status={order.status}
        paymentStatus={order.payment_status}
        paymentMethod={order.payment_method}
        nfeNumber={order.nfe_number}
        blingSyncStatus={order.bling_sync_status}
        blingSyncError={order.bling_sync_error}
        melhorEnvioStatus={order.melhor_envio_status}
        melhorEnvioLabelUrl={order.melhor_envio_label_url}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold text-iseul-ink">Itens</h2>
            <ul className="mt-3 divide-y text-sm">
              {items.map((item) => (
                <li key={item.id} className="flex justify-between gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{item.product_name}</div>
                    {item.product_brand && (
                      <div className="text-xs text-neutral-500">{item.product_brand}</div>
                    )}
                    <div className="text-xs text-neutral-500">
                      {item.quantity}× {formatCurrency(item.unit_price)}
                    </div>
                  </div>
                  <div className="shrink-0 font-medium">{formatCurrency(item.line_total)}</div>
                </li>
              ))}
            </ul>
            <dl className="mt-4 space-y-2 border-t pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-neutral-500">Subtotal</dt>
                <dd>{formatCurrency(order.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-neutral-500">Frete</dt>
                <dd>{order.shipping === 0 ? "Grátis" : formatCurrency(order.shipping)}</dd>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-neutral-500">Desconto</dt>
                  <dd>-{formatCurrency(order.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between font-semibold text-iseul-ink">
                <dt>Total</dt>
                <dd>{formatCurrency(order.total)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold text-iseul-ink">Cliente e entrega</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Nome</dt>
                <dd className="text-right font-medium">{order.customer_name}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">E-mail</dt>
                <dd className="break-all text-right">{order.customer_email}</dd>
              </div>
              {order.customer_phone && (
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">Telefone</dt>
                  <dd>{order.customer_phone}</dd>
                </div>
              )}
              {order.customer_cpf && (
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">CPF</dt>
                  <dd>{order.customer_cpf}</dd>
                </div>
              )}
            </dl>

            {address && (
              <div className="mt-4 border-t pt-4">
                <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">
                  Endereço de entrega
                </p>
                <p className="mt-2 text-sm leading-relaxed text-neutral-600">
                  {address.street}, {address.number}
                  {address.complement ? ` — ${address.complement}` : ""}
                  <br />
                  {address.neighborhood} · {address.city}/{address.state}
                  <br />
                  CEP {address.zip}
                </p>
                {shippingLabel && (
                  <p className="mt-3 text-sm font-medium text-iseul-ink">
                    Frete: {shippingLabel}
                    {address.shipping_delivery_days
                      ? ` · ${address.shipping_delivery_days} dias úteis`
                      : ""}
                  </p>
                )}
                {order.tracking_code && (
                  <p className="mt-2 text-sm text-neutral-600">
                    Rastreio:{" "}
                    <span className="font-mono font-medium text-iseul-ink">
                      {order.tracking_code}
                    </span>
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <OrderActionsPanel
            orderId={order.id}
            currentStatus={order.status}
            trackingCode={order.tracking_code}
            notes={order.notes}
            hasShippingAddress={!!address}
            melhorEnvioStatus={order.melhor_envio_status}
            melhorEnvioError={order.melhor_envio_error}
            melhorEnvioLabelUrl={order.melhor_envio_label_url}
          />

          <OrderIntegrationsPanel
            orderId={order.id}
            paymentStatus={order.payment_status}
            paymentMethod={order.payment_method}
            asaasCheckoutId={order.asaas_checkout_id}
            asaasPaymentId={order.asaas_payment_id}
            paidAt={order.paid_at}
            blingOrderId={order.bling_order_id}
            blingSyncStatus={order.bling_sync_status}
            blingSyncError={order.bling_sync_error}
            nfeNumber={order.nfe_number}
            nfeUrl={order.nfe_url}
          />
        </div>
      </div>
    </div>
  );
}
