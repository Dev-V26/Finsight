import { api } from "./client";


export const listGoalsApi = () => api.get("/goals");
export const createGoalApi = (payload) => api.post("/goals", payload);
export const updateGoalApi = (id, payload) => api.patch(`/goals/${id}`, payload);
export const deleteGoalApi = (id) => api.delete(`/goals/${id}`);
