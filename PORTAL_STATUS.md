# Divine International School Portal Status

This file is the source of truth for portal delivery progress. Update it at the
start and completion of every portal implementation phase.
`PORTAL_IMPLEMENTATION_PLAN.md` remains the portal architecture and product
brief.

## Current Phase

**Portal Phase 19: CMS media — calendar flipbook & post images**
Status: `complete`
Completed: July 26, 2026

Extends the Phase 18 CMS with rich media, all portal-managed and R2-backed.

- **School-calendar PDF flipbook**: admins upload the official calendar PDF
  (`portal/admin/website/calendar`); when published, the public calendar page
  renders it as a realistic page-turning book (PDF.js renders pages, page-flip
  animates) instead of the academic-term tabs, which remain the fallback. A new
  `CalendarDocument` (singleton, R2) with admin upload/publish/delete (audited)
  and public metadata + byte-serving endpoints; a same-origin `/calendar/pdf`
  proxy lets PDF.js load it without CORS; reduced-motion/failure falls back to
  an embedded PDF + download. Deps added: `pdfjs-dist`, `page-flip`.
- **News & event images**: each post can carry an image chosen from the site's
  built-in photo gallery (rendered through the optimized pipeline) or uploaded
  from the admin's computer (R2, served via a `/cms-image/:ref` proxy restricted
  to the `cms-images/` prefix). A reusable `ImagePicker` (gallery grid + upload)
  is wired into the news form and events manager; `POST /cms/images` +
  `GET /public/cms-image/:ref` back it. No image → the existing icon placeholder.
- **Public site polish**: reduced the Student Life feature-carousel heights so
  the Campus/Voices sections fit within a laptop viewport.

**Portal Phase 18: Public Website CMS (portal-managed site content)**
Status: `complete`
Completed: July 25, 2026

Lets school admins manage the **public marketing website's** content — news,
events, and the school calendar — from the portal, closing the "these static
updates can later be replaced by an approved CMS" note that was on the public
News page.

- **Backend** (migration `public_cms`, `server/src/routes/cms.ts`): three
  admin-managed models — `NewsArticlePost`, `EventPost`, `CalendarTermPost` —
  each with unauthenticated public read endpoints (`/public/news`,
  `/public/news/:slug`, `/public/events`, `/public/calendar`) that serve only
  `published` rows, and admin-only `/cms/*` CRUD with draft/published status.
  Every mutation is audit-logged (`cms.*` actions); icons are validated against
  an allowlist mirroring the web app's `ContentIcon` set so the public site can
  never receive an unknown icon name. Seed mirrors the prior static content.
- **Public site** (`src/lib/public-content.ts`): the news list/detail, calendar
  (terms + events), and the home News/Events/Calendar previews read from the
  public endpoints behind `USE_REAL_PUBLIC_CONTENT`, ISR-cached (60s), with a
  fall back to the typed static content on any error or when the flag is off —
  so the site always renders with no backend. CMS content is text + icon based
  (the site's photography uses a separate pre-optimized local image pipeline).
- **Portal admin UI** (`/portal/admin/website` + News/Events/Calendar managers):
  admin-only (non-admins 404). News has a create/edit form with a dynamic
  multi-section body editor; events and calendar have inline create/edit with
  publish toggles and ordering. Server actions call the backend then
  `revalidatePath` the affected public routes, so published edits appear on the
  live site immediately rather than after the ISR window.
- **Verified end-to-end through the real UI**: an admin publishing a news
  article or event in the portal makes it appear on public `/news` and
  `/calendar` instantly; a non-admin is 404'd from every CMS page; public reads
  expose only published rows (proven by a draft staying off the site and by the
  static-only "Admissions Enquiries" article being absent once backend reads are
  on). All content is rendered as escaped React text (no
  `dangerouslySetInnerHTML`), so admin-authored content can't inject script.

**Portal Phase 17: Real File Storage for Course Materials & Submissions**
Status: `complete`
Completed: July 25, 2026

Extends the R2 storage wired up for payment attachments to the two remaining
documented file categories: staff-uploaded course materials and student
assignment submissions.

- **Schema** (migrations `academics_file_storage`, `learning_resource_mimetype`,
  `learning_resource_created_at`): `LearningResource` gains `objectKey`,
  `mimeType`, `fileSize`, and `createdAt` (real timestamp for deterministic
  ordering — `sharedAt` is a day-granularity display date and ties within the
  same day). A new `AssignmentSubmission` table (one row per
  assignment+student, a re-submission overwrites it) holds the student's
  uploaded file.
- **Backend**: `POST /learning-resources` (staff/admin, own class only) uploads
  a file to R2 and creates the resource; `GET /learning-resources/:id/download`
  is gated by class access (admin any, staff their classes, student their own
  class). `POST /assignments/:id/submissions` (student, own class) uploads/
  re-uploads a file — `submittedCount` increments once per student, not per
  submission; `GET /assignments/:id/submissions` (staff/admin) lists them,
  `GET /assignments/:id/submissions/me` (student) returns their own, and
  `GET /submissions/:id/download` is gated to staff of that class, admin, or
  the submitting student. Uploads over 8MB are rejected (`413`).
- **Frontend**: the staff "Add course material" page now uploads for real
  (replacing the old device-only preview); the course home page lists shared
  materials with a working download link. The student assignment page's old
  "requires a later assignment submission and file-storage phase" placeholder
  is replaced with a real upload form showing submission status and a
  download link; staff see a submissions list with per-student download links
  on the same page. Both new download routes are same-origin Next.js proxies
  (mirroring the existing payment-attachment proxy), since the browser can't
  attach the backend's bearer token to a cross-origin request.
- **One real bug found and fixed during verification**: the submission
  status/list views initially 500'd — `formatPortalDate` expects a
  day-granularity string and appends its own time suffix, but
  `AssignmentSubmission.submittedAt` is a full ISO timestamp; fixed by slicing
  to the date portion first (the same pattern already used for
  `Payment.paidAt` elsewhere).

A follow-up security review (multi-pass: an independent identification pass,
then a separate false-positive-filtering pass per finding) covering the full
uncommitted backend surface (auth, admin accounts, payments, statement
reconciliation, academics, file storage) found and fixed four real issues,
all confirmed at 9/10 confidence:

- **Stored XSS via attacker-controlled upload `Content-Type`**: the payment
  bank-receipt upload and the new Phase 17 material/submission uploads all
  accepted an arbitrary client-supplied `mimeType`, stored it, and served it
  back verbatim as the literal `Content-Type` response header with
  `Content-Disposition: inline` on download — and the real accounts-console
  attachment link opens as a top-level `target="_blank"` navigation (not an
  `<img>`/fetch), so a `text/html`/`image/svg+xml` "receipt" or "material"
  would execute script in the viewing staff/student's authenticated session.
  Fixed with a shared upload MIME allowlist (`server/src/lib/
  file-validation.ts` — images, PDF, Office docs, plain text only) enforced
  on all three upload routes, plus a global `X-Content-Type-Options: nosniff`
  response header as defense-in-depth.
- **Statement reconciliation could be defrauded**: the exact-reference-match
  path in `POST /statements/import` auto-verified a payment without ever
  comparing the statement row's real amount to the payment's self-reported
  amount — a parent could pair a real (small) transaction's genuine reference
  with a fabricated (large) `amount` at submission time, and the next routine
  statement import would silently credit the invoice for the fabricated
  amount before any human reviewed it. Fixed by requiring the amounts to
  match even on an exact reference hit; a mismatch now stays unmatched for
  manual review instead of auto-verifying.
- **Staff reads were unscoped**: `GET /results`, `/attendance-summaries`,
  `/daily-attendance`, and `/gradebook` returned every class's records to any
  staff account, while the equivalent write endpoints already correctly
  scoped writes to the staff member's assigned classes via `canWriteClass`.
  Fixed with a new `resolveReadableClassIds` helper (mirrors
  `canWriteClass`) applied to all four read endpoints; admin is unaffected
  (unrestricted by design).
- A fifth candidate (no rate limiting on `/auth/login`) was raised but
  excluded per the review's own policy — rate-limiting/DOS concerns are out
  of scope for this pass.

All four fixes were re-verified end-to-end (disallowed MIME rejected `400`,
allowed MIME still succeeds, `nosniff` present, fabricated reference+amount
mismatch stays `pending`/unmatched, staff sees strictly fewer records than
admin for the same endpoints) with no regressions (`tsc`/`eslint` clean on
both apps).

**Portal Phase 16: Audit Logging**
Status: `complete`
Completed: July 25, 2026

Closes a gap called out repeatedly in `PORTAL_BACKEND_API_CONTRACT.md` section
8 and `PORTAL_AUTHORIZATION_PLAN.md` but never implemented: no audit trail
existed despite the backend now handling real auth, real payments, and real
files.

- **Schema** (migration `audit_log`): an append-only `AuditLog` table (actor,
  action, target type/id, a free-text summary, request id, IP, user agent,
  timestamp). No update/delete path is exposed.
- **`recordAudit()` helper** (`server/src/lib/audit.ts`): fire-and-log, not
  fire-and-throw — a broken audit insert is caught and logged, never blocks
  the business action it's recording.
- **Wired into every sensitive write**: login success/failure (with reason:
  not-found / inactive / bad-password) and logout; admin account create/
  update (update logs the actual before→after field diff); every payment path
  (MoMo/bank submit, cash record, verify, reject, attachment view) and
  statement reconciliation (import, manual match); assignment create,
  gradebook save, attendance save — plus the Phase 17 material/submission
  upload and download actions.
- **Admin-only read**: `GET /audit-logs`, paginated and filterable by
  `actorId`/`targetType`/`action`.

**Portal Phase 15: Backend Foundation & Core Domains**
Status: `complete`
Completed: July 25, 2026

The mock→real transition. A **separate Render backend service** (Fastify + Prisma
+ PostgreSQL) now implements six increments, each verified end-to-end against a
real Postgres database (`DIS`):

1. **Authentication** — admin-issued accounts, argon2-hashed passwords,
   server-owned sessions; Next.js login/session wired behind `USE_REAL_PORTAL_AUTH`
   (mock session remains the fallback).
2. **Admin account management** — list/create/suspend accounts; role + status
   lifecycle (admin-only, 401/403 enforced).
3. **Identity / people** — students, parents, staff, classes (+ the parent's own
   children).
4. **Finance** — fee items (incl. **admission** + **miscellaneous** categories),
   invoices, payments; parent finance reads; and a **cash-desk write** that records
   a payment, recomputes the invoice, and generates a receipt document.
5. **Transport** — routes, trips, and the parent's assigned transport (route +
   latest trip).
6. **Documents & notifications** — parent documents (bills, receipts, menu,
   calendar) and role/user-targeted notifications.

Backends for all six increments are built, migrated (`prisma migrate`), seeded,
and curl-verified. Three further backend domains were then added and verified
against the same database: **academics** (courses, course modules, assignments,
timetable, learning resources, results, attendance summaries, daily attendance,
gradebook — with student `/me/*` reads), **wallets** (feeding + transport wallet
balances, transactions, and a parent `/me/wallets` aggregate), and
**communication** (announcements, events, transport notices); an admin/accounts
`GET /transport/assignments` endpoint was also added.

A **messages** domain followed (migration `messages_domain`): `Conversation`,
`ConversationParticipant` (with a per-participant `lastReadAt`), and `Message`
models with `User` relations. `GET /me/conversations` returns viewer-relative
conversations (counterpart, preview, unread, and per-message `fromMe` are derived
for the requester); `POST /me/conversations/:id/messages` sends a reply and
`POST /me/conversations/:id/read` clears unread — both participant-guarded. This
makes the portal Messages UI (previously mock-only) backend-ready behind the
flag; the frontend `/me/conversations` data layer already matches the returned
shape.

**First real write paths** were then added (the portal was read-only + mock
previews before this):

- **Notification read state** (migration `notification_reads`): a
  `NotificationRead` table gives per-user read state; `GET /me/notifications`
  derives each `read` flag for the requester, and `POST /me/notifications/:id/read`
  (+`/read-all`) persist it.
- **Academics writes** (migration `academics_write_constraints` adds the upsert
  unique keys): `POST /assignments` (create), `POST /gradebook` (bulk score
  upsert), `POST /daily-attendance` (bulk register upsert) — all guarded so staff
  may only write to their own classes (admins any); validation → `400`,
  cross-class → `403`.
- **Frontend write plumbing**: a server-side `portalApiPost` helper plus BFF
  server actions under `src/app/(portal)/portal/actions/*` (messages,
  notifications, academics). Each action **no-ops as a preview when the flag is
  off** (mock UX unchanged) and POSTs with the session bearer token when on. The
  message composer, notifications read toggles, assignment form, gradebook
  Save/SpeedGrader and attendance register are wired to these actions and refresh
  on real success.

**Payment system — unified model + verification workflow (replaces the old
mock-only checkout).** The school's process is: parents pay by **Mobile Money**
or **Bank Deposit** externally, submit the transaction details, and the school
verifies each submission against a MoMo/bank statement before it counts;
**Cash** is verified immediately at the office desk. Every payment, regardless
of method, is one `Payment` record with a **generated receipt** on verification.

- **Unified model** (migration `payments_unified`): `Payment.status` is now
  `pending | verified | rejected` (`method` is `momo | bank | cash`), with
  verification metadata (`verifiedById`, `verifiedAt`, `rejectionReason`) and
  bank fields (`bankName`, `depositorName`, `depositDate`). A new
  `PaymentAttachment` table holds an uploaded deposit-slip photo (bytes in
  Postgres — a dev stopgap for real object storage).
- **Parent submission**: `POST /me/payments/momo` and `POST /me/payments/bank`
  (with an optional receipt image, sent as base64) create a `pending` payment
  scoped to the parent's own child; both notify the accounts/admin roles.
- **Verification core**: `POST /payments/:id/verify` / `/reject`, and the
  existing cash endpoint, all funnel through one `verifyPaymentRecord` helper
  (`server/src/lib/payments.ts`) — recomputes the invoice, creates the receipt
  `DocumentAsset`, and notifies the parent (`audience: "user"`, not broadcast).
- **Statement reconciliation** (migration `statement_reconciliation`, new
  `server/src/routes/statements.ts`): `POST /statements/import` accepts a CSV
  export (MoMo or bank), parses it with a small built-in parser, and
  auto-matches each row against pending payments of the same method — exact
  reference match, or amount + date (±3 days) + fuzzy depositor-name match
  (≥70% confidence) — auto-verifying matches through the same helper.
  Unmatched rows stay visible; `POST /statements/transactions/:id/match` lets
  an admin/accounts user link one by hand. `GET /statements` and
  `GET /statements/:id` list imports and their rows.
- **Frontend**: `MomoPaymentForm`/`BankDepositForm` (parent Pay Now, tabbed via
  `PaymentMethodTabs`) show the school's merchant number / bank account
  (`src/lib/portal/payment-config.ts`) and submit for verification;
  `CashPaymentForm` (accounts) records + verifies instantly; the accounts/admin
  **Payments console** (`/portal/{accounts,admin}/payments`) filters by status
  and has per-row Verify/Reject actions and a bank-attachment viewer (proxied
  through a same-origin Next.js route handler, since the browser can't attach
  the backend's bearer token to a cross-origin image request); a **Statement
  reconciliation** area (`/payments/statements`, `/payments/statements/:id`)
  handles CSV upload and manual matching.
- **Two real bugs found and fixed during verification**: (1) Fastify v5
  rejects a POST with `content-type: application/json` and an empty body
  before the route handler runs, which broke every bodyless action
  (`verifyPayment`, `markAllNotificationsRead`) — fixed by only setting that
  header when a body is sent (`portalApiPost`) and by adding a lenient
  content-type parser server-side. (2) `notifyPaymentParent` was defaulting to
  `audience: "all"`, broadcasting every "payment verified/rejected" notice
  (meant for one parent) to *every* signed-in user — fixed with a `"user"`
  audience sentinel matched only by `userId`.
- **Deferred (documented, needs external services)**: MTN MoMo Collections API
  auto-verify, OCR of the uploaded receipt, and automatic bank
  email/statement-import polling — manual statement upload is the live path
  today.

**Portal UI wiring — complete.** Via a repository layer (`src/lib/portal/data/*`)
that returns mock data when `USE_REAL_PORTAL_AUTH` is off and backend data when
on, **every portal page and all six role dashboards** now read through the real
API when the flag is on. Identity is resolved from the session for student,
parent, and staff dashboards (context helpers dispatch mock↔real), while admin
and accounts dashboards keep their illustrative aggregate summary/alert cards as
labelled mock data (not modelled in the backend). With the flag off the portal is
unchanged and continues to run on the mock session.

## Phase History

| Phase | Status | Completed | Delivered |
|---|---|---|---|
| Portal Phase 1: Foundation | `complete` | June 22, 2026 | Portal route group, login UI, cookie-backed mock session, role guards and redirects, responsive shared layout, role navigation, dashboard primitives, mock data modules, and protected role dashboard shells |
| Portal Phase 2: Role Dashboards | `complete` | June 23, 2026 | Student, parent, and staff dashboards plus admin and accounts summary shells using organized mock academic, communication, operational, and finance data |
| Portal Phase 3: Parent Payments and Fees UI | `complete` | June 23, 2026 | Parent fee summaries, invoice list, payment history, receipt placeholders, feeding balances and ledger, transport-fee category, and advance-payment previews |
| Portal Phase 4: Transport Tracking UI | `complete` | June 23, 2026 | Parent assigned-route tracking, trip timeline, pickup/drop-off and fee details, plus admin and transport-role route oversight with manual status-update previews |
| Portal Phase 5: Staff Operations UI | `complete` | June 23, 2026 | Staff class and roster views, attendance marking, assignment management, gradebook records, and resource-upload previews using fictional data |
| Portal Phase 6: Admin and Accounts Control | `complete` | June 23, 2026 | Admin student, parent, staff, class, and fee controls plus accounts invoice, payment, balance, feeding, transport-fee, and reporting views |
| Portal Phase 7: Course Workspace and To Do Alignment | `complete` | June 23, 2026 | Admin-issued account rule documented, dashboard quick-action blocks removed, student To Do page added, Resources navigation replaced with Canvas-inspired Courses workspaces for students and staff |
| Portal Phase 8: Backend API Contract and Readiness | `complete` | June 23, 2026 | Render API contract, typed endpoint/service/data ownership definitions, admin backend-readiness view, and implementation order for auth, database, audit, payments, storage, notifications, and optional LMS boundary |
| Portal Phase 9: Database Schema Readiness | `complete` | June 23, 2026 | PostgreSQL schema plan, typed table/relationship/index/migration/retention map, admin database-readiness view, and schema migration order without adding a database client or live data |
| Portal Phase 10: Authentication and Authorization Readiness | `complete` | June 23, 2026 | Production auth policy plan, typed role/route/session/account-lifecycle/password-reset maps, admin auth-readiness view, and backend-owned authorization boundaries without adding real credentials or auth provider code |
| Portal Phase 11: Payment Provider and Reconciliation Readiness | `complete` | June 23, 2026 | Payment-provider policy plan, typed provider/flow/ledger/webhook/reconciliation/receipt maps, admin/accounts payment-readiness view, and backend-owned payment boundaries without adding provider SDKs, keys, or live payments |
| Portal Phase 12: Secure File Storage Readiness | `complete` | June 25, 2026 | Private file storage policy plan, typed provider/category/flow/access/security/readiness maps, admin storage-readiness view, and backend-owned storage boundaries without adding provider SDKs, keys, signed URLs, upload endpoints, or live files |
| Portal Phase 13: Parent Portal UX Polish and Tracking Readiness | `complete` | June 25, 2026 | Smooth portal page transitions, dashboard title bounce, cleaned parent dashboard, parent Events page, grouped Fees navigation, ward-filtered finance pages, backend-gated Pay Now route, mock map-style transport tracking, and local-only pickup/drop-off preferences |
| Portal Phase 14: Parent Finance Refinement and Transport Wallet | `complete` | June 25, 2026 | Slower portal transitions, simplified parent Events and finance summary cards, parent Transport Wallet under Fees navigation, ward-filtered transport wallet balances/activity, and backend-gated transport advance payment readiness |
| Portal Phase 15: Backend Foundation & Core Domains | `complete` | July 25, 2026 | Separate Render backend (Fastify + Prisma + PostgreSQL) with six DB-backed, curl-verified increments: (1) auth — hashed passwords + server sessions, portal login wired behind `USE_REAL_PORTAL_AUTH`; (2) admin account management (create/suspend, 401/403); (3) identity — students/parents/staff/classes + parent's children; (4) finance — fee items (incl. admission + miscellaneous), invoices, payments, cash-desk write with receipt + invoice recompute; (5) transport — routes/trips + parent assignment; (6) documents + notifications. Plus academics, wallets, communication, and messages domains, the unified payment verification workflow (MoMo/bank/cash + statement reconciliation), and R2 object storage for payment attachments. Portal UI wiring **complete**: every page and all six role dashboards read through the real API behind `USE_REAL_PORTAL_AUTH` via a repository/context dispatch layer |
| Portal Phase 16: Audit Logging | `complete` | July 25, 2026 | Append-only `AuditLog` table + `recordAudit()` helper wired into every sensitive write (auth, admin accounts, payments, statements, academics writes, Phase 17 file operations); admin-only paginated `GET /audit-logs` read |
| Portal Phase 17: Real File Storage for Course Materials & Submissions | `complete` | July 25, 2026 | R2-backed course-material upload/download (class-scoped) and assignment-submission upload/list/download (student's own class; staff/admin see and download all); staff "Add material" and student assignment pages now do real uploads instead of device-only previews |
| Portal Phase 18: Public Website CMS | `complete` | July 25, 2026 | Admin-managed news/events/calendar for the public marketing site: backend models + published-only public read endpoints + admin CRUD (audited, icon-allowlisted); public pages read via `USE_REAL_PUBLIC_CONTENT` with ISR + static fallback; portal admin managers with `revalidatePath` so edits go live instantly |
| Portal Phase 19: CMS media (flipbook & images) | `complete` | July 26, 2026 | School-calendar PDF flipbook (PDF.js + page-flip; admin upload, R2, public flipbook replacing term tabs with embedded-PDF fallback); news/event images picked from the built-in gallery or uploaded to R2 via a reusable ImagePicker + `/cms-image` proxy; Student Life carousel heights trimmed to fit the viewport |

## Phase 1 Delivered

- Private portal routes are separated from the public website with the
  `(portal)` route group and a dedicated layout.
- `/portal/login` provides role selection for fictional student, parent, staff,
  administrator, accounts, and transport accounts.
- Mock authentication uses an HTTP-only, same-site cookie. It does not call a
  backend or use production credentials.
- `/portal/[role]/dashboard` is protected by a server-side role guard.
- Unauthenticated users are redirected to the selected role login.
- Signed-in users cannot browse another role's portal; they are redirected to
  their assigned mock dashboard.
- Shared portal shell components include sidebar, topbar, dashboard card,
  metric card, status badge, data table, and quick-action card.
- Role navigation is configured for all six planned roles. Routes scheduled for
  later phases are disabled instead of linking to unfinished pages.
- Mock data modules cover users, students, parents, staff, fees, invoices,
  payments, transport routes, and transport trips.
- Public portal cards and footer links now open the appropriate mock login.
- Private `/portal/` paths are disallowed in `robots.txt`; the public `/portal`
  landing remains available.

## Phase 2 Delivered

- Student dashboard with attendance, active assignments, recent average,
  today's timetable, quick-action previews, upcoming work, notices, results,
  and profile summary.
- Parent dashboard with linked children, combined attendance, outstanding fee
  snapshot, read-only payment history, notices, events, and a clearly bounded
  transport preview.
- Staff dashboard with assigned classes, student totals, teaching schedule,
  review queue, notices, workload indicators, and Phase 5 action previews.
- Admin dashboard shell with school-wide people and attendance metrics, class
  overview, admissions snapshot, fee collection indicator, alerts,
  announcements, and calendar preview.
- Accounts dashboard shell with expected, received, outstanding, and daily
  payment metrics, collection progress, transaction preview, finance alerts,
  and invoice-status summary.
- Transport remains a foundation-only dashboard because its operational UI is
  assigned to Portal Phase 4.
- Added typed mock data for classes, timetable entries, assignments, results,
  attendance, announcements, events, dashboard alerts, and operational
  summaries.
- Added reusable dashboard header, notice list, progress meter, formatting
  helpers, and improved disabled quick-action status labels.

## Phase 3 Delivered

- Protected parent fee page with family invoice totals, paid and outstanding
  balances, due date, invoice table, fee-category summaries, payment progress,
  and links to payment and feeding records.
- Protected parent payment-history page with category and method labels,
  successful-payment totals, transaction table, and per-transaction receipt
  download placeholders.
- Protected parent feeding page with child-level balances, active and
  low-balance statuses, feeding-plan details, wallet activity, and advance
  feeding top-up preview.
- Client-side payment preview for school fees, feeding advances, and transport
  advances. The preview validates amount and selections but performs no fetch,
  provider call, navigation, or backend write.
- Expanded mock invoices and payments for both linked children, including
  school-fee, feeding-fee, and transport-fee categories.
- Added typed feeding balances and wallet transactions while keeping all
  financial records fictional and frontend-only.
- Parent navigation now links to Fees, Payment History, and Feeding routes.

## Phase 4 Delivered

- Protected parent transport page with assigned child, bus, route, vehicle,
  driver contact, route stops, current location, next stop, last update, and
  morning trip timeline.
- Parent pickup and drop-off cards with mock points and estimated times.
- Parent transport fee summary with term charge, amount paid, outstanding
  balance, and payment status derived from mock finance records.
- Protected admin transport overview with route, driver, capacity, assigned
  student, trip status, location, delayed-trip, and arrival summaries.
- Transport-role dashboard upgraded from the foundation screen to the same
  operational route and trip overview.
- Manual trip-status update preview supports route, status, and location
  selection without mutating data, sending notifications, or calling an API.
- Added three mock routes, vehicles, drivers, morning trips, transport
  assignments, and transport notices.
- Parent and admin navigation now link to their role-specific transport views.

## Phase 5 Delivered

- Protected staff class-list page with assigned class cards, role indicators,
  subject totals, and a focused fictional student roster.
- Protected daily attendance page with editable present, late, absent, and
  excused marks plus live browser-only totals and submission preview.
- Protected assignment page with due dates, submission counts, status labels,
  and a local assignment-creation preview.
- Protected gradebook page with fictional assessment records, percentages,
  draft/published states, class average, and validated grade-entry preview.
- Protected staff learning-materials page with published/draft materials and a
  file upload placeholder that kept selected files on the user's device. This
  screen is superseded by the Phase 7 Courses workspace.
- Expanded typed mock data for staff rosters, daily attendance, assignment
  instructions and submission counts, gradebook entries, and course materials.
- Staff sidebar navigation links to Phase 5 operation routes.
- Attendance, assignment, grade, and former material-upload previews perform no
  fetch, backend write, notification, student-result update, or file upload.

## Phase 6 Delivered

- Protected admin student-management page with account states, class and parent
  links, and a local student-account creation preview.
- Protected admin parent-management page with contact details, child
  relationships, account states, and parent-account creation preview.
- Protected admin staff-management page with roles, class and subject
  assignments, account states, and staff-account creation preview.
- Admin class-management view integrated into the existing role-aware class
  route with class totals, teacher assignments, sample rosters, and class setup
  preview.
- Admin fee-item setup integrated into the existing role-aware fee route with
  category, term, academic year, amount, due date, and fee creation preview.
- Protected accounts invoice page with invoice status, balances, due dates, and
  student fee-assignment preview.
- Accounts payment management integrated into the existing role-aware payment
  route with successful, pending, and failed transaction records plus manual
  payment preview.
- Protected balances page with student, class, invoiced, paid, outstanding, and
  status records.
- Accounts feeding management integrated into the existing role-aware feeding
  route with wallet, top-up, balance, and low-balance summaries.
- Protected transport-fee page with route, bus, charge, paid, balance, and fee
  status records.
- Protected reports overview with collection metrics, category progress, and
  CSV/PDF/Excel export placeholders.
- Admin and accounts dashboards and sidebars now link to all Phase 6 controls.
- Expanded fictional people, fee, invoice, and payment datasets to exercise
  active, inactive, suspended, paid, partial, unpaid, pending, and failed
  states.
- All creation, assignment, payment, and export controls are browser-only
  previews with no credential creation, database write, reconciliation,
  provider call, email, or file generation.

## Phase 7 Delivered

- Updated `PORTAL_IMPLEMENTATION_PLAN.md` to confirm there is no public
  self-sign-up flow. Production accounts must be created or approved by school
  administrators before credentials are issued.
- Added no-sign-up guidance to the public portal access notes and the mock login
  page.
- Updated admin account-creation previews to describe admin-issued accounts
  instead of user self-registration.
- Removed dashboard quick-action sections from student, parent, staff, admin,
  and accounts dashboards.
- Removed the `QuickActionCard` component because dashboard action blocks are no
  longer part of the portal direction.
- Added `/portal/student/todo` as the dedicated student To Do page, replacing
  the old student dashboard upcoming-assignment block.
- Added `/portal/student/courses` with Canvas-inspired course cards, course
  navigation, course home sections, modules, assignments, course materials, and
  a To Do sidebar summary.
- Added `/portal/staff/courses` with Canvas-inspired course cards, course home
  sections, module/assignment/material records, assigned-class context, and
  browser-only course action previews.
- Replaced student/staff Resources navigation with Courses navigation.
- Kept `/portal/student/resources` and `/portal/staff/resources` as compatibility
  redirects to the matching Courses page so old links do not break.
- Expanded typed mock academic data with courses, modules, course-linked
  assignments, and course-linked materials.
- New course and To Do controls perform no fetch, backend write, Canvas
  integration, notification, file upload, or real submission.

## Phase 8 Delivered

- Added `PORTAL_BACKEND_API_CONTRACT.md` as the working backend contract for the
  future Render-hosted portal API.
- Documented the production account rule again: no public sign-up endpoint;
  accounts must be admin-issued or admin-approved.
- Added typed API contract structures for response envelopes, errors,
  pagination, endpoints, backend services, data ownership, and readiness checks.
- Added a portal API contract data module mapping planned endpoints to roles,
  frontend routes, audit requirements, current mock sources, and future stores.
- Added protected `/portal/admin/backend-readiness` with service boundary,
  endpoint contract, data ownership, readiness checks, and security-boundary
  summaries.
- Added the admin sidebar link for Backend Readiness.
- Kept all backend work contract-only. No Render service, database, payment
  provider, file storage, notification service, Canvas/LMS provider, production
  credentials, or live records were connected.

## Phase 9 Delivered

- Added `PORTAL_DATABASE_SCHEMA_PLAN.md` as the working PostgreSQL schema design
  document for the future Render backend.
- Added typed schema planning structures for domains, table specs,
  relationships, indexes, migration groups, audit levels, sensitivity levels,
  and retention rules.
- Added a schema contract data module covering identity, academics, courses,
  finance, transport, files, notifications, and audit-log tables.
- Added protected `/portal/admin/database-readiness` with planned tables,
  relationships, indexes, migration order, retention rules, and implementation
  boundaries.
- Added the admin sidebar link for Database Readiness.
- Kept the work design-only. No Prisma, Drizzle, migration files, PostgreSQL
  client, database URL, seed data, production records, or backend connection was
  added.

## Phase 10 Delivered

- Added `PORTAL_AUTHORIZATION_PLAN.md` as the production authentication and
  authorization policy draft.
- Added typed auth planning structures for role permissions, route access
  policies, account lifecycle, session controls, password reset rules, and auth
  readiness checks.
- Added an auth contract data module covering student, parent, staff, admin,
  accounts, and transport access scopes.
- Added protected `/portal/admin/auth-readiness` with role scopes, route
  ownership rules, account lifecycle, session controls, password reset policy,
  readiness checks, and implementation boundaries.
- Added the admin sidebar link for Auth Readiness.
- Kept the work policy-only. No real authentication provider, password hashing,
  reset token generation, session signing, MFA integration, credential storage,
  production users, secrets, or backend calls were added.

## Phase 11 Delivered

- Added `PORTAL_PAYMENT_INTEGRATION_PLAN.md` as the payment-provider, ledger,
  receipt, refund, and reconciliation policy draft.
- Added typed payment planning structures for provider candidates, payment flow
  steps, ledger rules, reconciliation controls, webhook events, receipt rules,
  and readiness checks.
- Added a payment contract data module covering Paystack, Hubtel, Flutterwave,
  manual office payments, provider-safe checkout boundaries, idempotent webhook
  rules, manual payment controls, settlement review, receipts, refunds, and
  reversals.
- Added protected `/portal/admin/payment-readiness` and
  `/portal/accounts/payment-readiness` for management and finance review.
- Added admin and accounts sidebar links for Payment Readiness.
- Kept the work policy-only. No payment provider SDK, checkout script, provider
  key, webhook secret, live checkout session, live receipt, bank settlement
  import, backend call, or live payment record was added.

## Phase 12 Delivered

- Added `PORTAL_FILE_STORAGE_PLAN.md` as the private file storage, signed
  upload/download, scanning, retention, and access-control policy draft.
- Added typed storage planning structures for provider candidates, file
  categories, upload/download flow steps, role access rules, security controls,
  and readiness checks.
- Added a storage contract data module covering S3-compatible private buckets,
  managed storage, school-owned private buckets, local development storage,
  course materials, submissions, report cards, receipts, exports, admin
  documents, and transport documents.
- Added protected `/portal/admin/storage-readiness` for administrative review of
  storage provider options, file categories, upload/download flow, access
  rules, security controls, readiness checks, and implementation boundaries.
- Added the admin sidebar link for Storage Readiness.
- Linked the storage policy from the backend API contract, database schema plan,
  and payment plan where file metadata, receipts, and finance exports are
  discussed.
- Kept the work policy-only. No storage provider SDK, bucket, object-storage
  credential, upload endpoint, signed URL generation, malware scanning
  integration, backend call, live file upload, live file download, or production
  file metadata was added.

## Phase 13 Delivered

- Added smooth portal route-enter animation and dashboard title bounce while
  preserving reduced-motion behavior.
- Removed the parent dashboard Messages metric card and dashboard Upcoming
  Events side card.
- Added the parent message count to the header notification control.
- Added protected `/portal/parent/events` as the dedicated parent Events page.
- Grouped parent finance navigation under Fees with Overview, Pay Now, Payment
  History, and Feeding Wallet subtabs.
- Added ward filtering to parent Fees Overview, Pay Now, Payment History, and
  Feeding Wallet views.
- Added protected `/portal/parent/fees/pay` as the prominent Pay Now route while
  keeping checkout backend-gated.
- Updated parent payment copy so payment action is prominent without implying a
  frontend payment provider is connected.
- Added mock route coordinates, a map-style transport tracking panel, and
  local-only pickup/drop-off preference controls.
- Kept the work frontend-only. No payment provider SDK, checkout script,
  provider key, map provider key, GPS feed, backend call, live payment write,
  invoice mutation, transport assignment write, notification, or audit-log write
  was added.

## Phase 14 Delivered

- Slowed the portal route-enter animation and dashboard title bounce timing
  while preserving reduced-motion behavior.
- Removed the top summary-card row from the parent Events page so the event list
  is the primary content.
- Removed Open Invoices summary cards from the parent Fees Overview and Pay Now
  pages.
- Removed the latest-payment style summary card from the parent Pay Now page.
- Removed the Transactions summary card from the parent Payment History page.
- Added a parent Transport Wallet page under the Fees navigation group.
- Added ward-filtered transport wallet balances and transport-wallet activity
  using fictional frontend mock data.
- Added a backend-gated transport advance payment action that does not call a
  provider, create a payment, mutate an invoice, or write a wallet ledger entry.
- Kept the work frontend-only. No payment provider SDK, checkout script,
  provider key, backend call, live payment write, invoice mutation, wallet
  ledger mutation, transport assignment write, notification, or audit-log write
  was added.

## Latest Verification

Phases 16–17 (audit logging + real file storage; backend run against the real
local PostgreSQL database; **full-stack pass** — a `USE_REAL_PORTAL_AUTH=true`
Next.js instance driven with Playwright against the live backend):

- Audit log: a failed login (bad password, unknown email) and a successful
  login each produce the correct `auth.login_failed` / `auth.login_succeeded`
  row with the right reason in `summary`; `GET /audit-logs` returns them to an
  admin and `403`s a parent.
- Course materials: staff upload → `201`, appears on the course home page
  with a working download link; downloaded bytes match the upload
  byte-for-byte; a student in a different role gets `403` on upload, a user
  with no access to the class gets `403` on download; a >8MB upload gets
  `413`.
- Assignment submissions: student submit → `201`, `submittedCount` increments
  by exactly 1; re-submitting the same student doesn't double-count and
  overwrites the same row; staff/admin list submissions and download them
  (bytes match); a non-owning user gets `403` on download.
- Browser pass caught one real bug (see Phase 17 above: `formatPortalDate`
  crashing on a full ISO timestamp) — fixed and re-verified with a fresh
  Playwright run showing the previously-500ing student assignment page
  rendering correctly with no console errors.
- `tsc --noEmit` and `eslint` clean on both the web app and the server after
  all Phase 16–17 changes.

Payment system (backend run against the real PostgreSQL `DIS` database; **plus
a full-stack pass** — a temporary `USE_REAL_PORTAL_AUTH=true` Next.js instance
run against the live backend, since this is a money-handling feature):

- Backend, direct: MoMo/bank submission → `pending`; duplicate reference →
  `409`; missing fields → `400`; wrong child / wrong role → `403`. Statement
  import: an exact-reference row auto-verifies (confidence 100); an
  amount+date+fuzzy-name row auto-verifies (confidence ≥70); an unrelated row
  stays unmatched. Manual match on an unmatched row → verified; re-matching the
  same row → `409`. Reject → `rejected` + reason; parent cannot verify/reject
  → `403`; re-verifying an already-verified payment is idempotent. Bank
  attachment bytes round-trip byte-for-byte through `GET /payments/:id/attachment`.
- Full-stack, real mode: the accounts **and** admin Payments consoles render
  the seeded pending MoMo/bank rows with working Verify/Reject buttons and a
  "Statement reconciliation" link; the status-filter tabs route to the correct
  role path (`/portal/{accounts,admin}/payments?status=...`); the parent Pay
  Now page renders the real merchant number and MoMo/Bank tabs; the parent
  Payment History page shows `pending`/`verified` correctly with a real "View
  receipt" link; the Next.js attachment proxy route streams the correct
  `image/png` bytes end-to-end and correctly returns `403` for a parent /
  `401` with no session.
- Mock mode (flag off): `tsc`/`eslint` clean; render sweep of the parent
  Pay Now/Payment History, accounts/admin Payments consoles, and the new
  Statement Reconciliation pages (empty-state) all `200` with no regressions
  to previously-wired pages.

First write paths (backend run against the real PostgreSQL `DIS` database; web
`tsc`/`eslint` clean; mock-mode render sweep of the wired pages all `200`):

- Notifications: per-user read verified — mark read → `read:true`, toggle →
  `false`, `read-all` → 0 unread, and a second user's unread count is unaffected
  (per-user isolation); unknown id → `404`, no token → `401`.
- Assignments: `POST /assignments` → `201` (computes `totalStudents`); non-owned
  class → `403`, non-staff → `403`, missing fields → `400`; admin may write any
  class → `201`.
- Gradebook: `POST /gradebook` upserts — an existing assessment updates in place
  and a brand-new column is inserted (no duplicates).
- Attendance: `POST /daily-attendance` upserts a class/date register; a
  re-submit updates the same row rather than duplicating.

Messages backend domain (backend run against the real PostgreSQL `DIS` database):

- Schema migrated (`messages_domain`), Prisma client regenerated, seed extended
  with 8 fictional conversations spanning all six roles; server `tsc --noEmit`
  clean.
- `GET /me/conversations`: staff sees 4 (viewer-relative counterpart/preview/
  unread/`fromMe` all correct); parent 3 (1 unread); student 2 (1 unread).
- `POST /me/conversations/:id/messages` → `201`, `fromMe:true`; on re-fetch the
  message appears and the sender's `unread` flips to `false`.
- Authz: no token → `401`; a student posting to a conversation it is not part of
  → `403`; `POST /me/conversations/:id/read` → `200`.

Portal Phase 15 UI-wiring completion (web checks against the live dev server,
flag off / mock mode):

- Web: `tsc --noEmit` clean, `eslint .` clean, server `tsc --noEmit` clean
  (new `/transport/assignments` endpoint + academics/wallets/communication
  routes).
- Authenticated render sweep of **33 portal pages** across all six roles (mock
  session cookie per role): every page returned `200` with no runtime/error
  markers — student dashboard/courses/todo; parent dashboard/fees/pay/payments/
  feeding/transport-wallet/transport/documents/events; staff dashboard/classes/
  courses/attendance/assignments/gradebook; admin dashboard/students/parents/
  staff/classes/fees/transport; accounts dashboard/invoices/payments/balances/
  feeding/transport-fees/reports; transport dashboard.
- All previously mock-only surfaces (academics, feeding/transport wallets,
  events, and the six role dashboards) now route through the repository/context
  dispatch layer.

Portal Phase 15 backend verification (backend run against a real PostgreSQL `DIS`
database; web checks against the live dev server):

- Server: `npm install`, `prisma generate`, `tsc --noEmit` passed; `prisma
  migrate dev` created `init` + `portal_domain_models` migrations; seed populated
  6 accounts + 2 classes/2 students/1 parent/2 staff/5 fee items/2 invoices/3
  payments/transport/4 documents/2 notifications.
- Auth: login → `/auth/me` → logout verified; wrong password `401`; post-logout
  `/auth/me` `401`.
- Admin account management: list, create account, PATCH → `suspended`; parent →
  `/admin/users` `403`; no token → `/students` `401`.
- People: admin reads students(2)/parents(1)/staff(2)/classes(2); parent
  `/me/children`(2).
- Finance: fee categories include `admission` + `miscellaneous`; parent
  `/me/invoices`(2)/`/me/payments`(3); `POST /payments/cash` → `201`, receipt
  auto-created (documents 4→5), invoice balance/status recomputed.
- Transport: `/me/transport` assignment(1) with route + latest trip.
- Documents/notifications: `/me/documents`(4), `/me/notifications`(2).
- Web: `tsc --noEmit` + `eslint` passed; with the flag off the live portal is
  unchanged (admin students `307` to login when unauthenticated).

Portal Phase 14 verification:

- ESLint: passed
- TypeScript (`tsc --noEmit`): passed
- Production build: passed
- Image verification: 99 WebP images across 12 albums passed
- Parent Fees Overview returned `200`, rendered the Fees navigation group and
  ward selector, and did not render an Open Invoices summary card.
- Parent Pay Now returned `200`, rendered Start secure payment, did not render
  Open Invoices or Latest Payment summary cards, and remained backend-gated.
- Parent Payment History returned `200`, rendered Payment history, and did not
  render a Transactions summary card.
- Parent Events returned `200`, rendered the event table content, and did not
  render the removed top event metric-card row.
- Parent Transport Wallet returned `200`, rendered ward filtering, transport
  wallet accounts, transport wallet activity, and the backend-gated transport
  payment action.
- Unauthenticated Parent Transport Wallet access returned `307` to parent
  login.
- Source audit found no fetch, external client, server action, backend form
  action, environment-secret access, payment provider SDK/client initialization,
  checkout script, provider key, live payment write, invoice mutation, wallet
  ledger mutation, transport assignment write, notification send, or audit-log
  write in the Phase 14 parent finance/events files

## Security and Integration Boundary

- A real backend (Fastify + Prisma + PostgreSQL) now exists with real
  authentication (hashed passwords, server-owned sessions). It is **off by
  default** in the web app: the portal uses the mock session unless
  `USE_REAL_PORTAL_AUTH=true`.
- The database holds **only fictional seed data** (demo accounts, sample
  students/fees/etc.); no real school records or credentials.
- No payment provider, transport GPS feed, or object-storage provider is
  connected yet; the cash-desk write is the only real payment path and it records
  a fictional payment.
- The frontend holds no secrets; the backend owns the database URL, session
  secret material, and password hashing.
- Local dev connects to a developer-supplied PostgreSQL via `DATABASE_URL`
  (kept in an env var / gitignored `.env`, never committed).

## Next Phase

Phases 15–17 are complete: real backend (auth through messages/payments/
statements), an audit trail on every sensitive write, and R2-backed file
storage for both payment attachments and course materials/submissions.

Remaining gaps, per the "Deferred" note under Phase 15 and the backend
README TODOs — none block current functionality, all need an external
service/decision before they can be built:

- MTN MoMo Collections API auto-verify, OCR of uploaded receipts, and
  automatic bank email/statement-import polling (manual statement upload is
  the live path today).
- Admin/accounts dashboard summary/alert cards remain illustrative mock data
  (not modelled in the backend) — a real aggregate-metrics endpoint would be
  the next increment here.
- Login rate limiting and optional MFA for admin/accounts (noted in
  `server/README.md`, tracked against `PORTAL_AUTHORIZATION_PLAN.md`).

Prerequisites the school must supply for the deferred items above: a payment-
provider account (MTN MoMo Collections API access) and, if automatic bank
statement polling is wanted, a mailbox/API the backend can poll.
