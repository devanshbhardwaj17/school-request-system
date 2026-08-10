import React, { useEffect, useState, useCallback, useMemo } from "react";
import Navbar from "../components/Navbar.jsx";
import RequestTable from "../components/RequestTable.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/api.js";

const FILTERS = [
  { key: "open", label: "Needs action" },
  { key: "all", label: "All" },
  { key: "delivered", label: "Delivered" },
];

const STORE_ACTIONS = [
  { status: "in_stock", label: "Mark in stock" },
  { status: "out_of_stock", label: "Mark out of stock" },
  { status: "delivered", label: "Mark delivered" },
];

export default function StoreDashboard() {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("open");
  const [busyId, setBusyId] = useState(null);
  const [rowError, setRowError] = useState({});

  const loadRequests = useCallback(async () => {
    try {
      const data = await api.listRequests(token);
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  const filtered = useMemo(() => {
    if (filter === "all") return requests;
    if (filter === "delivered") return requests.filter((r) => r.status === "delivered");
    return requests.filter((r) => r.status !== "delivered");
  }, [requests, filter]);

  async function handleStatusChange(id, status) {
    setBusyId(id);
    setRowError((prev) => ({ ...prev, [id]: "" }));
    try {
      await api.storeStatus(token, id, status);
      await loadRequests();
    } catch (err) {
      setRowError((prev) => ({ ...prev, [id]: err.message }));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-10 space-y-8">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-chalk-600">
            Store room — {user?.name}
          </p>
          <h1 className="font-display text-3xl font-semibold mt-1">Approved requisitions</h1>
          <p className="text-sm text-ink/50 mt-1">
            Only requests approved by the director appear here. Delivered requests are locked.
          </p>
        </div>

        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`focus-ring text-xs font-mono uppercase tracking-wider px-3 py-2 rounded-sm border-2 transition-colors ${
                filter === f.key
                  ? "bg-chalk-700 text-paper border-chalk-700"
                  : "border-line text-ink/60 hover:border-chalk-600 hover:text-chalk-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <p className="text-sm text-ink/40 font-mono uppercase tracking-widest">Loading…</p>
        ) : error ? (
          <p className="text-sm text-rose-600">{error}</p>
        ) : (
          <RequestTable
            requests={filtered}
            showRequester
            emptyTitle="Nothing waiting"
            emptyBody="Approved requests from the director will show up here."
            renderActions={(r) =>
              r.status === "delivered" ? (
                <span className="text-xs font-mono uppercase tracking-wider text-ink/35">Locked</span>
              ) : (
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-1.5">
                    {STORE_ACTIONS.filter((a) => a.status !== r.status).map((a) => (
                      <button
                        key={a.status}
                        disabled={busyId === r.id}
                        onClick={() => handleStatusChange(r.id, a.status)}
                        className="focus-ring text-xs font-medium px-2.5 py-1.5 rounded-sm border-2 border-chalk-700/30 text-chalk-700 hover:bg-chalk-50 disabled:opacity-50 transition-colors whitespace-nowrap"
                      >
                        {a.label}
                      </button>
                    ))}
                  </div>
                  {rowError[r.id] && <span className="text-xs text-rose-600">{rowError[r.id]}</span>}
                </div>
              )
            }
          />
        )}
      </main>
    </div>
  );
}
