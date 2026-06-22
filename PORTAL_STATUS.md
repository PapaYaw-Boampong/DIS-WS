# Divine International School Portal Status

This file is the source of truth for portal delivery progress. Update it at the
start and completion of every portal implementation phase.
`PORTAL_IMPLEMENTATION_PLAN.md` remains the portal architecture and product
brief.

## Current Phase

**Portal Phase 1: Foundation**
Status: `complete`
Completed: June 22, 2026

## Phase History

| Phase | Status | Completed | Delivered |
|---|---|---|---|
| Portal Phase 1: Foundation | `complete` | June 22, 2026 | Portal route group, login UI, cookie-backed mock session, role guards and redirects, responsive shared layout, role navigation, dashboard primitives, mock data modules, and protected role dashboard shells |
| Portal Phase 2: Role Dashboards | `not started` | - | Student, parent, staff, admin, and accounts dashboard content |
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

## Latest Verification

Portal Phase 1 verification:

- ESLint: passed
- TypeScript (`tsc --noEmit`): passed
- Production build: passed
- Image verification: 99 WebP images across 12 albums passed
- Public `/portal`: returned `200`
- `/portal/login`: returned `200`
- Unauthenticated role dashboard: returned `307` to role login
- Mock parent login: created session cookie and reached the parent dashboard
- Role mismatch: redirected back to the signed-in parent dashboard
- Logout: returned to login and protected access redirected to login afterward
- Role dashboard smoke: student, parent, staff, admin, accounts, and transport
  routes returned `200` with matching mock sessions
- Robots smoke: `/portal/` private paths are disallowed

## Security and Integration Boundary

- No real authentication provider is connected.
- No database, payment provider, transport feed, or Render API is connected.
- No live school records, secrets, payment credentials, or sensitive user data
  are stored in the frontend.
- All current portal people and records are fictional mock data.

## Next Phase

**Portal Phase 2: Role Dashboards**

Build role-specific student, parent, staff, admin, and accounts dashboard
content using the Phase 1 shell and mock data. Do not begin payments, transport
operations, backend integration, or production authentication during Phase 2.
