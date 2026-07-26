import type { PortalRole } from "@/types/portal";

export type PortalPaymentMethod =
  | "mobile_money"
  | "card"
  | "bank_transfer"
  | "cash"
  | "manual";

export type PortalPaymentCategory =
  | "school_fees"
  | "feeding"
  | "transport"
  | "uniform"
  | "books"
  | "exam"
  | "other";

export type PortalPaymentPolicyStatus =
  | "ready"
  | "designed"
  | "planned"
  | "needs_decision";

export type PortalPaymentProviderSpec = {
  readonly id: string;
  readonly name: string;
  readonly supportedMethods: readonly PortalPaymentMethod[];
  readonly roleInFlow: string;
  readonly secretTypes: readonly string[];
  readonly decisionStatus: PortalPaymentPolicyStatus;
  readonly notes: string;
};

export type PortalPaymentFlowStep = {
  readonly step: number;
  readonly name: string;
  readonly actor: PortalRole | "backend" | "provider" | "system";
  readonly purpose: string;
  readonly auditRequired: boolean;
  readonly status: PortalPaymentPolicyStatus;
};

export type PortalPaymentLedgerRule = {
  readonly rule: string;
  readonly affectedTables: readonly string[];
  readonly reason: string;
  readonly status: PortalPaymentPolicyStatus;
};

export type PortalPaymentReconciliationControl = {
  readonly control: string;
  readonly owner: PortalRole | "backend" | "provider";
  readonly rule: string;
  readonly failureMode: string;
  readonly status: PortalPaymentPolicyStatus;
};

export type PortalPaymentWebhookRule = {
  readonly event: string;
  readonly backendAction: string;
  readonly idempotencyKey: string;
  readonly auditRequired: boolean;
  readonly status: PortalPaymentPolicyStatus;
};

export type PortalPaymentReadinessCheck = {
  readonly area: string;
  readonly status: PortalPaymentPolicyStatus;
  readonly detail: string;
};

export type PortalPaymentReceiptRule = {
  readonly receiptType: string;
  readonly generatedBy: "backend" | "accounts";
  readonly availableTo: readonly PortalRole[];
  readonly rule: string;
  readonly status: PortalPaymentPolicyStatus;
};
