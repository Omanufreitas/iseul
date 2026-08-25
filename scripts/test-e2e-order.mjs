#!/usr/bin/env node
/**
 * Teste E2E: frete, Asaas com IBGE, colunas ME, pedido recente + Bling.
 */
import dotenv from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: resolve(root, ".env.local") });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const asaasKey = (process.env.ASAAS_API_KEY ?? "").replace(/^\\+/, "").trim();
const meToken = process.env.MELHOR_ENVIO_TOKEN?.trim();

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
  if (asaasKey.includes("_test_") || asaasKey.startsWith("$aact_hmlg")) {
    return "https://api-sandbox.asaas.com";
  }
  return "https://api.asaas.com";
}

async function testAsaasWithIbge() {
  const body = {
    billingTypes: ["PIX"],
    chargeTypes: ["DETACHED"],
    minutesToExpire: 60,
    externalReference: `test-ibge-${Date.now()}`,
    callback: {
      successUrl: "https://iseul.com.br/obrigado",
      cancelUrl: "https://iseul.com.br/checkout",
      expiredUrl: "https://iseul.com.br/checkout/aguardando",
    },
    items: [
      {
        name: "Teste IBGE",
        description: "Teste checkout Iseul",
        quantity: 1,
        value: 10,
        imageBase64:
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/p9sAAAAASUVORK5CYII=",
      },
    ],
    customerData: {
      name: "Teste Iseul E2E",
      email: "teste-e2e@iseul.com.br",
      cpfCnpj: "52998224725",
      phone: "11987654321",
      address: "Avenida Paulista",
      addressNumber: 1000,
      postalCode: "01310100",
      province: "Bela Vista",
      city: 3550308,
    },
  };

  const res = await fetch(`${asaasBase()}/v3/checkouts`, {
    method: "POST",
    headers: {
      access_token: asaasKey,
      "Content-Type": "application/json",
      "User-Agent": "Iseul/1.0",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

async function testMelhorEnvioQuote() {
  const from = (process.env.MELHOR_ENVIO_ORIGIN_POSTAL_CODE ?? "79072266").replace(/\D/g, "");
  const to = "01310100";
  const base =
    process.env.MELHOR_ENVIO_SANDBOX === "true"
      ? "https://sandbox.melhorenvio.com.br"
      : "https://melhorenvio.com.br";

  const res = await fetch(`${base}/api/v2/me/shipment/calculate`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${meToken}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "User-Agent": "Iseul (contato@iseul.com.br)",
    },
    body: JSON.stringify({
      from: { postal_code: from },
      to: { postal_code: to },
      products: [{ weight: 0.25, width: 8, height: 15, length: 8, quantity: 1, insurance_value: 50 }],
    }),
  });
  const data = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data };
}

async function main() {
  console.log("=== Teste E2E Iseul ===\n");

  // 1. Colunas Melhor Envio
  const meCols = await sb(
    "orders?select=tracking_code,shipping_method,shipping_service_id,melhor_envio_status,melhor_envio_order_id&limit=1"
  );
  console.log(meCols.ok ? "✅ Colunas Melhor Envio no banco OK" : `❌ Colunas ME: ${JSON.stringify(meCols.data)}`);

  // 2. Asaas com IBGE (fix postalCode)
  if (!asaasKey) {
    console.log("❌ ASAAS_API_KEY ausente");
  } else {
    const asaas = await testAsaasWithIbge();
    if (asaas.ok && asaas.data?.link) {
      console.log("✅ Asaas checkout com CEP + IBGE OK:", asaas.data.id);
    } else {
      console.log("❌ Asaas com IBGE FALHOU:", asaas.status, JSON.stringify(asaas.data?.errors ?? asaas.data));
    }
  }

  // 3. Melhor Envio cotação
  if (!meToken) {
    console.log("⚠️  MELHOR_ENVIO_TOKEN ausente — pulando cotação");
  } else {
    const me = await testMelhorEnvioQuote();
    if (me.ok && Array.isArray(me.data) && me.data.length > 0) {
      const options = me.data
        .filter((o) => !o.error && o.name)
        .slice(0, 4)
        .map((o) => `${o.company?.name ?? ""} ${o.name} R$ ${o.price}`)
        .join(" | ");
      console.log(`✅ Melhor Envio: ${me.data.length} opções (${options})`);
    } else {
      console.log("❌ Melhor Envio cotação falhou:", me.status, typeof me.data === "string" ? me.data.slice(0, 200) : JSON.stringify(me.data)?.slice(0, 300));
    }
  }

  // 4. Site produção
  const site = await fetch("https://iseul.com.br/api/webhooks/asaas", { method: "GET" }).catch(() => null);
  if (site?.ok) {
    console.log("✅ Webhook Asaas no ar (GET health)");
  } else {
    const checkout = await fetch("https://iseul.com.br/checkout", { redirect: "manual" });
    console.log(checkout.status === 200 ? "✅ Site iseul.com.br/checkout OK" : `⚠️  Site status ${checkout.status}`);
  }

  // 5. Últimos pedidos + Bling
  const orders = await sb(
    "orders?select=id,order_number,status,payment_status,bling_sync_status,bling_order_id,bling_sync_error,shipping_method,tracking_code,ordered_at&order=ordered_at.desc&limit=5"
  );
  if (orders.ok && orders.data?.length) {
    console.log("\n--- Últimos 5 pedidos ---");
    for (const o of orders.data) {
      const bling =
        o.bling_sync_status === "synced"
          ? `✅ Bling #${o.bling_order_id ?? "?"}`
          : o.bling_sync_status === "error"
            ? `❌ Bling: ${(o.bling_sync_error ?? "").slice(0, 60)}`
            : o.payment_status === "aprovado"
              ? "⏳ Bling pendente"
              : "— aguardando pagamento";
      console.log(
        `  #${o.order_number} ${o.status}/${o.payment_status} | ${bling} | frete: ${o.shipping_method ?? "—"}`
      );
    }
  } else {
    console.log("\n⚠️  Nenhum pedido no banco");
  }

  console.log("\n=== Fim E2E ===");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
