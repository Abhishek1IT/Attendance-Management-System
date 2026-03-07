import api from "./axios";

export const markAttendanceApi = () =>
    api.post("/attendance/mark");

export const myAttendanceApi = () =>
    api.get("/attendance/my");

export const monthlyAttendanceApi = (month, year) =>
    api.get(`/attendance/monthly-summary?month=${month}&year=${year}`);