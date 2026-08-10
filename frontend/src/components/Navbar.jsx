import React from "react";
import { useAuth } from "../context/AuthContext.jsx";

const ROLE_LABELS = {
  teacher: "Teacher",
  director: "Director",
  store_manager: "Store Manager",
};

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b-2 border-line bg-paper/95 backdrop-blur sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 h-16 flex items-center justify-between">
        <div className="flex items-baseline gap-2">
          <span className="font-display text-xl font-semibold text-chalk-700">Requisition</span>
          <span className="hidden sm:inline text-xs font-mono uppercase tracking-widest text-ink/40">
            Supply Office
          </span>
        </div>

        {user && (
          <div className="flex items-center gap-4">
            <div className="text-right leading-tight">
              <div className="text-sm font-medium">{user.name}</div>
              <div className="text-[11px] font-mono uppercase tracking-wider text-ink/50">
                {ROLE_LABELS[user.role] || user.role}
              </div>
            </div>
            <button
              onClick={logout}
              className="focus-ring text-sm font-medium px-3 py-1.5 rounded-sm border-2 border-ink/15 hover:border-chalk-600 hover:text-chalk-700 transition-colors"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
