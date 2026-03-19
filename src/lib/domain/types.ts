export type Role = "OPS" | "FINANCE";

export type Vendor = {
  id: string;
  name: string;
  upi_id?: string | null;
  bank_account?: string | null;
  ifsc?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PayoutMode = "UPI" | "IMPS" | "NEFT";
export type PayoutStatus = "Draft" | "Submitted" | "Approved" | "Rejected";

export type AuditAction = "CREATED" | "SUBMITTED" | "APPROVED" | "REJECTED";

export type AuditEntry = {
  id: string;
  payout_id: string;
  action: AuditAction;
  actor_role: Role;
  actor_label: string;
  timestamp: string;
  decision_reason?: string | null;
};

export type Payout = {
  id: string;
  vendor_id: string;
  amount: number;
  mode: PayoutMode;
  note?: string | null;
  status: PayoutStatus;
  decision_reason?: string | null;
  created_at: string;
  updated_at: string;
  submitted_at?: string | null;
  decided_at?: string | null;
};

