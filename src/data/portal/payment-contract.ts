import type {
  PortalPaymentFlowStep,
  PortalPaymentLedgerRule,
  PortalPaymentProviderSpec,
  PortalPaymentReadinessCheck,
  PortalPaymentReceiptRule,
  PortalPaymentReconciliationControl,
  PortalPaymentWebhookRule,
} from "@/types/portal-payment";

export const portalPaymentProviders = [
  {
    id: "paystack",
    name: "Paystack",
    supportedMethods: ["mobile_money", "card", "bank_transfer"],
    roleInFlow:
      "Potential hosted checkout and verification provider for parent-initiated online payments.",
    secretTypes: [
      "public key",
      "secret key",
      "webhook signing secret",
    ],
    decisionStatus: "needs_decision",
    notes:
      "Listed as a candidate only. No package, script, key, or checkout integration is connected.",
  },
  {
    id: "hubtel",
    name: "Hubtel",
    supportedMethods: ["mobile_money", "card"],
    roleInFlow:
      "Potential Ghana payment collection provider for mobile money/card flows.",
    secretTypes: ["merchant account credentials", "API token", "webhook secret"],
    decisionStatus: "needs_decision",
    notes:
      "Listed as a candidate only. Provider settlement and reconciliation rules need school approval.",
  },
  {
    id: "flutterwave",
    name: "Flutterwave",
    supportedMethods: ["mobile_money", "card", "bank_transfer"],
    roleInFlow:
      "Potential hosted checkout and payment verification provider.",
    secretTypes: [
      "public key",
      "secret key",
      "encryption key",
      "webhook hash",
    ],
    decisionStatus: "needs_decision",
    notes:
      "Listed as a candidate only. No live provider configuration is present in the frontend.",
  },
  {
    id: "manual-office",
    name: "School office manual payments",
    supportedMethods: ["cash", "manual", "bank_transfer"],
    roleInFlow:
      "Accounts office records approved cash, bank transfer, or offline payment evidence.",
    secretTypes: [],
    decisionStatus: "designed",
    notes:
      "Manual payment recording remains an accounts/admin backend write with immutable audit records.",
  },
] satisfies readonly PortalPaymentProviderSpec[];

export const portalPaymentFlowSteps = [
  {
    step: 1,
    name: "Parent selects invoice or wallet top-up",
    actor: "parent",
    purpose:
      "Choose school fees, feeding, transport, or another approved charge from the parent portal.",
    auditRequired: false,
    status: "designed",
  },
  {
    step: 2,
    name: "Backend validates payable balance",
    actor: "backend",
    purpose:
      "Confirm the amount, student ownership, fee category, invoice status, and account state before initialization.",
    auditRequired: true,
    status: "designed",
  },
  {
    step: 3,
    name: "Backend initializes provider transaction",
    actor: "backend",
    purpose:
      "Create a provider transaction using server-side credentials and return only provider-safe checkout data.",
    auditRequired: true,
    status: "planned",
  },
  {
    step: 4,
    name: "Provider collects payment",
    actor: "provider",
    purpose:
      "Handle mobile money, card, or bank transfer authorization outside the frontend app.",
    auditRequired: false,
    status: "planned",
  },
  {
    step: 5,
    name: "Provider sends webhook",
    actor: "provider",
    purpose:
      "Notify the backend of successful, failed, abandoned, reversed, or pending payment state.",
    auditRequired: true,
    status: "planned",
  },
  {
    step: 6,
    name: "Backend verifies webhook",
    actor: "backend",
    purpose:
      "Verify provider signature/reference, enforce idempotency, and fetch provider status if required.",
    auditRequired: true,
    status: "planned",
  },
  {
    step: 7,
    name: "Backend updates ledger",
    actor: "backend",
    purpose:
      "Create immutable payment and wallet records, update invoice balances, and preserve reconciliation metadata.",
    auditRequired: true,
    status: "designed",
  },
  {
    step: 8,
    name: "Receipt becomes available",
    actor: "system",
    purpose:
      "Expose a generated receipt to parent/accounts after backend verification, not after client-side intent alone.",
    auditRequired: true,
    status: "designed",
  },
  {
    step: 9,
    name: "Accounts reconciles settlement",
    actor: "accounts",
    purpose:
      "Compare portal payment records against provider settlement, bank deposits, and school finance records.",
    auditRequired: true,
    status: "designed",
  },
] satisfies readonly PortalPaymentFlowStep[];

export const portalPaymentLedgerRules = [
  {
    rule: "Payment intent is not a payment record until provider verification succeeds or accounts records a manual payment.",
    affectedTables: ["payments", "audit_logs"],
    reason:
      "Prevents parents from receiving receipts for abandoned or unverified checkout attempts.",
    status: "designed",
  },
  {
    rule: "Provider references must be unique and idempotent.",
    affectedTables: ["payments"],
    reason:
      "A repeated webhook must not double-credit an invoice or wallet balance.",
    status: "designed",
  },
  {
    rule: "Invoice balances update only inside backend transactions.",
    affectedTables: ["invoices", "payments", "invoice_items"],
    reason:
      "Invoice and payment records must stay consistent even if a provider callback is retried.",
    status: "designed",
  },
  {
    rule: "Feeding and transport advances create wallet credit transactions after successful verification.",
    affectedTables: ["wallet_transactions", "payments"],
    reason:
      "Advance balances need an auditable ledger instead of direct balance edits.",
    status: "designed",
  },
  {
    rule: "Manual payments require accounts role, payment evidence, and immutable audit log.",
    affectedTables: ["payments", "audit_logs"],
    reason:
      "Cash and bank transfer entries need staff accountability and reconciliation review.",
    status: "designed",
  },
  {
    rule: "Refunds and reversals are new ledger entries, not destructive edits to original payments.",
    affectedTables: ["payments", "wallet_transactions", "audit_logs"],
    reason:
      "Financial history must remain traceable for school and parent review.",
    status: "planned",
  },
] satisfies readonly PortalPaymentLedgerRule[];

export const portalPaymentReconciliationControls = [
  {
    control: "Provider callback verification",
    owner: "backend",
    rule: "Backend verifies signature/hash and provider reference before changing financial records.",
    failureMode:
      "If verification fails, store audit event and do not update invoice or wallet balance.",
    status: "planned",
  },
  {
    control: "Idempotent webhook handling",
    owner: "backend",
    rule: "Repeated callbacks for the same provider reference return safely without duplicating ledger entries.",
    failureMode:
      "Duplicate event should be logged as duplicate and leave balances unchanged.",
    status: "designed",
  },
  {
    control: "Settlement review",
    owner: "accounts",
    rule: "Accounts compares provider settlement reports against portal payment records before monthly close.",
    failureMode:
      "Unmatched provider payments remain in pending reconciliation until reviewed.",
    status: "designed",
  },
  {
    control: "Manual payment approval",
    owner: "accounts",
    rule: "Manual payment entries require accounts role and audit trail.",
    failureMode:
      "Missing evidence or duplicate reference should block the backend write.",
    status: "designed",
  },
  {
    control: "Provider outage handling",
    owner: "backend",
    rule: "Frontend receives a safe unavailable state; secrets and provider errors are not exposed.",
    failureMode:
      "Parent can retry later or contact accounts without losing invoice state.",
    status: "planned",
  },
  {
    control: "Chargeback/refund review",
    owner: "accounts",
    rule: "Refunds, reversals, and chargebacks require separate ledger records and admin/accounts approval.",
    failureMode:
      "Original payment remains immutable; reversal appears as a linked adjustment.",
    status: "planned",
  },
] satisfies readonly PortalPaymentReconciliationControl[];

export const portalPaymentWebhookRules = [
  {
    event: "payment.success",
    backendAction:
      "Verify provider signature/reference, create successful payment ledger entry, update invoice/wallet balance, create receipt record.",
    idempotencyKey: "provider_reference",
    auditRequired: true,
    status: "planned",
  },
  {
    event: "payment.failed",
    backendAction:
      "Record failed attempt metadata without updating invoice or wallet balance.",
    idempotencyKey: "provider_reference",
    auditRequired: true,
    status: "planned",
  },
  {
    event: "payment.pending",
    backendAction:
      "Store pending state for accounts review or later provider confirmation.",
    idempotencyKey: "provider_reference",
    auditRequired: true,
    status: "planned",
  },
  {
    event: "payment.reversed",
    backendAction:
      "Create linked reversal ledger entry and flag reconciliation review.",
    idempotencyKey: "provider_reference + reversal_reference",
    auditRequired: true,
    status: "planned",
  },
] satisfies readonly PortalPaymentWebhookRule[];

export const portalPaymentReceiptRules = [
  {
    receiptType: "Online provider receipt",
    generatedBy: "backend",
    availableTo: ["parent", "accounts", "admin"],
    rule: "Available only after verified successful provider event.",
    status: "designed",
  },
  {
    receiptType: "Manual office receipt",
    generatedBy: "accounts",
    availableTo: ["parent", "accounts", "admin"],
    rule: "Available only after accounts user records approved manual payment.",
    status: "designed",
  },
  {
    receiptType: "Wallet top-up receipt",
    generatedBy: "backend",
    availableTo: ["parent", "accounts", "admin"],
    rule: "Shows feeding or transport wallet credit after verified payment.",
    status: "designed",
  },
  {
    receiptType: "Refund/reversal note",
    generatedBy: "accounts",
    availableTo: ["parent", "accounts", "admin"],
    rule: "Generated as a linked financial adjustment, not by editing the original receipt.",
    status: "planned",
  },
] satisfies readonly PortalPaymentReceiptRule[];

export const portalPaymentReadinessChecks = [
  {
    area: "Provider choice",
    status: "needs_decision",
    detail:
      "School must choose payment provider(s), settlement account, fees, and supported methods before integration.",
  },
  {
    area: "Provider secrets",
    status: "planned",
    detail:
      "All provider secret keys and webhook signing secrets must remain in the Render backend environment.",
  },
  {
    area: "Frontend payment UI",
    status: "ready",
    detail:
      "Parent fees, payments, feeding, and transport fee screens exist as mock previews.",
  },
  {
    area: "Manual payments",
    status: "designed",
    detail:
      "Accounts manual payment workflow is planned as backend-audited office entry.",
  },
  {
    area: "Webhook verification",
    status: "planned",
    detail:
      "Provider callbacks need backend signature/reference verification before balances change.",
  },
  {
    area: "Reconciliation",
    status: "designed",
    detail:
      "Accounts should compare provider settlement, bank deposits, and portal ledger records before close.",
  },
  {
    area: "Refund policy",
    status: "needs_decision",
    detail:
      "School needs an approved policy for refunds, reversals, chargebacks, and overpayments.",
  },
  {
    area: "Receipt generation",
    status: "designed",
    detail:
      "Receipts become available only after verified provider success or approved manual payment entry.",
  },
] satisfies readonly PortalPaymentReadinessCheck[];
