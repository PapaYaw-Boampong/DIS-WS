import { portalRoles, type PortalRole } from "@/types/portal";

export const portalRoleLabels: Record<PortalRole, string> = {
  student: "Student",
  parent: "Parent",
  staff: "Staff",
  admin: "Administrator",
  accounts: "Accounts",
  transport: "Transport",
};

export const portalRoleDescriptions: Record<PortalRole, string> = {
  student: "Academic information and student resources",
  parent: "Children, fees, transport and school communication",
  staff: "Classes, attendance, assignments and learning resources",
  admin: "School operations, people and academic administration",
  accounts: "Invoices, payments, balances and finance reporting",
  transport: "Routes, assigned students and trip status updates",
};

export function isPortalRole(value: string): value is PortalRole {
  return portalRoles.some((role) => role === value);
}
