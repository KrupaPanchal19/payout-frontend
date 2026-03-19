"use client";

import { useMemo, useState } from "react";
import useSWR from "swr";
import { usePathname, useRouter } from "next/navigation";
type Role = "OPS" | "FINANCE";

async function logout() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("authToken");
    window.localStorage.removeItem("authEmail");
    window.localStorage.removeItem("authRole");
  }
}

export function UserMenu() {
  const router = useRouter();
  const pathname = usePathname();
  const { data, mutate, isLoading } = useSWR<{
    success: boolean;
    message: string;
    data?: { user?: { role: Role; email?: string } | null };
  }>("/auth/me");

  const apiUser = data?.data?.user ?? null;

  // Fall back to localStorage snapshot so header updates instantly after login
  let localUser: { email?: string; role?: Role } | null = null;
  if (typeof window !== "undefined") {
    const email = window.localStorage.getItem("authEmail") ?? undefined;
    const roleStr = window.localStorage.getItem("authRole") ?? undefined;
    const role = roleStr === "OPS" || roleStr === "FINANCE" ? roleStr : undefined;
    if (email || role) {
      localUser = { email, role };
    }
  }

  const user = apiUser ?? localUser;

  const [open, setOpen] = useState(false);
  const label = useMemo(() => {
    if (isLoading) return "Loading...";
    if (!user) return "Sign in";
    const roleText = user.role ? ` (${user.role})` : "";
    return `${user.email ?? "Signed in"}${roleText}`;
  }, [isLoading, user]);

  return (
    <div className="relative">
      <button
        type="button"
        className="rounded-md border px-3 py-2 text-sm hover:bg-slate-50"
        onClick={() => setOpen((v) => !v)}
      >
        {label}
      </button>
      {open ? (
        <div className="absolute right-0 mt-2 w-52 rounded-md border bg-white p-2 shadow">
          {!user ? (
            <button
              className="w-full rounded px-2 py-2 text-left text-sm hover:bg-slate-100"
              onClick={() => {
                router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
                setOpen(false);
              }}
            >
              Go to login
            </button>
          ) : (
            <>
              <div className="px-2 py-1 text-xs font-medium text-slate-500">
                {user.email ?? "Signed in"} {user.role ? `(${user.role})` : ""}
              </div>
              <div className="my-1 border-t" />
              <button
                className="w-full rounded px-2 py-2 text-left text-sm hover:bg-slate-100"
                onClick={async () => {
                  await logout();
                  await mutate();
                  setOpen(false);
                }}
              >
                Logout
              </button>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}

