import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { StudentImportWorkspace } from "@/components/portal/forms/StudentImportWorkspace";
import { listClasses } from "@/lib/portal/data/people";
import { listStudents } from "@/lib/portal/data/students";
import { getCapableSession } from "@/lib/portal/permissions";
import { isPortalRole } from "@/lib/portal/roles";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = { title: "Import Students" };

type ImportStudentsPageProps = {
  readonly params: Promise<{ role: string }>;
};

export default async function ImportStudentsPage({
  params,
}: ImportStudentsPageProps) {
  const { role } = await params;

  if (!isPortalRole(role) || !(await getCapableSession("students.import"))) {
    notFound();
  }

  const [classes, students] = await Promise.all([
    listClasses(),
    listStudents(),
  ]);

  return (
    <>
      <Link
        href={portalRoutes.studentsRegister(role)}
        className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-deep-orange transition-colors hover:text-curry-orange"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Student register
      </Link>

      <DashboardHeader
        eyebrow="Enrolment"
        title="Import a student list"
        description="Upload a class list from Excel or CSV. Columns are matched automatically, every row is checked against your classes, and only clean rows are enrolled."
        badge="Bulk enrolment"
      />

      <DashboardCard
        title="Upload a spreadsheet"
        description="Start from the template if you are preparing a new list — it uses the column names this page expects."
        className="mt-8"
      >
        <StudentImportWorkspace
          classNames={classes.map((item) => item.name)}
          existingStudentIds={students.map((student) => student.studentId)}
        />
      </DashboardCard>
    </>
  );
}
