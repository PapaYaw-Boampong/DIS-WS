# Divine International School Portal Backend API Contract

Status: Phase 8 contract draft
Frontend branch: `portal-foundation`
Backend target: separate Render API service, not this Next.js frontend

## 1. Boundary

The current portal remains a mock-data frontend. This contract defines the
backend surface that should be built before replacing mock data with live school
records.

The frontend must not contain:

- database credentials
- payment provider secrets
- storage provider secrets
- notification provider secrets
- production authentication signing secrets
- live student, parent, staff, fee, payment, or transport records

The future backend owns authentication, authorization, validation, database
writes, audit logging, payment verification, file storage, notification sending,
and provider webhooks.

## 2. Account Rule

The portal must not expose public self sign-up.

Student, parent, staff, accounts, transport, and admin accounts are created,
approved, linked, activated, suspended, reset, and audited by authorized school
administrators.

The backend should therefore include admin account-management endpoints, but no
public `/signup`, `/register`, or anonymous account-creation endpoint.

## 3. Deployment Model

```txt
Browser
  -> Vercel Next.js frontend
      -> Render Portal API
          -> PostgreSQL
          -> Private file/object storage
          -> Payment provider
          -> Notification provider
```

The Vercel frontend may eventually use a public API base URL. All sensitive
provider credentials must remain in the Render backend environment.

## 4. Response Shape

Successful responses should use a consistent envelope:

```ts
type ApiSuccess<T> = {
  ok: true;
  data: T;
  requestId: string;
};
```

Error responses should be structured:

```ts
type ApiError = {
  ok: false;
  error: {
    code:
      | "UNAUTHENTICATED"
      | "FORBIDDEN"
      | "VALIDATION_ERROR"
      | "NOT_FOUND"
      | "CONFLICT"
      | "RATE_LIMITED"
      | "PROVIDER_UNAVAILABLE"
      | "INTERNAL_ERROR";
    message: string;
    fieldErrors?: Record<string, string[]>;
    requestId: string;
  };
};
```

List endpoints should use pagination:

```ts
type Paginated<T> = {
  items: T[];
  pageInfo: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
  };
};
```

## 5. Authentication and Authorization

Required backend behavior:

- Authenticate only existing administrator-issued accounts.
- Deny inactive or suspended accounts.
- Return a server-managed session with role and account status.
- Enforce role access on every endpoint.
- Enforce record ownership:
  - students can only access their own records
  - parents can only access linked children
  - staff can only access assigned classes and subjects unless granted broader permissions
  - accounts users can access finance records but not full academic administration
  - admins have broad management access
- Record audit logs for login attempts, account changes, financial writes,
  attendance writes, transport updates, exports, and file operations.

The detailed authentication and authorization policy draft is tracked in
`PORTAL_AUTHORIZATION_PLAN.md`.

## 6. Core Endpoint Groups

### Auth

| Method | Path | Purpose | Roles |
|---|---|---|---|
| `POST` | `/v1/auth/login` | Authenticate an existing admin-issued account | all portal roles |
| `POST` | `/v1/auth/logout` | End the current session | all portal roles |
| `GET` | `/v1/auth/session` | Return current user, role, status, and allowed routes | all portal roles |
| `POST` | `/v1/auth/password-reset/request` | Start approved reset flow | all portal roles |
| `POST` | `/v1/auth/password-reset/confirm` | Complete approved reset flow | all portal roles |

No public sign-up endpoint should exist.

### Identity and People

| Method | Path | Purpose | Roles |
|---|---|---|---|
| `GET` | `/v1/users` | List users by role/status/search | admin |
| `POST` | `/v1/users` | Create administrator-issued account | admin |
| `PATCH` | `/v1/users/{userId}` | Update status, role metadata, contact fields | admin |
| `GET` | `/v1/students` | List/search students | admin, staff scoped |
| `POST` | `/v1/students` | Create student record | admin |
| `GET` | `/v1/parents` | List/search parents | admin |
| `POST` | `/v1/parents/{parentId}/children` | Link parent to student | admin |
| `GET` | `/v1/staff` | List/search staff | admin |

### Academics and Courses

| Method | Path | Purpose | Roles |
|---|---|---|---|
| `GET` | `/v1/classes` | Return classes, teachers, rosters | admin, staff |
| `POST` | `/v1/classes` | Create/update class setup | admin |
| `GET` | `/v1/courses` | Return scoped courses, modules, assignments, materials | student, staff, admin |
| `POST` | `/v1/courses` | Create course shell | admin |
| `POST` | `/v1/courses/{courseId}/modules` | Create module | staff, admin |
| `POST` | `/v1/courses/{courseId}/assignments` | Create assignment | staff, admin |
| `GET` | `/v1/courses/todo` | Return student To Do list | student |
| `POST` | `/v1/attendance/daily` | Save daily attendance | staff, admin |
| `POST` | `/v1/gradebook/entries` | Save assessment marks | staff, admin |

Course pages are Canvas-inspired, but no Canvas integration is currently
approved. If a direct LMS integration is later desired, it should be designed as
a separate backend adapter.

### Finance

| Method | Path | Purpose | Roles |
|---|---|---|---|
| `GET` | `/v1/finance/fee-items` | List fee items | admin, accounts |
| `POST` | `/v1/finance/fee-items` | Create approved fee item | admin, accounts |
| `GET` | `/v1/finance/invoices` | List invoices and balances | parent scoped, admin, accounts |
| `POST` | `/v1/finance/invoices` | Assign invoices | admin, accounts |
| `GET` | `/v1/finance/payments` | List payment records | parent scoped, accounts, admin |
| `POST` | `/v1/finance/payments/manual` | Record manual payment | accounts |
| `POST` | `/v1/finance/payments/initialize` | Start provider payment | parent |
| `POST` | `/v1/finance/payments/webhook` | Verify provider callback | provider/backend only |
| `GET` | `/v1/reports/finance` | Generate report metadata/export links | accounts, admin |

Payment provider secrets and webhook verification must stay on the backend.

### Transport

| Method | Path | Purpose | Roles |
|---|---|---|---|
| `GET` | `/v1/transport/routes` | List routes, buses, stops, assignments | parent scoped, admin, transport |
| `POST` | `/v1/transport/routes` | Create/update route | admin, transport |
| `GET` | `/v1/transport/trips/current` | Return current trip statuses | parent scoped, admin, transport |
| `PATCH` | `/v1/transport/trips/{tripId}` | Update manual trip status | admin, transport |
| `POST` | `/v1/transport/announcements` | Publish route notice | admin, transport |

### Files and Notifications

| Method | Path | Purpose | Roles |
|---|---|---|---|
| `POST` | `/v1/files/upload-intents` | Create signed upload intent | staff, admin, accounts |
| `GET` | `/v1/files/{fileId}/download` | Return signed download URL if authorized | scoped by role |
| `POST` | `/v1/notifications/events` | Queue approved notification event | admin/backend |

## 7. Data Stores

Minimum PostgreSQL areas:

- users and sessions
- roles and permissions
- students, parents, parent-child links
- staff, classes, subjects, staff assignments
- courses, modules, module items, assignments, submissions
- attendance records
- gradebook entries
- fee items, invoices, payments, balances
- feeding wallet transactions
- transport routes, buses, stops, assignments, trips
- announcements and notices
- audit logs
- file metadata
- notification events

File binaries should live in private object storage, not in PostgreSQL.

The detailed schema draft is tracked in `PORTAL_DATABASE_SCHEMA_PLAN.md`.

## 8. Audit Requirements

Audit records should capture:

- actor user id and role
- action name
- target entity type and id
- previous value summary when relevant
- new value summary when relevant
- request id
- IP/user-agent where legally appropriate
- timestamp

Audit required for:

- account creation/status changes
- role changes
- parent-child links
- class/staff assignment changes
- attendance submissions
- grade entries
- fee item and invoice changes
- manual payment records
- provider payment verification
- report exports
- trip status updates
- file upload/download intents
- notification events

## 9. Backend Implementation Order

Recommended backend order:

1. Render service scaffold, health endpoint, CORS, request ids, logging.
2. PostgreSQL schema, migrations, seed data, audit-log table.
3. Authentication and session handling for admin-issued accounts.
4. Identity/admin account management.
5. Read-only portal data endpoints for dashboards and role pages.
6. Staff/admin write endpoints with audit logs.
7. Finance records and manual payments.
8. Payment provider initialization, webhook verification, and reconciliation.
9. Secure file storage with signed URLs.
10. Notifications.
11. Optional LMS/Canvas adapter only if explicitly approved.

## 10. Frontend Migration Rule

Each mock portal area should be replaced one route group at a time:

1. Keep mock data as fallback during the migration branch.
2. Add typed API client functions for one domain.
3. Verify authorization and route protection on the backend.
4. Smoke-test role access and cross-role denial.
5. Remove the matching mock dependency only after real endpoint behavior is
   validated.

Do not switch the whole portal from mock data to live data in one large change.
