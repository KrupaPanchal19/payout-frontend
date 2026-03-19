"use client";

import Link from "next/link";
import useSWR from "swr";
import { useMemo, useState } from "react";
import type { PayoutStatus } from "@/lib/domain/types";
import { Alert } from "@/components/ui/Alert";
import { StatusBadge } from "@/components/payouts/StatusBadge";
import { formatINR } from "@/lib/ui/format";
import { api } from "@/lib/api/api";

const statuses: Array<PayoutStatus | "All"> = [
  "All",
  "Draft",
  "Submitted",
  "Approved",
  "Rejected"
];

function buildKey(status: string, vendorId: string) {
  const qs = new URLSearchParams();
  if (status && status !== "All") qs.set("status", status);
  if (vendorId && vendorId !== "All") qs.set("vendor_id", vendorId);
  const s = qs.toString();
  return s ? `/payouts?${s}` : "/payouts";
}

type BackendVendor = {
  _id: string;
  name: string;
};

type VendorsResponse = {
  success: boolean;
  message: string;
  data: BackendVendor[];
};

type PayoutsResponse = {
  success: boolean;
  message: string;
  data: BackendPayout[];
};

type BackendVendorPopulated = {
  _id: string;
  name: string;
  upi_id?: string;
  bank_account?: string;
  ifsc?: string;
  is_active?: boolean;
};

type BackendPayout = {
  _id: string;
  vendor_id: BackendVendorPopulated | string;
  amount: number;
  mode: string;
  note?: string | null;
  status: PayoutStatus;
  decision_reason?: string | null;
  createdAt: string;
  updatedAt: string;
};

export default function PayoutsPage() {
  const { data: vendorsData } = useSWR<VendorsResponse>("/vendors");
  const vendors = vendorsData?.data ?? [];

  const [status, setStatus] = useState<string>("All");
  const [vendorId, setVendorId] = useState<string>("All");
  const key = useMemo(() => buildKey(status, vendorId), [status, vendorId]);
  const { data, error, isLoading, mutate } = useSWR<PayoutsResponse>(key);

  const { data: meData } = useSWR<any>("/auth/me");
  const role: string | null =
    meData?.data?.role ?? meData?.user?.role ?? null;

  const [actionError, setActionError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  const vendorNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const v of vendors) map.set(v._id, v.name);
    return map;
  }, [vendors]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Payout requests</h1>
          <p className="text-sm text-slate-600">
            Filters are server-backed; actions are role + status enforced.
          </p>
        </div>
        <Link
          href="/payouts/new"
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Create payout
        </Link>
      </div>

      <div className="rounded-lg border bg-white p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <div>
            <label className="text-sm font-medium">Status</label>
              <select
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium">Vendor</label>
            <select
              className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
            >
              <option value="All">All</option>
              {vendors.map((v) => (
                <option key={v._id} value={v._id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error ? (
        <Alert
          title="Failed to load payouts"
          message={(error as Error).message}
        />
      ) : null}
      {actionError ? <Alert title="Action failed" message={actionError} /> : null}

      <div className="rounded-lg border bg-white">
        <div className="border-b px-4 py-3 text-sm font-medium">Payout list</div>
        {isLoading ? (
          <div className="p-4 text-sm text-slate-600">Loading payouts…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-2">#</th>
                  <th className="px-4 py-2">Vendor</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Mode</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Updated</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data?.data ?? []).map((p,index) => (
                  <tr key={p?._id ?? index} className="border-t hover:bg-slate-50">
                    <td className="px-4 py-2">
                      <Link
                        className="font-medium hover:underline"
                        href={`/payouts/${p._id}`}
                      >
                        {index + 1}
                      </Link>
                    </td>
                    <td className="px-4 py-2">
                      {typeof p.vendor_id === "string"
                        ? vendorNameById.get(p.vendor_id) ?? p.vendor_id
                        : p.vendor_id?.name ?? "—"}
                    </td>
                    <td className="px-4 py-2">{formatINR(p.amount)}</td>
                    <td className="px-4 py-2">{p.mode}</td>
                    <td className="px-4 py-2">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-2">
                      {new Date(p.updatedAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/payouts/${p._id}`}
                          className="rounded-md border bg-white px-2 py-1 text-xs hover:bg-slate-50"
                        >
                          View
                        </Link>

                        {role === "OPS" && p.status === "Draft" ? (
                          <button
                            type="button"
                            className="rounded-md border bg-white px-2 py-1 text-xs hover:bg-slate-50"
                            disabled={actingId === p._id}
                            onClick={async () => {
                              setActionError(null);
                              setActingId(p._id);
                              try {
                                await api.post(`/payouts/${p._id}/submit`);
                                await mutate();
                              } catch (e) {
                                setActionError((e as Error).message ?? "Action failed");
                              } finally {
                                setActingId(null);
                              }
                            }}
                          >
                            Submit
                          </button>
                        ) : null}

                        {role === "FINANCE" && p.status === "Submitted" ? (
                          <>
                            <button
                              type="button"
                              className="rounded-md border bg-white px-2 py-1 text-xs hover:bg-slate-50"
                              disabled={actingId === p._id}
                              onClick={async () => {
                                setActionError(null);
                                setActingId(p._id);
                                try {
                                  await api.post(`/payouts/${p._id}/approve`);
                                  await mutate();
                                } catch (e) {
                                  setActionError(
                                    (e as Error).message ?? "Action failed"
                                  );
                                } finally {
                                  setActingId(null);
                                }
                              }}
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              className="rounded-md border border-red-200 bg-white px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                              disabled={actingId === p._id}
                              onClick={async () => {
                                const reason = window.prompt(
                                  "Enter rejection reason"
                                );
                                if (!reason || !reason.trim()) {
                                  setActionError("Rejection reason is required.");
                                  return;
                                }
                                setActionError(null);
                                setActingId(p._id);
                                try {
                                  await api.post(`/payouts/${p._id}/reject`, {
                                    reason: reason.trim()
                                  });
                                  await mutate();
                                } catch (e) {
                                  setActionError(
                                    (e as Error).message ?? "Action failed"
                                  );
                                } finally {
                                  setActingId(null);
                                }
                              }}
                            >
                              Reject
                            </button>
                          </>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
                {(data?.data?.length ?? 0) === 0 && !isLoading ? (
                  <tr className="border-t">
                    <td className="px-4 py-6 text-slate-600" colSpan={7}>
                      No payouts found.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

