"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserMenu } from "@/components/UserMenu";

function NavLink({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const active = pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      className={[
        "rounded-md px-3 py-2 text-sm font-medium",
        active ? "bg-slate-900 text-white" : "text-slate-700 hover:bg-slate-200"
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-10 border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-semibold">
              CORD4
            </Link>
            <span className="hidden text-sm text-slate-500 md:inline">
              Payout Ops
            </span>
          </div>

          <nav className="flex items-center gap-2">
            <NavLink href="/vendors" label="Vendors" />
            <NavLink href="/payouts" label="Payouts" />
          </nav>

          <UserMenu />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </div>
  );
}

