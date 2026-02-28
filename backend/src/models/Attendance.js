import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    checkIn: {
      type: Date,
    },
    checkout: {
      type: Date,
    },
    status: {
      type: String,
      enum: ["present", "absent", "half-day"],
      default: "present",
    },
  },
  {
    timestamps: true,
  },
);

attendanceSchema.index({ userId: 1, date: 1 }, { unique: true });

export default mongoose.model("Attendance", attendanceSchema);
