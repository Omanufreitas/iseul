"use client";

import Link from "next/link";
import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useCart } from "@/context/cart-context";
import { formatCurrency } from "@/lib/utils";
import { backdropFade, slideFromRight, stagger, fadeUp } from "@/lib/motion";
import type { StoreSettings } from "@/types";

export function CartDrawer({ settings }: { settings: StoreSettings }) {
  const { items, isOpen, closeCart, setQuantity, removeItem, subtotal } = useCart();
  const reduce = useReducedMotion();
  const threshold = settings.free_shipping_threshold;
  const falta = threshold - subtotal;
  const progress = Math.min(100, (subtotal / threshold) * 100);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <m.button
            type="button"
            aria-label="Fechar sacola"
            className="fixed inset-0 z-[90] bg-[rgba(24,22,18,.42)] backdrop-blur-[2px]"
            onClick={closeCart}
            variants={backdropFade}
            initial="hidden"
            animate="show"
            exit="exit"
          />
          <m.aside
            className="fixed right-0 top-0 z-[100] flex h-full w-full max-w-[430px] flex-col bg-iseul-paper shadow-[-10px_0_40px_rgba(0,0,0,.1)]"
            variants={reduce ? fadeUp : slideFromRight}
            initial="hidden"
            animate="show"
            exit="exit"
          >
            <div className="flex items-center justify-between border-b border-iseul-line px-5 py-5">
              <h3 className="font-serif text-[22px]">Sua sacola</h3>
              <button
                type="button"
                onClick={closeCart}
                className="grid h-8 w-8 place-items-center rounded-full text-iseul-muted transition-colors hover:bg-iseul-paper2"
              >
                ✕
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5">
              {items.length === 0 ? (
                <m.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-12 text-center text-iseul-muted"
                >
                  <div className="mb-3 text-3xl opacity-35">◌</div>
                  Sua sacola está vazia.
                  <div className="mt-5">
                    <Link
                      href="/#catalogo"
                      onClick={closeCart}
                      className="inline-block rounded-full border border-iseul-line bg-iseul-card px-4 py-2 text-[13px]"
                    >
                      Ver catálogo
                    </Link>
                  </div>
                </m.div>
              ) : (
                <m.div variants={stagger(0.06)} initial="hidden" animate="show">
                  {items.map((item) => (
                    <m.div
                      key={item.productId}
                      layout
                      variants={fadeUp}
                      className="flex gap-3.5 border-b border-iseul-line py-3.5"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.image_url}
                        alt=""
                        className="h-[66px] w-[66px] rounded-lg bg-iseul-paper2 object-cover"
                        onError={(e) => {
                          if (item.image_fallback_url) {
                            (e.target as HTMLImageElement).src = item.image_fallback_url;
                          }
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-[10px] font-semibold uppercase tracking-widest text-iseul-accent2">
                          {item.brand}
                        </div>
                        <div className="text-[13.5px] leading-snug">{item.name}</div>
                        <div className="mt-2 flex items-center gap-2">
                          <span className="inline-flex items-center rounded-full border border-iseul-line text-sm">
                            <button
                              type="button"
                              className="px-2.5 py-1 transition-colors hover:bg-iseul-paper2"
                              onClick={() => setQuantity(item.productId, item.quantity - 1)}
                            >
                              −
                            </button>
                            <span className="min-w-[20px] text-center">{item.quantity}</span>
                            <button
                              type="button"
                              className="px-2.5 py-1 transition-colors hover:bg-iseul-paper2"
                              onClick={() => setQuantity(item.productId, item.quantity + 1)}
                            >
                              +
                            </button>
                          </span>
                          <button
                            type="button"
                            className="text-xs text-iseul-muted underline"
                            onClick={() => removeItem(item.productId)}
                          >
                            remover
                          </button>
                        </div>
                      </div>
                      <div className="font-serif text-base">
                        {formatCurrency(item.price * item.quantity)}
                      </div>
                    </m.div>
                  ))}
                </m.div>
              )}
            </div>

            {items.length > 0 && (
              <m.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-t border-iseul-line bg-iseul-card px-5 py-5"
              >
                {falta > 0 ? (
                  <div className="mb-3">
                    <p className="text-sm text-iseul-muted">
                      Faltam <b className="text-iseul-ink">{formatCurrency(falta)}</b> para frete
                      grátis.
                    </p>
                    <div className="mt-2 h-1 overflow-hidden rounded-full bg-iseul-line">
                      <m.div
                        className="h-full rounded-full bg-iseul-accent"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                  </div>
                ) : (
                  <p className="mb-3 text-sm font-medium text-iseul-accent">Frete grátis liberado ✓</p>
                )}
                <div className="mb-1 flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                <div className="mb-4 flex justify-between text-sm text-iseul-muted">
                  <span>Frete</span>
                  <span>Calculado no checkout</span>
                </div>
                <Link
                  href="/checkout"
                  onClick={closeCart}
                  className="block w-full rounded-full bg-iseul-ink py-3.5 text-center text-sm font-medium text-iseul-paper transition-colors duration-300 hover:bg-iseul-accent"
                >
                  Finalizar compra
                </Link>
              </m.div>
            )}
          </m.aside>
        </>
      )}
    </AnimatePresence>
  );
}
