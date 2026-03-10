import api from "./axios";

export const getAllUsersApi = () =>
  api.get("/user/all");

export const changeRoleApi = (id, role) =>
  api.post(`/user/role/${id}`, { role });

export const deactivateUserApi = (id) =>
  api.patch(`/user/deactivate/${id}`);

export const deleteUserApi = (id) =>
  api.delete(`/user/${id}`);

export const getAllLeavesApi = () =>
  api.get("/leave/all");

export const updateLeaveStatusApi = (id, status) =>
  api.put(`/leave/status/${id}`, { status });

export const getAllAttendanceApi = () =>
  api.get("/attendance/all");

export const getTodayAttendanceOverviewApi = () =>
  api.get("/attendance/today-overview");

export const updateAttendanceApi = (id, status, remark = "") =>
  api.put(`/attendance/update/${id}`, { status, remark });