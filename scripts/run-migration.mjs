import { readFileSync } from "node:fs";
import { execSync } from "node:child_process";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const password = process.env.SUPABASE_DB_PASSWORD;
const ref = process.env.NEXT_PUBLIC_SUPABASE_URL?.match(/https:\/\/([^.]+)/)?.[1];

if (!password || !ref) {
  console.error("Faltam SUPABASE_DB_PASSWORD ou NEXT_PUBLIC_SUPABASE_URL em .env.local");
  process.exit(1);
}

const file = process.argv[2];
if (!file) {
  console.error("Uso: node scripts/run-migration.mjs <arquivo.sql>");
  process.exit(1);
}

const conn = `postgresql://postgres.${ref}@aws-0-sa-east-1.pooler.supabase.com:6543/postgres`;

execSync(`psql "${conn}" -f "${file}"`, {
  stdio: "inherit",
  env: { ...process.env, PGPASSWORD: password },
});
