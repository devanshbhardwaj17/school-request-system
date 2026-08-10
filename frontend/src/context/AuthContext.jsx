import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { api } from "../api/api.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("req_token") || null);
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("req_user");
    return raw ? JSON.parse(raw) : null;
  });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Verify the stored token is still valid on app load
    async function verify() {
      if (!token) {
        setChecking(false);
        return;
      }
      try {
        const { user: freshUser } = await api.me(token);
        setUser(freshUser);
        localStorage.setItem("req_user", JSON.stringify(freshUser));
      } catch {
        setToken(null);
        setUser(null);
        localStorage.removeItem("req_token");
        localStorage.removeItem("req_user");
      } finally {
        setChecking(false);
      }
    }
    verify();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = useCallback(async (username, password) => {
    const { token: newToken, user: newUser } = await api.login(username, password);
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem("req_token", newToken);
    localStorage.setItem("req_user", JSON.stringify(newUser));
    return newUser;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("req_token");
    localStorage.removeItem("req_user");
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout, checking }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
