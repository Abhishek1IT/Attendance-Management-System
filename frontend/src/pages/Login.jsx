import { useState } from "react";
import { loginApi } from "../api/authApi";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

export default function Login() {
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const navigate = useNavigate();

  const submut = async (e) => {
    e.preventDefault();

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      alert("Please enter email and password");
      return;
    }

    try {
      const res = await loginApi({ email: normalizedEmail, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);

      if (error.response?.status === 401) {
        alert("Email or password is wrong");
        return;
      }

      alert(error.response?.data?.message || "Login failed. Please try again.");
    }
  };

  return (
      <div className="login-page">
      <div className="login-card">
        <h2 className="login-title">Login</h2>
        <form className="login-form" onSubmit={submut}>
          <input
            type="email"
            name="username"
            placeholder="Email"
            value={email}
            onChange={(e) => setemail(e.target.value)}
            autoComplete="username"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setpassword(e.target.value)}
            autoComplete="current-password"
          />
          <button className="login-button" type="submit">Login</button>
        </form>
      </div>
      </div>
  )
}