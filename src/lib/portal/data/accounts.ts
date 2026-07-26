import "server-only";

import { portalApiGet } from "@/lib/portal/data/api";
import type { PortalAccountStatus, PortalRole } from "@/types/portal";

export type UserAccount = {
  readonly id: string;
  readonly name: string;
  readonly email: string;
  readonly role: PortalRole;
  readonly status: PortalAccountStatus;
  readonly mustChangePassword: boolean;
};

// Real user accounts (admin-only). Empty when the flag is off / no backend.
export async function listUserAccounts(): Promise<readonly UserAccount[]> {
  return (
    await portalApiGet<{ users?: UserAccount[] }>("/admin/users", {})
  ).users ?? [];
}
