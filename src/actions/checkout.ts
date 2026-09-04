"use server";

import { headers } from "next/headers";
import { createCheckoutSchema } from "@/lib/validations";
import { createAdminClient } from "@/lib/supabase/client";
import { createStoreAsaasCheckout } from "@/lib/asaas";
import { normalizeStoreOrigin } from "@/lib/store-url";
import { getProductById, getStoreSettings, getVariantById } from "@/lib/catalog";
import { validateCouponCode } from "@/actions/admin/coupons";
import { isMockCatalogEnabled, isSupabaseConfigured } from "@/lib/config";
import { RESERVATION_MINUTES } from "@/lib/constants";
import { releaseExpiredReservations } from "@/lib/orders/fulfill";
import { getAvailableStock } from "@/lib/inventory";
import { quoteShippingForCheckout, shippingPricesMatch } from "@/lib/shipping";
import { subscribeWaitlist } from "@/lib/waitlist";
import { couponDiscountAmount } from "@/lib/coupons";
import {
  asaasBillingTypes,
  cardUnitPrice,
  pixUnitPrice,
} from "@/lib/pricing";

async function getCheckoutRequestOrigin(): Promise<string | undefined> {
  const h = await headers();
  const host =
    h.get("x-forwarded-host")?.split(",")[0]?.trim() ??
    h.get("host")?.trim();
  if (!host || host.startsWith("localhost") || host.startsWith("127.0.0.1")) {
    return undefined;
  }
  const proto = h.get("x-forwarded-proto")?.split(",")[0]?.trim() ?? "https";
  return normalizeStoreOrigin(`${proto}://${host}`) ?? undefined;
}

export async function createCheckoutOrder(raw: unknown) {
  if (isMockCatalogEnabled() || !isSupabaseConfigured()) {
    return {
      error:
        "Checkout indisponível. Configure Supabase e Asaas.",
    };
  }

  const parsed = createCheckoutSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  await releaseExpiredReservations();
  const admin = createAdminClient();
  const settings = await getStoreSettings();
  const pixDiscountPercent = settings.pix_discount_percent;
  const { items, address, shipping_price, shipping_option_id, payment_method } = parsed.data;

  type PreparedItem = {
    product_id: string;
    variant_id: string | null;
    variant_label: string | null;
    product_name: string;
    product_brand: string;
    quantity: number;
    pix_unit_price: number;
    card_unit_price: number;
    charge_unit_price: number;
    line_total: number;
  };

  const prepared: PreparedItem[] = [];

  for (const item of items) {
    const product = await getProductById(item.productId);
    if (!product || !product.active) {
      return { error: "Produto não encontrado ou indisponível." };
    }

    const variants = product.variants ?? [];
    let salePrice = product.price;
    let compareAtPrice = product.compare_at_price;
    let variantId: string | null = null;
    let variantLabel: string | null = null;
    let productName = product.name;

    if (variants.length > 0) {
      if (!item.variantId) {
        return { error: `Selecione uma variação: ${product.name}` };
      }
      const variant =
        variants.find((v) => v.id === item.variantId) ??
        (await getVariantById(item.variantId));
      if (!variant || !variant.active || variant.product_id !== product.id) {
        return { error: `Variação indisponível: ${product.name}` };
      }
      salePrice = variant.price;
      compareAtPrice = variant.compare_at_price ?? product.compare_at_price;
      variantId = variant.id;
      variantLabel = variant.label;
      productName = `${product.name} — ${variant.label}`;
    }

    const availableStock = await getAvailableStock(product.id, variantId);
    if (availableStock < item.quantity) {
      return {
        error:
          availableStock <= 0
            ? `${productName} está esgotado. Atualize a sacola e tente novamente.`
            : `Estoque insuficiente para ${productName}: restam ${availableStock} unidade(s).`,
      };
    }

    const pixPrice = pixUnitPrice(salePrice, compareAtPrice, pixDiscountPercent);
    const cardPrice = cardUnitPrice(salePrice, compareAtPrice);
    const chargeUnitPrice =
      payment_method === "pix" ? pixPrice : cardPrice;

    prepared.push({
      product_id: product.id.startsWith("seed-") ? product.id : product.id,
      variant_id: variantId,
      variant_label: variantLabel,
      product_name: productName,
      product_brand: product.brand,
      quantity: item.quantity,
      pix_unit_price: pixPrice,
      card_unit_price: cardPrice,
      charge_unit_price: chargeUnitPrice,
      line_total: chargeUnitPrice * item.quantity,
    });
  }

  const pixSubtotal = prepared.reduce((s, r) => s + r.pix_unit_price * r.quantity, 0);
  const cardSubtotal = prepared.reduce((s, r) => s + r.card_unit_price * r.quantity, 0);
  const chargeSubtotal =
    payment_method === "pix" ? pixSubtotal : cardSubtotal;

  let discount = 0;
  let couponCode: string | null = null;
  let couponPercent: number | null = null;
  if (parsed.data.coupon_code?.trim()) {
    const couponResult = await validateCouponCode(
      parsed.data.coupon_code,
      pixSubtotal,
      address.email
    );
    if ("error" in couponResult && couponResult.error) {
      return { error: couponResult.error };
    }
    if ("discount" in couponResult && couponResult.discount != null) {
      couponCode = couponResult.code ?? null;
      couponPercent = couponResult.discount_percent ?? null;
      if (couponPercent != null) {
        discount = couponDiscountAmount(chargeSubtotal, couponPercent);
      } else {
        discount = couponResult.discount;
      }
    }
  }

  const shippingQuote = await quoteShippingForCheckout(address.zip, items, shipping_option_id);
  if ("error" in shippingQuote) {
    return { error: shippingQuote.error };
  }
  if (shippingQuote.selectedOptionId !== shipping_option_id) {
    return { error: "Opção de frete inválida. Atualize o CEP e tente novamente." };
  }
  if (!shippingPricesMatch(shippingQuote.price, shipping_price)) {
    return { error: "Valor de frete desatualizado. Atualize o CEP e tente novamente." };
  }

  const selectedShipping = shippingQuote.options.find((o) => o.id === shipping_option_id);
  const shippingMethod =
    [selectedShipping?.company, selectedShipping?.name].filter(Boolean).join(" ") || null;

  const total = Math.max(0, chargeSubtotal - discount + shippingQuote.price);
  const cpf = address.cpf.replace(/\D/g, "");

  const customerPatch = {
    full_name: address.full_name,
    cpf,
    phone: address.phone.replace(/\D/g, ""),
    address_street: address.street,
    address_number: address.number,
    address_complement: address.complement ?? null,
    address_neighborhood: address.neighborhood,
    address_city: address.city,
    address_state: address.state.toUpperCase(),
    address_zip: address.zip.replace(/\D/g, ""),
    marketing_opt_in: Boolean(address.marketing_opt_in),
    marketing_opt_in_at: address.marketing_opt_in ? new Date().toISOString() : null,
  };

  let customerId: string | null = null;
  const { data: existingCustomer } = await admin
    .from("customers")
    .select("id")
    .ilike("email", address.email.trim())
    .maybeSingle();

  if (existingCustomer?.id) {
    customerId = existingCustomer.id;
    await admin.from("customers").update(customerPatch).eq("id", customerId);
  } else {
    const { data: created, error: custErr } = await admin
      .from("customers")
      .insert({
        email: address.email.trim().toLowerCase(),
        ...customerPatch,
      })
      .select("id")
      .single();

    if (custErr?.code === "23505") {
      const { data: raceWinner } = await admin
        .from("customers")
        .select("id")
        .ilike("email", address.email.trim())
        .maybeSingle();
      if (!raceWinner?.id) return { error: "Erro ao salvar cliente." };
      customerId = raceWinner.id;
      await admin.from("customers").update(customerPatch).eq("id", customerId);
    } else if (custErr || !created) {
      return { error: custErr?.message ?? "Erro ao salvar cliente" };
    } else {
      customerId = created.id;
    }
  }

  if (address.marketing_opt_in) {
    try {
      await subscribeWaitlist(address.email.trim().toLowerCase(), "checkout");
    } catch {
      /* não bloqueia checkout */
    }
  }

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      customer_id: customerId,
      status: "aguardando_pagamento",
      payment_status: "pendente",
      payment_method: payment_method === "pix" ? "asaas_pix" : "asaas_cartao",
      subtotal: chargeSubtotal,
      shipping: shippingQuote.price,
      discount,
      total,
      coupon_code: couponCode,
      shipping_method: shippingMethod,
      shipping_service_id: String(shipping_option_id),
      shipping_address: {
        ...address,
        zip: address.zip.replace(/\D/g, ""),
        shipping_option_id: shipping_option_id,
        shipping_carrier: selectedShipping?.company ?? shippingQuote.carrier ?? null,
        shipping_service: selectedShipping?.name ?? shippingQuote.service ?? null,
        shipping_delivery_days: selectedShipping?.deliveryDays ?? shippingQuote.deliveryDays ?? null,
      },
      customer_email: address.email.trim().toLowerCase(),
      customer_name: address.full_name,
      customer_phone: address.phone.replace(/\D/g, ""),
      customer_cpf: cpf,
    })
    .select("id, order_number")
    .single();

  if (orderErr || !order) {
    return { error: orderErr?.message ?? "Erro ao criar pedido" };
  }

  for (const row of prepared) {
    if (row.product_id.startsWith("seed-")) continue;
    const { error: itemErr } = await admin.from("order_items").insert({
      order_id: order.id,
      product_id: row.product_id,
      variant_id: row.variant_id,
      variant_label: row.variant_label,
      product_name: row.product_name,
      product_brand: row.product_brand,
      quantity: row.quantity,
      unit_price: row.charge_unit_price,
      line_total: row.charge_unit_price * row.quantity,
    });
    if (itemErr) {
      await admin.from("orders").delete().eq("id", order.id);
      return { error: itemErr.message };
    }
  }

  const expiresAt = new Date(Date.now() + RESERVATION_MINUTES * 60 * 1000).toISOString();
  for (const row of prepared) {
    if (row.product_id.startsWith("seed-")) continue;
    await admin.from("stock_reservations").insert({
      product_id: row.product_id,
      variant_id: row.variant_id,
      order_id: order.id,
      quantity: row.quantity,
      expires_at: expiresAt,
    });
  }

  const asaasItems = prepared.map((oi) => {
    let unitPrice = oi.charge_unit_price;
    if (discount > 0 && chargeSubtotal > 0) {
      const ratio = discount / chargeSubtotal;
      unitPrice = Math.round(oi.charge_unit_price * (1 - ratio) * 100) / 100;
    }
    return {
      title: oi.product_name,
      quantity: oi.quantity,
      unit_price: unitPrice,
    };
  });

  const requestOrigin = await getCheckoutRequestOrigin();
  const checkout = await createStoreAsaasCheckout(
    order.id,
    {
      email: address.email,
      full_name: address.full_name,
      cpf: address.cpf,
      phone: address.phone,
      zip: address.zip,
      street: address.street,
      number: address.number,
      complement: address.complement,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      city_ibge: address.city_ibge,
    },
    asaasItems,
    shippingQuote.price,
    asaasBillingTypes(payment_method),
    requestOrigin
  );

  if (!checkout.ok) {
    await admin.from("orders").delete().eq("id", order.id);
    return { error: checkout.error };
  }

  await admin
    .from("orders")
    .update({ asaas_checkout_id: checkout.checkoutId })
    .eq("id", order.id);

  return { success: true, orderId: order.id, paymentUrl: checkout.initPoint };
}
