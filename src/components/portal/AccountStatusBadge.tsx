import { StatusBadge } from "@/components/portal/StatusBadge";
import type { PortalAccountStatus } from "@/types/portal";

type AccountStatusBadgeProps = {
  readonly status: PortalAccountStatus;
};

export function AccountStatusBadge({ status }: AccountStatusBadgeProps) {
  if (status === "active") {
    return <StatusBadge variant="success">Active</StatusBadge>;
  }

  if (status === "suspended") {
    return <StatusBadge variant="danger">Suspended</StatusBadge>;
  }

  return <StatusBadge variant="warning">Inactive</StatusBadge>;
}
