import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { approvePayout } from "@/lib/server/store";

export async function POST(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  const auth = await requireRole(["FINANCE"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { id } = await ctx.params;
  const result = approvePayout(id, { role: auth.user.role, label: auth.user.label });
  if (!result.ok) {
    const status = result.error === "NOT_FOUND" ? 404 : 400;
    return NextResponse.json({ error: result.error }, { status });
  }

  return NextResponse.json({ payout: result.payout });
}

