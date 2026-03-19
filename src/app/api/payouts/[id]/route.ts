import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { getPayout, getPayoutAudit } from "@/lib/server/store";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(["OPS", "FINANCE"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await ctx.params;
  const payout = getPayout(id);
  if (!payout) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  return NextResponse.json({ payout, audit: getPayoutAudit(id) });
}

