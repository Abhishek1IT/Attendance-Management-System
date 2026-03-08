import { useEffect, useState } from "react";
import { monthlyAttendanceApi, myAttendanceApi } from "../api/attendanceApi";
import { Link } from "react-router-dom";
import "../styles/MyAttendance.css";

export default function MyAttendance() {
    const [data, setData] = useState([]);
    const [error, setError] = useState("");
    const [monthlyError, setMonthlyError] = useState("");
    const [monthlySummary, setMonthlySummary] = useState(null);

    const now = new Date();
    const [month, setMonth] = useState(now.getMonth() + 1);
    const [year, setYear] = useState(now.getFullYear());

    useEffect(() => {
        myAttendanceApi()
            .then(res => setData(res.data))
            .catch((err) => {
                setError(err.response?.data?.message || "Unable to load attendance");
            });
    }, []);

    useEffect(() => {
        monthlyAttendanceApi(month, year)
            .then((res) => {
                setMonthlySummary(res.data);
                setMonthlyError("");
            })
            .catch((err) => {
                setMonthlyError(err.response?.data?.message || "Unable to load monthly summary");
            });
    }, [month, year]);

    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ];

    const formatTime = (value) => {
        if (!value) return "-";
        return new Date(value).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const getStatusLabel = (status) => {
        if (status === "checkout-pending") {
            return "Checkout Pending";
        }

        return status;
    };

    return (
        <div className="my-attendance-page">
            <div className="my-attendance-card">
                <div className="my-attendance-header">
                    <h2 className="my-attendance-title">My Attendance</h2>
                    <Link className="my-attendance-back" to="/dashboard">Back</Link>
                </div>

                <div className="my-attendance-monthly-card">
                    <h3 className="my-attendance-monthly-title">Monthly Attendance</h3>

                    <div className="my-attendance-monthly-filter">
                        <select
                            className="my-attendance-filter-input"
                            value={month}
                            onChange={(e) => setMonth(Number(e.target.value))}
                        >
                            {monthNames.map((name, index) => (
                                <option key={name} value={index + 1}>{name}</option>
                            ))}
                        </select>

                        <input
                            className="my-attendance-filter-input"
                            type="number"
                            value={year}
                            min="2000"
                            max="2100"
                            onChange={(e) => setYear(Number(e.target.value))}
                        />
                    </div>

                    {monthlyError ? <p className="my-attendance-error">{monthlyError}</p> : null}

                    {!monthlyError && monthlySummary ? (
                        <div className="my-attendance-monthly-grid">
                            <div className="my-attendance-monthly-item">
                                <span>Total Records</span>
                                <strong>{monthlySummary.totalRecords}</strong>
                            </div>
                            <div className="my-attendance-monthly-item">
                                <span>Present Days</span>
                                <strong>{monthlySummary.presentDays}</strong>
                            </div>
                            <div className="my-attendance-monthly-item">
                                <span>Half Days</span>
                                <strong>{monthlySummary.halfDays}</strong>
                            </div>
                            <div className="my-attendance-monthly-item">
                                <span>Total Working Hours</span>
                                <strong>{monthlySummary.totalWorkingHours}</strong>
                            </div>
                        </div>
                    ) : null}
                </div>

                {error ? <p className="my-attendance-error">{error}</p> : null}

                {!error && data.length === 0 ? (
                    <p className="my-attendance-empty">No attendance records found.</p>
                ) : null}

                {!error && data.length > 0 ? (
                    <div className="my-attendance-table">
                        <div className="my-attendance-row my-attendance-row-head">
                            <span>Date</span>
                            <span>Status</span>
                            <span>Check In</span>
                            <span>Check Out</span>
                            <span>Hours</span>
                        </div>
                        {data.map((d) => (
                            <div className="my-attendance-row" key={d._id}>
                                <span>{new Date(d.date).toLocaleDateString()}</span>
                                <span className="my-attendance-status">{getStatusLabel(d.status)}</span>
                                <span>{formatTime(d.checkIn)}</span>
                                <span>{formatTime(d.checkout)}</span>
                                <span>{d.workingHours ?? 0} h</span>
                            </div>
                        ))}
                    </div>
                ) : null}
            </div>
        </div>
    )
}