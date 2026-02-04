import { api } from "./client";


export async function getNotifications(limit = 10, page = 1) {
  const res = await api.get(`/notifications?limit=${limit}&page=${page}`);
  // backend: { success, message, data: { items, total, page, limit } }
  return res.data?.data?.items || [];
}

export async function getUnreadCount() {
  const res = await api.get("/notifications/unread-count");
  return res.data?.data?.count || 0;
}

export async function markNotificationRead(id) {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data;
}

export async function markAllRead() {
  const res = await api.patch("/notifications/mark-all-read");
  return res.data;
}
