import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  ListChecks,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { formatPortalDate } from "@/lib/portal/format";
import { getMockStudentPortalContext } from "@/lib/portal/mock-student";
import { isPortalRole } from "@/lib/portal/roles";
import { portalRoutes } from "@/lib/portal/routes";
import type { AssignmentSummary } from "@/types/portal";

export const metadata: Metadata = {
  title: "To Do",
};

type StudentTodoPageProps = {
  readonly params: Promise<{
    role: string;
  }>;
};

function todoStatus(assignment: AssignmentSummary) {
  if (assignment.status === "submitted") {
    return <StatusBadge variant="success">Submitted</StatusBadge>;
  }

  if (assignment.status === "in_progress") {
    return <StatusBadge variant="info">In progress</StatusBadge>;
  }

  if (assignment.status === "review") {
    return <StatusBadge variant="warning">Teacher review</StatusBadge>;
  }

  return <StatusBadge>Not started</StatusBadge>;
}

export default async function StudentTodoPage({
  params,
}: StudentTodoPageProps) {
  const { role } = await params;

  if (!isPortalRole(role) || role !== "student") {
    notFound();
  }

  const context = await getMockStudentPortalContext();

  if (!context) {
    notFound();
  }

  const openAssignments = context.assignments.filter(
    (assignment) => assignment.status !== "submitted",
  );
  const submittedAssignments = context.assignments.filter(
    (assignment) => assignment.status === "submitted",
  );
  const nextDue = [...openAssignments].sort((first, second) =>
    first.dueDate.localeCompare(second.dueDate),
  )[0];
  const todoRows: readonly DataTableRow[] = openAssignments.map(
    (assignment) => {
      const course = context.courses.find(
        (item) => item.id === assignment.courseId,
      );

      return {
        id: assignment.id,
        cells: [
          course?.title ?? assignment.subject,
          assignment.title,
          formatPortalDate(assignment.dueDate),
          todoStatus(assignment),
        ],
      };
    },
  );
  const submittedRows: readonly DataTableRow[] = submittedAssignments.map(
    (assignment) => {
      const course = context.courses.find(
        (item) => item.id === assignment.courseId,
      );

      return {
        id: assignment.id,
        cells: [
          course?.title ?? assignment.subject,
          assignment.title,
          formatPortalDate(assignment.dueDate),
          todoStatus(assignment),
        ],
      };
    },
  );

  return (
    <>
      <DashboardHeader
        eyebrow={`${context.student.className} coursework`}
        title="To Do"
        description="A student task list for course work due soon. This replaces the old dashboard upcoming-assignments block."
        badge="Mock To Do"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Open tasks"
          value={String(openAssignments.length)}
          detail="Assignments to complete"
          icon={<ListChecks aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Next due"
          value={nextDue ? formatPortalDate(nextDue.dueDate) : "None"}
          detail={nextDue?.title ?? "No open tasks"}
          icon={<CalendarClock aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Submitted"
          value={String(submittedAssignments.length)}
          detail="Completed mock tasks"
          icon={<CheckCircle2 aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Mode"
          value="Preview"
          detail="No submissions are saved"
          icon={<ClipboardCheck aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.3fr)_minmax(20rem,0.7fr)]">
        <div className="space-y-8">
          <DashboardCard
            title="Current To Do"
            description="Open course work is shown here instead of as a dashboard assignment table."
          >
            <DataTable
              caption="Student to do items"
              columns={["Course", "Task", "Due", "Status"]}
              rows={todoRows}
              emptyMessage="No open To Do items are available."
            />
          </DashboardCard>

          <DashboardCard
            title="Submitted work"
            description="Completed items remain visible for context."
          >
            <DataTable
              caption="Submitted student work"
              columns={["Course", "Task", "Due", "Status"]}
              rows={submittedRows}
              emptyMessage="No submitted work is available."
            />
          </DashboardCard>
        </div>

        <div className="space-y-8">
          <DashboardCard
            title="Course context"
            description="Open the course page to view modules, materials and course-level details."
          >
            <div className="space-y-4">
              {context.courses.map((course) => (
                <div
                  key={course.id}
                  className="rounded-2xl border border-border bg-soft-white p-4"
                >
                  <p className="font-bold text-charcoal">{course.title}</p>
                  <p className="mt-1 text-sm text-muted-grey">
                    {course.courseCode} · {course.teacher}
                  </p>
                </div>
              ))}
            </div>
            <Link
              href={portalRoutes.studentCourses}
              className="mt-5 inline-flex min-h-10 items-center rounded-full border border-curry-orange px-4 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream"
            >
              Open courses
            </Link>
          </DashboardCard>

          <DashboardCard
            title="Preview boundary"
            description="The To Do list is display-only in this frontend phase."
          >
            <p className="text-sm leading-6 text-muted-grey">
              Marking items complete, uploading submissions and sending
              messages will require the later backend, storage and notification
              services.
            </p>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
