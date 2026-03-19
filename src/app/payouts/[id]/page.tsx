"use client";

import Link from "next/link";
import { use, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { api } from "@/lib/api/api";
import type { PayoutStatus, Role } from "@/lib/domain/types";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/payouts/StatusBadge";
import { formatINR } from "@/lib/ui/format";

export default function PayoutDetailPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { id: payoutId } = use(params);

  const { data: meData } = useSWR<any>("/auth/me");
  const role: string | null = meData?.data?.user?.role ?? meData?.user?.role ?? null;

  type BackendVendor = {
    _id: string;
    name: string;
  };
  type VendorsResponse = {
    success: boolean;
    message: string;
    data: BackendVendor[];
  };
  const { data: vendorsData } = useSWR<VendorsResponse>("/vendors");
  const vendors = vendorsData?.data ?? [];

  type AuditEntryLike = {
    action?: string;
    actor_role?: string;
    actor_label?: string;
    timestamp?: string;
    decision_reason?: string | null;
    who?: string;
    reason?: string | null;
    createdAt?: string;
  };

  type BackendPayoutDetail = {
    _id: string;
    vendor_id: { _id: string; name: string } | string;
    amount: number;
    mode: string;
    note?: string | null;
    status: PayoutStatus;
    decision_reason?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };

  const { data, error, isLoading, mutate } = useSWR<any>(`/payouts/${payoutId}`);

  const payout: BackendPayoutDetail | null =
    data?.data?.payout ?? data?.payout ?? data?.data ?? null;

  const audit: AuditEntryLike[] =
    data?.data?.audit ?? data?.audit ?? [];

  const vendorName = useMemo(() => {
    if (!payout) return "—";
    if (typeof payout.vendor_id === "string") {
      const v = vendors.find((x) => x._id === payout.vendor_id);
      return v?.name ?? payout.vendor_id;
    }
    return payout.vendor_id?.name ?? "—";
  }, [vendors, payout]);

  const [actionError, setActionError] = useState<string | null>(null);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [acting, setActing] = useState(false);

  const canSubmit = role === "OPS" && payout?.status === "Draft";
  const canApprove = role === "FINANCE" && payout?.status === "Submitted";
  const canReject = role === "FINANCE" && payout?.status === "Submitted";

  async function doAction(fn: () => Promise<void>) {
    setActionError(null);
    setActing(true);
    try {
      await fn();
      await mutate();
      router.refresh();
    } catch (e) {
      setActionError((e as Error).message ?? "Action failed");
    } finally {
      setActing(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Payout detail</h1>
          <p className="text-sm text-slate-600">
            ID: <span className="font-mono">{payoutId}</span>
          </p>
        </div>
        <Link className="text-sm text-slate-700 hover:underline" href="/payouts">
          Back to list
        </Link>
      </div>

      {error ? (
        <Alert
          title="Failed to load payout"
          message={String((error as Error).message ?? error)}
        />
      ) : null}

      {actionError ? <Alert title="Action failed" message={actionError} /> : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-lg border bg-white p-5">
            {isLoading || !payout ? (
              <div className="text-sm text-slate-600">Loading payout…</div>
            ) : (
              <div className="space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-sm text-slate-600">
                    Vendor: <span className="font-medium text-slate-900">{vendorName}</span>
                  </div>
                  <StatusBadge status={payout.status} />
                </div>

                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div className="rounded-md bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">Amount</div>
                    <div className="text-lg font-semibold">{formatINR(payout.amount)}</div>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3">
                    <div className="text-xs text-slate-500">Mode</div>
                    <div className="text-lg font-semibold">{payout.mode}</div>
                  </div>
                  <div className="rounded-md bg-slate-50 p-3 md:col-span-2">
                    <div className="text-xs text-slate-500">Note</div>
                    <div className="text-sm">{payout.note ?? "—"}</div>
                  </div>
                  {payout.status === "Rejected" ? (
                    <div className="rounded-md border border-red-200 bg-red-50 p-3 md:col-span-2">
                      <div className="text-xs font-medium text-red-900">
                        Rejection reason
                      </div>
                      <div className="text-sm text-red-900">
                        {payout.decision_reason ?? "—"}
                      </div>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <Button
                    disabled={!canSubmit || acting}
                    onClick={() =>
                      doAction(async () => {
                        await api.post(`/payouts/${payoutId}/submit`);
                      })
                    }
                  >
                    Submit (OPS)
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={!canApprove || acting}
                    onClick={() =>
                      doAction(async () => {
                        await api.post(`/payouts/${payoutId}/approve`);
                      })
                    }
                  >
                    Approve (FINANCE)
                  </Button>
                  <Button
                    variant="danger"
                    disabled={!canReject || acting}
                    onClick={() => setRejectOpen(true)}
                  >
                    Reject (FINANCE)
                  </Button>
                </div>

                {rejectOpen ? (
                  <div className="rounded-lg border bg-white p-4">
                    <div className="text-sm font-medium">Reject payout</div>
                    <div className="mt-2">
                      <label className="text-sm font-medium">Reason *</label>
                      <textarea
                        className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                        rows={3}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        variant="danger"
                        disabled={acting || !rejectReason.trim()}
                        onClick={() =>
                          doAction(async () => {
                            await api.post(`/payouts/${payoutId}/reject`, {
                              reason: rejectReason.trim()
                            });
                            setRejectOpen(false);
                            setRejectReason("");
                          })
                        }
                      >
                        Confirm reject
                      </Button>
                      <Button
                        variant="secondary"
                        disabled={acting}
                        onClick={() => {
                          setRejectOpen(false);
                          setRejectReason("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-lg border bg-white">
            <div className="border-b px-4 py-3 text-sm font-medium">Audit trail</div>
            {isLoading ? (
              <div className="p-4 text-sm text-slate-600">Loading history…</div>
            ) : audit.length === 0 ? (
              <div className="p-4 text-sm text-slate-600">No history.</div>
            ) : (
              <div className="divide-y">
                {audit.map((a) => (
                  <div key={(a as any).id ?? `${a.action ?? "A"}-${a.timestamp ?? ""}`} className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="text-sm font-medium">{a.action ?? "—"}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(a.timestamp ?? a.createdAt ?? "").toLocaleString()}
                      </div>
                    </div>
                    <div className="mt-1 text-sm text-slate-700">
                      {a.actor_label ?? a.who ?? "Unknown"} ({a.actor_role ?? "—"})
                    </div>
                    {a.action === "REJECTED" && (a.decision_reason ?? a.reason) ? (
                      <div className="mt-2 rounded-md bg-slate-50 p-2 text-sm text-slate-800">
                        Reason: {a.decision_reason ?? a.reason}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="rounded-lg border bg-white p-4">
            <div className="text-sm font-medium">Your access</div>
            <div className="mt-1 text-sm text-slate-600">
              Current role: <span className="font-medium">{role ?? "None"}</span>
            </div>
            <div className="mt-2 text-xs text-slate-500">
              Actions are enforced by API routes; UI buttons simply reflect what’s allowed.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

