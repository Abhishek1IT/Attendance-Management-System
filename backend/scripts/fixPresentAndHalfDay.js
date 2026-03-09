import mongoose from "mongoose";
import dotenv from "dotenv";

import Attendance from "../src/models/Attendance.js";
import {
  getToday,
  getWorkingMinutes,
  getStatusByWorkingMinutes,
} from "../src/utils/attendanceUtils.js";

dotenv.config();

const fixpresentAndHalfDay = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const today = getToday();

    if (new Date().getDay() === 0) {
      console.log("Today is Sunday. Skipping.");
      process.exit(0);
    }

    const recorde = await Attendance.find({
      date: today,
      checkIn: { $ne: null },
      checkout: { $ne: null },
    });

    let presentCount = 0;
    let halfDayCount = 0;
    let absentCount = 0;

    for (const rec of recorde) {
      const workingMinutes = getWorkingMinutes(rec);
      const computedStatus = getStatusByWorkingMinutes(workingMinutes);
      rec.status = computedStatus;

      if (computedStatus === "absent") {
        rec.remark = "Auto Absent (Very low working hours)";
        absentCount++;
      } else if (computedStatus === "half-day") {
        rec.remark = "Auto Half Day (Low working hours)";
        halfDayCount++;
      } else {
        rec.remark = "Auto Present (Sufficient working hours)";
        presentCount++;
      }

      await rec.save();
    }

    console.log("Present fixed:", presentCount);
    console.log("Half-day fixed:", halfDayCount);
    console.log("Absent fixed:", absentCount);

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
};

fixpresentAndHalfDay();
