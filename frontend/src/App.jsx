import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.jsx";
import TeacherDashboard from "./pages/TeacherDashboard.jsx";
import DirectorDashboard from "./pages/DirectorDashboard.jsx";
import StoreDashboard from "./pages/StoreDashboard.jsx";
import ProtectedRoute from "./pages/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";

const HOME_BY_ROLE = {
  teacher: "/teacher",
  director: "/director",
  store_manager: "/store",
};

function RootRedirect() {
  const { user, checking } = useAuth();
  if (checking) return null;
  return <Navigate to={user ? HOME_BY_ROLE[user.role] || "/login" : "/login"} replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<RootRedirect />} />
      <Route path="/login" element={<Login />} />
      <Route
        path="/teacher"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/director"
        element={
          <ProtectedRoute role="director">
            <DirectorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/store"
        element={
          <ProtectedRoute role="store_manager">
            <StoreDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
