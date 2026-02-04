import { api } from "./client";


export async function getMonthSummaryApi(month) {
  const res = await api.get("/transactions/summary/month", {
    params: month ? { month } : {}
  });
  return res.data;
}
