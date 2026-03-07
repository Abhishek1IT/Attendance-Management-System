import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { myProfileApi } from "../api/authApi";
import "../styles/Profile.css";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await myProfileApi();
        setUser(res.data);
        setError("");
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile");
      }
    };

    loadProfile();
  }, []);

  if (error) {
    return (
      <div className="profile-container">
        <div className="profile-card profile-error">{error}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-container">
        <div className="profile-card profile-loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="profile-title">My Profile</h2>
        <Link className="profile-back" to="/dashboard">
          Back
        </Link>

        <div className="profile-item">
          <span className="profile-label">Name:</span>
          <span className="profile-value">{user.name}</span>
        </div>

        <div className="profile-item">
          <span className="profile-label">Email:</span>
          <span className="profile-value">{user.email}</span>
        </div>

        <div className="profile-item profile-item-last">
          <span className="profile-label">Role</span>
          <span className="profile-value profile-role">{user.role}</span>
        </div>
      </div>
    </div>
  );
}