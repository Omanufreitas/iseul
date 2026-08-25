#!/usr/bin/env npx tsx
/**
 * Consulta Asaas e confirma pagamento de pedidos pendentes.
 * Uso: npx tsx scripts/sync-order-payment.ts [--order-number 24]
 */
import dotenv from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createAdminClient } from "../src/lib/supabase/client";
import { syncOrderByReference } from "../src/lib/orders/fulfill";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: resolve(root, ".env.local") });

async function main() {
  const orderNumberArg = process.argv.find((a, i) => process.argv[i - 1] === "--order-number");
  const admin = createAdminClient();

  let query = admin
    .from("orders")
    .select("id, order_number, payment_status, status, customer_email")
    .eq("payment_status", "pendente")
    .order("order_number", { ascending: false });

  if (orderNumberArg) {
    query = admin
      .from("orders")
      .select("id, order_number, payment_status, status, customer_email")
      .eq("order_number", Number(orderNumberArg));
  }

  const { data: orders } = await query;
  if (!orders?.length) {
    console.log("Nenhum pedido pendente encontrado.");
    return;
  }

  for (const order of orders) {
    const result = await syncOrderByReference(order.id);
    console.log(
      `#${order.order_number} ${order.customer_email} →`,
      result.paid ? "PAGO confirmado" : "ainda pendente no Asaas",
    );
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
