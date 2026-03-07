import api from "./axios";

export const applyLeaveApi = (data) =>
  api.post("/leave/apply", data);

export const myLeavesApi = () =>
  api.get("/leave/my");