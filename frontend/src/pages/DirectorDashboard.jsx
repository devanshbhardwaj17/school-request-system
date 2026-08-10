import React, { useEffect, useState, useCallback, useMemo } from "react";
import Navbar from "../components/Navbar.jsx";
import RequestTable from "../components/RequestTable.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/api.js";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function DirectorDashboard() {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("pending");
  const [decisionTarget, setDecisionTarget] = useState(null); // { request, decision }
  const [actionError, setActionError] = useState("");

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
    if (filter === "approved")
      return requests.filter((r) => ["approved", "in_stock", "out_of_stock", "delivered"].includes(r.status));
    return requests.filter((r) => r.status === filter);
  }, [requests, filter]);

  const pendingCount = requests.filter((r) => r.status === "pending").length;

  async function confirmDecision(note) {
    if (!decisionTarget) return;
    setActionError("");
    try {
      await api.directorDecision(token, decisionTarget.request.id, decisionTarget.decision, note);
      setDecisionTarget(null);
      await loadRequests();
    } catch (err) {
      setActionError(err.message);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-10 space-y-8">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-chalk-600">
              Director's office — {user?.name}
            </p>
            <h1 className="font-display text-3xl font-semibold mt-1">All requisitions</h1>
          </div>
          <div className="border-2 border-amber-600/40 bg-amber-50 rounded-md px-4 py-2 text-sm text-amber-600 font-medium">
            {pendingCount} awaiting your decision
          </div>
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
            emptyTitle="Nothing here"
            emptyBody="No requests match this filter right now."
            renderActions={(r) =>
              r.status === "pending" ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setDecisionTarget({ request: r, decision: "approved" })}
                    className="focus-ring text-xs font-medium px-2.5 py-1.5 rounded-sm bg-chalk-700 text-paper hover:bg-chalk-600 transition-colors"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => setDecisionTarget({ request: r, decision: "rejected" })}
                    className="focus-ring text-xs font-medium px-2.5 py-1.5 rounded-sm border-2 border-rose-600/50 text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    Reject
                  </button>
                </div>
              ) : null
            }
          />
        )}
      </main>

      {decisionTarget && (
        <DecisionModal
          target={decisionTarget}
          error={actionError}
          onCancel={() => {
            setDecisionTarget(null);
            setActionError("");
          }}
          onConfirm={confirmDecision}
        />
      )}
    </div>
  );
}

function DecisionModal({ target, onCancel, onConfirm, error }) {
  const [note, setNote] = useState("");
  const { request, decision } = target;

  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-20">
      <div className="bg-paper border-2 border-line rounded-md max-w-md w-full p-6 fade-in">
        <div className="flex items-center gap-2 mb-1">
          <StatusBadge status={decision} />
        </div>
        <h3 className="font-display text-xl font-semibold mt-2">
          {decision === "approved" ? "Approve" : "Reject"} this request?
        </h3>
        <p className="text-sm text-ink/60 mt-1">
          {request.quantity} × {request.itemName} — requested by {request.createdBy?.name}
        </p>

        <label className="block text-xs font-mono uppercase tracking-wider text-ink/50 mt-5 mb-1.5">
          Note <span className="text-ink/30 normal-case">(optional)</span>
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          className="focus-ring w-full rounded-sm border-2 border-line bg-white px-3 py-2.5 text-sm resize-none"
          placeholder="Add context for the record…"
        />

        {error && <p className="text-sm text-rose-600 mt-3">{error}</p>}

        <div className="flex gap-2 mt-5">
          <button
            onClick={onCancel}
            className="focus-ring flex-1 rounded-sm border-2 border-line py-2.5 text-sm font-medium hover:border-ink/30 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(note)}
            className={`focus-ring flex-1 rounded-sm py-2.5 text-sm font-medium text-paper transition-colors ${
              decision === "approved" ? "bg-chalk-700 hover:bg-chalk-600" : "bg-rose-600 hover:bg-rose-400"
            }`}
          >
            Confirm {decision === "approved" ? "approval" : "rejection"}
          </button>
        </div>
      </div>
    </div>
  );
}
