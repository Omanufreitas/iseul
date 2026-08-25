#!/usr/bin/env node
/**
 * Aplica migrations SQL pendentes no Supabase de produção.
 * Uso: node scripts/apply-supabase-migrations.mjs
 */
import { readFileSync, readdirSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: resolve(root, ".env.local") });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const password = process.env.SUPABASE_DB_PASSWORD;

if (!url || !password) {
  console.error("Defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_DB_PASSWORD em .env.local");
  process.exit(1);
}

const ref = url.replace(/^https:\/\//, "").replace(/\.supabase\.co\/?$/, "");
const host = `db.${ref}.supabase.co`;

const migrationsDir = resolve(root, "supabase/migrations");
const PENDING_FROM = process.env.MIGRATE_FROM ?? "20260823120000";

const files = readdirSync(migrationsDir)
  .filter((f) => f.endsWith(".sql") && f >= `${PENDING_FROM}_`)
  .sort();

console.log(`Projeto: ${ref}`);
console.log(`Aplicando ${files.length} migration(s)...\n`);

for (const file of files) {
  const path = resolve(migrationsDir, file);
  const sql = readFileSync(path, "utf8");
  console.log(`→ ${file}`);

  const result = spawnSync(
    "psql",
    [
      "-h",
      host,
      "-p",
      "5432",
      "-U",
      "postgres",
      "-d",
      "postgres",
      "-v",
      "ON_ERROR_STOP=1",
      "-c",
      sql,
    ],
    {
      env: { ...process.env, PGPASSWORD: password },
      encoding: "utf8",
    }
  );

  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    process.exit(result.status ?? 1);
  }
  console.log("  ok");
}

// Verifica coluna image_urls
const check = spawnSync(
  "psql",
  [
    "-h",
    host,
    "-p",
    "5432",
    "-U",
    "postgres",
    "-d",
    "postgres",
    "-tAc",
    "SELECT column_name FROM information_schema.columns WHERE table_schema='public' AND table_name='products' AND column_name='image_urls';",
  ],
  {
    env: { ...process.env, PGPASSWORD: password },
    encoding: "utf8",
  }
);

console.log("\nColuna image_urls:", check.stdout?.trim() || "(não encontrada)");
if (check.status !== 0) process.exit(1);

console.log("Migrations aplicadas com sucesso.");
