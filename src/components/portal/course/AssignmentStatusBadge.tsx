import { StatusBadge } from "@/components/portal/StatusBadge";
import type { AssignmentSummary } from "@/types/portal";

type AssignmentStatusBadgeProps = {
  readonly status: AssignmentSummary["status"];
};

export function AssignmentStatusBadge({ status }: AssignmentStatusBadgeProps) {
  if (status === "submitted") {
    return <StatusBadge variant="success">Submitted</StatusBadge>;
  }

  if (status === "review") {
    return <StatusBadge variant="warning">Review</StatusBadge>;
  }

  if (status === "in_progress") {
    return <StatusBadge variant="info">Open</StatusBadge>;
  }

  return <StatusBadge>Not started</StatusBadge>;
}
