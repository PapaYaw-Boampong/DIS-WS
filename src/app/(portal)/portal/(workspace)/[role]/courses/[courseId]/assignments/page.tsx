import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FilePenLine } from "lucide-react";

import { AssignmentStatusBadge } from "@/components/portal/course/AssignmentStatusBadge";
import { DashboardCard } from "@/components/portal/DashboardCard";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { listAssignments } from "@/lib/portal/data/academics";
import { resolveCourseAccess } from "@/lib/portal/course";
import { formatPortalDate } from "@/lib/portal/format";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = {
  title: "Course Assignments",
};

type CourseAssignmentsPageProps = {
  readonly params: Promise<{
    role: string;
    courseId: string;
  }>;
};

export default async function CourseAssignmentsPage({
  params,
}: CourseAssignmentsPageProps) {
  const { role: rawRole, courseId } = await params;
  const access = await resolveCourseAccess(rawRole, courseId);

  if (!access) {
    notFound();
  }

  const { role } = access;
  const assignments = (await listAssignments()).filter(
    (item) => item.courseId === courseId,
  );
  const rows: readonly DataTableRow[] = assignments.map((assignment) => ({
    id: assignment.id,
    cells: [
      <Link
        key={assignment.id}
        href={portalRoutes.courseAssignmentDetail(role, courseId, assignment.id)}
        className="font-bold text-deep-orange transition-colors hover:text-curry-orange hover:underline"
      >
        {assignment.title}
      </Link>,
      formatPortalDate(assignment.dueDate),
      `${assignment.submittedCount ?? 0}/${assignment.totalStudents ?? 0}`,
      <AssignmentStatusBadge key={`${assignment.id}-status`} status={assignment.status} />,
    ],
  }));

  return (
    <DashboardCard
      title="Assignments"
      description="Course-level work, kept inside the course workspace instead of the dashboard."
      action={
        access.role === "staff" ? (
          <Link
            href={`${portalRoutes.staffAssignmentNew}?courseId=${courseId}&classId=${access.course.classId}`}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-curry-orange px-4 text-sm font-bold text-white transition-colors hover:bg-deep-orange"
          >
            <FilePenLine aria-hidden="true" className="size-4" />
            Create assignment
          </Link>
        ) : undefined
      }
    >
      <DataTable
        caption={`${access.course.title} assignments`}
        columns={["Assignment", "Due", "Submitted", "Status"]}
        rows={rows}
        emptyMessage="No assignments are listed for this course."
      />
    </DashboardCard>
  );
}
