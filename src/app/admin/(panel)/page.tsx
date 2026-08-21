import { Suspense } from "react";
import { DashboardView } from "@/components/admin/dashboard/DashboardView";
import { fetchDashboardData } from "@/lib/admin-dashboard";

type Props = {
  searchParams: Promise<{ from?: string; to?: string }>;
};

export default async function AdminDashboardPage({ searchParams }: Props) {
  const params = await searchParams;
  const data = await fetchDashboardData(params.from, params.to);

  return (
    <Suspense fallback={null}>
      <DashboardView initialData={data} />
    </Suspense>
  );
}
