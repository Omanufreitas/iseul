#!/usr/bin/env node
/**
 * Testa checkout: produtos, cupons, variações e Asaas.
 * Uso: node scripts/test-checkout-flow.mjs
 */
import dotenv from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: resolve(root, ".env.local") });

function getAsaasApiKey() {
  let key = process.env.ASAAS_API_KEY?.trim() ?? "";
  if (key.startsWith("\\$")) key = key.slice(1);
  else if (key.startsWith("\\") && key.includes("$aact")) key = key.replace(/^\\+/, "");
  return key;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const asaasKey = getAsaasApiKey();

async function sb(path, opts = {}) {
  const res = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...opts,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: opts.prefer ?? "return=representation",
      ...opts.headers,
    },
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  return { ok: res.ok, status: res.status, data };
}

function asaasBase() {
  const env = process.env.ASAAS_ENV?.trim().toLowerCase();
  if (env === "sandbox") return "https://api-sandbox.asaas.com";
  if (env === "production") return "https://api.asaas.com";
  const key = asaasKey?.trim() ?? "";
  if (key.includes("_test_") || key.startsWith("$aact_hmlg")) {
    return "https://api-sandbox.asaas.com";
  }
  return "https://api.asaas.com";
}

async function testAsaasCheckout(items, shipping = 0) {
  const body = {
    billingTypes: ["PIX", "CREDIT_CARD"],
    chargeTypes: ["DETACHED", "INSTALLMENT"],
    installment: {
      maxInstallmentCount: 3,
    },
    minutesToExpire: 120,
    externalReference: "test-" + Date.now(),
    callback: {
      successUrl: "https://iseul.com.br/obrigado",
      cancelUrl: "https://iseul.com.br/checkout",
      expiredUrl: "https://iseul.com.br/checkout/aguardando",
    },
    items: items.map((item) => ({
      name: item.title.slice(0, 30),
      description: item.title.slice(0, 150),
      quantity: item.quantity,
      value: Math.round(item.unit_price * 100) / 100,
      imageBase64:
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
    })),
    customerData: {
      name: "Teste Iseul",
      email: "teste@iseul.com.br",
      cpfCnpj: "52998224725",
      phone: "4738010919",
      address: "Rua Teste",
      addressNumber: 123,
      postalCode: "01310100",
      province: "Centro",
    },
  };

  if (shipping > 0) {
    body.items.push({
      name: "Frete",
      description: "Frete Iseul",
      quantity: 1,
      value: shipping,
      imageBase64: body.items[0].imageBase64,
    });
  }

  const res = await fetch(`${asaasBase()}/v3/checkouts`, {
    method: "POST",
    headers: {
      access_token: asaasKey.trim(),
      "Content-Type": "application/json",
      "User-Agent": "Iseul/1.0",
    },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  console.log("=== Teste Iseul Checkout ===\n");

  if (!supabaseUrl || !serviceKey) {
    console.error("❌ Supabase não configurado em .env.local");
    process.exit(1);
  }

  // 1. Schema
  const tables = ["product_variants", "coupons"];
  for (const table of tables) {
    const r = await sb(`${table}?select=id&limit=1`, { method: "GET", prefer: "count=exact" });
    console.log(r.ok ? `✅ Tabela ${table} OK` : `❌ Tabela ${table}: ${r.status} ${JSON.stringify(r.data)}`);
  }

  const ordersCols = await fetch(
    `${supabaseUrl}/rest/v1/rpc/to_regclass`,
    { method: "POST", headers: { apikey: serviceKey, Authorization: `Bearer ${serviceKey}` } }
  ).catch(() => null);

  void ordersCols;

  // Check coupon_code column via sample insert rollback approach - query orders
  const orderSample = await sb("orders?select=coupon_code&limit=1");
  if (orderSample.ok) {
    console.log("✅ Coluna orders.coupon_code OK");
  } else {
    console.log("❌ orders.coupon_code:", orderSample.data);
  }

  const itemSample = await sb("order_items?select=variant_id,variant_label&limit=1");
  if (itemSample.ok) {
    console.log("✅ Colunas order_items.variant_id/variant_label OK");
  } else {
    console.log("❌ order_items variant cols:", itemSample.data);
  }

  // 2. Products
  const products = await sb("products?select=id,name,slug,price,stock,active&active=eq.true&limit=3");
  if (!products.ok || !products.data?.length) {
    console.log("❌ Nenhum produto ativo:", products.data);
  } else {
    console.log(`✅ ${products.data.length} produto(s) ativo(s):`);
    for (const p of products.data) {
      console.log(`   - ${p.name} (${p.slug}) R$ ${p.price} estoque ${p.stock}`);
    }
  }

  // 3. Variants
  const variants = await sb("product_variants?select=id,label,product_id,price,stock,active&limit=5");
  if (variants.ok) {
    console.log(`✅ Variações: ${variants.data?.length ?? 0} cadastrada(s)`);
    for (const v of variants.data ?? []) {
      console.log(`   - ${v.label} R$ ${v.price} estoque ${v.stock}`);
    }
  }

  // 4. Coupons
  const coupons = await sb("coupons?select=code,name,discount_percent,active&active=eq.true");
  if (coupons.ok) {
    console.log(`✅ Cupons ativos: ${coupons.data?.length ?? 0}`);
    for (const c of coupons.data ?? []) {
      console.log(`   - ${c.code} (${c.name}) ${c.discount_percent}%`);
    }
  }

  // 5. Asaas
  if (!asaasKey) {
    console.log("\n❌ ASAAS_API_KEY não configurada");
    process.exit(1);
  }

  const product = products.data?.[0];
  if (!product) {
    console.log("\n⚠️  Sem produto para testar Asaas");
    process.exit(0);
  }

  console.log("\n--- Teste Asaas checkout ---");
  const asaasTest = await testAsaasCheckout(
    [{ title: product.name, quantity: 1, unit_price: Number(product.price) }],
    0
  );

  if (asaasTest.ok && asaasTest.data?.link) {
    console.log("✅ Asaas checkout criado:", asaasTest.data.id);
    console.log("   Link:", asaasTest.data.link);
  } else {
    console.log("❌ Asaas checkout FALHOU:");
    console.log("   Status:", asaasTest.status);
    console.log("   Resposta:", JSON.stringify(asaasTest.data, null, 2));
  }

  // 6. Simular insert pedido (sem commit final - deletar depois)
  console.log("\n--- Teste insert pedido completo ---");
  const testOrder = await sb("orders", {
    method: "POST",
    prefer: "return=representation",
    body: JSON.stringify({
      status: "aguardando_pagamento",
      payment_status: "pendente",
      payment_method: "asaas",
      subtotal: Number(product.price),
      shipping: 0,
      discount: 0,
      total: Number(product.price),
      coupon_code: null,
      customer_email: "teste-checkout@iseul.com.br",
      customer_name: "Teste Checkout",
      customer_phone: "11999999999",
      customer_cpf: "52998224725",
    }),
  });

  if (!testOrder.ok) {
    console.log("❌ Insert order falhou:", JSON.stringify(testOrder.data, null, 2));
  } else {
    const orderId = testOrder.data[0]?.id;
    console.log("✅ Pedido criado:", orderId);

    const itemInsert = await sb("order_items", {
      method: "POST",
      body: JSON.stringify({
        order_id: orderId,
        product_id: product.id,
        variant_id: null,
        variant_label: null,
        product_name: product.name,
        product_brand: "Teste",
        quantity: 1,
        unit_price: Number(product.price),
        line_total: Number(product.price),
      }),
    });

    if (!itemInsert.ok) {
      console.log("❌ Insert order_items falhou:", JSON.stringify(itemInsert.data, null, 2));
    } else {
      console.log("✅ order_items OK");
    }

    const reservation = await sb("stock_reservations", {
      method: "POST",
      body: JSON.stringify({
        product_id: product.id,
        variant_id: null,
        order_id: orderId,
        quantity: 1,
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      }),
    });

    if (!reservation.ok) {
      console.log("❌ Insert stock_reservations falhou:", JSON.stringify(reservation.data, null, 2));
    } else {
      console.log("✅ stock_reservations OK");
    }

    // cleanup
    await sb(`orders?id=eq.${orderId}`, { method: "DELETE" });
    console.log("🧹 Pedido de teste removido");
  }

  console.log("\n=== Fim ===");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
