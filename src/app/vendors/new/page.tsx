"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Formik } from "formik";
import * as yup from "yup";
import { api } from "@/lib/api/api";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";

const schema = yup.object({
  name: yup.string().trim().required("Name is required"),
  upi_id: yup.string().trim().optional(),
  bank_account: yup.string().trim().optional(),
  ifsc: yup.string().trim().optional(),
  is_active: yup.boolean().default(true)
});

export default function VendorNewPage() {
  const router = useRouter();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">Add vendor</h1>
          <p className="text-sm text-slate-600">Create a new vendor.</p>
        </div>
        <Link className="text-sm text-slate-700 hover:underline" href="/vendors">
          Back to list
        </Link>
      </div>

      <Formik
        initialValues={{
          name: "",
          upi_id: "",
          bank_account: "",
          ifsc: "",
          is_active: true
        }}
        validationSchema={schema}
        onSubmit={async (values, { setSubmitting, setStatus }) => {
          setStatus(null);
          try {
            await api.post("/vendors", {
              ...values,
              upi_id: values.upi_id || null,
              bank_account: values.bank_account || null,
              ifsc: values.ifsc || null
            });
            router.push("/vendors");
            router.refresh();
          } catch (e) {
            setStatus((e as Error).message ?? "Failed to create vendor");
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
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
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
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving…" : "Save vendor"}
              </Button>
              <Link
                href="/vendors"
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

