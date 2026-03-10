import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAllAttendanceApi,
  getTodayAttendanceOverviewApi,
  updateAttendanceApi
} from "../../api/adminApi";
import "../../styles/Attendance.css";

export default function Attendance() {
  const [data, setData] = useState([]);
  const [overview, setOverview] = useState(null);
  const [error, setError] = useState("");

  const reloadAttendance = async () => {
    try {
      const [attendanceRes, overviewRes] = await Promise.all([
        getAllAttendanceApi(),
        getTodayAttendanceOverviewApi(),
      ]);

      setData(attendanceRes.data);
      setOverview(overviewRes.data);
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

        {!error && overview ? (
          <div className="attendance-overview-wrap">
            <div className="attendance-overview-head">
              <h3>Today Overview ({overview.date})</h3>
              <p>Total Employees: {overview.summary?.totalEmployees ?? 0}</p>
            </div>

            <div className="attendance-overview-cards">
              <div className="attendance-overview-card attendance-overview-came">
                <strong>Came</strong>
                <span>{overview.summary?.came ?? 0}</span>
              </div>
              <div className="attendance-overview-card attendance-overview-notcame">
                <strong>Not Came</strong>
                <span>{overview.summary?.notCame ?? 0}</span>
              </div>
              <div className="attendance-overview-card attendance-overview-leave">
                <strong>On Leave</strong>
                <span>{overview.summary?.onLeave ?? 0}</span>
              </div>
            </div>

            <div className="attendance-overview-lists">
              <div className="attendance-mini-list">
                <h4>Came to Office</h4>
                {overview.came?.length ? (
                  <ul>
                    {overview.came.map((u) => (
                      <li key={u._id}>{u.name} ({u.status})</li>
                    ))}
                  </ul>
                ) : (
                  <p>No one marked present yet.</p>
                )}
              </div>

              <div className="attendance-mini-list">
                <h4>Not Came</h4>
                {overview.notCame?.length ? (
                  <ul>
                    {overview.notCame.map((u) => (
                      <li key={u._id}>{u.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p>All employees are marked.</p>
                )}
              </div>

              <div className="attendance-mini-list">
                <h4>On Leave</h4>
                {overview.onLeave?.length ? (
                  <ul>
                    {overview.onLeave.map((u) => (
                      <li key={u._id}>{u.name}</li>
                    ))}
                  </ul>
                ) : (
                  <p>No approved leave for today.</p>
                )}
              </div>
            </div>
          </div>
        ) : null}

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