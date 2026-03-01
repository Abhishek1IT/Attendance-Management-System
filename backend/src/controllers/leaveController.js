import Leave from "../models/Leave.js";

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

    return res.json({
      message: "Leave status updated successfully",
      leave,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};