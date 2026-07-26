import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { MockAssignmentForm } from "@/components/portal/MockAssignmentForm";
import { getMockStaffPortalContext } from "@/lib/portal/mock-staff";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = {
  title: "Create Assignment",
};

export default async function NewAssignmentPage() {
  const context = await getMockStaffPortalContext();

  if (!context) {
    notFound();
  }

  return (
    <>
      <Link
        href={portalRoutes.staffAssignments}
        className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-deep-orange transition-colors hover:text-curry-orange"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Assignments
      </Link>

      <DashboardHeader
        eyebrow="Class work"
        title="Create assignment"
        description="Prepare a new assignment for one of your classes. This is a preview and does not publish work to students."
        badge="Preview only"
      />

      <div className="mt-8 max-w-2xl">
        <DashboardCard
          title="New assignment"
          description="Set the title, class, subject, instructions and due date."
        >
          <MockAssignmentForm classes={context.classes} />
        </DashboardCard>
      </div>
    </>
  );
}
