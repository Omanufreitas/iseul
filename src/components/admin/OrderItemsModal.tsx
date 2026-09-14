"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { Package, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export type OrderItemsModalItem = {
  product_name: string;
  product_brand?: string | null;
  variant_label?: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
};

type Props = {
  open: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: number;
  customerName: string;
  items: OrderItemsModalItem[];
  subtotal?: number;
  shipping?: number;
  discount?: number;
  total?: number;
};

export function OrderItemsModal({
  open,
  onClose,
  orderId,
  orderNumber,
  customerName,
  items,
  subtotal,
  shipping,
  discount,
  total,
}: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open || !mounted) return null;

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-end justify-center p-4 pt-20 sm:items-center sm:p-6 sm:pt-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="order-items-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[rgba(24,22,18,0.45)] backdrop-blur-[2px]"
        onClick={onClose}
        aria-label="Fechar"
      />

      <div className="relative flex max-h-[min(calc(100dvh-5.5rem),640px)] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-iseul-line/80 bg-white shadow-[0_24px_80px_-24px_rgba(45,42,38,0.35)]">
        <div className="border-b bg-gradient-to-r from-iseul-dew/70 via-white to-white px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-iseul-accent/10 text-iseul-accent">
                  <Package className="h-4 w-4" />
                </span>
                <div className="min-w-0">
                  <h2 id="order-items-modal-title" className="font-semibold text-iseul-ink">
                    Produtos do pedido
                  </h2>
                  <p className="mt-0.5 truncate text-sm text-iseul-muted">
                    #{orderNumber} · {customerName}
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-iseul-line/80 text-neutral-500 transition hover:bg-neutral-50 hover:text-iseul-ink"
              aria-label="Fechar modal"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-xs text-iseul-muted">
            {items.length} produto{items.length === 1 ? "" : "s"} · {itemCount} unidade
            {itemCount === 1 ? "" : "s"}
          </p>
        </div>

        <ul className="flex-1 divide-y overflow-y-auto">
          {items.length === 0 ? (
            <li className="px-5 py-10 text-center text-sm text-iseul-muted">
              Nenhum item neste pedido.
            </li>
          ) : (
            items.map((item, index) => (
              <li key={`${item.product_name}-${index}`} className="px-5 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <p className="font-medium leading-snug text-iseul-ink">{item.product_name}</p>
                    {(item.variant_label || item.product_brand) && (
                      <p className="mt-1 text-xs text-iseul-muted">
                        {[item.product_brand, item.variant_label].filter(Boolean).join(" · ")}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-neutral-500">
                      {item.quantity}× {formatCurrency(item.unit_price)}
                    </p>
                  </div>
                  <div className="shrink-0 text-right font-medium text-iseul-ink">
                    {formatCurrency(item.line_total)}
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>

        {(subtotal != null || total != null) && (
          <div className="border-t bg-iseul-paper/40 px-5 py-4">
            <dl className="space-y-1.5 text-sm">
              {subtotal != null && (
                <div className="flex justify-between gap-4 text-neutral-600">
                  <dt>Subtotal</dt>
                  <dd>{formatCurrency(subtotal)}</dd>
                </div>
              )}
              {shipping != null && (
                <div className="flex justify-between gap-4 text-neutral-600">
                  <dt>Frete</dt>
                  <dd>{shipping === 0 ? "Grátis" : formatCurrency(shipping)}</dd>
                </div>
              )}
              {discount != null && discount > 0 && (
                <div className="flex justify-between gap-4 text-neutral-600">
                  <dt>Desconto</dt>
                  <dd>-{formatCurrency(discount)}</dd>
                </div>
              )}
              {total != null && (
                <div className="flex justify-between gap-4 border-t border-iseul-line/60 pt-2 font-semibold text-iseul-ink">
                  <dt>Total</dt>
                  <dd>{formatCurrency(total)}</dd>
                </div>
              )}
            </dl>
          </div>
        )}

        <div className="border-t px-5 py-4">
          <Link
            href={`/admin/pedidos/${encodeURIComponent(orderId)}`}
            className="block w-full rounded-xl bg-iseul-ink py-2.5 text-center text-sm font-medium text-white transition hover:bg-iseul-accent"
            onClick={onClose}
          >
            Abrir pedido completo
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}
