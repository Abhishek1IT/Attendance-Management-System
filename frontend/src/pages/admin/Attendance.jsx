import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAllAttendanceApi,
  updateAttendanceApi
} from "../../api/adminApi";
import "../../styles/Attendance.css";

export default function Attendance() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  const reloadAttendance = async () => {
    try {
      const res = await getAllAttendanceApi();
      setData(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load attendance");
    }
  };

  useEffect(() => {
    (async () => {
      await reloadAttendance();
    })();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await updateAttendanceApi(id, status);
      await reloadAttendance();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update attendance");
    }
  };

  return (
    <div className="attendance-page">
      <div className="attendance-card">
        <div className="attendance-header">
          <h2 className="attendance-title">All Attendance</h2>
          <Link className="attendance-back" to="/dashboard">Back</Link>
        </div>

        {error ? <p className="attendance-error">{error}</p> : null}

        {!error && data.length === 0 ? (
          <p className="attendance-empty">No attendance records found.</p>
        ) : null}

        {!error && data.length > 0 ? (
          <div className="attendance-table">
            <div className="attendance-row attendance-row-head">
              <span>Employee</span>
              <span>Status</span>
              <span>Hours</span>
              <span>Actions</span>
            </div>

            {data.map((a) => (
              <div className="attendance-row" key={a._id}>
                <span>{a.userId?.name || "Unknown"}</span>
                <span className="attendance-status">{a.status}</span>
                <span>{a.workingHours ?? 0} h</span>

                <div className="attendance-actions">
                  <button
                    className="attendance-btn attendance-btn-present"
                    onClick={() => updateStatus(a._id, "present")}
                  >
                    Present
                  </button>

                  <button
                    className="attendance-btn attendance-btn-absent"
                    onClick={() => updateStatus(a._id, "absent")}
                  >
                    Absent
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}