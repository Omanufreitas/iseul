"use server";

import { fetchDashboardData, type DashboardData } from "@/lib/admin-dashboard";

export async function getDashboardData(
  from?: string | null,
  to?: string | null
): Promise<DashboardData> {
  return fetchDashboardData(from, to);
}
