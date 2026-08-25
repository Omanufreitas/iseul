#!/usr/bin/env npx tsx
/**
 * Cria pedido de teste, sincroniza Bling, limpa.
 * Uso: npx tsx scripts/test-bling-sync.ts
 */
import dotenv from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createAdminClient } from "../src/lib/supabase/client";
import { syncOrderToBling } from "../src/lib/bling/sync-order";
import { isBlingConfigured } from "../src/lib/bling/client";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: resolve(root, ".env.local") });

async function main() {
  console.log("=== Teste sync Bling ===\n");

  if (!isBlingConfigured()) {
    console.log("❌ Bling não configurado (BLING_CLIENT_ID/SECRET ou tokens OAuth)");
    process.exit(1);
  }
  console.log("✅ Bling configurado");

  const admin = createAdminClient();

  const { data: product } = await admin
    .from("products")
    .select("id, name, sku, slug, price, stock, bling_product_id")
    .eq("active", true)
    .gt("stock", 0)
    .limit(1)
    .maybeSingle();

  if (!product) {
    console.log("❌ Nenhum produto ativo com estoque");
    process.exit(1);
  }
  console.log(`✅ Produto teste: ${product.name} (SKU: ${product.sku ?? product.slug})`);

  const { data: order, error: orderErr } = await admin
    .from("orders")
    .insert({
      status: "pago",
      payment_status: "aprovado",
      payment_method: "asaas",
      subtotal: Number(product.price),
      shipping: 0,
      discount: 0,
      total: Number(product.price),
      customer_email: "teste-bling-sync@iseul.com.br",
      customer_name: "Teste Bling Sync",
      customer_phone: "67999999999",
      customer_cpf: "52998224725",
      shipping_method: "Correios PAC",
      shipping_service_id: "-1",
      shipping_address: {
        full_name: "Teste Bling Sync",
        email: "teste-bling-sync@iseul.com.br",
        cpf: "52998224725",
        phone: "67999999999",
        zip: "79002280",
        street: "Rua Teste",
        number: "100",
        complement: "",
        neighborhood: "Centro",
        city: "Campo Grande",
        state: "MS",
      },
      paid_at: new Date().toISOString(),
    })
    .select("id, order_number")
    .single();

  if (orderErr || !order) {
    console.log("❌ Falha ao criar pedido:", orderErr?.message);
    process.exit(1);
  }
  console.log(`✅ Pedido teste #${order.order_number} (${order.id})`);

  const { error: itemErr } = await admin.from("order_items").insert({
    order_id: order.id,
    product_id: product.id,
    product_name: product.name,
    product_brand: "Teste",
    quantity: 1,
    unit_price: Number(product.price),
    line_total: Number(product.price),
  });

  if (itemErr) {
    await admin.from("orders").delete().eq("id", order.id);
    console.log("❌ Falha order_items:", itemErr.message);
    process.exit(1);
  }

  try {
    await syncOrderToBling(order.id);
  } catch (e) {
    console.log("❌ Exceção syncOrderToBling:", e instanceof Error ? e.message : e);
  }

  const { data: updated } = await admin
    .from("orders")
    .select("bling_order_id, bling_sync_status, bling_sync_error, nfe_number, nfe_url")
    .eq("id", order.id)
    .single();

  if (updated?.bling_sync_status === "synced" && updated.bling_order_id) {
    console.log(`✅ Bling sync OK — pedido Bling #${updated.bling_order_id}`);
    if (updated.nfe_number) {
      console.log(`✅ NF-e: ${updated.nfe_number}`);
    } else if (updated.bling_sync_error?.includes("NF-e")) {
      console.log(`⚠️  Pedido no Bling OK, NF-e: ${updated.bling_sync_error}`);
    } else {
      console.log("ℹ️  NF-e não emitida (BLING_NFE_ENABLED pode estar off)");
    }
  } else {
    console.log("❌ Bling sync falhou:");
    console.log("   status:", updated?.bling_sync_status);
    console.log("   erro:", updated?.bling_sync_error ?? "(sem mensagem)");
  }

  await admin.from("orders").delete().eq("id", order.id);
  console.log("🧹 Pedido de teste removido");

  console.log("\n=== Fim teste Bling ===");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
