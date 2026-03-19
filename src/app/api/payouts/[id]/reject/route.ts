import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { rejectPayout } from "@/lib/server/store";

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(["FINANCE"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = (await req.json().catch(() => null)) as { reason?: unknown } | null;
  const reason = typeof body?.reason === "string" ? body.reason : "";
  if (!reason.trim()) {
    return NextResponse.json({ error: "REASON_REQUIRED" }, { status: 400 });
  }

  const { id } = await ctx.params;
  const result = rejectPayout(id, reason.trim(), {
    role: auth.user.role,
    label: auth.user.label
  });
  if (!result.ok) {
    const status = result.error === "NOT_FOUND" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ payout: result.payout });
}

