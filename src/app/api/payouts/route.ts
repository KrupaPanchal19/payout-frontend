import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { createPayout, getVendor, listPayouts } from "@/lib/server/store";

export async function GET(req: Request) {
  const auth = await requireRole(["OPS", "FINANCE"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const url = new URL(req.url);
  const status = url.searchParams.get("status") ?? undefined;
  const vendor_id = url.searchParams.get("vendor_id") ?? undefined;

  const allowedStatus =
    status === "Draft" ||
    status === "Submitted" ||
    status === "Approved" ||
    status === "Rejected"
      ? status
      : undefined;

  return NextResponse.json({
    payouts: listPayouts({ status: allowedStatus, vendor_id })
  });
}

export async function POST(req: Request) {
  const auth = await requireRole(["OPS"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = (await req.json().catch(() => null)) as
    | { vendor_id?: unknown; amount?: unknown; mode?: unknown; note?: unknown }
    | null;

  const vendor_id = typeof body?.vendor_id === "string" ? body.vendor_id : "";
  const amount = typeof body?.amount === "number" ? body.amount : Number.NaN;
  const mode = typeof body?.mode === "string" ? body.mode : "";
  const note = typeof body?.note === "string" ? body.note : null;

  if (!vendor_id) return NextResponse.json({ error: "VENDOR_REQUIRED" }, { status: 400 });
  if (!getVendor(vendor_id))
    return NextResponse.json({ error: "VENDOR_NOT_FOUND" }, { status: 400 });
  if (!(amount > 0)) return NextResponse.json({ error: "AMOUNT_INVALID" }, { status: 400 });
  if (mode !== "UPI" && mode !== "IMPS" && mode !== "NEFT")
    return NextResponse.json({ error: "MODE_INVALID" }, { status: 400 });

  const payout = createPayout({
    vendor_id,
    amount,
    mode,
    note,
    actor: { role: auth.user.role, label: auth.user.label }
  });

  return NextResponse.json({ payout }, { status: 201 });
}

