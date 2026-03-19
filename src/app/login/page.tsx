"use client";
export const dynamic = "force-dynamic";

import { useRouter, useSearchParams } from "next/navigation";
import { Formik } from "formik";
import * as yup from "yup";
import { api } from "@/lib/api/api";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import Link from "next/link";

const schema = yup.object({
  email: yup.string().trim().email("Invalid email").required("Email is required"),
  password: yup.string().required("Password is required")
});

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") ?? "/";

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-lg font-semibold">Sign in</h1>
        <p className="mt-1 text-sm text-slate-600">
          Enter your credentials to access payout ops.
        </p>

        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={schema}
          onSubmit={async (values, { setSubmitting, setStatus }) => {
            setStatus(null);
            try {
              const res = await api.post("/auth/login", {
                email: values.email,
                password: values.password
              });
              // Backend response:
              // { success, message, data: { token, user: { email, role, ... } } }
              const { data } = res.data as {
                success: boolean;
                message: string;
                data?: { token?: string; user?: { email?: string; role?: string } };
              };
              const token = data?.token;
              const user = data?.user;

              if (typeof window !== "undefined") {
                if (token) {
                  window.localStorage.setItem("authToken", token);
                }
                if (user?.email) {
                  window.localStorage.setItem("authEmail", user.email);
                }
                if (user?.role) {
                  window.localStorage.setItem("authRole", user.role);
                }
              }
              router.push(redirectTo);
              router.refresh();
            } catch (e) {
              const message =
                (e as any)?.response?.data?.message ||
                (e as Error).message ||
                "Login failed";
              setStatus(message);
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
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {status ? <Alert title="Login failed" message={String(status)} /> : null}

              <div>
                <label className="text-sm font-medium">Email</label>
                <input
                  name="email"
                  type="email"
                  value={values.email}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {touched.email && errors.email ? (
                  <div className="mt-1 text-sm text-red-600">{errors.email}</div>
                ) : null}
              </div>

              <div>
                <label className="text-sm font-medium">Password</label>
                <input
                  name="password"
                  type="password"
                  value={values.password}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className="mt-1 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                {touched.password && errors.password ? (
                  <div className="mt-1 text-sm text-red-600">{errors.password}</div>
                ) : null}
              </div>

              <Button type="submit" disabled={isSubmitting} >
                {isSubmitting ? "Signing in…" : "Sign in"}
              </Button>

              <div className="pt-2 text-xs text-slate-500">
                <Link href="/" className="hover:underline">
                  Back to home
                </Link>
              </div>
            </form>
          )}
        </Formik>
      </div>
    </div>
  );
}

