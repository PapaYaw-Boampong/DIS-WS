import type {
  PortalAccountLifecycleStep,
  PortalAuthReadinessCheck,
  PortalPasswordResetRule,
  PortalRolePermissionSpec,
  PortalRouteAccessSpec,
  PortalSessionControlSpec,
} from "@/types/portal-auth";

export const portalRolePermissions = [
  {
    role: "student",
    label: "Student",
    permissionLevel: "own_record",
    allowedDomains: ["session", "route_guard", "authorization"],
    accessSummary:
      "Can read their own dashboard, courses, To Do items, timetable, results, attendance, notices, and approved files.",
    deniedSummary:
      "Cannot access finance management, other students, parent records, staff tools, or admin controls.",
    status: "designed",
  },
  {
    role: "parent",
    label: "Parent / guardian",
    permissionLevel: "linked_records",
    allowedDomains: ["session", "route_guard", "authorization"],
    accessSummary:
      "Can read records for children linked through parent_student_links, including fees, payments, feeding, transport, attendance, and results.",
    deniedSummary:
      "Cannot access unlinked students, staff tools, admin controls, or accounts reconciliation controls.",
    status: "designed",
  },
  {
    role: "staff",
    label: "Staff / teacher",
    permissionLevel: "assigned_records",
    allowedDomains: [
      "session",
      "route_guard",
      "authorization",
      "account_lifecycle",
    ],
    accessSummary:
      "Can manage classes, courses, attendance, assignments, gradebook records, and materials for assigned class/subject scopes.",
    deniedSummary:
      "Cannot manage finance records, unassigned classes, account setup, or school-wide admin controls unless explicitly granted later.",
    status: "designed",
  },
  {
    role: "admin",
    label: "Administrator",
    permissionLevel: "school_wide",
    allowedDomains: [
      "account_lifecycle",
      "session",
      "authorization",
      "password_reset",
      "audit",
      "route_guard",
    ],
    accessSummary:
      "Can create and manage approved accounts, people records, class setup, fees, transport, readiness views, and broad school configuration.",
    deniedSummary:
      "Should not bypass immutable finance/payment audit records or provider reconciliation rules.",
    status: "designed",
  },
  {
    role: "accounts",
    label: "Accounts / finance",
    permissionLevel: "finance_scope",
    allowedDomains: ["session", "route_guard", "authorization", "audit"],
    accessSummary:
      "Can manage invoices, manual payments, balances, feeding wallets, transport fee balances, and finance reports.",
    deniedSummary:
      "Cannot manage academic grades, staff assignments, transport trip operations, or account lifecycle outside finance approval flows.",
    status: "designed",
  },
  {
    role: "transport",
    label: "Transport",
    permissionLevel: "transport_scope",
    allowedDomains: ["session", "route_guard", "authorization", "audit"],
    accessSummary:
      "Can view assigned transport operations and update manually managed trip statuses when enabled.",
    deniedSummary:
      "Cannot access finance reconciliation, academic records, account management, or unassigned operational scopes.",
    status: "designed",
  },
] satisfies readonly PortalRolePermissionSpec[];

export const portalRouteAccessPolicies = [
  {
    routePattern: "/portal/student/*",
    owner: "student",
    allowedRoles: ["student"],
    ownershipRule: "student.user_id must match the authenticated user id.",
    backendPolicy: "Require own_record scope and active account status.",
    status: "designed",
  },
  {
    routePattern: "/portal/parent/*",
    owner: "parent",
    allowedRoles: ["parent"],
    ownershipRule:
      "All child records must be joined through active parent_student_links.",
    backendPolicy: "Require linked_records scope and active account status.",
    status: "designed",
  },
  {
    routePattern: "/portal/staff/classes",
    owner: "staff",
    allowedRoles: ["staff"],
    ownershipRule:
      "Class records must match staff_class_assignments unless future elevated permission is granted.",
    backendPolicy: "Require assigned_records scope.",
    status: "designed",
  },
  {
    routePattern: "/portal/staff/courses",
    owner: "staff",
    allowedRoles: ["staff"],
    ownershipRule:
      "Course records must match assigned class/subject/teacher scope.",
    backendPolicy: "Require assigned_records scope before course writes.",
    status: "designed",
  },
  {
    routePattern: "/portal/staff/attendance",
    owner: "staff",
    allowedRoles: ["staff"],
    ownershipRule:
      "Attendance writes require the staff member to be assigned to the selected class.",
    backendPolicy: "Require assigned_records scope and immutable audit log.",
    status: "designed",
  },
  {
    routePattern: "/portal/admin/*",
    owner: "admin",
    allowedRoles: ["admin"],
    ownershipRule: "School-wide admin scope required.",
    backendPolicy:
      "Require admin role, active status, audit logging for sensitive writes.",
    status: "designed",
  },
  {
    routePattern: "/portal/accounts/*",
    owner: "accounts",
    allowedRoles: ["accounts"],
    ownershipRule: "Finance records are scoped to accounts role controls.",
    backendPolicy:
      "Require finance_scope and immutable audit for invoice/payment writes.",
    status: "designed",
  },
  {
    routePattern: "/portal/transport/*",
    owner: "transport",
    allowedRoles: ["transport"],
    ownershipRule:
      "Transport records are scoped to route/trip operation permissions.",
    backendPolicy:
      "Require transport_scope and audit logging for trip status updates.",
    status: "planned",
  },
  {
    routePattern: "/portal/admin/transport",
    owner: "admin",
    allowedRoles: ["admin"],
    ownershipRule: "Admin can oversee transport routes and manual status data.",
    backendPolicy: "Require admin role and audit trip/status writes.",
    status: "designed",
  },
] satisfies readonly PortalRouteAccessSpec[];

export const portalAccountLifecycleSteps = [
  {
    step: 1,
    name: "Record approved by school",
    actor: "admin",
    purpose:
      "Confirm the student, parent, staff, accounts, or transport record is legitimate before account setup.",
    auditRequired: true,
    status: "designed",
  },
  {
    step: 2,
    name: "Account created by admin",
    actor: "admin",
    purpose:
      "Create the user account with role, status, linked person record, and official contact details.",
    auditRequired: true,
    status: "designed",
  },
  {
    step: 3,
    name: "Credential issued",
    actor: "system",
    purpose:
      "Send or prepare credentials through an approved backend process after account creation.",
    auditRequired: true,
    status: "planned",
  },
  {
    step: 4,
    name: "First login and password setup",
    actor: "account_owner",
    purpose:
      "Require the account owner to complete secure first-use setup after receiving approved credentials.",
    auditRequired: true,
    status: "planned",
  },
  {
    step: 5,
    name: "Role-scoped portal access",
    actor: "system",
    purpose:
      "Redirect to the correct portal and enforce backend role/ownership checks for every request.",
    auditRequired: false,
    status: "designed",
  },
  {
    step: 6,
    name: "Suspension or deactivation",
    actor: "admin",
    purpose:
      "Disable access when a student leaves, a guardian link changes, a staff member exits, or finance/transport access is revoked.",
    auditRequired: true,
    status: "designed",
  },
] satisfies readonly PortalAccountLifecycleStep[];

export const portalSessionControls = [
  {
    control: "Session owner",
    rule: "The backend owns production sessions. The frontend only reads the authenticated session state.",
    reason:
      "Prevents client-side role spoofing and keeps signing/encryption secrets server-side.",
    status: "designed",
  },
  {
    control: "Role redirect",
    rule: "After login, users are redirected to the dashboard for the role returned by the backend session.",
    reason:
      "Matches current mock behavior while moving final authority to the backend.",
    status: "designed",
  },
  {
    control: "Cross-role denial",
    rule: "Requests to another role namespace redirect or return forbidden after backend authorization.",
    reason:
      "Students, parents, staff, accounts, and transport users must not browse admin or unrelated role records.",
    status: "designed",
  },
  {
    control: "Suspended account handling",
    rule: "Suspended and inactive users cannot create sessions or access protected portal routes.",
    reason:
      "Account state must be enforced before route data loads.",
    status: "designed",
  },
  {
    control: "Session expiry",
    rule: "Production sessions need an approved expiry and revocation strategy.",
    reason:
      "The current mock cookie expiry is not the production policy.",
    status: "needs_decision",
  },
  {
    control: "Multi-factor authentication",
    rule: "Admin and accounts roles should be evaluated for MFA before live finance or student data is enabled.",
    reason:
      "Privileged account takeover would expose sensitive academic and financial records.",
    status: "needs_decision",
  },
] satisfies readonly PortalSessionControlSpec[];

export const portalPasswordResetRules = [
  {
    actor: "account_owner",
    rule: "Can request a reset only for an existing administrator-issued account.",
    auditRequired: true,
    status: "designed",
  },
  {
    actor: "admin",
    rule: "Can initiate or approve reset for students, parents, staff, accounts, or transport users after identity verification.",
    auditRequired: true,
    status: "designed",
  },
  {
    actor: "system",
    rule: "Reset tokens must be single-use, short-lived, and stored/verified server-side.",
    auditRequired: true,
    status: "planned",
  },
  {
    actor: "system",
    rule: "No reset flow should reveal whether an email or phone belongs to an account.",
    auditRequired: false,
    status: "designed",
  },
] satisfies readonly PortalPasswordResetRule[];

export const portalAuthReadinessChecks = [
  {
    area: "No public signup",
    status: "ready",
    detail:
      "Plan and UI already state that accounts are administrator-issued or administrator-approved.",
  },
  {
    area: "Mock route guard",
    status: "ready",
    detail:
      "Current RoleGuard redirects unauthenticated and cross-role requests using mock sessions.",
  },
  {
    area: "Backend session authority",
    status: "planned",
    detail:
      "Production session verification must move to the Render backend before live data is used.",
  },
  {
    area: "Record ownership rules",
    status: "designed",
    detail:
      "Student, parent, staff, accounts, admin, and transport ownership rules are mapped for backend enforcement.",
  },
  {
    area: "Password reset",
    status: "planned",
    detail:
      "Reset request/confirm endpoints are contracted but not implemented.",
  },
  {
    area: "MFA policy",
    status: "needs_decision",
    detail:
      "School should decide whether admin/accounts roles require MFA before production finance/student records go live.",
  },
  {
    area: "Audit logging",
    status: "designed",
    detail:
      "Sensitive auth events must write immutable audit records in the backend.",
  },
] satisfies readonly PortalAuthReadinessCheck[];
