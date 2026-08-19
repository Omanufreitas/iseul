#!/usr/bin/env node
/**
 * Cria usuário admin inicial.
 * Uso: ADMIN_EMAIL=... ADMIN_PASSWORD=... node scripts/seed-admin.mjs
 */
import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcryptjs";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
config({ path: path.join(__dirname, "..", ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL ?? "manu.oficial93@gmail.com";
const password = process.env.ADMIN_PASSWORD;

if (!url || !key) {
  console.error("Configure Supabase no .env.local");
  process.exit(1);
}
if (!password) {
  console.error("Defina ADMIN_PASSWORD");
  process.exit(1);
}

const supabase = createClient(url, key);
const hash = await bcrypt.hash(password, 12);

const { error } = await supabase.from("admin_users").upsert(
  { email, password_hash: hash, name: process.env.ADMIN_NAME ?? "Manu" },
  { onConflict: "email" }
);

if (error) {
  console.error(error);
  process.exit(1);
}

console.log(`✓ Admin criado: ${email}`);
