"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { api } from "@/lib/api/api";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { use } from "react";

type Vendor = {
  _id: string;
  name: string;
  upi_id?: string;
  bank_account?: string;
  ifsc?: string;
  is_active: boolean;
};

type VendorDetailResponse =
  | { success: boolean; message: string; data?: Vendor }
  | { vendor?: Vendor; data?: Vendor };

export default function VendorDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id: vendorId } = use(params);

  const { data, error, isLoading, mutate } = useSWR<VendorDetailResponse>(
    `/vendors/${vendorId}`
  );

  const vendor: Vendor | null =
    (data as any)?.data?.name ? ((data as any).data as Vendor) : (data as any)?.data ?? (data as any)?.vendor ?? null;

  async function toggleActive() {
    if (!vendor) return;
    await api.put(`/vendors/${vendorId}`, { is_active: !vendor.is_active });
    await mutate();
  }

  async function deleteVendor() {
    if (!vendor) return;
    const ok = window.confirm(`Delete vendor "${vendor.name}"? This cannot be undone.`);
    if (!ok) return;
    await api.delete(`/vendors/${vendorId}`);
    router.push("/vendors");
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Vendor</h1>
          <p className="mt-1 text-sm text-slate-600">
            ID: <span className="font-mono">{vendorId}</span>
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/vendors"
            className="inline-flex items-center justify-center rounded-md border bg-white px-3 py-2 text-sm hover:bg-slate-50"
          >
            Back
          </Link>
          <Link
            href={`/vendors/${vendorId}/edit`}
            className="inline-flex items-center justify-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Edit
          </Link>
        </div>
      </div>

      {error ? (
        <Alert title="Failed to load vendor" message={(error as Error).message} />
      ) : null}

      <div className="rounded-lg border bg-white p-5">
        {isLoading || !vendor ? (
          <div className="text-sm text-slate-600">Loading vendor…</div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <div className="text-xs text-slate-500">Name</div>
                <div className="text-sm font-medium">{vendor.name}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-500">UPI</div>
                <div className="text-sm">{vendor.upi_id ?? "—"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-500">Bank account</div>
                <div className="text-sm">{vendor.bank_account ?? "—"}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-slate-500">IFSC</div>
                <div className="text-sm">{vendor.ifsc ?? "—"}</div>
              </div>
              <div className="space-y-1 md:col-span-2">
                <div className="text-xs text-slate-500">Status</div>
                <div className="text-sm font-medium">
                  {vendor.is_active ? "Active" : "Inactive"}
                </div>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Button variant="secondary" disabled={false} onClick={toggleActive}>
                {vendor.is_active ? "Deactivate" : "Activate"}
              </Button>
              <Button variant="danger" disabled={false} onClick={deleteVendor}>
                Delete
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

