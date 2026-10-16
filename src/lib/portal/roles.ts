import {
  portalAdminRoles,
  portalRoles,
  type PortalRole,
} from "@/types/portal";

export const portalRoleLabels: Record<PortalRole, string> = {
  student: "Student",
  parent: "Parent",
  staff: "Staff",
  admin: "School Admin",
  registry: "Registry",
  developer: "Developer",
  accounts: "Accounts",
  transport: "Transport",
};

export const portalRoleDescriptions: Record<PortalRole, string> = {
  student: "Courses, To Do, timetable, results and student records",
  parent: "Children, fees, transport and school communication",
  staff: "Courses, classes, attendance, assignments and gradebook tools",
  admin: "School operations, classes, fees, transport and the public website",
  registry: "Student, parent and staff records, admissions and enquiries",
  developer: "User accounts, platform readiness and integration checks",
  accounts: "Invoices, payments, balances and finance reporting",
  transport: "Routes, trips, assigned students and status updates",
};

export function isPortalRole(value: string): value is PortalRole {
  return portalRoles.some((role) => role === value);
}

export function isAdminRole(value: string): boolean {
  return portalAdminRoles.some((role) => role === value);
}
