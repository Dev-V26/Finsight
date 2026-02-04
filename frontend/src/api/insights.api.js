import { api } from "./client";

// GET /api/insights/dashboard?month=YYYY-MM
export async function getDashboardInsightsApi(month) {
  const res = await api.get("/insights/dashboard", {
    params: month ? { month } : undefined,
  });
  return res.data;
}
