import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const API = "https://localhost:5000";

export default function UserLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function login() {
    try {
      const res = await fetch(`${API}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!data.success) {
        alert("Login failed");
        return;
      }

      // store session
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.user.email);
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("expiresAt", data.user.expiresAt || "");

      navigate("/user");
    } catch {
      alert("Network error");
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <img src="/logo.png" alt="Logo" className="auth-logo" />
        <h1>TipStorm</h1>
        <p>Premium betting insights</p>
      </div>

      <div className="auth-right">
        <div className="auth-box">
          <h2>User Login</h2>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={login}>Login</button>
        </div>
      </div>
    </div>
  );
} 
