import { Suspense } from "react";
import { OrdersAdminPanel } from "@/components/admin/OrdersAdminPanel";
import { DATE_PRESETS } from "@/components/admin/dashboard/DateRangePicker";
import { listOrderFilterProducts, listOrdersAdmin } from "@/lib/admin-orders";

type Props = {
  searchParams: Promise<{
    q?: string;
    product?: string;
    from?: string;
    to?: string;
  }>;
};

function parseFilters(searchParams: Awaited<Props["searchParams"]>) {
  const allRange = DATE_PRESETS.find((p) => p.id === "all")!.getRange();
  return {
    q: searchParams.q?.trim() || undefined,
    productId: searchParams.product || undefined,
    from: searchParams.from || allRange.from,
    to: searchParams.to || allRange.to,
  };
}

async function OrdersContent({ searchParams }: Props) {
  const sp = await searchParams;
  const filters = parseFilters(sp);
  const [orders, products] = await Promise.all([
    listOrdersAdmin(filters),
    listOrderFilterProducts(),
  ]);

  return <OrdersAdminPanel orders={orders} products={products} filters={filters} />;
}

export default function AdminOrdersPage(props: Props) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Pedidos</h1>
        <p className="text-sm text-neutral-500">Filtre por cliente, produto e data</p>
      </div>

      <Suspense
        fallback={
          <div className="rounded-2xl border bg-white p-8 text-center text-sm text-neutral-500">
            Carregando pedidos…
          </div>
        }
      >
        <OrdersContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
