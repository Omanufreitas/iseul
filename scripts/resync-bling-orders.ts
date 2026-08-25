#!/usr/bin/env npx tsx
/**
 * Reenvia pedidos pagos ao Bling (sem duplicar pedido/NF-e já existentes).
 *
 * Uso:
 *   npx tsx scripts/resync-bling-orders.ts
 *   npx tsx scripts/resync-bling-orders.ts --order-number 7
 *   npx tsx scripts/resync-bling-orders.ts --order-id <uuid>
 */
import dotenv from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { resyncPaidOrdersToBling } from "../src/lib/bling/sync-order";
import { isBlingConfigured } from "../src/lib/bling/client";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: resolve(root, ".env.local") });

function parseArgs() {
  const args = process.argv.slice(2);
  let orderId: string | undefined;
  let orderNumber: number | undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--order-id" && args[i + 1]) orderId = args[++i];
    if (args[i] === "--order-number" && args[i + 1]) orderNumber = Number(args[++i]);
  }

  return { orderId, orderNumber };
}

async function main() {
  console.log("=== Resync Bling (pedidos pagos) ===\n");

  if (!isBlingConfigured()) {
    console.log("❌ Bling não configurado");
    process.exit(1);
  }

  const { orderId, orderNumber } = parseArgs();
  const results = await resyncPaidOrdersToBling({ orderId, orderNumber });

  if (!results.length) {
    console.log("Nenhum pedido pago pendente de sync com Bling.");
    return;
  }

  for (const row of results) {
    const label = row.orderNumber != null ? `#${row.orderNumber}` : row.orderId.slice(0, 8);
    console.log(`${label}: ${row.result}`);
  }

  console.log(`\n✅ ${results.length} pedido(s) processado(s)`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
