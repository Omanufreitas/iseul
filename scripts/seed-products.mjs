#!/usr/bin/env node
/**
 * Importa os 57 produtos de data/products.seed.json para o Supabase.
 * Uso: node scripts/seed-products.mjs
 * Requer: NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY no .env.local
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Configure NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(url, key);

function slugify(text) {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const seed = JSON.parse(
  readFileSync(path.join(__dirname, "..", "data", "products.seed.json"), "utf-8")
);

const slugs = new Set();
const rows = seed.map((p) => {
  let slug = slugify(p.name);
  if (slugs.has(slug)) slug = `${slug}-${p.id}`;
  slugs.add(slug);
  return {
    shopee_id: p.id,
    slug,
    name: p.name,
    full_name: p.full,
    brand: p.brand,
    category_slug: p.cat,
    category_label: p.catLabel,
    price: p.price,
    compare_at_price: p.before > 0 ? p.before : null,
    pitch: p.pitch,
    image_url: p.img,
    image_fallback_url: p.fallback,
    shopee_url: p.shopee,
    sold_count: p.sold,
    rating: p.rating,
    review_count: p.rcount,
    stock: 10,
    active: true,
  };
});

async function main() {
  console.log(`Importando ${rows.length} produtos...`);
  const { error } = await supabase.from("products").upsert(rows, { onConflict: "shopee_id" });
  if (error) {
    console.error(error);
    process.exit(1);
  }
  console.log("✓ Produtos importados com sucesso");
}

main();
