import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Landing from "./Landing";

import UserLogin from "./components/UserLogin";
import UserRegister from "./components/UserRegister";
import AdminLogin from "./components/AdminLogin";
import User from "./components/user";    
import Admin from "./components/admin";  

function App() {

  return (

    <Router>

      <Routes>

        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* User auth */}
        <Route path="/login" element={<UserLogin />} />
        <Route path="/register" element={<UserRegister />} />

        {/* User dashboard */}
        <Route path="/user" element={<User />} />

        {/* Admin */}
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/admin" element={<Admin />} />

        {/* 404 */}
        <Route
          path="*"
          element={<h2 style={{ textAlign: "center" }}>Page Not Found</h2>}
        />

      </Routes>

    </Router>

  );

}

export default App; 
