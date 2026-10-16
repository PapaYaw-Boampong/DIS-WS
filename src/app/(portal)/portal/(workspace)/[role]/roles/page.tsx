import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { RolePermissionMatrix } from "@/components/portal/RolePermissionMatrix";
import { getMockRoleSession } from "@/lib/portal/mock-role";
import { getCapabilityMatrix } from "@/lib/portal/permissions";
import { portalRoleLabels } from "@/lib/portal/roles";

export const metadata: Metadata = { title: "Role Permissions" };

type RolePermissionsPageProps = {
  readonly params: Promise<{ role: string }>;
};

export default async function RolePermissionsPage({
  params,
}: RolePermissionsPageProps) {
  const { role } = await params;

  // Deciding what each role may do is a developer responsibility.
  if (role !== "developer" || !(await getMockRoleSession("developer"))) {
    notFound();
  }

  const matrix = await getCapabilityMatrix();

  return (
    <>
      <DashboardHeader
        eyebrow="Access control"
        title="Role permissions"
        description="Decide what each portal role can do. Granting a capability adds the matching pages to that role's navigation; revoking it closes them."
        badge="Developer tools"
      />

      <DashboardCard
        title="Capability matrix"
        description="For example, tick “Create students” and “Manage classes” for the school administrator so they can enrol learners without the registry."
        className="mt-8"
      >
        <RolePermissionMatrix matrix={matrix} roleLabels={portalRoleLabels} />
      </DashboardCard>
    </>
  );
}
