import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { StudentIntakeForm } from "@/components/portal/forms/StudentIntakeForm";
import { listClasses, listParents } from "@/lib/portal/data/people";
import { listStudents } from "@/lib/portal/data/students";
import { listTransportRoutes } from "@/lib/portal/data/transport";
import { getCapableSession } from "@/lib/portal/permissions";
import { isPortalRole } from "@/lib/portal/roles";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = { title: "Add Student" };

type NewStudentPageProps = {
  readonly params: Promise<{ role: string }>;
};

// Suggests the next number in the school's existing sequence, e.g. DIS-2026-009.
function suggestStudentId(existing: readonly string[]) {
  const year = new Date().getFullYear();
  const numbers = existing
    .map((id) => Number(id.split("-").at(-1)))
    .filter((value) => Number.isFinite(value));
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1;

  return `DIS-${year}-${String(next).padStart(3, "0")}`;
}

export default async function NewStudentPage({ params }: NewStudentPageProps) {
  const { role } = await params;

  if (!isPortalRole(role) || !(await getCapableSession("students.create"))) {
    notFound();
  }

  const [classes, parents, students, routes] = await Promise.all([
    listClasses(),
    listParents(),
    listStudents(),
    listTransportRoutes(),
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
        title="Add a student"
        description="Capture the full intake record: placement, guardians, contact details and the school services the learner uses."
        badge="Registry"
      />

      <DashboardCard
        title="Student intake"
        description="Fields marked with * are required. Everything else can be completed later from the learner's record."
        className="mt-8"
      >
        <StudentIntakeForm
          classes={classes.map((item) => ({
            id: item.id,
            name: item.name,
            level: item.level,
          }))}
          parents={parents.map((parent) => ({
            id: parent.id,
            label: parent.fullName,
            meta: `${parent.phone} · ${parent.childIds.length} linked`,
          }))}
          routes={routes.map((route) => ({
            id: route.id,
            label: `${route.routeName} · ${route.busName}`,
          }))}
          suggestedStudentId={suggestStudentId(
            students.map((student) => student.studentId),
          )}
        />
      </DashboardCard>
    </>
  );
}
