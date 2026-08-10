import React, { useEffect, useState, useCallback } from "react";
import Navbar from "../components/Navbar.jsx";
import RequestTable from "../components/RequestTable.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { api } from "../api/api.js";

export default function TeacherDashboard() {
  const { token, user } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [itemName, setItemName] = useState("");
  const [quantity, setQuantity] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formMessage, setFormMessage] = useState("");

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

  async function handleSubmit(e) {
    e.preventDefault();
    setFormMessage("");
    setSubmitting(true);
    try {
      await api.createRequest(token, { itemName, quantity: Number(quantity), note });
      setItemName("");
      setQuantity("");
      setNote("");
      setFormMessage("Request submitted for director approval.");
      await loadRequests();
    } catch (err) {
      setFormMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const approvedCount = requests.filter((r) =>
    ["approved", "in_stock", "out_of_stock", "delivered"].includes(r.status)
  ).length;
  const deliveredCount = requests.filter((r) => r.status === "delivered").length;

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-5 sm:px-8 py-10 space-y-10">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-chalk-600">
            Teacher desk — {user?.name}
          </p>
          <h1 className="font-display text-3xl font-semibold mt-1">New requisition</h1>
        </div>

        <section className="grid lg:grid-cols-5 gap-8">
          <form
            onSubmit={handleSubmit}
            className="lg:col-span-2 border-2 border-line rounded-md bg-white/70 p-6 space-y-4 h-fit"
          >
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink/50 mb-1.5">
                Item
              </label>
              <input
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="e.g. C Programming textbooks"
                className="focus-ring w-full rounded-sm border-2 border-line bg-white px-3 py-2.5 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink/50 mb-1.5">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                placeholder="e.g. 50"
                className="focus-ring w-full rounded-sm border-2 border-line bg-white px-3 py-2.5 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-ink/50 mb-1.5">
                Note <span className="text-ink/30 normal-case">(optional)</span>
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={3}
                placeholder="Any context for the director…"
                className="focus-ring w-full rounded-sm border-2 border-line bg-white px-3 py-2.5 text-sm resize-none"
              />
            </div>

            {formMessage && (
              <p
                className={`text-sm rounded-sm px-3 py-2 border-2 ${
                  formMessage.includes("submitted")
                    ? "text-chalk-700 bg-chalk-50 border-chalk-600/30"
                    : "text-rose-600 bg-rose-50 border-rose-600/30"
                }`}
              >
                {formMessage}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="focus-ring w-full bg-chalk-700 text-paper font-medium rounded-sm py-2.5 hover:bg-chalk-600 transition-colors disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Submit request"}
            </button>
          </form>

          <div className="lg:col-span-3 grid grid-cols-3 gap-4 content-start">
            <Stat label="Pending" value={pendingCount} />
            <Stat label="Approved" value={approvedCount} />
            <Stat label="Delivered" value={deliveredCount} />
            <div className="col-span-3 border-2 border-line rounded-md bg-white/70 p-5 text-sm text-ink/60 leading-relaxed">
              Requests go to the <strong className="text-ink/80">Director</strong> first. Once
              approved, the <strong className="text-ink/80">Store Manager</strong> updates stock
              and delivery. You'll see every step below as it happens.
            </div>
          </div>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold mb-4">History &amp; status</h2>
          {loading ? (
            <p className="text-sm text-ink/40 font-mono uppercase tracking-widest">Loading…</p>
          ) : error ? (
            <p className="text-sm text-rose-600">{error}</p>
          ) : (
            <RequestTable
              requests={requests}
              emptyTitle="No requests filed yet"
              emptyBody="Use the form above to raise your first requisition."
            />
          )}
        </section>
      </main>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border-2 border-line rounded-md bg-white/70 p-5">
      <div className="font-mono text-3xl font-semibold text-chalk-700">{value}</div>
      <div className="text-xs font-mono uppercase tracking-wider text-ink/45 mt-1">{label}</div>
    </div>
  );
}
