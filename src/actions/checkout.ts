"use server";

import { headers } from "next/headers";
import { createCheckoutSchema } from "@/lib/validations";
import { createAdminClient } from "@/lib/supabase/client";
import { createStoreCheckoutPreference } from "@/lib/mercadopago";
import { normalizeStoreOrigin } from "@/lib/store-url";
import { getProductById } from "@/lib/catalog";
import { isMockCatalogEnabled, isSupabaseConfigured } from "@/lib/config";
import { RESERVATION_MINUTES } from "@/lib/constants";
import { releaseExpiredReservations } from "@/lib/orders/fulfill";

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
        "Checkout indisponível no modo demo. Configure Supabase e Mercado Pago no .env.local.",
    };
  }

  const parsed = createCheckoutSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  await releaseExpiredReservations();
  const admin = createAdminClient();
  const { items, address, shipping_price } = parsed.data;

  type PreparedItem = {
    product_id: string;
    product_name: string;
    product_brand: string;
    quantity: number;
    unit_price: number;
    line_total: number;
  };

  const prepared: PreparedItem[] = [];

  for (const item of items) {
    const product = await getProductById(item.productId);
    if (!product || !product.active) {
      return { error: "Produto não encontrado ou indisponível." };
    }
    if (product.stock < item.quantity) {
      return { error: `Estoque insuficiente: ${product.name}` };
    }
    prepared.push({
      product_id: product.id.startsWith("seed-") ? product.id : product.id,
      product_name: product.name,
      product_brand: product.brand,
      quantity: item.quantity,
      unit_price: product.price,
      line_total: product.price * item.quantity,
    });
  }

  const subtotal = prepared.reduce((s, r) => s + r.line_total, 0);
  const total = subtotal + shipping_price;
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

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      customer_id: customerId,
      status: "aguardando_pagamento",
      payment_status: "pendente",
      payment_method: "mercadopago",
      subtotal,
      shipping: shipping_price,
      discount: 0,
      total,
      shipping_address: address,
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
      product_name: row.product_name,
      product_brand: row.product_brand,
      quantity: row.quantity,
      unit_price: row.unit_price,
      line_total: row.line_total,
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
      order_id: order.id,
      quantity: row.quantity,
      expires_at: expiresAt,
    });
  }

  const mpItems = prepared.map((oi) => ({
    title: oi.product_name,
    quantity: oi.quantity,
    unit_price: oi.unit_price,
  }));

  const requestOrigin = await getCheckoutRequestOrigin();
  const mp = await createStoreCheckoutPreference(
    order.id,
    {
      email: address.email,
      full_name: address.full_name,
      cpf: address.cpf,
      phone: address.phone,
      zip: address.zip,
      street: address.street,
      number: address.number,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
    },
    mpItems,
    shipping_price,
    requestOrigin
  );

  if (!mp.ok) {
    await admin.from("orders").delete().eq("id", order.id);
    return { error: mp.error };
  }

  return { success: true, orderId: order.id, paymentUrl: mp.initPoint };
}
