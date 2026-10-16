import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { ParentIntakeForm } from "@/components/portal/forms/ParentIntakeForm";
import { listStudents } from "@/lib/portal/data/students";
import { getCapableSession } from "@/lib/portal/permissions";
import { isPortalRole } from "@/lib/portal/roles";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = { title: "Add Parent" };

type NewParentPageProps = {
  readonly params: Promise<{ role: string }>;
};

export default async function NewParentPage({ params }: NewParentPageProps) {
  const { role } = await params;

  if (!isPortalRole(role) || !(await getCapableSession("parents.create"))) {
    notFound();
  }

  const students = await listStudents();

  return (
    <>
      <Link
        href={portalRoutes.parentsRegister(role)}
        className="mb-3 inline-flex items-center gap-2 text-sm font-bold text-deep-orange transition-colors hover:text-curry-orange"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Parent register
      </Link>

      <DashboardHeader
        eyebrow="Family records"
        title="Add a parent or guardian"
        description="Capture the guardian's contact details, identification and the learners they are responsible for."
        badge="Registry"
      />

      <DashboardCard
        title="Guardian intake"
        description="Linking learners here is what gives the guardian access to their fees, results and transport."
        className="mt-8"
      >
        <ParentIntakeForm
          students={students.map((student) => ({
            id: student.id,
            label: student.fullName,
            meta: `${student.className} · ${student.studentId}`,
          }))}
        />
      </DashboardCard>
    </>
  );
}
