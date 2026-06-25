# Divine International School Portal Payment Integration Plan

Status: Phase 11 payment readiness draft
Frontend status: backend-gated Pay Now UX only
Production authority: future Render backend

## 1. Boundary

This plan defines how online payments, manual payments, receipts, refunds, and
reconciliation should work before live school payments are connected.

This phase does not add:

- payment provider SDKs or checkout scripts
- provider public keys
- provider secret keys
- webhook signing secrets
- live checkout sessions
- live receipts
- bank settlement imports
- backend calls
- live payment records

The existing frontend remains mock-only.

## 2. Provider Candidates

The portal plan has mentioned Paystack, Hubtel, Flutterwave, mobile money,
cards, bank transfer, and manual office payment. These remain candidates until
the school selects a provider and settlement workflow.

Provider choice should consider:

- Ghana mobile money support
- card support
- settlement timing
- fees
- webhook reliability
- reconciliation exports
- refund/reversal support
- school bank account requirements
- support availability

No provider is selected or connected in this repository.

## 3. Production Payment Flow

Recommended flow:

1. Parent opens Fees, Feeding, Transport, or Payments.
2. Parent chooses invoice or wallet top-up.
3. Frontend requests backend payment initialization.
4. Backend validates parent-child access, invoice state, amount, fee category,
   and account status.
5. Backend initializes the provider transaction using server-side credentials.
6. Frontend receives only provider-safe checkout data.
7. Provider collects payment.
8. Provider sends webhook to backend.
9. Backend verifies signature/reference and enforces idempotency.
10. Backend writes payment ledger entry and updates invoice or wallet balance.
11. Receipt becomes available.
12. Accounts reconciles provider settlement with the portal ledger and bank
    deposits.

The frontend must not mark a payment as successful just because a checkout page
was opened or returned.

The Phase 13 parent Pay Now page is the intended frontend entry point for this
flow. It must remain backend-gated until provider initialization, webhook
verification, ledger writes, and receipt generation exist in the Render API.

## 4. Ledger Rules

- Payment intent is not a payment.
- Provider references must be unique.
- Webhooks must be idempotent.
- Invoice balance changes must happen inside backend transactions.
- Feeding and transport advance payments must create wallet ledger entries.
- Manual payments require accounts role and audit logs.
- Refunds, reversals, and chargebacks are new ledger entries, not edits to the
  original payment.
- Receipts are available only after backend verification or accounts approval.

## 5. Manual Payment Flow

Manual payment covers cash, bank transfer, or office-confirmed payment evidence.

Recommended flow:

1. Parent pays through approved offline channel.
2. Accounts user opens Payments.
3. Accounts user enters student, invoice/category, amount, method, reference,
   and evidence note.
4. Backend checks duplicate reference and role permission.
5. Backend writes payment ledger and audit log.
6. Invoice or wallet balance updates.
7. Receipt becomes available.

## 6. Webhook Rules

Backend webhook endpoint:

```txt
POST /v1/finance/payments/webhook
```

Required behavior:

- verify provider signature/hash
- verify provider reference
- reject unknown or duplicate events safely
- fetch provider transaction status if required
- never trust client-provided success alone
- write audit log
- update invoice/wallet in a backend transaction
- return safe acknowledgement to provider

## 7. Reconciliation Rules

Accounts should be able to compare:

- portal payment records
- provider settlement reports
- bank deposits
- manual office records
- refunds/reversals
- pending confirmations
- failed/abandoned attempts

Every mismatch should have a status:

```txt
Matched
Pending Provider Settlement
Pending Bank Confirmation
Duplicate Provider Event
Amount Mismatch
Unknown Provider Reference
Manual Review Required
Resolved
```

## 8. Receipt Rules

Receipts should include:

- receipt number
- payment reference
- provider reference when applicable
- student
- parent/guardian when applicable
- category
- invoice/wallet target
- amount
- method
- status
- paid/verified timestamp
- issued timestamp

Receipts should not expose provider secrets or internal webhook payloads.

Receipt PDFs and finance exports should follow `PORTAL_FILE_STORAGE_PLAN.md`:
store generated files as private objects, keep metadata in PostgreSQL, issue
downloads only through backend authorization, and expire short-lived exports
unless formally archived.

## 9. Refund and Reversal Rules

The school still needs to approve:

- who can initiate refunds
- who can approve refunds
- how chargebacks are recorded
- whether overpayments become wallet credit or refundable balances
- how parent-visible refund notes are shown

Implementation rule:

Refunds and reversals should create linked adjustment records instead of editing
or deleting the original payment.

## 10. Security Requirements

- Provider secret keys stay only in the Render backend.
- Webhook signing secrets stay only in the Render backend.
- Payment initialization validates account status and role ownership.
- Parent payment access is limited to linked children.
- Accounts manual payments require accounts role.
- Admins/accounts can reconcile records; parent users cannot reconcile.
- Payment writes are immutable-audited.
- Provider errors shown to users must be safe and non-sensitive.

## 11. Implementation Order

1. Choose provider and settlement workflow.
2. Add backend payment configuration and secrets in Render only.
3. Add payment initialization endpoint.
4. Add webhook endpoint with verification and idempotency.
5. Add payment ledger transaction logic.
6. Add receipt generation.
7. Add manual payment write endpoint.
8. Add accounts reconciliation views/endpoints.
9. Add refund/reversal policy and endpoints.
10. Replace mock frontend payment controls one route at a time.

Do not wire the frontend directly to a payment provider before backend
verification, audit logging, and reconciliation rules are implemented.
