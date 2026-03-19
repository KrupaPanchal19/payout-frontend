import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-white p-5">
        <h1 className="text-xl font-semibold">CORD4 - Payout Ops</h1>
        <p className="mt-1 text-sm text-slate-600">
          Demo UI for Vendors + Payout workflow with role enforcement on server
          routes.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Link
          href="/vendors"
          className="rounded-lg border bg-white p-5 hover:bg-slate-50"
        >
          <div className="font-medium">Vendors</div>
          <div className="text-sm text-slate-600">List + add vendor</div>
        </Link>

        <Link
          href="/payouts"
          className="rounded-lg border bg-white p-5 hover:bg-slate-50"
        >
          <div className="font-medium">Payout requests</div>
          <div className="text-sm text-slate-600">
            Draft → Submitted → Approved/Rejected
          </div>
        </Link>
      </div>
    </div>
  );
}

