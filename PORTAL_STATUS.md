# Divine International School Portal Status

This file is the source of truth for portal delivery progress. Update it at the
start and completion of every portal implementation phase.
`PORTAL_IMPLEMENTATION_PLAN.md` remains the portal architecture and product
brief.

## Current Phase

**Portal Phase 2: Role Dashboards**
Status: `complete`
Completed: June 23, 2026

## Phase History

| Phase | Status | Completed | Delivered |
|---|---|---|---|
| Portal Phase 1: Foundation | `complete` | June 22, 2026 | Portal route group, login UI, cookie-backed mock session, role guards and redirects, responsive shared layout, role navigation, dashboard primitives, mock data modules, and protected role dashboard shells |
| Portal Phase 2: Role Dashboards | `complete` | June 23, 2026 | Student, parent, and staff dashboards plus admin and accounts summary shells using organized mock academic, communication, operational, and finance data |
| Portal Phase 3: Parent Payments and Fees UI | `not started` | - | Parent fees, invoices, payment history, feeding and advance-payment interfaces |
| Portal Phase 4: Transport Tracking UI | `not started` | - | Parent transport tracking and admin/manual transport status interfaces |
| Portal Phase 5: Staff Operations UI | `not started` | - | Classes, attendance, assignments, gradebook, and resources interfaces |
| Portal Phase 6: Admin and Accounts Control | `not started` | - | People management, fee setup, invoices, payments, balances, and reports |

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

## Latest Verification

Portal Phase 2 verification:

- ESLint: passed
- TypeScript (`tsc --noEmit`): passed
- Production build: passed
- Image verification: 99 WebP images across 12 albums passed
- Role dashboard smoke: student, parent, staff, admin, accounts, and transport
  routes returned `200` and rendered their expected role content
- Dashboard metadata: all protected role routes retained `noindex, nofollow`
- Unauthenticated accounts dashboard: returned `307` to the accounts login
- Cross-role protection: a student session requesting the admin dashboard was
  redirected to the student dashboard
- Phase boundary: transport remained foundation-only and deeper feature routes
  remained disabled

## Security and Integration Boundary

- No real authentication provider is connected.
- No database, payment provider, transport feed, or Render API is connected.
- No live school records, secrets, payment credentials, or sensitive user data
  are stored in the frontend.
- All current portal people and records are fictional mock data.

## Next Phase

**Portal Phase 3: Parent Payments and Fees UI**

Build the parent fees, payments, invoice, payment-history, feeding-balance,
transport-fee, advance-payment, and receipt-placeholder interfaces using mock
data only. Do not connect a payment provider, database, Render API, or real
school financial records during Phase 3.
