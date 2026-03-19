"use client";

import type { PayoutStatus } from "@/lib/domain/types";

export function StatusBadge({ status }: { status: PayoutStatus }) {
  const cls =
    status === "Draft"
      ? "bg-slate-100 text-slate-800"
      : status === "Submitted"
        ? "bg-amber-100 text-amber-900"
        : status === "Approved"
          ? "bg-emerald-100 text-emerald-900"
          : "bg-red-100 text-red-900";
  return (
    <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${cls}`}>
      {status}
    </span>
  );
}

