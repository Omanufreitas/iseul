"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { quoteShipping } from "@/actions/shipping";
import { createCheckoutOrder } from "@/actions/checkout";
import { validateCartItems } from "@/actions/cart";
import { validateCouponCode } from "@/actions/admin/coupons";
import { useCart, cartItemKey } from "@/context/cart-context";
import { trackMetaInitiateCheckout } from "@/lib/analytics/meta";
import { storePurchaseData } from "@/lib/meta-pixel";
import { formatCurrency, maskCep, maskCpf, maskPhone } from "@/lib/utils";
import { cardUnitPrice, pixUnitPrice, type CheckoutPaymentMethod } from "@/lib/pricing";
import { couponDiscountAmount } from "@/lib/coupons";
import type { ShippingQuoteOption, ShippingQuoteResult } from "@/lib/shipping";
import type { StoreSettings } from "@/types";

const BR_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS", "MG",
  "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
];

async function fetchCep(cep: string) {
  const res = await fetch(`https://viacep.com.br/ws/${cep.replace(/\D/g, "")}/json/`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.erro) return null;
  return data as {
    logradouro: string;
    bairro: string;
    localidade: string;
    uf: string;
    ibge: string;
  };
}

function formatShippingLabel(option: ShippingQuoteOption): string {
  const days =
    option.deliveryDays > 0
      ? ` · ${option.deliveryDays} dia${option.deliveryDays === 1 ? "" : "s"} úteis`
      : "";
  return `${option.company} ${option.name}${days}`;
}

export function CheckoutForm({ settings }: { settings: StoreSettings }) {
  const { items, subtotal, clearCart, replaceItems } = useCart();
  const [pending, startTransition] = useTransition();
  const [shipping, setShipping] = useState<number | null>(null);
  const [shippingOptions, setShippingOptions] = useState<ShippingQuoteOption[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);
  const [shippingMeta, setShippingMeta] = useState<ShippingQuoteResult | null>(null);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepValid, setCepValid] = useState<boolean | null>(null);
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    name: string;
    discount: number;
    discount_percent: number;
  } | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [cartIssues, setCartIssues] = useState<string[]>([]);
  const [cartValidated, setCartValidated] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<CheckoutPaymentMethod>("pix");
  const lastLookupCep = useRef("");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    cpf: "",
    phone: "",
    zip: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "SP",
    city_ibge: 0,
    marketing_opt_in: true,
  });
  const lastValidatedCart = useRef("");
  const checkoutTracked = useRef(false);

  const cepDigits = form.zip.replace(/\D/g, "");
  const cartItems = useMemo(
    () =>
      items.map((i) => ({
        productId: i.productId,
        variantId: i.variantId ?? null,
        quantity: i.quantity,
      })),
    [items]
  );

  const cartSignature = useMemo(
    () => items.map((item) => `${cartItemKey(item)}:${item.quantity}`).join("|"),
    [items]
  );

  useEffect(() => {
    if (!items.length) {
      setCartValidated(true);
      return;
    }
    if (lastValidatedCart.current === cartSignature) return;

    let cancelled = false;
    setCartValidated(false);

    validateCartItems(
      items.map((item) => ({
        productId: item.productId,
        variantId: item.variantId ?? null,
        quantity: item.quantity,
      }))
    ).then((result) => {
      if (cancelled) return;

      const validKeys = new Set(
        result.valid.map((item) =>
          item.variantId ? `${item.productId}:${item.variantId}` : item.productId
        )
      );
      const nextItems = items.filter((item) => validKeys.has(cartItemKey(item)));

      if (result.syncedItems.length) {
        replaceItems(result.syncedItems);
      } else if (nextItems.length !== items.length) {
        replaceItems(nextItems);
        return;
      }

      setCartIssues(result.errors);
      lastValidatedCart.current = cartSignature;
      setCartValidated(true);

      if (result.errors.length) {
        toast.error(result.errors[0]);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [cartSignature, items, replaceItems]);

  useEffect(() => {
    if (checkoutTracked.current || items.length === 0) return;
    checkoutTracked.current = true;
    trackMetaInitiateCheckout({
      contentIds: items.map((item) => item.productId),
      value: subtotal,
      numItems: items.reduce((sum, item) => sum + item.quantity, 0),
    });
  }, [items, subtotal]);

  useEffect(() => {
    if (cepDigits.length !== 8) {
      setShipping(null);
      setShippingOptions([]);
      setSelectedShippingId(null);
      setShippingMeta(null);
      setCepValid(null);
      return;
    }

    let cancelled = false;
    setCepLoading(true);

    quoteShipping({ destinationCep: form.zip, items: cartItems })
      .then((result) => {
        if (cancelled) return;
        if ("error" in result && result.error) {
          setShipping(null);
          setShippingOptions([]);
          setSelectedShippingId(null);
          setShippingMeta(null);
          toast.error(result.error);
          return;
        }
        if ("quote" in result && result.quote) {
          setShippingMeta(result.quote);
          setShippingOptions(result.quote.options);
          setSelectedShippingId(result.quote.selectedOptionId);
          setShipping(result.quote.price);
        }
      })
      .finally(() => {
        if (!cancelled) setCepLoading(false);
      });

    if (lastLookupCep.current === cepDigits) return;
    lastLookupCep.current = cepDigits;

    fetchCep(form.zip)
      .then((data) => {
        if (cancelled) return;
        if (!data) {
          setCepValid(false);
          setForm((f) => ({ ...f, city_ibge: 0 }));
          toast.error("CEP não encontrado");
          return;
        }
        setCepValid(true);
        setForm((f) => ({
          ...f,
          street: data.logradouro || f.street,
          neighborhood: data.bairro || f.neighborhood,
          city: data.localidade,
          state: data.uf,
          city_ibge: Number.parseInt(data.ibge, 10) || 0,
        }));
      });

    return () => {
      cancelled = true;
    };
  }, [cepDigits, form.zip, cartItems]);

  function selectShippingOption(optionId: number) {
    const option = shippingOptions.find((o) => o.id === optionId);
    if (!option) return;
    setSelectedShippingId(option.id);
    setShipping(option.price);
    setShippingMeta((prev) =>
      prev
        ? {
            ...prev,
            price: option.price,
            selectedOptionId: option.id,
            freeShipping: option.price === 0,
            carrier: option.company,
            service: option.name,
            deliveryDays: option.deliveryDays,
          }
        : prev
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <h1 className="font-serif text-3xl">Sacola vazia</h1>
        {cartIssues.length > 0 && (
          <p className="mt-4 text-sm text-red-600">{cartIssues[0]}</p>
        )}
        <Link href="/#catalogo" className="mt-6 inline-block text-iseul-accent underline">
          Voltar ao catálogo
        </Link>
      </div>
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cartIssues.length > 0) {
      toast.error(cartIssues[0] ?? "Atualize a sacola antes de continuar.");
      return;
    }
    if (cepDigits.length !== 8) {
      toast.error("Informe um CEP válido");
      return;
    }
    if (!cepValid || !form.city_ibge) {
      toast.error("CEP não encontrado. Verifique o CEP informado.");
      return;
    }
    if (shipping == null || selectedShippingId == null) {
      toast.error("Aguarde o cálculo do frete");
      return;
    }

    startTransition(async () => {
      const result = await createCheckoutOrder({
        items: cartItems,
        address: form,
        shipping_option_id: selectedShippingId,
        shipping_price: shipping,
        coupon_code: appliedCoupon?.code,
        payment_method: paymentMethod,
      });

      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }

      if ("paymentUrl" in result && result.paymentUrl) {
        if ("orderId" in result && result.orderId) {
          storePurchaseData({
            orderId: result.orderId,
            value: total,
            num_items: items.reduce((sum, item) => sum + item.quantity, 0),
            content_ids: items.map((item) => item.productId),
          });
        }
        clearCart();
        window.location.href = result.paymentUrl;
      }
    });
  }

  const ship = shipping;
  const pixSubtotal = items.reduce(
    (sum, item) =>
      sum +
      pixUnitPrice(item.price, item.listPrice ?? item.price, settings.pix_discount_percent) *
        item.quantity,
    0
  );
  const cardSubtotal = items.reduce(
    (sum, item) =>
      sum +
      cardUnitPrice(item.price, item.listPrice ?? item.price) * item.quantity,
    0
  );
  const chargeSubtotal = paymentMethod === "pix" ? pixSubtotal : cardSubtotal;
  const discount = appliedCoupon
    ? couponDiscountAmount(chargeSubtotal, appliedCoupon.discount_percent)
    : 0;
  const pixTotal = Math.max(0, pixSubtotal - (appliedCoupon ? couponDiscountAmount(pixSubtotal, appliedCoupon.discount_percent) : 0) + (ship ?? 0));
  const cardTotal = Math.max(0, cardSubtotal - (appliedCoupon ? couponDiscountAmount(cardSubtotal, appliedCoupon.discount_percent) : 0) + (ship ?? 0));
  const total = paymentMethod === "pix" ? pixTotal : cardTotal;
  const canSubmit =
    !pending &&
    cartValidated &&
    cartIssues.length === 0 &&
    cepDigits.length === 8 &&
    cepValid === true &&
    form.city_ibge > 0 &&
    ship != null &&
    selectedShippingId != null &&
    !cepLoading;

  async function applyCoupon() {
    const code = couponInput.trim();
    if (!code) {
      toast.error("Informe o cupom");
      return;
    }
    setCouponLoading(true);
    try {
      const result = await validateCouponCode(code, subtotal, form.email.trim() || null);
      if ("error" in result && result.error) {
        toast.error(result.error);
        setAppliedCoupon(null);
        return;
      }
      if ("discount" in result && result.discount != null && result.code && result.name) {
        setAppliedCoupon({
          code: result.code,
          name: result.name,
          discount: result.discount,
          discount_percent: result.discount_percent ?? 0,
        });
        toast.success(`Cupom ${result.code} aplicado`);
      }
    } finally {
      setCouponLoading(false);
    }
  }

  function removeCoupon() {
    setAppliedCoupon(null);
    setCouponInput("");
  }

  return (
    <div className="mx-auto grid max-w-store gap-10 px-6 py-12 lg:grid-cols-[1.2fr_.8fr]">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div>
          <h1 className="font-serif text-3xl md:text-4xl">Checkout</h1>
          <p className="mt-2 text-sm text-iseul-muted">Pagamento seguro via Asaas (PIX ou cartão)</p>
        </div>

        {cartIssues.length > 0 && (
          <div className="rounded-iseul border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {cartIssues.map((issue) => (
              <p key={issue}>{issue}</p>
            ))}
          </div>
        )}

        <fieldset className="space-y-4 rounded-iseul border border-iseul-line bg-iseul-card p-6">
          <legend className="px-2 font-semibold">Identificação</legend>
          {(
            [
              ["full_name", "Nome completo", "text"],
              ["email", "E-mail", "email"],
            ] as const
          ).map(([key, label, type]) => (
            <label key={key} className="block text-sm">
              <span className="mb-1 block text-iseul-muted">{label}</span>
              <input
                required
                type={type}
                className="w-full rounded-lg border border-iseul-line bg-iseul-paper px-3 py-2.5"
                value={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
              />
            </label>
          ))}
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block text-iseul-muted">CPF</span>
              <input
                required
                className="w-full rounded-lg border border-iseul-line bg-iseul-paper px-3 py-2.5"
                value={form.cpf}
                onChange={(e) => setForm({ ...form, cpf: maskCpf(e.target.value) })}
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-iseul-muted">Telefone</span>
              <input
                required
                className="w-full rounded-lg border border-iseul-line bg-iseul-paper px-3 py-2.5"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: maskPhone(e.target.value) })}
              />
            </label>
          </div>
          <label className="flex items-start gap-3 rounded-lg border border-iseul-line/80 bg-iseul-paper px-3 py-3 text-sm">
            <input
              type="checkbox"
              checked={form.marketing_opt_in}
              onChange={(e) => setForm({ ...form, marketing_opt_in: e.target.checked })}
              className="mt-1"
            />
            <span>
              Quero receber ofertas e novidades por e-mail
              <span className="mt-0.5 block text-xs text-iseul-muted">
                Salvamos seu nome e e-mail para enviar promoções da Iseul.
              </span>
            </span>
          </label>
        </fieldset>

        <fieldset className="space-y-4 rounded-iseul border border-iseul-line bg-iseul-card p-6">
          <legend className="px-2 font-semibold">Entrega</legend>
          <label className="block text-sm">
            <span className="mb-1 block text-iseul-muted">CEP</span>
            <input
              required
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="00000-000"
              className="w-full rounded-lg border border-iseul-line bg-iseul-paper px-3 py-2.5"
              value={form.zip}
              onChange={(e) => {
                const next = maskCep(e.target.value);
                const nextDigits = next.replace(/\D/g, "");
                if (nextDigits.length !== 8) {
                  lastLookupCep.current = "";
                  setCepValid(null);
                  setForm((f) => ({ ...f, zip: next, city_ibge: 0 }));
                  return;
                }
                setForm((f) => ({ ...f, zip: next }));
              }}
            />
            {cepLoading && (
              <span className="mt-1 block text-xs text-iseul-muted">Calculando frete…</span>
            )}
            {cepDigits.length === 8 && cepValid === false && !cepLoading && (
              <span className="mt-1 block text-xs text-red-600">CEP não encontrado</span>
            )}
          </label>

          {shippingOptions.length > 0 && !cepLoading && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-iseul-ink">Forma de envio</p>
              <ul className="space-y-2">
                {shippingOptions.map((option) => {
                  const selected = option.id === selectedShippingId;
                  return (
                    <li key={option.id}>
                      <label
                        className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                          selected
                            ? "border-iseul-accent bg-iseul-paper"
                            : "border-iseul-line bg-white hover:border-iseul-accent/40"
                        }`}
                      >
                        <span className="flex min-w-0 items-start gap-3">
                          <input
                            type="radio"
                            name="shipping_option"
                            checked={selected}
                            onChange={() => selectShippingOption(option.id)}
                            className="mt-1"
                          />
                          <span className="min-w-0">
                            <span className="block font-medium">{formatShippingLabel(option)}</span>
                          </span>
                        </span>
                        <span className="shrink-0 font-medium">
                          {option.price === 0 ? "Grátis" : formatCurrency(option.price)}
                        </span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm sm:col-span-2">
              <span className="mb-1 block text-iseul-muted">Rua</span>
              <input required className="w-full rounded-lg border border-iseul-line bg-iseul-paper px-3 py-2.5" value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-iseul-muted">Número</span>
              <input required className="w-full rounded-lg border border-iseul-line bg-iseul-paper px-3 py-2.5" value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-iseul-muted">Complemento</span>
              <input className="w-full rounded-lg border border-iseul-line bg-iseul-paper px-3 py-2.5" value={form.complement} onChange={(e) => setForm({ ...form, complement: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-iseul-muted">Bairro</span>
              <input required className="w-full rounded-lg border border-iseul-line bg-iseul-paper px-3 py-2.5" value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-iseul-muted">Cidade</span>
              <input required className="w-full rounded-lg border border-iseul-line bg-iseul-paper px-3 py-2.5" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block text-iseul-muted">UF</span>
              <select required className="w-full rounded-lg border border-iseul-line bg-iseul-paper px-3 py-2.5" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })}>
                {BR_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </label>
          </div>
        </fieldset>

        <fieldset className="space-y-3 rounded-iseul border border-iseul-line bg-iseul-card p-6">
          <legend className="px-2 font-semibold">Forma de pagamento</legend>
          <ul className="space-y-2">
            {(
              [
                {
                  id: "pix" as const,
                  title: "Pix",
                  detail:
                    settings.pix_discount_percent > 0
                      ? `${settings.pix_discount_percent}% de desconto`
                      : "Pagamento à vista",
                  amount: pixTotal,
                },
                {
                  id: "credit_card" as const,
                  title: "Cartão de crédito",
                  detail: "Até 12x no cartão",
                  amount: cardTotal,
                },
              ] as const
            ).map((option) => {
              const selected = paymentMethod === option.id;
              return (
                <li key={option.id}>
                  <label
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                      selected
                        ? "border-iseul-accent bg-iseul-paper"
                        : "border-iseul-line bg-white hover:border-iseul-accent/40"
                    }`}
                  >
                    <span className="flex min-w-0 items-start gap-3">
                      <input
                        type="radio"
                        name="payment_method"
                        checked={selected}
                        onChange={() => setPaymentMethod(option.id)}
                        className="mt-1"
                      />
                      <span className="min-w-0">
                        <span className="block font-medium">{option.title}</span>
                        <span className="block text-xs text-iseul-muted">{option.detail}</span>
                      </span>
                    </span>
                    <span className="shrink-0 font-medium">
                      {ship == null ? "—" : formatCurrency(option.amount)}
                    </span>
                  </label>
                </li>
              );
            })}
          </ul>
        </fieldset>

        <fieldset className="space-y-3 rounded-iseul border border-iseul-line bg-iseul-card p-6">
          <legend className="px-2 font-semibold">Cupom de desconto</legend>
          <div className="flex gap-2">
            <input
              value={couponInput}
              onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
              placeholder="Código do cupom"
              disabled={!!appliedCoupon}
              className="min-w-0 flex-1 rounded-lg border border-iseul-line bg-iseul-paper px-3 py-2.5 text-sm uppercase"
            />
            {appliedCoupon ? (
              <button
                type="button"
                onClick={removeCoupon}
                className="shrink-0 rounded-lg border border-iseul-line px-4 py-2.5 text-sm"
              >
                Remover
              </button>
            ) : (
              <button
                type="button"
                onClick={() => void applyCoupon()}
                disabled={couponLoading}
                className="shrink-0 rounded-lg bg-iseul-ink px-4 py-2.5 text-sm text-iseul-paper disabled:opacity-60"
              >
                {couponLoading ? "..." : "Aplicar"}
              </button>
            )}
          </div>
          {appliedCoupon && (
            <p className="text-sm text-iseul-sage">
              {appliedCoupon.name} (−{formatCurrency(appliedCoupon.discount)})
            </p>
          )}
        </fieldset>

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-full bg-iseul-ink py-4 text-sm font-medium text-iseul-paper hover:bg-iseul-accent disabled:opacity-60"
        >
          {pending ? "Redirecionando..." : "Ir para pagamento"}
        </button>
      </form>

      <aside className="h-fit rounded-iseul border border-iseul-line bg-iseul-card p-6">
        <h2 className="font-semibold">Resumo</h2>
        <ul className="mt-4 space-y-3">
          {items.map((i) => (
            <li key={cartItemKey(i)} className="flex justify-between gap-3 text-sm">
              <span className="min-w-0 flex-1 truncate text-iseul-muted">
                {i.quantity}× {i.name}
              </span>
              <span className="shrink-0">{formatCurrency(i.price * i.quantity)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-2 border-t border-iseul-line pt-4 text-sm">
          <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
          <div className="flex justify-between text-iseul-muted">
            <span>Frete</span>
            <span>
              {ship == null
                ? "Informe o CEP"
                : ship === 0
                  ? "Grátis"
                  : formatCurrency(ship)}
            </span>
          </div>
          {shippingMeta?.carrier && shippingMeta.service && ship != null && (
            <p className="text-xs text-iseul-muted">
              {shippingMeta.carrier} {shippingMeta.service}
              {shippingMeta.deliveryDays ? ` · ${shippingMeta.deliveryDays} dias úteis` : ""}
            </p>
          )}
          {discount > 0 && (
            <div className="flex justify-between text-iseul-sage">
              <span>Cupom {appliedCoupon?.code}</span>
              <span>−{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="space-y-1 border-t border-iseul-line pt-4">
            <div className="flex justify-between text-sm text-iseul-muted">
              <span>Total no Pix</span>
              <span>{ship == null ? "—" : formatCurrency(pixTotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-iseul-muted">
              <span>Total no cartão</span>
              <span>{ship == null ? "—" : formatCurrency(cardTotal)}</span>
            </div>
            <div className="flex justify-between font-serif text-xl">
              <span>Total ({paymentMethod === "pix" ? "Pix" : "cartão"})</span>
              <span>{ship == null ? "—" : formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
