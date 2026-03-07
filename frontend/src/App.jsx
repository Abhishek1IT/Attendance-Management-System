import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import MyAttendance from "./pages/MyAttendance.jsx";
import ApplyLeave from "./pages/ApplyLeave.jsx";
import MyLeaves from "./pages/MyLeave.jsx";
import Profile from "./pages/Profile.jsx";

import Users from "./pages/admin/Users.jsx";
import Leaves from "./pages/admin/Leaves.jsx";
import Attendance from "./pages/admin/Attendance.jsx";

function getStoredUser() {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function RequireAuth({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function RequireAdmin({ children }) {
  const token = localStorage.getItem("token");
  const user = getStoredUser();

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (user?.role?.toLowerCase() !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/my-attendance"
          element={
            <RequireAuth>
              <MyAttendance />
            </RequireAuth>
          }
        />
        <Route
          path="/apply-leave"
          element={
            <RequireAuth>
              <ApplyLeave />
            </RequireAuth>
          }
        />
        <Route
          path="/my-leaves"
          element={
            <RequireAuth>
              <MyLeaves />
            </RequireAuth>
          }
        />
        <Route
          path="/profile"
          element={
            <RequireAuth>
              <Profile />
            </RequireAuth>
          }
        />

        {/* admin */}
        <Route
          path="/admin/users"
          element={
            <RequireAdmin>
              <Users />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/leaves"
          element={
            <RequireAdmin>
              <Leaves />
            </RequireAdmin>
          }
        />
        <Route
          path="/admin/attendance"
          element={
            <RequireAdmin>
              <Attendance />
            </RequireAdmin>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;