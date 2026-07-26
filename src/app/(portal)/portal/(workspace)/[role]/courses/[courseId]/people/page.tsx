import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GraduationCap, Users } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { resolveCourseAccess } from "@/lib/portal/course";
import { listStudents } from "@/lib/portal/data/students";
import { getMockStaffPortalContext } from "@/lib/portal/mock-staff";
import { getMockStudentPortalContext } from "@/lib/portal/mock-student";

export const metadata: Metadata = {
  title: "Course People",
};

type CoursePeoplePageProps = {
  readonly params: Promise<{
    role: string;
    courseId: string;
  }>;
};

export default async function CoursePeoplePage({
  params,
}: CoursePeoplePageProps) {
  const { role, courseId } = await params;
  const access = await resolveCourseAccess(role, courseId);

  if (!access) {
    notFound();
  }

  const { course } = access;

  const teacherCard = (
    <DashboardCard
      title="Teacher"
      description="Staff assigned to this course."
    >
      <div className="flex items-center gap-4">
        <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-soft-cream text-curry-orange">
          <GraduationCap aria-hidden="true" className="size-6" />
        </div>
        <div>
          <p className="font-bold text-charcoal">{course.teacher}</p>
          <p className="text-sm text-muted-grey">{course.subject}</p>
        </div>
      </div>
    </DashboardCard>
  );

  if (access.role === "student") {
    const context = await getMockStudentPortalContext();
    const classmates = (await listStudents()).filter(
      (student) =>
        student.classId === course.classId &&
        student.id !== context?.student.id,
    );

    return (
      <div className="space-y-6">
        {teacherCard}
        <DashboardCard
          title="Classmates"
          description={`${classmates.length} other student${classmates.length === 1 ? "" : "s"} in ${context?.student.className ?? "this class"}.`}
        >
          {classmates.length ? (
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {classmates.map((classmate) => (
                <div
                  key={classmate.id}
                  className="flex items-center gap-3 rounded-2xl border border-border bg-soft-white p-4"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-white text-curry-orange shadow-sm">
                    <Users aria-hidden="true" className="size-4" />
                  </div>
                  <p className="font-semibold text-charcoal">
                    {classmate.fullName}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-grey">
              No other students are listed for this class.
            </p>
          )}
        </DashboardCard>
      </div>
    );
  }

  const context = await getMockStaffPortalContext();

  if (!context) {
    notFound();
  }

  const roster = context.students.filter(
    (student) => student.classId === course.classId,
  );
  const rows: readonly DataTableRow[] = roster.map((student) => ({
    id: student.id,
    cells: [
      student.fullName,
      student.studentId,
      student.level,
      <StatusBadge key={student.id} variant="success">
        Active
      </StatusBadge>,
    ],
  }));

  return (
    <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2">
        {teacherCard}
        <MetricCard
          label="Roster"
          value={String(roster.length)}
          detail={`Enrolled in ${course.title}`}
          icon={<Users aria-hidden="true" className="size-5" />}
        />
      </div>
      <DashboardCard
        title="Student roster"
        description="Fictional sample students enrolled in this course's class."
      >
        <DataTable
          caption={`${course.title} roster`}
          columns={["Student", "Student ID", "Level", "Status"]}
          rows={rows}
          emptyMessage="No students are enrolled in this class yet."
        />
      </DashboardCard>
    </div>
  );
}
