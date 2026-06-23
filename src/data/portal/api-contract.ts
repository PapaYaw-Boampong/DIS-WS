import type {
  PortalApiEndpointSpec,
  PortalBackendServiceSpec,
  PortalDataEntitySpec,
  PortalReadinessCheck,
} from "@/types/portal-api";

export const portalBackendServices = [
  {
    id: "portal-api",
    name: "Portal API",
    responsibility:
      "Owns authenticated portal operations, role checks, data validation, audit logging, and database access.",
    plannedHost: "Render",
    status: "contracted",
    requiredSecretTypes: [
      "database connection URL",
      "session/JWT signing secret",
      "CORS allowed origin",
    ],
    notes:
      "The frontend must call this only after production authentication and deployment configuration are approved.",
  },
  {
    id: "postgres",
    name: "Portal PostgreSQL",
    responsibility:
      "Stores users, school records, academic data, invoices, balances, transport records, and audit logs.",
    plannedHost: "Render",
    status: "planned",
    requiredSecretTypes: ["database credentials"],
    notes:
      "Schema should be implemented after the contract is approved and before live portal data entry.",
  },
  {
    id: "payments",
    name: "Payment Provider",
    responsibility:
      "Handles mobile money/card/bank transfer initialization, callbacks, verification, and reconciliation.",
    plannedHost: "External provider",
    status: "planned",
    requiredSecretTypes: [
      "provider public key",
      "provider secret key",
      "webhook signing secret",
    ],
    notes:
      "No payment provider is selected or connected in the frontend. Provider secrets must remain server-side.",
  },
  {
    id: "object-storage",
    name: "Secure File Storage",
    responsibility:
      "Stores course materials, report cards, receipts, exports, and uploaded documents.",
    plannedHost: "External provider",
    status: "planned",
    requiredSecretTypes: ["storage access key", "storage secret key"],
    notes:
      "The portal should use signed upload/download URLs from the backend, not direct public buckets.",
  },
  {
    id: "notifications",
    name: "Notification Service",
    responsibility:
      "Sends approved email, SMS, WhatsApp, and in-app notification events.",
    plannedHost: "External provider",
    status: "planned",
    requiredSecretTypes: ["provider API token", "sender identity"],
    notes:
      "Notification sending must be triggered by backend events, not client-only actions.",
  },
  {
    id: "frontend",
    name: "Vercel Frontend",
    responsibility:
      "Renders public website and portal UI, keeps role routing, and consumes the backend API through approved contracts.",
    plannedHost: "Vercel frontend",
    status: "mocked",
    requiredSecretTypes: ["public API base URL only after backend is ready"],
    notes:
      "The current frontend remains mock-data-only and does not include production secrets.",
  },
] satisfies readonly PortalBackendServiceSpec[];

export const portalApiEndpoints = [
  {
    id: "auth-session",
    domain: "auth",
    method: "GET",
    path: "/v1/auth/session",
    summary:
      "Return the current authenticated user, role, status, and allowed portal routes.",
    roles: ["student", "parent", "staff", "admin", "accounts", "transport"],
    frontendRoutes: ["/portal/[role]/dashboard", "/portal/[role]/*"],
    status: "contracted",
    auditRequired: false,
    notes:
      "Replaces the current mock cookie session when production authentication is approved.",
  },
  {
    id: "auth-login",
    domain: "auth",
    method: "POST",
    path: "/v1/auth/login",
    summary:
      "Authenticate an administrator-issued account and create a secure server-managed session.",
    roles: ["student", "parent", "staff", "admin", "accounts", "transport"],
    frontendRoutes: ["/portal/login"],
    status: "contracted",
    auditRequired: true,
    notes:
      "There is no public sign-up endpoint. Accounts are created or approved by admins.",
  },
  {
    id: "identity-users",
    domain: "identity",
    method: "GET",
    path: "/v1/users",
    summary:
      "List portal users by role, status, class, account state, or search term.",
    roles: ["admin"],
    frontendRoutes: [
      "/portal/admin/students",
      "/portal/admin/parents",
      "/portal/admin/staff",
    ],
    status: "contracted",
    auditRequired: true,
  },
  {
    id: "identity-create-user",
    domain: "identity",
    method: "POST",
    path: "/v1/users",
    summary:
      "Create an administrator-issued student, parent, staff, accounts, or transport account.",
    roles: ["admin"],
    frontendRoutes: [
      "/portal/admin/students",
      "/portal/admin/parents",
      "/portal/admin/staff",
    ],
    status: "contracted",
    auditRequired: true,
    notes:
      "Must validate uniqueness, role permissions, linked records, and account status.",
  },
  {
    id: "academics-classes",
    domain: "academics",
    method: "GET",
    path: "/v1/classes",
    summary: "Return class summaries, teachers, rosters, and assigned subjects.",
    roles: ["staff", "admin"],
    frontendRoutes: ["/portal/staff/classes", "/portal/admin/classes"],
    status: "contracted",
    auditRequired: false,
  },
  {
    id: "academics-attendance",
    domain: "academics",
    method: "POST",
    path: "/v1/attendance/daily",
    summary:
      "Save a teacher-marked daily attendance register and audit the submission.",
    roles: ["staff", "admin"],
    frontendRoutes: ["/portal/staff/attendance"],
    status: "contracted",
    auditRequired: true,
  },
  {
    id: "courses-list",
    domain: "courses",
    method: "GET",
    path: "/v1/courses",
    summary:
      "Return course shells, modules, assignment summaries, materials, and progress scoped to the signed-in user.",
    roles: ["student", "staff", "admin"],
    frontendRoutes: ["/portal/student/courses", "/portal/staff/courses"],
    status: "contracted",
    auditRequired: false,
  },
  {
    id: "courses-todo",
    domain: "courses",
    method: "GET",
    path: "/v1/courses/todo",
    summary:
      "Return student To Do items derived from course assignments, quizzes, discussions, and teacher tasks.",
    roles: ["student"],
    frontendRoutes: ["/portal/student/todo"],
    status: "contracted",
    auditRequired: false,
  },
  {
    id: "courses-materials",
    domain: "files",
    method: "POST",
    path: "/v1/courses/{courseId}/materials",
    summary:
      "Create course material metadata and return a signed upload flow when file storage is ready.",
    roles: ["staff", "admin"],
    frontendRoutes: ["/portal/staff/courses"],
    status: "planned",
    auditRequired: true,
    notes:
      "Frontend must not upload directly to permanent storage without a backend-issued signed URL.",
  },
  {
    id: "finance-invoices",
    domain: "finance",
    method: "GET",
    path: "/v1/finance/invoices",
    summary:
      "Return invoices and balances scoped by role, student, family, class, term, or fee category.",
    roles: ["parent", "admin", "accounts"],
    frontendRoutes: [
      "/portal/parent/fees",
      "/portal/accounts/invoices",
      "/portal/accounts/balances",
    ],
    status: "contracted",
    auditRequired: false,
  },
  {
    id: "finance-create-invoice",
    domain: "finance",
    method: "POST",
    path: "/v1/finance/invoices",
    summary: "Assign approved fee items to students, classes, or groups.",
    roles: ["accounts", "admin"],
    frontendRoutes: ["/portal/accounts/invoices", "/portal/admin/fees"],
    status: "contracted",
    auditRequired: true,
  },
  {
    id: "finance-payment-init",
    domain: "finance",
    method: "POST",
    path: "/v1/finance/payments/initialize",
    summary:
      "Initialize a provider-backed payment for school fees, feeding, transport, or approved charges.",
    roles: ["parent"],
    frontendRoutes: ["/portal/parent/fees", "/portal/parent/feeding"],
    status: "planned",
    auditRequired: true,
    notes:
      "Provider keys and callbacks must live on the backend. Frontend receives only provider-safe checkout data.",
  },
  {
    id: "finance-manual-payment",
    domain: "finance",
    method: "POST",
    path: "/v1/finance/payments/manual",
    summary:
      "Record a cash, bank transfer, or office-confirmed manual payment.",
    roles: ["accounts"],
    frontendRoutes: ["/portal/accounts/payments"],
    status: "contracted",
    auditRequired: true,
  },
  {
    id: "transport-trips",
    domain: "transport",
    method: "GET",
    path: "/v1/transport/trips/current",
    summary:
      "Return current manually updated trip status for parents, admins, and transport officers.",
    roles: ["parent", "admin", "transport"],
    frontendRoutes: [
      "/portal/parent/transport",
      "/portal/admin/transport",
      "/portal/transport/dashboard",
    ],
    status: "contracted",
    auditRequired: false,
  },
  {
    id: "transport-update-trip",
    domain: "transport",
    method: "PATCH",
    path: "/v1/transport/trips/{tripId}",
    summary:
      "Update a manually managed trip status, location label, next stop, and delay reason.",
    roles: ["admin", "transport"],
    frontendRoutes: ["/portal/admin/transport", "/portal/transport/dashboard"],
    status: "contracted",
    auditRequired: true,
  },
  {
    id: "reports-finance",
    domain: "reports",
    method: "GET",
    path: "/v1/reports/finance",
    summary:
      "Generate finance report metadata and signed export links for authorized accounts users.",
    roles: ["accounts", "admin"],
    frontendRoutes: ["/portal/accounts/reports"],
    status: "planned",
    auditRequired: true,
  },
  {
    id: "notifications-events",
    domain: "notifications",
    method: "POST",
    path: "/v1/notifications/events",
    summary:
      "Queue approved in-app, email, SMS, or WhatsApp notifications from backend-side events.",
    roles: ["admin"],
    frontendRoutes: ["/portal/admin/dashboard"],
    status: "planned",
    auditRequired: true,
    notes:
      "Client pages should request actions; backend decides whether notifications are sent.",
  },
] satisfies readonly PortalApiEndpointSpec[];

export const portalDataEntities = [
  {
    entity: "Users and role assignments",
    plannedStore: "PostgreSQL",
    currentMockSource: "src/data/portal/users.ts",
    containsSensitiveData: true,
    auditRequired: true,
    notes:
      "Admin-issued account rule applies; no public registration table or endpoint.",
  },
  {
    entity: "Students, parents, staff, and class records",
    plannedStore: "PostgreSQL",
    currentMockSource:
      "src/data/portal/students.ts, parents.ts, staff.ts, academics.ts",
    containsSensitiveData: true,
    auditRequired: true,
    notes:
      "Parent-child links and staff class assignments must be enforced server-side.",
  },
  {
    entity: "Courses, modules, assignments, grades, and To Do items",
    plannedStore: "PostgreSQL",
    currentMockSource: "src/data/portal/academics.ts",
    containsSensitiveData: true,
    auditRequired: true,
    notes:
      "Canvas-inspired structure is local to DIS unless a future LMS integration is approved.",
  },
  {
    entity: "Invoices, payments, balances, and receipts",
    plannedStore: "PostgreSQL",
    currentMockSource:
      "src/data/portal/fees.ts, payments.ts, dashboard.ts",
    containsSensitiveData: true,
    auditRequired: true,
    notes:
      "Financial writes require accounts/admin authorization and immutable audit records.",
  },
  {
    entity: "Course files, report cards, receipts, and exports",
    plannedStore: "Object storage",
    currentMockSource: "Browser-only preview controls",
    containsSensitiveData: true,
    auditRequired: true,
    notes:
      "Use backend-issued signed URLs and private storage policies.",
  },
  {
    entity: "Provider payment references and callbacks",
    plannedStore: "Payment provider",
    currentMockSource: "No live provider connected",
    containsSensitiveData: true,
    auditRequired: true,
    notes:
      "Provider webhooks must be verified on the backend before updating balances.",
  },
] satisfies readonly PortalDataEntitySpec[];

export const portalReadinessChecks = [
  {
    id: "frontend-route-boundary",
    area: "Frontend route separation",
    status: "ready",
    detail:
      "Portal routes are isolated under the portal route group and remain noindex.",
  },
  {
    id: "mock-data-boundary",
    area: "Mock data boundary",
    status: "ready",
    detail:
      "Current portal records are fictional and local to the frontend codebase.",
  },
  {
    id: "account-policy",
    area: "Account policy",
    status: "ready",
    detail:
      "Plan and UI confirm no public sign-up; accounts are admin-issued or admin-approved.",
  },
  {
    id: "render-api",
    area: "Render API deployment",
    status: "needs_backend",
    detail:
      "Backend service, environment variables, CORS, health checks, and deployment pipeline are not created yet.",
  },
  {
    id: "database-schema",
    area: "PostgreSQL schema",
    status: "needs_backend",
    detail:
      "Tables, migrations, seed process, backups, and audit log schema still need implementation.",
  },
  {
    id: "payment-provider",
    area: "Payment provider",
    status: "needs_decision",
    detail:
      "Provider choice, settlement process, webhook verification, and reconciliation rules need approval.",
  },
  {
    id: "lms-boundary",
    area: "LMS/Course boundary",
    status: "needs_decision",
    detail:
      "Course pages are Canvas-inspired only. Direct Canvas integration has not been approved.",
  },
  {
    id: "secure-files",
    area: "Secure file storage",
    status: "needs_backend",
    detail:
      "Object storage provider, signed URL flow, malware scanning policy, and retention rules are not configured.",
  },
] satisfies readonly PortalReadinessCheck[];
