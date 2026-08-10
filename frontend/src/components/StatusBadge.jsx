import React from "react";

const STYLES = {
  pending: { label: "Pending", classes: "text-amber-600 border-amber-600/60 bg-amber-50" },
  approved: { label: "Approved", classes: "text-sky-600 border-sky-600/60 bg-sky-50" },
  rejected: { label: "Rejected", classes: "text-rose-600 border-rose-600/60 bg-rose-50" },
  in_stock: { label: "In Stock", classes: "text-chalk-700 border-chalk-700/60 bg-chalk-50" },
  out_of_stock: { label: "Out of Stock", classes: "text-rose-600 border-rose-600/60 bg-rose-50" },
  delivered: { label: "Delivered", classes: "text-chalk-900 border-chalk-900/70 bg-chalk-100" },
};

export default function StatusBadge({ status, size = "md" }) {
  const style = STYLES[status] || { label: status, classes: "text-ink border-ink/40 bg-white" };
  const sizeClasses = size === "sm" ? "text-[10px] px-2 py-0.5" : "text-xs px-2.5 py-1";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-sm border-2 font-mono font-semibold uppercase tracking-wider ${sizeClasses} ${style.classes} -rotate-1 select-none`}
    >
      {style.label}
    </span>
  );
}
