export type LeadStatus =
  | "NEW"
  | "OPERATOR_ASSIGNED"
  | "ACCEPTED"
  | "ARCHIVED"
  | "SENT"
  | "SOLD";

export type LeadListItem = {
  id: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  comment?: string | null;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    title: string;
    commissionOperator: number;
    commissionTargetologist: number;
  } | null;
  targetologist?: {
    id: string;
    username: string;
    email: string;
  } | null;
  operator?: {
    id: string;
    username: string;
    email: string;
  } | null;
  client?: {
    id: string;
    username: string;
    email: string;
  } | null;
  statusLogs?: Array<LeadStatusLog>;
};

export type LeadStatusLog = {
  id: string;
  previousStatus?: LeadStatus | null;
  newStatus: LeadStatus;
  comment: string;
  timestamp: string;
  user?: {
    id: string;
    username: string;
    role: string;
  } | null;
};

export type BalanceSummary = {
  holdBalance: number;
  mainBalance: number;
  transactions: Array<{
    id: string;
    leadId?: string | null;
    amount: number;
    status: "hold" | "confirmed";
    type: "credit" | "debit";
    reason?: string | null;
    createdAt: string;
  }>;
};
