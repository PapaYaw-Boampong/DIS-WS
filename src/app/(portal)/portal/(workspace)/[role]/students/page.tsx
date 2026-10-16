import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  GraduationCap,
  ShieldAlert,
  UserCheck,
  UserPlus,
  Users,
} from "lucide-react";

import { AccountStatusBadge } from "@/components/portal/AccountStatusBadge";
import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { ExportButton } from "@/components/portal/ExportButton";
import { MetricCard } from "@/components/portal/MetricCard";
import { listParents } from "@/lib/portal/data/people";
import { listStudents } from "@/lib/portal/data/students";
import {
  getCapableSession,
  roleHasCapability,
} from "@/lib/portal/permissions";
import { isPortalRole } from "@/lib/portal/roles";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = { title: "Student Register" };

type StudentsPageProps = {
  readonly params: Promise<{ role: string }>;
};

export default async function StudentsPage({ params }: StudentsPageProps) {
  const { role } = await params;

  if (!isPortalRole(role) || !(await getCapableSession("students.view"))) {
    notFound();
  }

  const [students, parents, canCreate, canImport, canPromote, canExport] =
    await Promise.all([
      listStudents(),
      listParents(),
      roleHasCapability(role, "students.create"),
      roleHasCapability(role, "students.import"),
      roleHasCapability(role, "students.promote"),
      roleHasCapability(role, "students.export"),
    ]);

  const guardianNames = (studentId: string) =>
    parents
      .filter((parent) => parent.childIds.includes(studentId))
      .map((parent) => parent.fullName);

  const rows: readonly DataTableRow[] = students.map((student) => {
    const guardians = guardianNames(student.id);

    return {
      id: student.id,
      cells: [
        student.fullName,
        student.studentId,
        student.className,
        student.level,
        guardians.length ? guardians.join(", ") : "Unlinked",
        <AccountStatusBadge key={student.id} status={student.status} />,
      ],
    };
  });

  const active = students.filter(
    (student) => student.status === "active",
  ).length;
  const linked = students.filter((student) =>
    parents.some((parent) => parent.childIds.includes(student.id)),
  ).length;

  return (
    <>
      <DashboardHeader
        eyebrow="People"
        title="Student register"
        description="Every learner on roll, their class placement and the guardians linked to them."
        badge="Registry"
        action={
          <div className="flex flex-wrap gap-3">
            {canExport ? (
              <ExportButton
                fileName="dis-student-register.csv"
                label="Export register"
                headers={[
                  "Full name",
                  "Student ID",
                  "Class",
                  "Level",
                  "Guardians",
                  "Status",
                  "Feeding plan",
                ]}
                rows={students.map((student) => [
                  student.fullName,
                  student.studentId,
                  student.className,
                  student.level,
                  guardianNames(student.id).join("; "),
                  student.status,
                  student.feedingPlan ?? "none",
                ])}
              />
            ) : null}
            {canImport ? (
              <Link
                href={portalRoutes.studentImport(role)}
                className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-sm font-bold text-charcoal transition-colors hover:bg-soft-white"
              >
                Import list
              </Link>
            ) : null}
            {canPromote ? (
              <Link
                href={portalRoutes.studentPromotions(role)}
                className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-sm font-bold text-charcoal transition-colors hover:bg-soft-white"
              >
                Promotions
              </Link>
            ) : null}
            {canCreate ? (
              <Link
                href={portalRoutes.studentNew(role)}
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-curry-orange px-4 text-sm font-bold text-white transition-colors hover:bg-deep-orange"
              >
                <UserPlus aria-hidden="true" className="size-4" />
                Add student
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Learners on roll"
          value={String(students.length)}
          detail="All classes"
          icon={<GraduationCap aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Active"
          value={String(active)}
          detail="Currently attending"
          icon={<UserCheck aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Linked families"
          value={String(linked)}
          detail="Has a guardian on file"
          icon={<Users aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Needs review"
          value={String(students.length - active)}
          detail="Inactive or suspended"
          icon={<ShieldAlert aria-hidden="true" className="size-5" />}
        />
      </div>

      <DashboardCard
        title="Student records"
        description="Open a learner from the register to review or correct their record."
        className="mt-8"
      >
        <DataTable
          caption="Student register"
          columns={[
            "Student",
            "Student ID",
            "Class",
            "Level",
            "Guardians",
            "Status",
          ]}
          rows={rows}
          emptyMessage="No learners are on the register yet."
        />
      </DashboardCard>
    </>
  );
}
