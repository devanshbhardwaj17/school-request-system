import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const HOME_BY_ROLE = {
  teacher: "/teacher",
  director: "/director",
  store_manager: "/store",
};

const DEMO_ACCOUNTS = [
  { label: "Teacher", username: "teacher1", password: "teacher123" },
  { label: "Director", username: "director1", password: "director123" },
  { label: "Store Manager", username: "store1", password: "store123" },
];

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={HOME_BY_ROLE[user.role] || "/login"} replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const loggedInUser = await login(username.trim(), password);
      navigate(HOME_BY_ROLE[loggedInUser.role] || "/login", { replace: true });
    } catch (err) {
      setError(err.message || "Could not log in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between bg-chalk-700 text-paper px-14 py-16">
        <div>
          <div className="font-mono text-xs uppercase tracking-widest text-chalk-100/70">
            Supply Office
          </div>
          <h1 className="font-display text-4xl leading-tight mt-4 max-w-md">
            One request,<br />three signatures,<br />no lost paperwork.
          </h1>
        </div>
        <div className="space-y-4 max-w-sm">
          <p className="text-sm text-chalk-50/80 leading-relaxed">
            A teacher raises a request. A director approves or rejects it. A store manager
            fulfills it. Every step is stamped and kept on the record.
          </p>
          <div className="flex gap-2 font-mono text-[11px] uppercase tracking-wider text-chalk-100/60">
            <span className="border border-chalk-400/50 rounded-sm px-2 py-1">Submit</span>
            <span className="border border-chalk-400/50 rounded-sm px-2 py-1">Approve</span>
            <span className="border border-chalk-400/50 rounded-sm px-2 py-1">Fulfill</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-sm fade-in">
          <div className="lg:hidden mb-8">
            <span className="font-display text-2xl font-semibold text-chalk-700">Requisition</span>
          </div>

          <h2 className="font-display text-2xl font-semibold mb-1">Sign in</h2>
          <p className="text-sm text-ink/50 mb-8">Use your office credentials to continue.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink/50 mb-1.5">
                Username
              </label>
              <input
                autoFocus
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="focus-ring w-full rounded-sm border-2 border-line bg-white px-3 py-2.5 text-sm"
                placeholder="teacher1"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink/50 mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="focus-ring w-full rounded-sm border-2 border-line bg-white px-3 py-2.5 text-sm"
                placeholder="••••••••"
                required
              />
            </div>

            {error && (
              <p className="text-sm text-rose-600 bg-rose-50 border-2 border-rose-600/30 rounded-sm px-3 py-2">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="focus-ring w-full bg-chalk-700 text-paper font-medium rounded-sm py-2.5 hover:bg-chalk-600 transition-colors disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <div className="mt-8 border-t-2 border-line pt-5">
            <p className="text-xs font-mono uppercase tracking-wider text-ink/40 mb-2">
              Demo accounts
            </p>
            <div className="space-y-1.5">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.username}
                  type="button"
                  onClick={() => {
                    setUsername(acc.username);
                    setPassword(acc.password);
                  }}
                  className="focus-ring w-full flex items-center justify-between text-left text-xs rounded-sm border border-line px-3 py-2 hover:border-chalk-600 hover:bg-chalk-50/50 transition-colors"
                >
                  <span className="font-medium">{acc.label}</span>
                  <span className="font-mono text-ink/40">{acc.username} / {acc.password}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
