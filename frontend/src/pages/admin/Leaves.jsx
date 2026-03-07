import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getAllLeavesApi,
  updateLeaveStatusApi
} from "../../api/adminApi";
import "../../styles/Leaves.css";

export default function Leaves() {
  const [leaves, setLeaves] = useState([]);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      const res = await getAllLeavesApi();
      setLeaves(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load leaves");
    }
  };

  useEffect(() => {
    (async () => {
      await load();
    })();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await updateLeaveStatusApi(id, status);
      await load();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update leave");
    }
  };

  return (
    <div className="leaves-page">
      <div className="leaves-card">
        <div className="leaves-header">
          <h2 className="leaves-title">All Leaves</h2>
          <Link className="leaves-back" to="/dashboard">Back</Link>
        </div>

        {error ? <p className="leaves-error">{error}</p> : null}

        {!error && leaves.length === 0 ? (
          <p className="leaves-empty">No leave requests found.</p>
        ) : null}

        {!error && leaves.length > 0 ? (
          <div className="leaves-table">
            <div className="leaves-row leaves-row-head">
              <span>Employee</span>
              <span>Reason</span>
              <span>Status</span>
              <span>Actions</span>
            </div>

            {leaves.map((l) => (
              <div className="leaves-row" key={l._id}>
                <span>{l.userId?.name || "Unknown"}</span>
                <span className="leaves-reason">{l.reason}</span>
                <span className="leaves-status">{l.status}</span>

                <div className="leaves-actions">
                  <button
                    className="leaves-btn leaves-btn-approve"
                    onClick={() => updateStatus(l._id, "approved")}
                  >
                    Approve
                  </button>

                  <button
                    className="leaves-btn leaves-btn-reject"
                    onClick={() => updateStatus(l._id, "rejected")}
                  >
                    Reject
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