import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  BookOpen,
  GraduationCap,
  School,
  Users,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { getMockStaffPortalContext } from "@/lib/portal/mock-staff";

export const metadata: Metadata = {
  title: "My Classes",
};

export default async function StaffClassesPage() {
  const context = await getMockStaffPortalContext();

  if (!context) {
    notFound();
  }

  const rosterRows: readonly DataTableRow[] = context.students.map(
    (student) => ({
      id: student.id,
      cells: [
        student.fullName,
        student.studentId,
        student.className,
        student.level,
        <StatusBadge key={student.id} variant="success">
          Active
        </StatusBadge>,
      ],
    }),
  );

  const primaryStudents = context.students.filter(
    (student) => student.level === "Primary School",
  ).length;

  return (
    <>
      <DashboardHeader
        eyebrow={`${context.staff.fullName} · ${context.staff.staffId}`}
        title="My classes"
        description="Review assigned classes and fictional student rosters. Student profile editing remains outside this staff operations phase."
        badge="Mock class records"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Assigned classes"
          value={String(context.classes.length)}
          detail="Across primary and JHS"
          icon={<School aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Roster preview"
          value={String(context.students.length)}
          detail="Sample fictional learners"
          icon={<Users aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Primary learners"
          value={String(primaryStudents)}
          detail="In the sample roster"
          icon={<GraduationCap aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Subjects"
          value={String(context.staff.subjectIds.length)}
          detail="Mathematics and Science"
          icon={<BookOpen aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 space-y-8">
        <DashboardCard
          title="Assigned class cards"
          description="Class totals use the wider fictional school dataset; roster rows below are a focused preview."
        >
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {context.classes.map((classItem) => (
              <article
                key={classItem.id}
                className="rounded-2xl border border-border bg-soft-white p-5"
              >
                <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-curry-orange shadow-sm">
                  <School aria-hidden="true" className="size-5" />
                </div>
                <h2 className="mt-5 text-xl font-extrabold text-charcoal">
                  {classItem.name}
                </h2>
                <p className="mt-1 text-sm text-muted-grey">
                  {classItem.level}
                </p>
                <p className="mt-5 text-3xl font-extrabold text-charcoal">
                  {classItem.studentCount}
                </p>
                <p className="text-sm text-muted-grey">Enrolled students</p>
                <div className="mt-4">
                  <StatusBadge
                    variant={
                      classItem.classTeacher === context.staff.fullName
                        ? "success"
                        : "neutral"
                    }
                  >
                    {classItem.classTeacher === context.staff.fullName
                      ? "Class teacher"
                      : "Subject teacher"}
                  </StatusBadge>
                </div>
              </article>
            ))}
          </div>
        </DashboardCard>

        <DashboardCard
          title="Student roster preview"
          description="Only fictional sample students are displayed."
        >
          <DataTable
            caption="Staff student roster"
            columns={["Student", "Student ID", "Class", "Level", "Status"]}
            rows={rosterRows}
          />
        </DashboardCard>
      </div>
    </>
  );
}
