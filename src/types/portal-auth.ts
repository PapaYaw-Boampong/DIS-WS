import type { PortalRole } from "@/types/portal";

export type PortalAuthPolicyStatus =
  | "ready"
  | "designed"
  | "planned"
  | "needs_decision";

export type PortalAuthControlDomain =
  | "account_lifecycle"
  | "session"
  | "authorization"
  | "password_reset"
  | "audit"
  | "route_guard";

export type PortalPermissionLevel =
  | "none"
  | "own_record"
  | "linked_records"
  | "assigned_records"
  | "finance_scope"
  | "transport_scope"
  | "school_wide";

export type PortalRolePermissionSpec = {
  readonly role: PortalRole;
  readonly label: string;
  readonly permissionLevel: PortalPermissionLevel;
  readonly allowedDomains: readonly PortalAuthControlDomain[];
  readonly accessSummary: string;
  readonly deniedSummary: string;
  readonly status: PortalAuthPolicyStatus;
};

export type PortalRouteAccessSpec = {
  readonly routePattern: string;
  readonly owner: PortalRole;
  readonly allowedRoles: readonly PortalRole[];
  readonly ownershipRule: string;
  readonly backendPolicy: string;
  readonly status: PortalAuthPolicyStatus;
};

export type PortalAccountLifecycleStep = {
  readonly step: number;
  readonly name: string;
  readonly actor: PortalRole | "account_owner" | "system";
  readonly purpose: string;
  readonly auditRequired: boolean;
  readonly status: PortalAuthPolicyStatus;
};

export type PortalSessionControlSpec = {
  readonly control: string;
  readonly rule: string;
  readonly reason: string;
  readonly status: PortalAuthPolicyStatus;
};

export type PortalAuthReadinessCheck = {
  readonly area: string;
  readonly status: PortalAuthPolicyStatus;
  readonly detail: string;
};

export type PortalPasswordResetRule = {
  readonly actor: PortalRole | "account_owner" | "system";
  readonly rule: string;
  readonly auditRequired: boolean;
  readonly status: PortalAuthPolicyStatus;
};
