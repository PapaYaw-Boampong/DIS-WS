import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileCheck2, Users } from "lucide-react";

import { AssignmentSubmissionForm } from "@/components/portal/AssignmentSubmissionForm";
import { AssignmentStatusBadge } from "@/components/portal/course/AssignmentStatusBadge";
import { DashboardCard } from "@/components/portal/DashboardCard";
import { MetricCard } from "@/components/portal/MetricCard";
import {
  getMySubmission,
  listAssignments,
  listSubmissionsForAssignment,
} from "@/lib/portal/data/academics";
import { listStudents } from "@/lib/portal/data/students";
import { resolveCourseAccess } from "@/lib/portal/course";
import { formatPortalDate } from "@/lib/portal/format";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = {
  title: "Assignment",
};

type AssignmentDetailPageProps = {
  readonly params: Promise<{
    role: string;
    courseId: string;
    assignmentId: string;
  }>;
};

export default async function AssignmentDetailPage({
  params,
}: AssignmentDetailPageProps) {
  const { role: rawRole, courseId, assignmentId } = await params;
  const access = await resolveCourseAccess(rawRole, courseId);

  if (!access) {
    notFound();
  }

  const { role } = access;
  const assignment = (await listAssignments()).find(
    (item) => item.id === assignmentId && item.courseId === courseId,
  );

  if (!assignment) {
    notFound();
  }

  const mySubmission =
    access.role === "student" ? await getMySubmission(assignment.id) : null;

  return (
    <div className="space-y-6">
      <Link
        href={portalRoutes.courseAssignments(role, courseId)}
        className="inline-flex items-center gap-2 text-sm font-bold text-deep-orange transition-colors hover:text-curry-orange"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Assignments
      </Link>

      <DashboardCard
        title={assignment.title}
        description={`${assignment.subject} · Due ${formatPortalDate(assignment.dueDate)}`}
        action={<AssignmentStatusBadge status={assignment.status} />}
      >
        <p className="leading-7 text-muted-grey">
          {assignment.instructions ??
            "No additional instructions were provided for this assignment."}
        </p>

        {access.role === "staff" ? (
          <>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <MetricCard
                label="Submitted"
                value={`${assignment.submittedCount ?? 0}/${assignment.totalStudents ?? 0}`}
                detail="Students who have turned this in"
                icon={<Users aria-hidden="true" className="size-5" />}
              />
              <MetricCard
                label="Status"
                value={
                  assignment.status === "review"
                    ? "Needs review"
                    : assignment.status === "submitted"
                      ? "Complete"
                      : "In progress"
                }
                detail="Across the assigned class"
                icon={<FileCheck2 aria-hidden="true" className="size-5" />}
              />
            </div>
            <Link
              href={portalRoutes.staffGradebook}
              className="mt-6 inline-flex min-h-10 items-center gap-2 rounded-full border border-curry-orange px-4 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream"
            >
              Open gradebook
            </Link>
            <StaffSubmissionsList
              role={role}
              courseId={courseId}
              assignmentId={assignment.id}
            />
          </>
        ) : (
          <AssignmentSubmissionForm
            assignmentId={assignment.id}
            submission={mySubmission}
            downloadHref={
              mySubmission
                ? portalRoutes.courseSubmissionDownload(
                    role,
                    courseId,
                    assignment.id,
                    mySubmission.id,
                  )
                : null
            }
          />
        )}
      </DashboardCard>
    </div>
  );
}

type StaffSubmissionsListProps = {
  readonly role: "student" | "staff";
  readonly courseId: string;
  readonly assignmentId: string;
};

async function StaffSubmissionsList({
  role,
  courseId,
  assignmentId,
}: StaffSubmissionsListProps) {
  const [submissions, students] = await Promise.all([
    listSubmissionsForAssignment(assignmentId),
    listStudents(),
  ]);

  if (submissions.length === 0) {
    return (
      <p className="mt-6 text-sm text-muted-grey">
        No submissions have come in for this assignment yet.
      </p>
    );
  }

  const studentNames = new Map(students.map((s) => [s.id, s.fullName]));

  return (
    <ul className="mt-6 divide-y divide-border">
      {submissions.map((submission) => (
        <li
          key={submission.id}
          className="flex items-center justify-between gap-4 py-3"
        >
          <span>
            <span className="block font-bold text-charcoal">
              {studentNames.get(submission.studentId) ?? "Unknown student"}
            </span>
            <span className="mt-1 block text-sm text-muted-grey">
              {submission.fileName} · Submitted{" "}
              {formatPortalDate(submission.submittedAt.slice(0, 10))}
            </span>
          </span>
          <a
            href={portalRoutes.courseSubmissionDownload(
              role,
              courseId,
              assignmentId,
              submission.id,
            )}
            className="inline-flex min-h-10 items-center gap-2 rounded-full border border-curry-orange px-4 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream"
          >
            <Download aria-hidden="true" className="size-4" />
            Download
          </a>
        </li>
      ))}
    </ul>
  );
}
