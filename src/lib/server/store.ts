import type {
  AuditAction,
  AuditEntry,
  Payout,
  PayoutMode,
  PayoutStatus,
  Role,
  Vendor
} from "@/lib/domain/types";

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now().toString(
    16
  )}`;
}

type DB = {
  vendors: Vendor[];
  payouts: Payout[];
  audits: AuditEntry[];
};

declare global {
  // eslint-disable-next-line no-var
  var __CORD4_DB__: DB | undefined;
}

function db(): DB {
  if (!globalThis.__CORD4_DB__) {
    const t = nowIso();
    globalThis.__CORD4_DB__ = {
      vendors: [
        {
          id: "v_1",
          name: "Acme Supplies",
          upi_id: "acme@upi",
          bank_account: null,
          ifsc: null,
          is_active: true,
          created_at: t,
          updated_at: t
        }
      ],
      payouts: [],
      audits: []
    };
  }
  return globalThis.__CORD4_DB__!;
}

export function listVendors() {
  return db().vendors.slice().sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function createVendor(input: {
  name: string;
  upi_id?: string | null;
  bank_account?: string | null;
  ifsc?: string | null;
  is_active?: boolean;
}) {
  const t = nowIso();
  const vendor: Vendor = {
    id: id("v"),
    name: input.name.trim(),
    upi_id: input.upi_id ?? null,
    bank_account: input.bank_account ?? null,
    ifsc: input.ifsc ?? null,
    is_active: input.is_active ?? true,
    created_at: t,
    updated_at: t
  };
  db().vendors.push(vendor);
  return vendor;
}

export function getVendor(vendorId: string) {
  return db().vendors.find((v) => v.id === vendorId) ?? null;
}

export function listPayouts(filters?: { status?: PayoutStatus; vendor_id?: string }) {
  let items = db().payouts.slice();
  if (filters?.status) items = items.filter((p) => p.status === filters.status);
  if (filters?.vendor_id) items = items.filter((p) => p.vendor_id === filters.vendor_id);
  items.sort((a, b) => b.created_at.localeCompare(a.created_at));
  return items;
}

export function getPayout(payoutId: string) {
  return db().payouts.find((p) => p.id === payoutId) ?? null;
}

export function getPayoutAudit(payoutId: string) {
  return db()
    .audits.filter((a) => a.payout_id === payoutId)
    .slice()
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

function addAudit(params: {
  payout_id: string;
  action: AuditAction;
  actor_role: Role;
  actor_label: string;
  decision_reason?: string | null;
}) {
  const entry: AuditEntry = {
    id: id("a"),
    payout_id: params.payout_id,
    action: params.action,
    actor_role: params.actor_role,
    actor_label: params.actor_label,
    timestamp: nowIso(),
    decision_reason: params.decision_reason ?? null
  };
  db().audits.push(entry);
  return entry;
}

export function createPayout(params: {
  vendor_id: string;
  amount: number;
  mode: PayoutMode;
  note?: string | null;
  actor: { role: Role; label: string };
}) {
  const t = nowIso();
  const payout: Payout = {
    id: id("p"),
    vendor_id: params.vendor_id,
    amount: params.amount,
    mode: params.mode,
    note: params.note ?? null,
    status: "Draft",
    decision_reason: null,
    created_at: t,
    updated_at: t,
    submitted_at: null,
    decided_at: null
  };
  db().payouts.push(payout);
  addAudit({
    payout_id: payout.id,
    action: "CREATED",
    actor_role: params.actor.role,
    actor_label: params.actor.label
  });
  return payout;
}

export function submitPayout(payoutId: string, actor: { role: Role; label: string }) {
  const payout = getPayout(payoutId);
  if (!payout) return { ok: false as const, error: "NOT_FOUND" };
  if (payout.status !== "Draft")
    return { ok: false as const, error: "INVALID_STATUS" };
  const t = nowIso();
  payout.status = "Submitted";
  payout.submitted_at = t;
  payout.updated_at = t;
  addAudit({
    payout_id: payout.id,
    action: "SUBMITTED",
    actor_role: actor.role,
    actor_label: actor.label
  });
  return { ok: true as const, payout };
}

export function approvePayout(payoutId: string, actor: { role: Role; label: string }) {
  const payout = getPayout(payoutId);
  if (!payout) return { ok: false as const, error: "NOT_FOUND" };
  if (payout.status !== "Submitted")
    return { ok: false as const, error: "INVALID_STATUS" };
  const t = nowIso();
  payout.status = "Approved";
  payout.decided_at = t;
  payout.updated_at = t;
  payout.decision_reason = null;
  addAudit({
    payout_id: payout.id,
    action: "APPROVED",
    actor_role: actor.role,
    actor_label: actor.label
  });
  return { ok: true as const, payout };
}

export function rejectPayout(
  payoutId: string,
  reason: string,
  actor: { role: Role; label: string }
) {
  const payout = getPayout(payoutId);
  if (!payout) return { ok: false as const, error: "NOT_FOUND" };
  if (payout.status !== "Submitted")
    return { ok: false as const, error: "INVALID_STATUS" };
  const t = nowIso();
  payout.status = "Rejected";
  payout.decided_at = t;
  payout.updated_at = t;
  payout.decision_reason = reason;
  addAudit({
    payout_id: payout.id,
    action: "REJECTED",
    actor_role: actor.role,
    actor_label: actor.label,
    decision_reason: reason
  });
  return { ok: true as const, payout };
}

