import { markAttendanceApi, myAttendanceApi } from "../api/attendanceApi";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "../styles/Dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();
  const [message, setMessage] = useState("");
  const [canMark, setCanMark] = useState(true);
  const [isMarking, setIsMarking] = useState(false);

  const today = useMemo(() => new Date().toLocaleDateString("en-CA"), []);

  const user = useMemo(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }, []);

  const employeeLinks = [
    { to: "/my-attendance", label: "My Attendance" },
    { to: "/apply-leave", label: "Apply Leave" },
    { to: "/my-leaves", label: "My Leaves" },
    { to: "/profile", label: "Profile" }
  ];

  const adminLinks = [
    { to: "/admin/users", label: "Manage Users" },
    { to: "/admin/leaves", label: "Manage Leaves" },
    { to: "/admin/attendance", label: "Manage Attendance" }
  ];

  useEffect(() => {
    const loadTodayAttendance = async () => {
      try {
        const res = await myAttendanceApi();
        const todayAttendance = res.data?.find((item) => item.date === today);

        if (todayAttendance?.checkIn && todayAttendance?.checkout) {
          setCanMark(false);
          setMessage("You have already checked in and checked out today");
          return;
        }

        setCanMark(true);
      } catch {
        setCanMark(true);
      }
    };

    loadTodayAttendance();
  }, [today]);

  const mark = async () => {
    if (!canMark || isMarking) return;

    setIsMarking(true);
    try {
      const response = await markAttendanceApi();
      const responseMessage = response.data?.message || "Attendance marked";
      const attendance = response.data?.attendance;

      setMessage(responseMessage);

      if (
        responseMessage.toLowerCase().includes("already checked in and checked out") ||
        (attendance?.checkIn && attendance?.checkout)
      ) {
        setCanMark(false);
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to mark attendance right now. Please try again.";
      setMessage(message);

      if (message.toLowerCase().includes("already checked in and checked out")) {
        setCanMark(false);
      }
    } finally {
      setIsMarking(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <h2 className="dashboard-sidebar-title">Attendance Panel</h2>
        <p className="dashboard-sidebar-user">{user?.name || "User"}</p>

        <h3 className="dashboard-nav-title">Employee Forms</h3>
        <nav className="dashboard-nav-list">
          {employeeLinks.map((item) => (
            <Link key={item.to} className="dashboard-nav-link" to={item.to}>
              {item.label}
            </Link>
          ))}
        </nav>

        {user?.role?.toLowerCase() === "admin" ? (
          <>
            <h3 className="dashboard-nav-title">Admin Forms</h3>
            <nav className="dashboard-nav-list">
              {adminLinks.map((item) => (
                <Link key={item.to} className="dashboard-nav-link" to={item.to}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </>
        ) : null}

        <button className="dashboard-button dashboard-logout" onClick={logout}>
          Logout
        </button>
      </aside>

      <main className="dashboard-main">
        <div className="dashboard-card">
          <h2 className="dashboard-title">Dashboard</h2>
          <p className="dashboard-welcome">Welcome {user?.name || "User"}</p>

          <button className="dashboard-button" onClick={mark} disabled={!canMark || isMarking}>
            {isMarking
              ? "Please wait..."
              : canMark
                ? "Mark Attendance"
                : "Attendance Closed for Today"}
          </button>
          {message ? <p className="dashboard-message">{message}</p> : null}

        </div>
      </main>
    </div>
  );
}