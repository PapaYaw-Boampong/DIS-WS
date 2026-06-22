import type { PortalRole } from "@/types/portal";

export const portalRoutes = {
  landing: "/portal",
  login: "/portal/login",
  dashboard: (role: PortalRole) => `/portal/${role}/dashboard`,
} as const;

export function portalLoginForRole(role: PortalRole) {
  return `${portalRoutes.login}?role=${role}`;
}
