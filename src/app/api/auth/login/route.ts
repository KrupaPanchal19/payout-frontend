import { NextResponse } from "next/server";
import { setSession } from "@/lib/server/auth";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { role?: unknown } | null;
  const role = body?.role;
  if (role !== "OPS" && role !== "FINANCE") {
    return NextResponse.json({ error: "INVALID_ROLE" }, { status: 400 });
  }
  await setSession({ role, label: role === "OPS" ? "Ops User" : "Finance User" });
  return NextResponse.json({ ok: true });
}

