import type { PortalRole } from "@/types/portal";

export const portalRoutes = {
  landing: "/portal",
  login: "/portal/login",
  dashboard: (role: PortalRole) => `/portal/${role}/dashboard`,
  parentFees: "/portal/parent/fees",
  parentPayments: "/portal/parent/payments",
  parentFeeding: "/portal/parent/feeding",
  parentTransport: "/portal/parent/transport",
  adminTransport: "/portal/admin/transport",
  staffClasses: "/portal/staff/classes",
  staffAttendance: "/portal/staff/attendance",
  staffAssignments: "/portal/staff/assignments",
  staffGradebook: "/portal/staff/gradebook",
  staffResources: "/portal/staff/resources",
} as const;

export function portalLoginForRole(role: PortalRole) {
  return `${portalRoutes.login}?role=${role}`;
}
