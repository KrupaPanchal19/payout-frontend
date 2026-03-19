"use client";

import Link from "next/link";
import useSWR from "swr";
import { api } from "@/lib/api/api";
import { Alert } from "@/components/ui/Alert";
import { useState } from "react";

type BackendVendor = {
  _id: string;
  name: string;
  upi_id?: string;
  bank_account?: string;
  ifsc?: string;
  is_active: boolean;
};

type VendorsResponse = {
  success: boolean;
  message: string;
  data: BackendVendor[];
};

export default function VendorsPage() {
  const { data, error, isLoading, mutate } = useSWR<VendorsResponse>("/vendors");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Vendors</h1>
          <p className="text-sm text-slate-600">
            Minimal vendor CRUD (list + add).
          </p>
        </div>
        <Link
          href="/vendors/new"
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Add vendor
        </Link>
      </div>

      {error ? (
        <Alert
          title="Failed to load vendors"
          message={String((error as Error).message ?? error)}
        />
      ) : null}
      {actionError ? <Alert title="Action failed" message={actionError} /> : null}

      <div className="rounded-lg border bg-white">
        <div className="border-b px-4 py-3 text-sm font-medium">Vendor list</div>
        {isLoading ? (
          <div className="p-4 text-sm text-slate-600">Loading vendors…</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-left text-slate-600">
                <tr>
                  <th className="px-4 py-2">Name</th>
                  <th className="px-4 py-2">UPI</th>
                  <th className="px-4 py-2">Bank</th>
                  <th className="px-4 py-2">IFSC</th>
                  <th className="px-4 py-2">Active</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(data?.data ?? []).map((v) => (
                  <tr key={v._id} className="border-t">
                    <td className="px-4 py-2 font-medium">{v.name}</td>
                    <td className="px-4 py-2">{v.upi_id ?? "—"}</td>
                    <td className="px-4 py-2">{v.bank_account ?? "—"}</td>
                    <td className="px-4 py-2">{v.ifsc ?? "—"}</td>
                    <td className="px-4 py-2">{v.is_active ? "Yes" : "No"}</td>
                    <td className="px-4 py-2">
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`/vendors/${v._id}`}
                          className="rounded-md border bg-white px-2 py-1 text-xs hover:bg-slate-50"
                        >
                          View
                        </Link>
                        <Link
                          href={`/vendors/${v._id}/edit`}
                          className="rounded-md border bg-white px-2 py-1 text-xs hover:bg-slate-50"
                        >
                          Edit
                        </Link>
                        <button
                          type="button"
                          className="rounded-md border bg-white px-2 py-1 text-xs hover:bg-slate-50"
                          disabled={actingId === v._id}
                          onClick={async () => {
                            setActionError(null);
                            const ok = window.confirm(
                              `Are you sure you want to ${
                                v.is_active ? "deactivate" : "activate"
                              } "${v.name}"?`
                            );
                            if (!ok) return;

                            // Backend convention: PUT /vendors/:id to update is_active.
                            setActingId(v._id);
                            try {
                              await api.put(`/vendors/${v._id}`, {
                                is_active: !v.is_active
                              });
                              await mutate();
                            } catch (e) {
                              setActionError((e as Error).message ?? "Action failed");
                            } finally {
                              setActingId(null);
                            }
                          }}
                        >
                          {v.is_active ? "Deactivate" : "Activate"}
                        </button>
                        <button
                          type="button"
                          className="rounded-md border border-red-200 bg-white px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                          disabled={actingId === v._id}
                          onClick={async () => {
                            setActionError(null);
                            const ok = window.confirm(
                              `Delete vendor "${v.name}"? This cannot be undone.`
                            );
                            if (!ok) return;
                            setActingId(v._id);
                            try {
                              await api.delete(`/vendors/${v._id}`);
                              await mutate();
                            } catch (e) {
                              setActionError((e as Error).message ?? "Action failed");
                            } finally {
                              setActingId(null);
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {(data?.data?.length ?? 0) === 0 && !isLoading ? (
                  <tr className="border-t">
                    <td className="px-4 py-6 text-slate-600" colSpan={5}>
                      No vendors yet.
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

