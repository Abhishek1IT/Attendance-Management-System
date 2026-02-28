import Attendance from "../models/Attendance.js";

const getToday = () => new Date().toISOString().split("T")[0];

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

      return res.status(201).json({
        message: "Checked in successfully",
        attendance,
      });
    }

    if (attendance.checkIn && !attendance.checkout) {
      attendance.checkout = new Date();
      await attendance.save();

      return res.json({
        message: "Checked out successfully",
        attendance,
      });
    }

    return res.status(400).json({
      message: "You have already checked in and checked out today",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const myAttendance = async (req, res) => {
  try {
    const userId = req.user.id;

    const list = await Attendance.find({ userId }).sort({ date: -1 }).lean();

    const result = list.map((a) => {
      let workingMinutes = 0;

      if (a.checkIn && a.checkout) {
        workingMinutes =
          (new Date(a.checkout) - new Date(a.checkIn)) / (1000 * 60);
      }

      return {
        ...a,
        workingHours: Number((workingMinutes / 60).toFixed(2)),
      };
    });

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
      if (a.checkIn && a.checkout) {
        const diff = (new Date(a.checkout) - new Date(a.checkIn)) / (1000 * 60);
        if (diff > 0) {
          totalWorkingMinutes += diff;
        }
      }
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