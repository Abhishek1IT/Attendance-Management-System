import Leave from "../models/Leave.js";
import User from "../models/User.js";
import { sendEmail } from "../utils/sendEmail.js";

const buildLeaveStatusEmailHtml = ({ name, status, fromDate, toDate, reason }) => {
  return `
    <div style="background:#f8fafc;padding:24px;font-family:Arial,sans-serif;">
      <div style="max-width:560px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:12px;padding:20px;">
        <h2 style="margin:0 0 10px;color:#0f172a;">Leave ${status}</h2>
        <p style="margin:0 0 14px;color:#334155;">Hello ${name}, your leave request has been <strong>${status}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#475569;">From</td><td style="padding:8px 0;color:#0f172a;font-weight:600;">${fromDate}</td></tr>
          <tr><td style="padding:8px 0;color:#475569;">To</td><td style="padding:8px 0;color:#0f172a;font-weight:600;">${toDate}</td></tr>
          <tr><td style="padding:8px 0;color:#475569;">Reason</td><td style="padding:8px 0;color:#0f172a;font-weight:600;">${reason || "-"}</td></tr>
          <tr><td style="padding:8px 0;color:#475569;">Status</td><td style="padding:8px 0;color:#0f172a;font-weight:600;">${status}</td></tr>
        </table>
      </div>
    </div>
  `;
};

export const applyLeave = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fromDate, toDate, reason } = req.body;

    if (!fromDate || !toDate || !reason) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const overlap = await Leave.findOne({
      userId,
      fromDate: { $lte: toDate },
      toDate: { $gte: fromDate },
    });

    if (overlap) {
      return res.status(400).json({
        message: "Leave already exists for selected dates",
      });
    }

    const leave = await Leave.create({
      userId,
      fromDate,
      toDate,
      reason,
      status: "Pending",
    });

    return res.status(201).json({
      message: "Leave applied successfully",
      leave,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const myLeaves = async (req, res) => {
  try {
    const userId = req.user.id;
    const leaves = await Leave.find({ userId }).sort({ createdAt: -1 });

    return res.json(leaves);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find()
      .populate("userId", "name email")
      .populate("approvedBy", "name email")
      .sort({ createdAt: -1 });

    return res.json(leaves);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateLeaveStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const normalizedStatus =
      status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();

    if (!["Approved", "Rejected"].includes(normalizedStatus)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const leave = await Leave.findById(id);

    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (leave.userId.toString() === req.user.id) {
      return res
        .status(403)
        .json({ message: "You cannot approve your own leave" });
    }

    leave.status = normalizedStatus;
    leave.approvedBy = req.user.id;
    await leave.save();

    // Send notification email to employee after leave status update.
    const employee = await User.findById(leave.userId).select("name email");

    if (employee?.email) {
      const fromDate = new Date(leave.fromDate).toLocaleDateString();
      const toDate = new Date(leave.toDate).toLocaleDateString();
      const emailSent = await sendEmail(
        employee.email,
        `Leave ${normalizedStatus}`,
        `Hello ${employee.name || "User"}, your leave request from ${fromDate} to ${toDate} has been ${normalizedStatus}.`,
        buildLeaveStatusEmailHtml({
          name: employee.name || "User",
          status: normalizedStatus,
          fromDate,
          toDate,
          reason: leave.reason,
        }),
      );

      if (!emailSent) {
        console.warn(`Leave status email failed for leaveId: ${leave._id}`);
      }
    }

    return res.json({
      message: "Leave status updated successfully",
      leave,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};