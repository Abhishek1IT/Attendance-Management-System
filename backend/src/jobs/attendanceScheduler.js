import cron from 'node-cron';
import Attendance  from '../models/Attendance.js';

export const startAttendanceScheduler = () => {
  cron.schedule("0 * * * *", async () => { 
    console.log("Running attendance scheduler...");

    try {
      const records = await Attendance.find({ status: "pending" });

      for (const record of records) {
        const login = record.loginTime;
        const logout = record.logoutTime;

        if (!login) {
          record.status = "absent";
        } 
        else if (login && !logout) {
          
          continue;
        } 
        else {
          const minutes =
            (new Date(logout) - new Date(login)) / (1000 * 60);

          if (minutes >= 480) {
            record.status = "present";
          } else if (minutes >= 240) {
            record.status = "half-day";
          } else {
            record.status = "absent";
          }
        }

        await record.save();
      }

    } catch (err) {
      console.log("Cron error:", err);
    }
  });

};