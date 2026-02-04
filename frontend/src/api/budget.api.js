import { api } from "./client";


export async function saveBudgetApi(payload) {
  const res = await api.post("/budgets", payload);
  return res.data;
}

export async function listBudgetsApi(month) {
  const res = await api.get("/budgets", {
    params: month ? { month } : {},
  });
  return res.data;
}

