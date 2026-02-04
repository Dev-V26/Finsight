import { api } from "./client";

export async function getPortfolioSummaryApi() {
  const res = await api.get("/portfolio/summary");
  return res.data; // { summary, count }
}

export async function listHoldingsApi(params = {}) {
  const res = await api.get("/portfolio/holdings", { params });
  return res.data; // { holdings }
}

export async function createHoldingApi(payload) {
  const res = await api.post("/portfolio/holdings", payload);
  return res.data; // { holding }
}

export async function updateHoldingApi(id, payload) {
  const res = await api.put(`/portfolio/holdings/${id}`, payload);
  return res.data; // { holding }
}

export async function deleteHoldingApi(id) {
  const res = await api.delete(`/portfolio/holdings/${id}`);
  return res.data; // { success: true }
}
