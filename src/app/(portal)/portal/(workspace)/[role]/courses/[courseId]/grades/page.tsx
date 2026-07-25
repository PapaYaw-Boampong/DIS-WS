import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChartNoAxesColumnIncreasing } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { listGradebook } from "@/lib/portal/data/academics";
import { resolveCourseAccess } from "@/lib/portal/course";
import { formatPortalDate, percentageScore } from "@/lib/portal/format";
import { getMockStaffPortalContext } from "@/lib/portal/mock-staff";
import { getMockStudentPortalContext } from "@/lib/portal/mock-student";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = {
  title: "Course Grades",
};

type CourseGradesPageProps = {
  readonly params: Promise<{
    role: string;
    courseId: string;
  }>;
};

function averagePercentage(scores: readonly { score: number; total: number }[]) {
  if (!scores.length) {
    return null;
  }

  const total = scores.reduce(
    (sum, entry) => sum + percentageScore(entry.score, entry.total),
    0,
  );
  return Math.round(total / scores.length);
}

export default async function CourseGradesPage({
  params,
}: CourseGradesPageProps) {
  const { role, courseId } = await params;
  const access = await resolveCourseAccess(role, courseId);

  if (!access) {
    notFound();
  }

  const { course } = access;

  if (access.role === "student") {
    const context = await getMockStudentPortalContext();
    const results = (context?.results ?? []).filter(
      (result) => result.subject === course.subject,
    );
    const average = averagePercentage(results);
    const rows: readonly DataTableRow[] = results.map((result) => ({
      id: result.id,
      cells: [
        result.assessment,
        `${result.score}/${result.total}`,
        `${percentageScore(result.score, result.total)}%`,
        formatPortalDate(result.gradedAt),
      ],
    }));

    return (
      <div className="space-y-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <MetricCard
            label="Course average"
            value={average === null ? "—" : `${average}%`}
            detail="Across graded assessments"
            icon={
              <ChartNoAxesColumnIncreasing
                aria-hidden="true"
                className="size-5"
              />
            }
          />
          <MetricCard
            label="Graded assessments"
            value={String(results.length)}
            detail={`In ${course.subject}`}
            icon={
              <ChartNoAxesColumnIncreasing
                aria-hidden="true"
                className="size-5"
              />
            }
          />
        </div>
        <DashboardCard
          title="Your grades"
          description="Published assessment results for this course."
        >
          <DataTable
            caption={`${course.title} grades`}
            columns={["Assessment", "Score", "Percentage", "Graded"]}
            rows={rows}
            emptyMessage="No grades have been published for this course yet."
          />
        </DashboardCard>
      </div>
    );
  }

  const context = await getMockStaffPortalContext();

  if (!context) {
    notFound();
  }

  const entries = (await listGradebook()).filter(
    (entry) => entry.classId === course.classId && entry.subject === course.subject,
  );
  const average = averagePercentage(entries);
  const rows: readonly DataTableRow[] = entries.map((entry) => {
    const student = context.students.find(
      (item) => item.id === entry.studentId,
    );

    return {
      id: entry.id,
      cells: [
        student?.fullName ?? entry.studentId,
        entry.assessment,
        `${entry.score}/${entry.total}`,
        `${percentageScore(entry.score, entry.total)}%`,
        <StatusBadge
          key={`${entry.id}-status`}
          variant={entry.status === "published" ? "success" : "warning"}
        >
          {entry.status === "published" ? "Published" : "Draft"}
        </StatusBadge>,
      ],
    };
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        <MetricCard
          label="Class average"
          value={average === null ? "—" : `${average}%`}
          detail={`Across recorded ${course.subject} marks`}
          icon={
            <ChartNoAxesColumnIncreasing aria-hidden="true" className="size-5" />
          }
        />
        <MetricCard
          label="Recorded marks"
          value={String(entries.length)}
          detail="In this course"
          icon={
            <ChartNoAxesColumnIncreasing aria-hidden="true" className="size-5" />
          }
        />
      </div>
      <DashboardCard
        title="Class grades"
        description="A read-only view scoped to this course. Edit marks from the full Gradebook."
        action={
          <Link
            href={portalRoutes.staffGradebook}
            className="inline-flex min-h-10 items-center rounded-full border border-curry-orange px-4 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream"
          >
            Open gradebook
          </Link>
        }
      >
        <DataTable
          caption={`${course.title} class grades`}
          columns={["Student", "Assessment", "Score", "Percentage", "Status"]}
          rows={rows}
          emptyMessage="No marks have been recorded for this course yet."
        />
      </DashboardCard>
    </div>
  );
}
