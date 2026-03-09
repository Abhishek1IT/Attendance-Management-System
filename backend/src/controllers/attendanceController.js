import Attendance from "../models/Attendance.js";
import { sendEmail } from "../utils/sendEmail.js";
import {
  getToday,
  getWorkingMinutes,
  getStatusByWorkingMinutes,
  getEffectiveStatus,
  withWorkingHours,
} from "../utils/attendanceUtils.js";

const EMAIL_TIME_ZONE = process.env.EMAIL_TIME_ZONE || "Asia/Kolkata";

const formatEmailTime = (value) => {
  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: EMAIL_TIME_ZONE,
  }).format(new Date(value));
};

const buildAttendanceEmailHtml = ({ title, name, date, details = [] }) => {
  const detailRows = details
    .map(
      (item) =>
        `<tr><td style=\"padding:8px 0;color:#475569;\">${item.label}</td><td style=\"padding:8px 0;color:#0f172a;font-weight:600;\">${item.value}</td></tr>`,
    )
    .join("");

  return `
    <div style="background:#f8fafc;padding:24px;font-family:Arial,sans-serif;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;">
        <h2 style="margin:0 0 10px;color:#0f172a;">${title}</h2>
        <p style="margin:0 0 14px;color:#334155;">Hello ${name}, your attendance update is recorded.</p>
        <table style="width:100%;border-collapse:collapse;">${detailRows}</table>
        <p style="margin:16px 0 0;color:#64748b;font-size:13px;">Date: ${date}</p>
      </div>
    </div>
  `;
};

export const markAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const today = getToday();

    let attendance = await Attendance.findOne({
      userId,
      date: today,
    });

    if (!attendance) {
      attendance = await Attendance.create({
        userId,
        date: today,
        checkIn: new Date(),
        status: "present",
      });

      const responseAttendance = withWorkingHours(attendance.toObject());

      await sendEmail(
        req.user.email,
        "Check-in Successful",
        `You have successfully checked in on ${today}.`,
        buildAttendanceEmailHtml({
          title: "Check-in Successful",
          name: req.user.name || "User",
          date: today,
          details: [
            { label: "Status", value: "Checked In" },
            {
              label: "Check-in Time",
              value: formatEmailTime(attendance.checkIn),
            },
          ],
        }),
      );

      return res.status(201).json({
        message: "Checked in successfully",
        attendance: responseAttendance,
      });
    }

    if (attendance.checkIn && !attendance.checkout) {
      attendance.checkout = new Date();
      const workingMinutes = getWorkingMinutes(attendance);
      attendance.status = getStatusByWorkingMinutes(workingMinutes);
      await attendance.save();

      const responseAttendance = withWorkingHours(attendance.toObject());

      await sendEmail(
        req.user.email,
        "Checkout Successful",
        `You have successfully checked out on ${today}. Total working hours: ${responseAttendance.workingHours}.`,
        buildAttendanceEmailHtml({
          title: "Checkout Successful",
          name: req.user.name || "User",
          date: today,
          details: [
            { label: "Status", value: "Checked Out" },
            {
              label: "Check-in Time",
              value: formatEmailTime(attendance.checkIn),
            },
            {
              label: "Checkout Time",
              value: formatEmailTime(attendance.checkout),
            },
            {
              label: "Working Hours",
              value: `${responseAttendance.workingHours} h`,
            },
          ],
        }),
      );

      return res.json({
        message: "Checked out successfully",
        attendance: responseAttendance,
      });
    }

    return res.status(200).json({
      message: "You have already checked in and checked out today",
      attendance: withWorkingHours(attendance.toObject()),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const myAttendance = async (req, res) => {
  try {
    const userId = req.user.id;

    const list = await Attendance.find({ userId }).sort({ date: -1 }).lean();

    const result = list.map((a) => withWorkingHours(a));

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const monthlyAttendance = async (req, res) => {
  try {
    const userId = req.user.id;
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({ message: "Month and year are required" });
    }
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const list = await Attendance.find({
      userId,
      checkIn: { $gte: startDate, $lt: endDate },
    }).lean();

    let totalWorkingMinutes = 0;
    let presentDays = 0;
    let halfDays = 0;

    list.forEach((a) => {
      const normalizedStatus = getEffectiveStatus(a);

      if (normalizedStatus === "present") {
        presentDays += 1;
      }

      if (normalizedStatus.includes("half")) {
        halfDays += 1;
      }

      totalWorkingMinutes += getWorkingMinutes(a);
    });

    res.json({
      month,
      year,
      totalRecords: list.length,
      presentDays,
      halfDays,
      totalWorkingHours: Number((totalWorkingMinutes / 60).toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find()
      .populate("userId", "name email")
      .sort({ date: -1 })
      .lean();

    const result = attendance.map((a) => withWorkingHours(a));

    res.status(200).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateAttendance = async (req, res) => {
  const { id } = req.params;
  const { status, remark } = req.body;

  try {
    const updaterecord = await Attendance.findByIdAndUpdate(
      id,
      { status, remark, updatedAt: new Date() },
      { new: true },
    );

    if (!updaterecord) {
      return res.status(404).json({ message: "Attendance record not found" });
    }

    res.status(200).json({
      message: "Attendance record updated successfully",
      data: updaterecord,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
