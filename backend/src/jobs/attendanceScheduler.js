import Attendance from "../models/Attendance.js";
import Leave from "../models/Leave.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";
import {
  getToday,
  getWorkingMinutes,
  getStatusByWorkingMinutes,
} from "../utils/attendanceUtils.js";

const SCHEDULER_TIME_ZONE = process.env.SCHEDULER_TIME_ZONE || "Asia/Kolkata";
const AUTO_ABSENT_TIME = process.env.AUTO_ABSENT_TIME || "18:30";
const ATTENDANCE_FIX_TIME = process.env.ATTENDANCE_FIX_TIME || "23:50";

const executedForDate = {
  autoAbsent: null,
  attendanceFix: null,
};

const buildAbsentEmailHtml = (date) => `
  <div style="background:#f8fafc;padding:24px;font-family:Arial,sans-serif;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;">
      <h2 style="margin:0 0 10px;color:#991b1b;">Absent Notification</h2>
      <p style="margin:0 0 12px;color:#334155;">You were marked absent because no check-in was recorded.</p>
      <p style="margin:0;color:#0f172a;font-weight:600;">Date: ${date}</p>
    </div>
  </div>
`;

const getClockInTimeZone = (date = new Date()) => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: SCHEDULER_TIME_ZONE,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).formatToParts(date);

  const val = (type) => parts.find((p) => p.type === type)?.value || "";
  return {
    date: `${val("year")}-${val("month")}-${val("day")}`,
    time: `${val("hour")}:${val("minute")}`,
  };
};

const runAutoMarkAbsent = async () => {
  const today = getToday();

  if (new Date().getDay() === 0) {
    console.log("[Scheduler] Sunday detected. Skipping auto absent.");
    return;
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  const [attendedIds, approvedLeaveIds] = await Promise.all([
    Attendance.find({ date: today }).distinct("userId"),
    Leave.find({
      status: "Approved",
      fromDate: { $lt: todayEnd },
      toDate: { $gte: todayStart },
    }).distinct("userId"),
  ]);

  const attendedIdStrings = new Set(attendedIds.map((id) => id.toString()));
  const approvedLeaveIdStrings = new Set(approvedLeaveIds.map((id) => id.toString()));
  const attendanceOrLeaveIds = [
    ...new Set([...attendedIdStrings, ...approvedLeaveIdStrings]),
  ];

  const usersToMarkAbsent = await User.find(
    {
      _id: { $nin: attendanceOrLeaveIds },
      isActive: true,
      role: "Employee",
    },
    "_id email",
  );

  const bulkAbsent = usersToMarkAbsent.map((user) => ({
    userId: user._id,
    date: today,
    status: "absent",
    remark: "System Auto-Absent",
    isManualStatus: false,
  }));

  const usersOnLeave = [...approvedLeaveIdStrings].filter(
    (id) => !attendedIdStrings.has(id),
  );

  const bulkLeave = usersOnLeave.map((id) => ({
    userId: id,
    date: today,
    status: "on-leave",
    remark: "Approved Leave",
    isManualStatus: false,
  }));

  if (bulkAbsent.length > 0) {
    await Attendance.insertMany(bulkAbsent, { ordered: false });
  }

  if (bulkLeave.length > 0) {
    await Attendance.insertMany(bulkLeave, { ordered: false });
  }

  const absentEmailPromises = usersToMarkAbsent
    .filter((user) => Boolean(user.email))
    .map((user) =>
      sendEmail(
        user.email,
        "Absent Notification",
        `You were marked absent for ${today} because no check-in was recorded.`,
        buildAbsentEmailHtml(today),
      ),
    );

  if (absentEmailPromises.length > 0) {
    await Promise.allSettled(absentEmailPromises);
  }

  console.log(`[Scheduler] Auto-absent done for ${today}.`);
  console.log(`[Scheduler] - Marked Absent: ${bulkAbsent.length}`);
  console.log(`[Scheduler] - Marked On-Leave: ${bulkLeave.length}`);
};

const runAttendanceFix = async () => {
  const today = getToday();

  if (new Date().getDay() === 0) {
    console.log("[Scheduler] Sunday detected. Skipping attendance fix.");
    return;
  }

  const records = await Attendance.find({
    date: today,
    checkIn: { $ne: null },
    checkout: { $ne: null },
  });

  let presentCount = 0;
  let halfDayCount = 0;
  let absentCount = 0;

  for (const rec of records) {
    const workingMinutes = getWorkingMinutes(rec);
    const computedStatus = getStatusByWorkingMinutes(workingMinutes);

    rec.status = computedStatus;
    rec.isManualStatus = false;

    if (computedStatus === "absent") {
      rec.remark = "Auto Absent (Very low working hours)";
      absentCount += 1;
    } else if (computedStatus === "half-day") {
      rec.remark = "Auto Half Day (Low working hours)";
      halfDayCount += 1;
    } else {
      rec.remark = "Auto Present (Sufficient working hours)";
      presentCount += 1;
    }

    await rec.save();
  }

  console.log(`[Scheduler] Attendance fix done for ${today}.`);
  console.log(`[Scheduler] - Present fixed: ${presentCount}`);
  console.log(`[Scheduler] - Half-day fixed: ${halfDayCount}`);
  console.log(`[Scheduler] - Absent fixed: ${absentCount}`);
};

const runScheduledTask = async (taskName, taskRunner, dateKey) => {
  try {
    await taskRunner();
    executedForDate[taskName] = dateKey;
  } catch (error) {
    if (error?.code === 11000 || error?.name === "BulkWriteError") {
      console.log(`[Scheduler] ${taskName} duplicate records handled.`);
      executedForDate[taskName] = dateKey;
      return;
    }

    console.error(`[Scheduler] ${taskName} failed:`, error.message);
  }
};

const checkAndRunSchedules = async () => {
  const { date, time } = getClockInTimeZone();

  if (time === AUTO_ABSENT_TIME && executedForDate.autoAbsent !== date) {
    await runScheduledTask("autoAbsent", runAutoMarkAbsent, date);
  }

  if (time === ATTENDANCE_FIX_TIME && executedForDate.attendanceFix !== date) {
    await runScheduledTask("attendanceFix", runAttendanceFix, date);
  }
};

export const startAttendanceScheduler = () => {
  console.log(
    `[Scheduler] Started (${SCHEDULER_TIME_ZONE}) | auto-absent: ${AUTO_ABSENT_TIME}, fix: ${ATTENDANCE_FIX_TIME}`,
  );

  setInterval(() => {
    checkAndRunSchedules().catch((error) => {
      console.error("[Scheduler] Tick failed:", error.message);
    });
  }, 60 * 1000);
};
