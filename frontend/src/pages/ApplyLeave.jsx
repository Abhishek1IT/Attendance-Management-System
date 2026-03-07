import { useState } from "react";
import { Link } from "react-router-dom";
import { applyLeaveApi } from "../api/leaveApi";
import "../styles/ApplyLeave.css";

export default function ApplyLeave() {
  const [form, setForm] = useState({
    fromDate: "",
    toDate: "",
    reason: ""
  });

  const submit = async (e) => {
    e.preventDefault();
    await applyLeaveApi(form);
    alert("Leave applied");
  };

  return (
    <div className="apply-leave-page">
      <form className="apply-leave-card" onSubmit={submit}>
        <div className="apply-leave-header">
          <h2 className="apply-leave-title">Leave Application</h2>
          <Link className="apply-leave-back" to="/dashboard">
            Back
          </Link>
        </div>

        <div className="apply-leave-grid">
          <div className="apply-leave-field">
            <label className="apply-leave-label" htmlFor="fromDate">
              From Date
            </label>
            <input
              id="fromDate"
              className="apply-leave-input"
              type="date"
              onChange={(e) =>
                setForm({ ...form, fromDate: e.target.value })
              }
            />
          </div>

          <div className="apply-leave-field">
            <label className="apply-leave-label" htmlFor="toDate">
              To Date
            </label>
            <input
              id="toDate"
              className="apply-leave-input"
              type="date"
              onChange={(e) =>
                setForm({ ...form, toDate: e.target.value })
              }
            />
          </div>
        </div>

        <div className="apply-leave-field">
          <label className="apply-leave-label" htmlFor="reason">
            Reason
          </label>
          <textarea
            id="reason"
            className="apply-leave-input apply-leave-textarea"
            placeholder="Enter reason"
            rows="4"
            onChange={(e) =>
              setForm({ ...form, reason: e.target.value })
            }
          />
        </div>

        <button className="apply-leave-button" type="submit">
          Apply Leave
        </button>
      </form>
    </div>
  );
}