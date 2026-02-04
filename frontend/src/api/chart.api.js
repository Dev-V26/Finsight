import { api } from "./client";


export async function getMonthlyChartApi(year) {
  const res = await api.get("/transactions/charts/monthly", {
    params: year ? { year } : {},
  });
  return res.data;
}

export async function getCategoryChartApi() {
  const res = await api.get("/transactions/charts/category");
  return res.data;
}
