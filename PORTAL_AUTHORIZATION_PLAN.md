# Divine International School Portal Authentication and Authorization Plan

Status: Phase 10 auth readiness draft
Frontend status: mock session only
Production authority: future Render backend

## 1. Boundary

This plan defines how production portal authentication and authorization should
work before live school data is connected.

This phase does not add:

- a real authentication provider
- password hashing
- login credential storage
- JWT/session signing
- MFA provider integration
- reset-token generation
- backend calls
- secrets
- live user data

The current portal still uses mock accounts and mock sessions only.

## 2. Account Creation Rule

There is no public self sign-up.

Accounts are created, approved, linked, activated, suspended, reset, and audited
by authorized school administrators.

The production backend should not expose anonymous `/signup`, `/register`, or
public account-creation endpoints.

## 3. Production Session Authority

The frontend may render the portal shell, but the future backend must be the
authority for:

- credential verification
- account status checks
- role assignment
- session creation
- session revocation
- session expiry
- route authorization
- record ownership checks
- password reset tokens
- audit logging

The frontend should treat backend session data as read-only.

## 4. Roles and Access Levels

| Role | Access level | Summary |
|---|---|---|
| student | own record | Own dashboard, courses, To Do, timetable, results, attendance, notices |
| parent | linked records | Children linked through approved parent-child records |
| staff | assigned records | Assigned classes, subjects, courses, attendance, assignments, gradebook |
| admin | school-wide | Account lifecycle, people records, setup, readiness, operations |
| accounts | finance scope | Invoices, payments, balances, feeding wallets, finance reports |
| transport | transport scope | Assigned route and trip operations |

## 5. Route Authorization

Every protected route needs two checks:

1. role namespace check
2. record ownership/scope check

Examples:

- `/portal/student/*` requires the signed-in student account and own student
  record.
- `/portal/parent/*` requires linked child access through parent-child links.
- `/portal/staff/*` requires assigned class/subject scope for operational
  records.
- `/portal/admin/*` requires admin role.
- `/portal/accounts/*` requires accounts role.
- `/portal/transport/*` requires transport role when those routes are fully
  enabled.

Frontend redirects are helpful for user experience, but backend authorization is
mandatory before any live data is returned.

## 6. Account Lifecycle

Recommended production lifecycle:

1. School approves the person/record.
2. Admin creates the portal account.
3. Backend links account to student, parent, staff, accounts, or transport
   record.
4. Credential is issued through approved backend process.
5. Account owner completes first login/password setup.
6. Backend redirects user according to role.
7. Backend enforces role and ownership on every request.
8. Admin can suspend, deactivate, or reset access.
9. Sensitive lifecycle events write audit logs.

## 7. Password Reset

Password reset should:

- work only for existing administrator-issued accounts
- avoid revealing whether an email/phone exists
- use single-use short-lived tokens
- store/verify tokens server-side
- audit requests and completions
- allow admin-assisted resets after identity verification
- deny reset for suspended accounts unless admin policy permits it

## 8. Session Controls

Production decisions still needed:

- session expiry duration
- refresh strategy
- cookie/session storage strategy
- revocation behavior
- device/session list visibility
- MFA requirement for admin/accounts roles
- lockout/rate-limit policy

Non-negotiable controls:

- suspended/inactive users cannot authenticate
- client cannot assign its own role
- provider/session secrets remain server-side
- cross-role access is denied by backend authorization
- sensitive auth events are audit logged

## 9. Audit Requirements

Audit required for:

- successful login
- failed login
- logout/session revocation
- password reset request
- password reset completion
- account creation
- account activation/deactivation/suspension
- role changes
- parent-child link changes
- staff class/subject permission changes
- privileged access to admin/accounts controls

Audit records should include:

- actor user id and role where available
- target account or record
- action
- request id
- timestamp
- status/result
- safe summary of changed values

## 10. Implementation Order

Recommended auth implementation order:

1. Backend auth/session scaffold.
2. Account table and status enforcement.
3. Login endpoint for admin-issued accounts.
4. Session endpoint used by portal frontend.
5. Logout/session revocation.
6. Role and route authorization middleware.
7. Record ownership policies.
8. Admin account lifecycle endpoints.
9. Password reset flow.
10. Audit-log integration.
11. MFA decision and implementation for privileged roles if approved.

Do not connect live portal data before role, route, and record ownership
authorization are verified.
