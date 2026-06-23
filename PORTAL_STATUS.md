# Divine International School Portal Status

This file is the source of truth for portal delivery progress. Update it at the
start and completion of every portal implementation phase.
`PORTAL_IMPLEMENTATION_PLAN.md` remains the portal architecture and product
brief.

## Current Phase

**Portal Phase 4: Transport Tracking UI**
Status: `complete`
Completed: June 23, 2026

## Phase History

| Phase | Status | Completed | Delivered |
|---|---|---|---|
| Portal Phase 1: Foundation | `complete` | June 22, 2026 | Portal route group, login UI, cookie-backed mock session, role guards and redirects, responsive shared layout, role navigation, dashboard primitives, mock data modules, and protected role dashboard shells |
| Portal Phase 2: Role Dashboards | `complete` | June 23, 2026 | Student, parent, and staff dashboards plus admin and accounts summary shells using organized mock academic, communication, operational, and finance data |
| Portal Phase 3: Parent Payments and Fees UI | `complete` | June 23, 2026 | Parent fee summaries, invoice list, payment history, receipt placeholders, feeding balances and ledger, transport-fee category, and advance-payment previews |
| Portal Phase 4: Transport Tracking UI | `complete` | June 23, 2026 | Parent assigned-route tracking, trip timeline, pickup/drop-off and fee details, plus admin and transport-role route oversight with manual status-update previews |
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

## Latest Verification

Portal Phase 4 verification:

- ESLint: passed
- TypeScript (`tsc --noEmit`): passed
- Production build: passed
- Image verification: 99 WebP images across 12 albums passed
- Parent `/transport`: returned `200`, rendered current-trip and transport-fee
  details, and retained `noindex, nofollow`
- Admin `/transport`: returned `200` with route overview and manual update
  preview
- Transport dashboard: returned `200` with the operations overview and manual
  update preview
- Unauthenticated parent transport: returned `307` to parent login
- Cross-role protection: parent and admin sessions requesting the other role's
  transport route were redirected to their own dashboards
- Phase 3 regression: parent fees still returned `200` with invoice and advance
  payment preview content
- Integration boundary: transport pages explicitly identify data as manual and
  mock; no GPS, notification service, backend write, or API call is connected

## Security and Integration Boundary

- No real authentication provider is connected.
- No database, payment provider, transport feed, or Render API is connected.
- No live school records, secrets, payment credentials, or sensitive user data
  are stored in the frontend.
- All current portal people and records are fictional mock data.

## Next Phase

**Portal Phase 5: Staff Operations UI**

Build staff class lists, attendance marking, assignments, gradebook, and
resource-upload placeholders using mock data only.
