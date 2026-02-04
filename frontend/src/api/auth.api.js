// src/api/auth.api.js
import { api } from "./client";

export async function loginApi(payload) {
  // backend mounted: app.use("/api/auth", authRoutes)
  const res = await api.post("/auth/login", payload);
  return res.data;
}

export async function registerApi(payload) {
  const res = await api.post("/auth/register", payload);
  return res.data;
}

export async function meApi() {
  const res = await api.get("/auth/me");
  return res.data;
}



// import { api } from "./client";

// function normalizeAuthResponse(data) {
//   const token =
//     data?.token ||
//     data?.accessToken ||
//     data?.jwt ||
//     data?.data?.token ||
//     data?.data?.accessToken;

//   const user = data?.user || data?.data?.user || data?.profile || null;

//   return {
//     ...data,
//     token,
//     user,
//   };
// }

// export const loginApi = async (payload) => {
//   const res = await api.post("/auth/login", payload);
//   return { ...res, data: normalizeAuthResponse(res.data) };
// };

// export const registerApi = async (payload) => {
//   const res = await api.post("/auth/register", payload);
//   return { ...res, data: normalizeAuthResponse(res.data) };
// };

// export const meApi = async () => {
//   const res = await api.get("/auth/me");
//   return { ...res, data: normalizeAuthResponse(res.data) };
// };

// export const authApi = {
//   login: loginApi,
//   register: registerApi,
//   me: meApi,
// };
