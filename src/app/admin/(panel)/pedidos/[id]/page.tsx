import Link from "next/link";
import { notFound } from "next/navigation";
import { MelhorEnvioOrderPanel } from "@/components/admin/MelhorEnvioOrderPanel";
import { OrderFulfillmentForm } from "@/components/admin/OrderFulfillmentForm";
import { BlingOrderPanel } from "@/components/admin/BlingOrderPanel";
import { getOrderById } from "@/lib/admin-orders";
import { formatCurrency } from "@/lib/utils";
import type { OrderStatus } from "@/types";

type Props = { params: Promise<{ id: string }> };

const STATUS_LABELS: Record<OrderStatus, string> = {
  aguardando_pagamento: "Aguardando pagamento",
  pago: "Pago",
  separando: "Separando",
  enviado: "Enviado",
  entregue: "Entregue",
  cancelado: "Cancelado",
};

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
      <div>
        <Link href="/admin/pedidos" className="text-sm text-neutral-500 hover:text-neutral-900">
          Voltar aos pedidos
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Pedido #{order.order_number}</h1>
        <p className="text-sm text-neutral-500">
          {new Date(order.ordered_at).toLocaleString("pt-BR")}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold">Cliente</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Nome</dt>
                <dd className="font-medium">{order.customer_name}</dd>
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
          </div>

          {address && (
            <div className="rounded-xl border bg-white p-5">
              <h2 className="font-semibold">Endereço de entrega</h2>
              <p className="mt-3 text-sm leading-relaxed text-neutral-600">
                {address.street}, {address.number}
                {address.complement ? ` — ${address.complement}` : ""}
                <br />
                {address.neighborhood} · {address.city}/{address.state}
                <br />
                CEP {address.zip}
              </p>
              {shippingLabel && (
                <p className="mt-3 text-sm font-medium text-neutral-900">
                  Frete: {shippingLabel}
                  {address.shipping_delivery_days
                    ? ` · ${address.shipping_delivery_days} dias úteis`
                    : ""}
                </p>
              )}
              {order.tracking_code && (
                <p className="mt-2 text-sm text-neutral-600">
                  Rastreio: <span className="font-mono">{order.tracking_code}</span>
                </p>
              )}
            </div>
          )}

          <OrderFulfillmentForm
            orderId={order.id}
            currentStatus={order.status}
            trackingCode={order.tracking_code}
            notes={order.notes}
          />

          <MelhorEnvioOrderPanel
            orderId={order.id}
            status={order.status}
            hasShippingAddress={!!address}
            melhorEnvioStatus={order.melhor_envio_status}
            melhorEnvioError={order.melhor_envio_error}
            melhorEnvioLabelUrl={order.melhor_envio_label_url}
          />
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold">Itens</h2>
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
              <div className="flex justify-between font-semibold">
                <dt>Total</dt>
                <dd>{formatCurrency(order.total)}</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold">Pagamento</h2>
            <dl className="mt-3 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Status</dt>
                <dd className="capitalize">{order.payment_status}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Método</dt>
                <dd>{order.payment_method}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-neutral-500">Status atual</dt>
                <dd>{STATUS_LABELS[order.status]}</dd>
              </div>
              {order.asaas_payment_id && (
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">ID Asaas</dt>
                  <dd className="break-all text-right font-mono text-xs">{order.asaas_payment_id}</dd>
                </div>
              )}
              {order.mercadopago_payment_id && (
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">ID Mercado Pago (legado)</dt>
                  <dd className="break-all text-right font-mono text-xs">{order.mercadopago_payment_id}</dd>
                </div>
              )}
              {order.paid_at && (
                <div className="flex justify-between gap-4">
                  <dt className="text-neutral-500">Pago em</dt>
                  <dd>{new Date(order.paid_at).toLocaleString("pt-BR")}</dd>
                </div>
              )}
            </dl>
          </div>

          <BlingOrderPanel
            orderId={order.id}
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
