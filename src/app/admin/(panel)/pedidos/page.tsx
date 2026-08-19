import { createAdminClient } from "@/lib/supabase/client";
import { isMockCatalogEnabled, isSupabaseConfigured } from "@/lib/config";
import { formatCurrency } from "@/lib/utils";

async function listOrders() {
  if (isMockCatalogEnabled() || !isSupabaseConfigured()) return [];
  const admin = createAdminClient();
  const { data } = await admin
    .from("orders")
    .select(
      "id, order_number, customer_name, customer_email, total, status, payment_status, ordered_at"
    )
    .order("ordered_at", { ascending: false })
    .limit(100);
  return data ?? [];
}

export default async function AdminOrdersPage() {
  const orders = await listOrders();

  return (
    <div>
      <h1 className="text-2xl font-semibold">Pedidos</h1>
      <p className="text-sm text-neutral-500">Últimos 100 pedidos</p>

      {orders.length === 0 ? (
        <p className="mt-8 text-neutral-500">
          Nenhum pedido ainda{isMockCatalogEnabled() ? " (modo demo sem Supabase)" : ""}.
        </p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl border bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-neutral-50 text-neutral-500">
              <tr>
                <th className="px-4 py-3">#</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Pagamento</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Data</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{o.order_number}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{o.customer_name}</div>
                    <div className="text-xs text-neutral-500">{o.customer_email}</div>
                  </td>
                  <td className="px-4 py-3">{formatCurrency(Number(o.total))}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        o.payment_status === "aprovado"
                          ? "bg-green-100 text-green-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {o.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 capitalize">{o.status.replace(/_/g, " ")}</td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {new Date(o.ordered_at).toLocaleString("pt-BR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
