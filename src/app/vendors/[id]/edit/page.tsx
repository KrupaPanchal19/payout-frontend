"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Formik } from "formik";
import * as yup from "yup";
import { api } from "@/lib/api/api";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

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

const schema = yup.object({
  name: yup.string().trim().required("Name is required"),
  upi_id: yup.string().trim().optional(),
  bank_account: yup.string().trim().optional(),
  ifsc: yup.string().trim().optional(),
  is_active: yup.boolean().default(true)
});

export default function VendorEditPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const vendorId = params.id;

  const { data, error, isLoading, mutate } = useSWR<VendorDetailResponse>(
    `/vendors/${vendorId}`
  );

  const vendor: Vendor | null =
    (data as any)?.data ?? (data as any)?.vendor ?? null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Edit vendor</h1>
          <p className="text-sm text-slate-600">
            Update vendor details and status.
          </p>
        </div>
        <Link className="text-sm text-slate-700 hover:underline" href={`/vendors/${vendorId}`}>
          Back to view
        </Link>
      </div>

      {error ? (
        <Alert title="Could not load vendor" message={(error as Error).message} />
      ) : null}

      <Formik
        enableReinitialize
        initialValues={{
          name: vendor?.name ?? "",
          upi_id: vendor?.upi_id ?? "",
          bank_account: vendor?.bank_account ?? "",
          ifsc: vendor?.ifsc ?? "",
          is_active: vendor?.is_active ?? true
        }}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting, setStatus }) => {
          setStatus(null);
          try {
            await api.put(`/vendors/${vendorId}`, {
              name: values.name,
              upi_id: values.upi_id || null,
              bank_account: values.bank_account || null,
              ifsc: values.ifsc || null,
              is_active: values.is_active
            });
            await mutate();
            router.push(`/vendors/${vendorId}`);
          } catch (e) {
            setStatus((e as Error).message ?? "Failed to update vendor");
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting, status }) => (
          <form onSubmit={handleSubmit} className="space-y-4">
            {status ? <Alert title="Could not save" message={String(status)} /> : null}
            <div className="rounded-lg border bg-white p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Name *</label>
                  <input
                    name="name"
                    value={values.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Vendor name"
                    disabled={isLoading || !vendor}
                  />
                  {touched.name && errors.name ? (
                    <div className="mt-1 text-sm text-red-600">{errors.name}</div>
                  ) : null}
                </div>

                <div>
                  <label className="text-sm font-medium">UPI ID</label>
                  <input
                    name="upi_id"
                    value={values.upi_id}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="example@upi"
                    disabled={isLoading || !vendor}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Bank account</label>
                  <input
                    name="bank_account"
                    value={values.bank_account}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="1234567890"
                    disabled={isLoading || !vendor}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">IFSC</label>
                  <input
                    name="ifsc"
                    value={values.ifsc}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="ABCD0123456"
                    disabled={isLoading || !vendor}
                  />
                </div>

                <div className="flex items-center gap-2 pt-6 md:col-span-2">
                  <input
                    id="is_active"
                    type="checkbox"
                    name="is_active"
                    checked={values.is_active}
                    onChange={handleChange}
                    className="h-4 w-4"
                  />
                  <label htmlFor="is_active" className="text-sm">
                    Active
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isSubmitting || isLoading || !vendor}>
                {isSubmitting ? "Saving…" : "Save changes"}
              </Button>
              <Link
                href={`/vendors/${vendorId}`}
                className="inline-flex items-center justify-center rounded-md border bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        )}
      </Formik>
    </div>
  );
}

