# Paystack Integration Plan (Optional Payment Route)

Status: **built — steps 1–8 implemented** (see §9). Steps 9 (settlement-report
import) and 10 (refunds/reversals) remain open; both need school policy answers
from §10 first.
Scope: adds Paystack as an **additional, switchable** payment lane
Parent document: `PORTAL_PAYMENT_INTEGRATION_PLAN.md`

## Implementation notes (what differed from the plan)

- **No separate `PAYSTACK_WEBHOOK_SECRET`.** Paystack signs webhooks with
  HMAC-SHA512 keyed on the *secret key* itself, so there is nothing extra to
  configure. `env.ts` takes `PAYSTACK_ENABLED`, `PAYSTACK_SECRET_KEY` and
  `PAYSTACK_CALLBACK_URL`, and refuses to boot on `ENABLED=true` with no key, or
  a `sk_test_` key under `NODE_ENV=production`.
- **Raw body handling (§4.2) had to change.** Fastify does not allow a
  route-scoped override of a content-type parser that already exists on the
  parent instance — registering the webhook in its own plugin throws
  `FST_ERR_CTP_ALREADY_PRESENT` at boot. Instead the one global JSON parser in
  `server/src/index.ts` stashes the untouched request text on
  `request.rawBody`, and the webhook computes the HMAC over exactly that.
- **A failed initialize deletes its `Payment` row** rather than leaving it at
  `initiated`, so the readiness screen's "stuck awaiting payment" count stays a
  true webhook-failure signal.
- **The cash-desk route was rewritten to use `verifyPaymentRecord`.** It had
  been applying its own invoice/receipt/notification logic — exactly the
  "fourth divergent path" this document warns about — which is why it silently
  did not credit feeding/transport wallets. All four verification paths (cash
  desk, accounts Verify button, statement auto-match, Paystack) now funnel
  through the one helper.
- **Wallet crediting is now part of verification.** A verified payment with
  category `feeding` or `transport` moves the matching wallet balance and
  writes a `WalletTransaction`. The parent wallet pages link to Pay Now rather
  than carrying their own top-up form.

## 1. Intent

Today a parent pays the school **outside** the portal (MTN MoMo merchant number
or an Ecobank deposit) and then submits the transaction reference for the
office to verify against a statement. That flow works without any provider
account and must keep working exactly as it does.

Paystack adds a second, faster lane: the parent pays **inside** the flow, and
the school's ledger is credited automatically once Paystack confirms the
transaction. This is an option, never a replacement:

- The school can turn Paystack off and lose nothing.
- MoMo-reference and bank-deposit lanes stay untouched in code and in UI.
- If Paystack is unreachable or disabled, the Pay Now page degrades to exactly
  what exists today.

Everything below assumes the school has decided to open a Paystack Ghana
business account. Until then, nothing in this plan is built.

## 2. What "optional" means mechanically

The switch lives on the **backend**, not in the frontend bundle. The frontend
asks what lanes are open rather than deciding for itself.

```txt
GET /finance/payment-methods
→ { "momo": true, "bank": true, "paystack": false }
```

`paystack` is true only when all of these hold:

1. `PAYSTACK_ENABLED=true`
2. `PAYSTACK_SECRET_KEY` and `PAYSTACK_WEBHOOK_SECRET` are present and parse
3. the process is not in a state where the key is a test key while
   `NODE_ENV=production`

`server/src/env.ts` gains those variables as **optional** with a refinement
that requires the keys when `PAYSTACK_ENABLED` is true. Adding them as required
would break every existing deployment on boot, which the current `env.ts`
`process.exit(1)` makes fatal.

The frontend never reads a `NEXT_PUBLIC_PAYSTACK_*` flag. A public flag would
drift from backend reality and could show parents a checkout button that 500s.

## 3. Data model changes

`Payment` in `server/prisma/schema.prisma` already carries `method`, `status`,
a unique `reference`, and verification metadata. Paystack needs four columns
and two new status values — no new table for the happy path.

```prisma
model Payment {
  // ... existing fields ...
  method String // momo | bank | cash | paystack
  status String @default("pending") // pending | initiated | verified | rejected | failed | abandoned

  // Provider fields — null for every manually-verified payment.
  provider          String?  // "paystack"
  providerReference String?  @unique
  providerChannel   String?  // card | mobile_money | bank_transfer | ussd
  providerFee       Int?     // provider fee in pesewas, as reported at verify
  providerPaidAt    DateTime?

  @@index([provider, providerReference])
}
```

Notes on each decision:

- **`providerReference` is `@unique`.** This is the idempotency guarantee. A
  replayed webhook cannot create a second credit because the row already
  exists and `verifyPaymentRecord` already short-circuits on
  `status === "verified"` (`server/src/lib/payments.ts:128`).
- **`initiated`** is a payment intent, not a payment. It must never appear in
  a parent's paid total, never generate a receipt, and never touch
  `Invoice.amountPaid`. Audit the existing `GET /me/payments` and
  `GET /payments` filters when adding it — anything that currently assumes
  "not rejected means it counts" needs a second look.
- **`providerFee` is stored in pesewas** because that is the unit Paystack
  reports and rounding it to cedis loses reconciliation accuracy. It is the one
  field in the schema that is not whole cedis, so it is named and commented as
  such.

### Amount unit — the single most likely bug

`Payment.amount`, `Invoice.totalAmount`, and `FeeItem.amount` are `Int` in
**whole Ghana cedis** (`createReceipt` prints `GHS ${payment.amount}` raw).
Paystack's API takes and returns amounts in **pesewas**.

Conversion happens only at the provider boundary, in one place:

```ts
// server/src/lib/paystack.ts
const toPesewas = (cedis: number) => cedis * 100;
const toCedis = (pesewas: number) => pesewas / 100;
```

The verify step asserts `toCedis(transaction.amount) === payment.amount` and
refuses to credit on mismatch. A 100× credit is the worst realistic failure
mode here, so this check is non-negotiable.

## 4. Backend endpoints

Three new routes in `server/src/routes/finance.ts`, matching the existing
`app.post("/me/payments/momo", ...)` shape and auth guards.

### 4.1 Initialize

```txt
POST /me/payments/paystack/initialize
```

1. `requireUser` + `resolveParent` — same guard as the MoMo route.
2. Zod-validate `{ studentId, invoiceId?, category, amount, note? }`.
3. **Assert the student is one of this parent's children.** The MoMo route
   already does this; the Paystack route must not be the one place it is
   skipped.
4. Reject if the flag is off, the amount is not a positive int, or the amount
   exceeds the invoice balance (overpayment goes through the office, not
   self-service checkout).
5. Generate our reference with the existing `newReference("PSK")` helper and
   create the `Payment` row at `status: "initiated"`.
6. Call Paystack `POST /transaction/initialize` with `amount: toPesewas(...)`,
   `currency: "GHS"`, `reference: <our reference>`, `email: <parent email>`,
   `callback_url`, and a `metadata` block carrying `paymentId`, `studentId`,
   `invoiceId`, `category`.
7. Return **only** `{ authorizationUrl, reference }`. No keys, no raw provider
   payload.

Using our own reference as Paystack's reference means the webhook, the verify
call, and our ledger all key on one string. Do not let Paystack generate it.

### 4.2 Webhook

```txt
POST /finance/payments/paystack/webhook
```

This route is public — no session — so its verification has to be airtight.

- **Raw body is required.** Paystack signs the exact bytes. The custom
  `addContentTypeParser` in `server/src/index.ts:52` replaces the body with a
  parsed object, so this route needs a route-scoped raw-body parser (register
  a `contentTypeParser` on a scoped Fastify plugin, or capture the raw buffer
  in a `preParsing` hook keyed to this URL). Verifying a re-serialized body
  will fail intermittently and look like a Paystack bug.
- Compute `HMAC-SHA512(rawBody, PAYSTACK_SECRET_KEY)` and compare to the
  `x-paystack-signature` header with `crypto.timingSafeEqual`.
- Optionally allowlist Paystack's published webhook IPs as defence in depth.
  The signature is the authority; the allowlist is not.
- Return `200` quickly for any well-formed signed event, including ones we
  ignore. Paystack retries non-2xx, and retrying an event we deliberately
  dropped is noise.

Handling, per event:

- `charge.success` → look up the payment by reference. If missing or already
  `verified`, ack and stop. Otherwise **re-verify against Paystack** (4.3) and
  credit only on that result.
- `charge.failed` → set `status: "failed"`, store the gateway reason, notify
  the parent. No ledger effect.
- everything else → ack, log, ignore.

**Never credit from the webhook payload alone.** The payload tells us to look;
the verify call tells us what is true.

### 4.3 Verify and credit

A shared helper, `confirmPaystackPayment(reference)`, called from the webhook
and from the parent's return-to-site callback:

1. `GET /transaction/verify/:reference` with the secret key.
2. Require `data.status === "success"`.
3. Require `toCedis(data.amount) === payment.amount`.
4. Require `data.currency === "GHS"`.
5. Persist `providerChannel`, `providerFee`, `providerPaidAt`.
6. Call the existing **`verifyPaymentRecord(paymentId, null)`**.

Step 6 is the point of the whole design. That function already applies the
invoice update, creates the receipt document, notifies the parent, and is
idempotent. Paystack must not grow its own copy of that logic — the
statement auto-matcher and the accounts "Verify" button already share it, and a
fourth divergent path is how ledgers drift.

`verifiedById` stays `null` for provider-confirmed payments; `provider =
"paystack"` is what distinguishes "machine verified" from "nobody verified".
Add an audit entry via `recordAudit` with the provider reference as the actor
detail.

## 5. Frontend changes

### 5.1 Pay Now page

`src/components/portal/PaymentMethodTabs.tsx` currently hardcodes two tabs
(`momo`, `bank`). Generalize it to take a tab array so a third lane is data,
not another boolean branch. The Paystack tab renders **only** when
`GET /finance/payment-methods` reports it open, and it renders first when
present — it is the fastest path for the parent.

The Paystack panel is deliberately thin: pick child, pick invoice or category,
enter amount, press "Pay with Paystack". The server action calls initialize and
redirects to `authorizationUrl`.

Use **Paystack's hosted checkout via redirect**, not the Paystack Inline JS
script. The redirect keeps a third-party script out of the portal, avoids CSP
changes, and moves all card-data handling off our origin. The UX cost is one
page transition.

### 5.2 Return page

```txt
/portal/[role]/fees/pay/confirm?reference=PSK-XXXXXX
```

This page shows a pending state and asks **our** backend for the payment's
status (short polling, a few attempts, then "we'll email you"). It must never
infer success from the fact that Paystack redirected back — a parent can reach
that URL by hand, and abandoning checkout can still redirect.

Copy should say what is true: "Paystack has confirmed this payment" or "Waiting
for confirmation — your balance updates automatically."

### 5.3 Accounts view

The payments table gains a "Source" column distinguishing office-verified from
Paystack-confirmed. Paystack rows are read-only for the manual verify/reject
actions — reversing one is a refund (section 7), not a status edit.

### 5.4 Readiness page

`/portal/[role]/payment-readiness` gains a Paystack row: flag state, key mode
(test/live), webhook last-received timestamp, and count of payments stuck at
`initiated` for more than an hour. That last number is the early warning that
webhooks have stopped arriving.

## 6. Fees and settlement

Paystack Ghana charges a percentage per transaction and settles **net of fees,
in batches**, not per transaction. Two consequences:

- **Decide who absorbs the fee before building.** If the school absorbs it, the
  parent is charged the invoice amount and the school banks slightly less —
  simplest, and `Payment.amount` stays the credited amount. If the fee is
  passed on, the charged amount and the credited amount differ, and both must
  be stored and shown to the parent before they commit. Recommendation: absorb
  it, and revisit once volume is known.
- **Bank deposits will not match payment records one-to-one.** One settlement
  line covers many payments minus fees. Reconciliation compares the sum of
  Paystack payments in a settlement window against the settlement amount plus
  `providerFee`, not individual rows.

The existing `StatementImport` / `StatementTransaction` reconciliation
(`server/src/routes/statements.ts`) is built for MoMo and bank CSVs. Paystack
settlement reports become a third import method rather than a new subsystem.
Its auto-matcher must not attempt to "match" already-verified Paystack payments
into a second credit.

## 7. Refunds and reversals

Paystack supports refunds via API. The rule from the parent document holds
without exception: **a refund is a new linked record, never an edit to the
original payment.** The original `Payment` row keeps `status: "verified"`
forever, and an adjustment row carries the negative effect and the provider
refund reference. Who may initiate and who must approve is still a school
policy decision and is out of scope here.

## 8. Security requirements

- `PAYSTACK_SECRET_KEY` and `PAYSTACK_WEBHOOK_SECRET` exist only as Render
  environment variables. They are never imported into `src/` — that directory
  ships to the browser.
- The webhook route uses timing-safe signature comparison.
- Initialize enforces parent-child ownership and account status before it ever
  calls Paystack.
- Amount, currency, and status are re-verified server-side before any credit.
- Provider errors shown to parents are generic; gateway responses are logged
  server-side only.
- Test keys must never run in production; the flag check refuses that
  combination at boot.

## 9. Build order

Each step is shippable and reversible on its own.

1. Schema migration for the provider columns and new status values. No
   behaviour change.
2. `server/src/env.ts` flag and optional keys, plus
   `GET /finance/payment-methods`. Returns `paystack: false` everywhere.
3. `server/src/lib/paystack.ts` — initialize, verify, unit conversion, HMAC
   check. Unit-tested against recorded fixtures, no live calls.
4. Initialize endpoint. Test-mode only.
5. Webhook endpoint with raw-body handling and signature verification.
6. `confirmPaystackPayment` wired into `verifyPaymentRecord`.
7. Frontend: generalize `PaymentMethodTabs`, add the Paystack panel and the
   confirm page.
8. Accounts source column and the readiness row.
9. Settlement report import and reconciliation.
10. Refund/reversal endpoints once school policy is settled.

Steps 1–6 can be exercised end to end with Paystack test keys and test MoMo
numbers before any parent sees a tab. Do not enable the flag in production
until a test-mode payment has been observed to move an invoice balance and
produce a receipt without anyone touching the accounts screen.

## 10. Open questions for the school

1. Does the school absorb the Paystack fee, or is it added to the parent's
   charge?
2. Which channels are enabled — MoMo only, or MoMo plus cards?
3. Which bank account receives settlements, and who reconciles them?
4. Are partial payments allowed through checkout, or full invoice only?
5. Who may issue a refund, and who approves it?
6. Does the school still want MoMo-reference submission available once
   Paystack is live, or does it become a fallback for failed checkouts only?
