import { Suspense } from "react";
import { OrdersAdminPanel } from "@/components/admin/OrdersAdminPanel";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { AdminPageSkeleton } from "@/components/admin/ui/AdminPageSkeleton";
import { getAllDateRange } from "@/lib/date-presets";
import { listOrderFilterProducts, listOrdersAdmin } from "@/lib/admin-orders";

type Props = {
  searchParams: Promise<{
    q?: string;
    product?: string;
    from?: string;
    to?: string;
    payment?: string;
    status?: string;
  }>;
};

function parseFilters(searchParams: Awaited<Props["searchParams"]>) {
  const allRange = getAllDateRange();
  return {
    q: searchParams.q?.trim() || undefined,
    productId: searchParams.product || undefined,
    from: searchParams.from || allRange.from,
    to: searchParams.to || allRange.to,
    paymentStatus: searchParams.payment || undefined,
    orderStatus: searchParams.status || undefined,
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
      <PageHeader
        title="Pedidos"
        description="Filtre por cliente, produto, status e data"
      />

      <Suspense fallback={<AdminPageSkeleton />}>
        <OrdersContent searchParams={props.searchParams} />
      </Suspense>
    </div>
  );
}
