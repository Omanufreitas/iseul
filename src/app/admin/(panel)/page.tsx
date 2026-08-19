import Link from "next/link";
import { listAllProductsAdmin } from "@/lib/catalog";
import { isMockCatalogEnabled, isSupabaseConfigured } from "@/lib/config";
import { createAdminClient } from "@/lib/supabase/client";
import { formatCurrency } from "@/lib/utils";

async function getOrderStats() {
  if (isMockCatalogEnabled() || !isSupabaseConfigured()) {
    return { totalOrders: 0, pendingOrders: 0, revenue: 0 };
  }
  const admin = createAdminClient();
  const { data: orders } = await admin.from("orders").select("total, payment_status");
  const totalOrders = orders?.length ?? 0;
  const pendingOrders = orders?.filter((o) => o.payment_status === "pendente").length ?? 0;
  const revenue =
    orders?.filter((o) => o.payment_status === "aprovado").reduce((s, o) => s + Number(o.total), 0) ??
    0;
  return { totalOrders, pendingOrders, revenue };
}

export default async function AdminDashboardPage() {
  const [products, stats] = await Promise.all([listAllProductsAdmin(), getOrderStats()]);

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="mt-1 text-sm text-neutral-500">
        {isMockCatalogEnabled()
          ? "Modo demo: catálogo carregado do JSON local (57 produtos)."
          : "Loja conectada ao Supabase."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Produtos", value: String(products.length) },
          { label: "Pedidos", value: String(stats.totalOrders) },
          { label: "Receita paga", value: formatCurrency(stats.revenue) },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl border bg-white p-5">
            <div className="text-sm text-neutral-500">{kpi.label}</div>
            <div className="mt-1 text-2xl font-semibold">{kpi.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/admin/produtos/novo"
          className="rounded-lg bg-iseul-accent px-4 py-2 text-sm font-medium text-white"
        >
          + Novo produto
        </Link>
        <Link
          href="/admin/produtos"
          className="rounded-lg border bg-white px-4 py-2 text-sm font-medium"
        >
          Gerenciar produtos
        </Link>
        <Link href="/" className="rounded-lg border bg-white px-4 py-2 text-sm font-medium">
          Ver loja
        </Link>
      </div>

      {stats.pendingOrders > 0 && (
        <p className="mt-6 text-sm text-amber-700">
          {stats.pendingOrders} pedido(s) aguardando pagamento.{" "}
          <Link href="/admin/pedidos" className="underline">
            Ver pedidos
          </Link>
        </p>
      )}
    </div>
  );
}
