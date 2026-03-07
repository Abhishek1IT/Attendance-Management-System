import mongoose from "mongoose";
import dotenv from "dotenv";

import Attendance from "../src/models/Attendance.js";

dotenv.config();

const fixpresentAndHalfDay = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const today = new Date().toLocaleDateString("en-CA");

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
      const start = new Date(rec.checkIn);
      const end = new Date(rec.checkout);

      const minutes = (end - start) / (1000 * 60);
      const hours = minutes / 60;

      if (hours <= 4) {
        rec.status = "absent";
        rec.remark = "Auto Absent (Very low working hours)";
        absentCount++;
      } else if (hours < 6) {
        rec.status = "half-day";
        rec.remark = "Auto Half Day (Low working hours)";
        halfDayCount++;
      } else {
        rec.status = "present";
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
