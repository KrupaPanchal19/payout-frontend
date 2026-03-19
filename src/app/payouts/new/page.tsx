"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Formik } from "formik";
import * as yup from "yup";
import { api } from "@/lib/api/api";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

const schema = yup.object({
  vendor_id: yup.string().required("Vendor is required"),
  amount: yup
    .number()
    .typeError("Amount must be a number")
    .moreThan(0, "Amount must be > 0")
    .required("Amount is required"),
  mode: yup.mixed<"UPI" | "IMPS" | "NEFT">().oneOf(["UPI", "IMPS", "NEFT"]).required(),
  note: yup.string().trim().optional()
});

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

export default function PayoutNewPage() {
  const router = useRouter();
  const { data: vendorsData, error: vendorsError, isLoading: vendorsLoading } =
    useSWR<VendorsResponse>("/vendors");

  const vendors = vendorsData?.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Create payout (Draft)</h1>
          <p className="text-sm text-slate-600">OPS-only (server enforced).</p>
        </div>
        <Link className="text-sm text-slate-700 hover:underline" href="/payouts">
          Back to list
        </Link>
      </div>

      {vendorsError ? (
        <Alert
          title="Could not load vendors"
          message={(vendorsError as Error).message}
        />
      ) : null}

      <Formik
        enableReinitialize
        initialValues={{
          vendor_id: vendors[0]?._id ?? "",
          amount: "",
          mode: "UPI" as const,
          note: ""
        }}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting, setStatus }) => {
          setStatus(null);
          try {
            const amount = typeof values.amount === "string" ? Number(values.amount) : values.amount;
            const res = await api.post("/payouts", {
              vendor_id: values.vendor_id,
              amount,
              mode: values.mode,
              note: values.note || null
            });
            // Backend may return different shapes, e.g.:
            // { success, data: { _id, ... } } OR { payout: { _id } }
            const id =
              res.data?.data?._id ??
              res.data?.payout?._id ??
              res.data?.payout?.id ??
              undefined;
            router.push(id ? `/payouts/${id}` : "/payouts");
            router.refresh();
          } catch (e) {
            const err = e as Error;
            setStatus(err.message || "Failed to create payout");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({
          values,
          errors,
          touched,
          handleChange,
          handleBlur,
          handleSubmit,
          isSubmitting,
          status
        }) => (
          <form onSubmit={handleSubmit} className="space-y-4">
            {status ? (
              <Alert
                title="Could not create payout"
                message={String(status)}
              />
            ) : null}

            <div className="rounded-lg border bg-white p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Vendor *</label>
                  <select
                    name="vendor_id"
                    value={values.vendor_id}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    disabled={vendorsLoading}
                  >
                    {vendors.map((v) => (
                      <option key={v._id} value={v._id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                  {touched.vendor_id && errors.vendor_id ? (
                    <div className="mt-1 text-sm text-red-600">
                      {String(errors.vendor_id)}
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-medium">Amount *</label>
                  <input
                    name="amount"
                    value={values.amount}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="1000"
                    inputMode="decimal"
                  />
                  {touched.amount && errors.amount ? (
                    <div className="mt-1 text-sm text-red-600">
                      {String(errors.amount)}
                    </div>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-medium">Mode *</label>
                  <select
                    name="mode"
                    value={values.mode}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  >
                    <option value="UPI">UPI</option>
                    <option value="IMPS">IMPS</option>
                    <option value="NEFT">NEFT</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Note</label>
                  <textarea
                    name="note"
                    value={values.note}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Optional note"
                    rows={3}
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting || vendors.length === 0}>
                {isSubmitting ? "Creating…" : "Create Draft payout"}
              </Button>
              <Link
                href="/payouts"
                className="inline-flex items-center justify-center rounded-md border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </Link>
            </div>

            {vendors.length === 0 ? (
              <Alert
                tone="info"
                title="No vendors yet"
                message="Create a vendor first, then create a payout."
              />
            ) : null}
          </form>
        )}
      </Formik>
    </div>
  );
}

