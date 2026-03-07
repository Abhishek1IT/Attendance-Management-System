import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { myLeavesApi } from "../api/leaveApi";
import "../styles/MyLeave.css";

export default function MyLeaves() {
  const [data, setData] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    myLeavesApi()
      .then((res) => setData(res.data))
      .catch((err) => {
        setError(err.response?.data?.message || "Unable to load leaves");
      });
  }, []);

  return (
    <div className="my-leaves-page">
      <div className="my-leaves-card">
        <div className="my-leaves-header">
          <h2 className="my-leaves-title">My Leaves</h2>
          <Link className="my-leaves-back" to="/dashboard">
            Back
          </Link>
        </div>

        {error ? <p className="my-leaves-error">{error}</p> : null}

        {!error && data.length === 0 ? (
          <p className="my-leaves-empty">No leave records found.</p>
        ) : null}

        {!error && data.length > 0 ? (
          <div className="my-leaves-table">
            <div className="my-leaves-row my-leaves-row-head">
              <span>Reason</span>
              <span>Status</span>
            </div>
            {data.map((l) => (
              <div className="my-leaves-row" key={l._id}>
                <span>{l.reason}</span>
                <span className="my-leaves-status">{l.status}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}