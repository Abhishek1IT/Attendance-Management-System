import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../src/models/User.js";
import Attendance from "../src/models/Attendance.js";
import Leave from "../src/models/Leave.js"; 

dotenv.config();

const markAbsent = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const today = new Date().toLocaleDateString('en-CA'); 
    
    if (new Date().getDay() === 0) {
      console.log("Today is Sunday. Skipping.");
      process.exit(0);
    }

    const [attendedIds, approvedLeaves] = await Promise.all([
      Attendance.find({ date: today }).distinct("userId"),
      Leave.find({ 
        status: "approved", 
        fromDate: { $lte: today }, 
        toDate: { $gte: today } 
      }).select("userId")
    ]);

    const approvedLeaveIds = approvedLeaves.map(l => l.userId.toString());

    
    const usersToMarkAbsent = await User.find({
      _id: { $nin: [...attendedIds, ...approvedLeaveIds] },
      status: "active" 
    }, "_id");

    const bulkAbsent = usersToMarkAbsent.map(user => ({
      userId: user._id,
      date: today,
      status: "absent",
      remark: "System Auto-Absent"
    }));

    const usersOnLeave = approvedLeaveIds.filter(id => !attendedIds.includes(id));
    const bulkLeave = usersOnLeave.map(id => ({
      userId: id,
      date: today,
      status: "on-leave",
      remark: "Approved Leave"
    }));

    if (bulkAbsent.length > 0) await Attendance.insertMany(bulkAbsent, { ordered: false });
    if (bulkLeave.length > 0) await Attendance.insertMany(bulkLeave, { ordered: false });

    console.log(`Summary for ${today}:`);
    console.log(`- Marked Absent: ${bulkAbsent.length}`);
    console.log(`- Marked On-Leave: ${bulkLeave.length}`);

    process.exit(0);

  } catch (err) {
    if (err.code === 11000 || err.name === 'BulkWriteError') {
      console.log("Processing finished (duplicates handled).");
      process.exit(0);
    }
    console.error("Error occurred:", err.message);
    process.exit(1);
  }
};

markAbsent();