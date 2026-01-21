import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

import Login from "./pages/Login";
import StudentDashboard from "./pages/StudentDashboard";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";

import { translations } from "./i18n/i18n.js";

// ---------------- ProtectedRoute Wrapper ----------------
function ProtectedRoute({ children, token, role, requiredRole }) {
  if (!token) return <Navigate to="/" replace />;
  if (requiredRole && role !== requiredRole) return <Navigate to="/" replace />;
  return children;
}

// ---------------- App Component ----------------
function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [role, setRole] = useState(localStorage.getItem("role") || "");
  const [language, setLanguage] = useState(localStorage.getItem("language") || "en");
  const [user, setUser] = useState(null);

  const t = translations[language];

  // ---------------- Login Handler ----------------
  const handleLogin = async (email, password) => {
  try {
    const res = await axios.post("http://localhost:5000/api/auth/login", {
      email,
      password,
    });

    console.log("Login response:", res.data); // 🔹 important for debugging

    // Adjust based on your backend structure:
    const { token, role, _id, language } = res.data.user || res.data; 

    setToken(token);
    setRole(role);
    setUser(res.data.user || res.data); // Save the whole user object
    if (language) setLanguage(language);

  } catch (err) {
    console.error("Login failed:", err);
    alert("Invalid credentials");
  }
};

  // ---------------- Logout Handler ----------------
  const logout = () => {
    setToken("");
    setRole("");
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("role");
  };

  // ---------------- JSX ----------------
  return (
    <BrowserRouter>
      {/* Language Switch */}
      <div style={{ position: "fixed", top: 10, left: 10, zIndex: 100 }}>
        <button onClick={() => setLanguage("en")}>EN</button>
        <button onClick={() => setLanguage("pl")}>PL</button>
      </div>

      <Routes>
        {/* Root path */}
        <Route
          path="/"
          element={
            !token ? (
              <Login onLogin={handleLogin} />
            ) : (
              <Navigate to={`/${role}`} replace />
            )
          }
        />

        {/* Student Dashboard */}
        <Route
          path="/student"
          element={
            <ProtectedRoute token={token} role={role} requiredRole="student">
              <StudentDashboard
                token={token}
                logout={logout}
                language={language}
                studentId={user?._id}
              />
            </ProtectedRoute>
          }
        />

        {/* Teacher Dashboard */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute token={token} role={role} requiredRole="teacher">
              <TeacherDashboard token={token} logout={logout} language={language} />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute token={token} role={role} requiredRole="admin">
              <AdminDashboard token={token} logout={logout} language={language} />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
