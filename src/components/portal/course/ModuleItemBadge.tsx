import {
  CircleHelp,
  FileText,
  MessageSquare,
  Paperclip,
  SquareCheckBig,
  type LucideIcon,
} from "lucide-react";

import { StatusBadge } from "@/components/portal/StatusBadge";
import { formatPortalDate } from "@/lib/portal/format";
import type { CourseModuleItem } from "@/types/portal";

export const moduleItemIcons: Record<CourseModuleItem["type"], LucideIcon> = {
  page: FileText,
  assignment: SquareCheckBig,
  material: Paperclip,
  quiz: CircleHelp,
  discussion: MessageSquare,
};

export const moduleItemTypeLabels: Record<CourseModuleItem["type"], string> = {
  page: "Page",
  assignment: "Assignment",
  material: "Material",
  quiz: "Quiz",
  discussion: "Discussion",
};

type ModuleItemStatusBadgeProps = {
  readonly item: CourseModuleItem;
};

export function ModuleItemStatusBadge({ item }: ModuleItemStatusBadgeProps) {
  if (item.status === "completed") {
    return <StatusBadge variant="success">Complete</StatusBadge>;
  }

  if (item.status === "locked") {
    return <StatusBadge>Locked</StatusBadge>;
  }

  if (item.type === "assignment" && item.dueDate) {
    return (
      <StatusBadge variant="warning">
        {`Due ${formatPortalDate(item.dueDate)}`}
      </StatusBadge>
    );
  }

  return <StatusBadge variant="info">Available</StatusBadge>;
}
