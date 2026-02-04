// import { api } from "./client";


// export async function getSettingsApi() {
//   const res = await api.get("/settings");
//   return res.data;
// }

// export async function updateSettingsApi(payload) {
//   const res = await api.put("/settings", payload);
//   return res.data;
// }
import { api } from "./client";

// backend mounted at: /api/settings (and axios baseURL already includes /api)
export const getSettingsApi = () => api.get("/settings");
export const updateSettingsApi = (payload) => api.put("/settings", payload);
