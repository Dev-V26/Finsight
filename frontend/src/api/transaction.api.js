import { api } from "./client";


export async function createTransactionApi(payload) {
  const res = await api.post("/transactions", payload);
  return res.data;
}

export async function listTransactionsApi(params = {}) {
  const res = await api.get("/transactions", { params });
  return res.data;
}

export async function updateTransactionApi(id, payload) {
  const res = await api.put(`/transactions/${id}`, payload);
  return res.data;
}

export async function deleteTransactionApi(id) {
  const res = await api.delete(`/transactions/${id}`);
  return res.data;
}
