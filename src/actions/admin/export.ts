"use server";

import { requireAdmin, requireOwnerAdmin } from "@/actions/admin/auth";
import { listCouponsAdmin } from "@/actions/admin/coupons";
import { listOrdersAdmin } from "@/lib/admin-orders";
import { listAdminUsers } from "@/lib/admin-users";
import { listAllProductsAdmin } from "@/lib/catalog";
import { rowsToCsv } from "@/lib/csv-export";
import { createAdminClient } from "@/lib/supabase/client";
import { isMockCatalogEnabled, isSupabaseConfigured } from "@/lib/config";
import { listWaitlistSubscribers } from "@/lib/waitlist";

export type AdminExportTable =
  | "orders"
  | "products"
  | "coupons"
  | "subscribers"
  | "customers"
  | "users";

export async function exportAdminTable(table: AdminExportTable) {
  await requireAdmin();

  if (table === "users") {
    await requireOwnerAdmin();
  }

  if (isMockCatalogEnabled() || !isSupabaseConfigured()) {
    return { error: "Exportação indisponível sem Supabase." };
  }

  const stamp = new Date().toISOString().slice(0, 10);

  if (table === "orders") {
    const orders = await listOrdersAdmin({ limit: 5000 });
    const csv = rowsToCsv(
      [
        "numero",
        "cliente",
        "email",
        "total",
        "subtotal",
        "frete",
        "desconto",
        "cupom",
        "status",
        "pagamento",
        "data",
        "produtos",
      ],
      orders.map((o) => [
        o.order_number,
        o.customer_name,
        o.customer_email,
        o.total,
        o.subtotal,
        o.shipping,
        o.discount,
        o.coupon_code ?? "",
        o.status,
        o.payment_status,
        o.ordered_at,
        o.items.map((i) => i.product_name).join(" | "),
      ]),
    );
    return { csv, filename: `iseul-pedidos-${stamp}.csv` };
  }

  if (table === "products") {
    const products = await listAllProductsAdmin();
    const admin = createAdminClient();
    const { data: variantRows } = await admin.from("product_variants").select("product_id, label, price, stock, active");
    const variantsByProduct = new Map<string, string[]>();
    for (const row of variantRows ?? []) {
      const pid = String(row.product_id);
      const list = variantsByProduct.get(pid) ?? [];
      list.push(`${row.label} (R$${row.price}, est.${row.stock}${row.active ? "" : ", inativa"})`);
      variantsByProduct.set(pid, list);
    }

    const csv = rowsToCsv(
      [
        "id",
        "nome",
        "marca",
        "categoria",
        "preco",
        "estoque",
        "ativo",
        "sku",
        "variacoes",
      ],
      products.map((p) => [
        p.id,
        p.name,
        p.brand,
        p.category_label,
        p.price,
        p.stock,
        p.active ? "sim" : "nao",
        p.sku ?? "",
        (variantsByProduct.get(p.id) ?? []).join(" | "),
      ]),
    );
    return { csv, filename: `iseul-produtos-${stamp}.csv` };
  }

  if (table === "coupons") {
    const coupons = await listCouponsAdmin();
    const csv = rowsToCsv(
      ["codigo", "nome", "desconto_pct", "ativo", "usos", "limite", "primeira_compra", "criado_em"],
      coupons.map((c) => [
        c.code,
        c.name,
        c.discount_percent,
        c.active ? "sim" : "nao",
        c.used_count,
        c.max_uses ?? "",
        c.first_purchase_only ? "sim" : "nao",
        c.created_at ?? "",
      ]),
    );
    return { csv, filename: `iseul-cupons-${stamp}.csv` };
  }

  if (table === "subscribers") {
    const subscribers = await listWaitlistSubscribers();
    const csv = rowsToCsv(
      ["nome", "email", "telefone", "origem", "data"],
      subscribers.map((s) => [s.name, s.email, s.phone, s.source, s.created_at]),
    );
    return { csv, filename: `iseul-inscritos-${stamp}.csv` };
  }

  if (table === "customers") {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("customers")
      .select("email, full_name, phone, cpf, marketing_opt_in, marketing_opt_in_at, created_at")
      .order("created_at", { ascending: false });
    if (error) return { error: error.message };

    const csv = rowsToCsv(
      ["email", "nome", "telefone", "cpf", "aceita_ofertas", "opt_in_em", "criado_em"],
      (data ?? []).map((c) => [
        c.email,
        c.full_name,
        c.phone ?? "",
        c.cpf ?? "",
        c.marketing_opt_in ? "sim" : "nao",
        c.marketing_opt_in_at ?? "",
        c.created_at,
      ]),
    );
    return { csv, filename: `iseul-clientes-${stamp}.csv` };
  }

  const users = await listAdminUsers();
  const csv = rowsToCsv(
    ["nome", "email", "criado_em"],
    users.map((u) => [u.name, u.email, u.created_at ?? ""]),
  );
  return { csv, filename: `iseul-usuarios-${stamp}.csv` };
}
