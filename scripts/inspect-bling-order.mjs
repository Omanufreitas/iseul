#!/usr/bin/env node
import dotenv from "dotenv";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: resolve(root, ".env.local") });

async function getToken() {
  const { getBlingAccessToken } = await import("../src/lib/bling/token-store.ts");
  return getBlingAccessToken();
}

async function blingGet(path, token) {
  const res = await fetch(`https://api.bling.com.br/Api/v3${path}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
  });
  const text = await res.text();
  return { ok: res.ok, status: res.status, data: text ? JSON.parse(text) : null };
}

const id = process.argv[2] || "26691627017";
const token = await getToken();
if (!token) {
  console.error("Sem token Bling");
  process.exit(1);
}

const order = await blingGet(`/pedidos/vendas/${id}`, token);
console.log("Pedido", id, "status HTTP", order.status);
if (order.ok) {
  const d = order.data?.data;
  console.log("Situação:", d?.situacao?.valor ?? d?.situacao);
  console.log("Itens no pedido:", d?.itens?.length ?? 0);
  if (d?.itens?.length) {
    console.log(JSON.stringify(d.itens[0], null, 2));
    const pid = d.itens[0]?.produto?.id;
    if (pid) {
      const p = await blingGet(`/produtos/${pid}`, token);
      const prod = p.data?.data;
      console.log("\nProduto Bling:", prod?.nome);
      console.log("Unidade:", prod?.unidade);
      console.log("Tributação:", JSON.stringify(prod?.tributacao, null, 2));
    }
  }
} else {
  console.log(order.data);
}
