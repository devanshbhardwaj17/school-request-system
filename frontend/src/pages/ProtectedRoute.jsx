import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const HOME_BY_ROLE = {
  teacher: "/teacher",
  director: "/director",
  store_manager: "/store",
};

export default function ProtectedRoute({ role, children }) {
  const { user, checking } = useAuth();

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center text-ink/50 font-mono text-sm uppercase tracking-widest">
        Loading…
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={HOME_BY_ROLE[user.role] || "/login"} replace />;

  return children;
}
