import { api } from "./client";


// ✅ One place to control your API base URL.
// - With Vite proxy: set VITE_API_URL to "" and proxy "/api" to backend.
// - Without proxy: set VITE_API_URL to "http://localhost:5000"
const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: `${apiBase}/api`,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
