import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { StaffIntakeForm } from "@/components/portal/forms/StaffIntakeForm";
import { listCourses } from "@/lib/portal/data/academics";
import { listClasses, listStaff } from "@/lib/portal/data/people";
import { getCapableSession } from "@/lib/portal/permissions";
import { isPortalRole } from "@/lib/portal/roles";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = { title: "Add Staff" };

type NewStaffPageProps = {
  readonly params: Promise<{ role: string }>;
};

function suggestStaffId(existing: readonly string[]) {
  const numbers = existing
    .map((id) => Number(id.split("-").at(-1)))
    .filter((value) => Number.isFinite(value));
  const next = (numbers.length ? Math.max(...numbers) : 0) + 1;

  return `DIS-STAFF-${String(next).padStart(3, "0")}`;
}

export default async function NewStaffPage({ params }: NewStaffPageProps) {
  const { role } = await params;

  if (!isPortalRole(role) || !(await getCapableSession("staff.create"))) {
    notFound();
  }

  const [classes, staff, courses] = await Promise.all([
    listClasses(),
    listStaff(),
    listCourses(),
  ]);

  // Subjects are derived from the courses the school actually runs.
  const subjects = [
    ...new Map(
      courses.map((course) => [course.subjectId, course.subject]),
    ).entries(),
  ].map(([id, name]) => ({ id, name }));

  return (
    <>
      <Link
        href={portalRoutes.staffRegister(role)}
        className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-deep-orange transition-colors hover:text-curry-orange"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Staff register
      </Link>

      <DashboardHeader
        eyebrow="Staff records"
        title="Add a staff member"
        description="Capture the employment record, teaching load and the portal role this member of staff signs in with."
        badge="Registry"
      />

      <DashboardCard
        title="Staff intake"
        description="The classes and subjects chosen here decide which registers and gradebooks they can open."
        className="mt-8"
      >
        <StaffIntakeForm
          classes={classes.map((item) => ({ id: item.id, name: item.name }))}
          subjects={subjects}
          suggestedStaffId={suggestStaffId(
            staff.map((member) => member.staffId),
          )}
        />
      </DashboardCard>
    </>
  );
}
