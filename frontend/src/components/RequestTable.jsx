import React, { useState } from "react";
import StatusBadge from "./StatusBadge.jsx";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" }) +
    " · " +
    d.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
}

export default function RequestTable({
  requests,
  showRequester = false,
  renderActions,
  emptyTitle = "No requests yet",
  emptyBody = "Once requests come in, they'll show up here.",
}) {
  const [openId, setOpenId] = useState(null);

  if (!requests || requests.length === 0) {
    return (
      <div className="paper-texture border-2 border-dashed border-line rounded-md py-14 text-center">
        <p className="font-display text-lg text-ink/70">{emptyTitle}</p>
        <p className="text-sm text-ink/45 mt-1">{emptyBody}</p>
      </div>
    );
  }

  return (
    <div className="border-2 border-line rounded-md overflow-hidden bg-white/60">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-chalk-700 text-paper text-left font-mono uppercase tracking-wider text-[11px]">
            <th className="px-4 py-3 font-semibold">Item</th>
            <th className="px-4 py-3 font-semibold">Qty</th>
            {showRequester && <th className="px-4 py-3 font-semibold">Requested by</th>}
            <th className="px-4 py-3 font-semibold">Submitted</th>
            <th className="px-4 py-3 font-semibold">Status</th>
            <th className="px-4 py-3 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.map((r, idx) => {
            const isOpen = openId === r.id;
            return (
              <React.Fragment key={r.id}>
                <tr
                  className={`border-t border-line/70 hover:bg-chalk-50/60 transition-colors ${
                    idx % 2 === 1 ? "bg-ink/[0.015]" : ""
                  }`}
                >
                  <td className="px-4 py-3 font-medium align-top">{r.itemName}</td>
                  <td className="px-4 py-3 align-top font-mono">{r.quantity}</td>
                  {showRequester && (
                    <td className="px-4 py-3 align-top text-ink/70">{r.createdBy?.name}</td>
                  )}
                  <td className="px-4 py-3 align-top text-ink/60 whitespace-nowrap">
                    {formatDate(r.createdAt)}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <StatusBadge status={r.status} />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex items-center justify-end gap-2">
                      {renderActions ? renderActions(r) : null}
                      <button
                        onClick={() => setOpenId(isOpen ? null : r.id)}
                        className="focus-ring text-xs font-mono uppercase tracking-wider text-chalk-700 hover:underline whitespace-nowrap"
                      >
                        {isOpen ? "Hide trail" : "History"}
                      </button>
                    </div>
                  </td>
                </tr>
                {isOpen && (
                  <tr className="bg-chalk-50/40 border-t border-line/70">
                    <td colSpan={showRequester ? 6 : 5} className="px-4 py-4">
                      {r.note && (
                        <p className="text-sm text-ink/70 mb-3">
                          <span className="font-mono text-[11px] uppercase tracking-wider text-ink/40 mr-2">
                            Note
                          </span>
                          {r.note}
                        </p>
                      )}
                      <ol className="space-y-2">
                        {r.history.map((h, i) => (
                          <li key={i} className="flex items-start gap-3 text-sm">
                            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-chalk-600 shrink-0" />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <StatusBadge status={h.status} size="sm" />
                                <span className="text-ink/50 text-xs">
                                  {formatDate(h.at)} — {h.changedBy}
                                </span>
                              </div>
                              {h.note && <p className="text-ink/60 text-xs mt-0.5">{h.note}</p>}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
