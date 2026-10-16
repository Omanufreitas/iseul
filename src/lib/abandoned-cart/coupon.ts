import { createAdminClient } from "@/lib/supabase/client";

export function abandonedCouponCode(nome: string): string {
  const base =
    nome
      .normalize("NFD")
      .replace(/\p{M}/gu, "")
      .replace(/[^A-Za-z]/g, "")
      .toUpperCase()
      .slice(0, 6) || "ISEUL";
  const suffix = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `${base}10${suffix}`;
}

export async function gerarCupomCarrinho(nome: string): Promise<{ codigo: string; expira_em: string }> {
  const admin = createAdminClient();
  const expira = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const expiraEm = expira.toISOString();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const codigo = abandonedCouponCode(nome);
    const { error } = await admin.from("coupons").insert({
      code: codigo,
      name: "Carrinho abandonado",
      discount_percent: 10,
      active: true,
      valid_from: new Date().toISOString(),
      valid_until: expiraEm,
      max_uses: 1,
      used_count: 0,
    });
    if (!error) return { codigo, expira_em: expiraEm };
    if (!/duplicate|unique/i.test(error.message)) throw error;
  }

  throw new Error("Não foi possível gerar um cupom único.");
}
