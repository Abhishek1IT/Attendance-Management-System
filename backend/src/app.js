import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";

import authRoutes from "./routes/authroute.js";
import attendanceRoutes from "./routes/attendanceroute.js";
import leaveRoutes from "./routes/leaveroute.js";
import userRoutes from "./routes/userroute.js";

dotenv.config();

const app = express();

app.use(
  cors({
    origin: "*", 
    credentials: true
  })
);
app.use(morgan("dev"));
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leave", leaveRoutes);
app.use("/api/user", userRoutes);
app.get("/", (req, res) => {
  res.json({ message: "Attendance API running" });
});

export default app;