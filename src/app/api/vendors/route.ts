import { NextResponse } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { createVendor, listVendors } from "@/lib/server/store";

export async function GET() {
  const auth = await requireRole(["OPS", "FINANCE"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  return NextResponse.json({ vendors: listVendors() });
}

export async function POST(req: Request) {
  const auth = await requireRole(["OPS", "FINANCE"]);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = (await req.json().catch(() => null)) as
    | {
        name?: unknown;
        upi_id?: unknown;
        bank_account?: unknown;
        ifsc?: unknown;
        is_active?: unknown;
      }
    | null;

  const name = typeof body?.name === "string" ? body.name : "";
  if (!name.trim()) {
    return NextResponse.json({ error: "NAME_REQUIRED" }, { status: 400 });
  }

  const vendor = createVendor({
    name,
    upi_id: typeof body?.upi_id === "string" ? body.upi_id : null,
    bank_account: typeof body?.bank_account === "string" ? body.bank_account : null,
    ifsc: typeof body?.ifsc === "string" ? body.ifsc : null,
    is_active: typeof body?.is_active === "boolean" ? body.is_active : undefined
  });

  return NextResponse.json({ vendor }, { status: 201 });
}

