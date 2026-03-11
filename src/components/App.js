import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import UserLogin from "./components/UserLogin";
import UserRegister from "./components/UserRegister";
import AdminLogin from "./components/AdminLogin";
import User from "./components/user"; // lowercase
import Admin from "./components/admin"; // lowercase
import Landing from "./components/Landing"; // your landing page

function App() {
  return (
    <Router>
      <Routes>
        {/* Redirect root to /login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Public routes */}
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserRegister />} />
        <Route path="/admin-login" element={<AdminLogin />} />

        {/* Protected routes */}
        <Route path="/user" element={<User />} />
        <Route path="/admin" element={<Admin />} />

        {/* 404 fallback */}
        <Route
          path="*"
          element={<h2 style={{ textAlign: "center" }}>Page Not Found</h2>}
        />
      </Routes>
    </Router>
  );
}

export default App; 
