import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarClock,
  ClipboardList,
  FileCheck2,
  FilePenLine,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { listAssignments } from "@/lib/portal/data/academics";
import { listClasses } from "@/lib/portal/data/people";
import { formatPortalDate } from "@/lib/portal/format";
import { getMockStaffPortalContext } from "@/lib/portal/mock-staff";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = {
  title: "Assignments",
};

function assignmentStatus(status: string) {
  if (status === "submitted") {
    return <StatusBadge variant="success">Complete</StatusBadge>;
  }

  if (status === "review") {
    return <StatusBadge variant="warning">Review</StatusBadge>;
  }

  if (status === "in_progress") {
    return <StatusBadge variant="info">Active</StatusBadge>;
  }

  return <StatusBadge>Draft</StatusBadge>;
}

export default async function StaffAssignmentsPage() {
  const context = await getMockStaffPortalContext();

  if (!context) {
    notFound();
  }

  const [mockAssignments, mockClasses] = await Promise.all([
    listAssignments(),
    listClasses(),
  ]);
  const assignments = mockAssignments.filter((assignment) =>
    context.staff.classIds.includes(assignment.classId),
  );
  const assignmentRows: readonly DataTableRow[] = assignments.map(
    (assignment) => {
      const classItem = mockClasses.find(
        (item) => item.id === assignment.classId,
      );

      return {
        id: assignment.id,
        cells: [
          assignment.title,
          classItem?.name ?? assignment.classId,
          assignment.subject,
          formatPortalDate(assignment.dueDate),
          `${assignment.submittedCount ?? 0}/${assignment.totalStudents ?? 0}`,
          assignmentStatus(assignment.status),
        ],
      };
    },
  );

  return (
    <>
      <DashboardHeader
        eyebrow="Class work"
        title="Assignments"
        description="Review fictional assignment activity and preview creation of new work without publishing to students."
        badge="Mock assignment data"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <MetricCard
          label="Assignments"
          value={String(assignments.length)}
          detail="Across assigned classes"
          icon={<ClipboardList aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Active"
          value={String(
            assignments.filter((item) => item.status === "in_progress").length,
          )}
          detail="Currently open"
          icon={<CalendarClock aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Review queue"
          value={String(
            assignments.filter((item) => item.status === "review").length,
          )}
          detail="Needs teacher review"
          icon={<FileCheck2 aria-hidden="true" className="size-5" />}
        />
      </div>

      <DashboardCard
        title="Assignment overview"
        description="Submission counts and status are fictional."
        className="mt-8"
        action={
          <Link
            href={portalRoutes.staffAssignmentNew}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-curry-orange px-4 text-sm font-bold text-white transition-colors hover:bg-deep-orange"
          >
            <FilePenLine aria-hidden="true" className="size-4" />
            Create assignment
          </Link>
        }
      >
        <DataTable
          caption="Staff assignment overview"
          columns={[
            "Assignment",
            "Class",
            "Subject",
            "Due",
            "Submitted",
            "Status",
          ]}
          rows={assignmentRows}
        />
      </DashboardCard>
    </>
  );
}
