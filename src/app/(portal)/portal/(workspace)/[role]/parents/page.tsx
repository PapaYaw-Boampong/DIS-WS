import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Link2, Mail, UserCheck, UserPlus, Users } from "lucide-react";

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

export const metadata: Metadata = { title: "Parent Register" };

type ParentsPageProps = {
  readonly params: Promise<{ role: string }>;
};

export default async function ParentsPage({ params }: ParentsPageProps) {
  const { role } = await params;

  if (!isPortalRole(role) || !(await getCapableSession("parents.view"))) {
    notFound();
  }

  const [parents, students, canCreate, canExport] = await Promise.all([
    listParents(),
    listStudents(),
    roleHasCapability(role, "parents.create"),
    roleHasCapability(role, "students.export"),
  ]);

  const childNames = (childIds: readonly string[]) =>
    childIds
      .map((id) => students.find((student) => student.id === id)?.fullName)
      .filter(Boolean)
      .join(", ");

  const rows: readonly DataTableRow[] = parents.map((parent) => ({
    id: parent.id,
    cells: [
      parent.fullName,
      parent.email,
      parent.phone,
      childNames(parent.childIds) || "Unlinked",
      <AccountStatusBadge key={parent.id} status={parent.status} />,
    ],
  }));

  return (
    <>
      <DashboardHeader
        eyebrow="People"
        title="Parent register"
        description="Guardians on file, how to reach them, and the learners each one is responsible for."
        badge="Registry"
        action={
          <div className="flex flex-wrap gap-3">
            {canExport ? (
              <ExportButton
                fileName="dis-parent-register.csv"
                label="Export register"
                headers={[
                  "Full name",
                  "Email",
                  "Phone",
                  "Linked children",
                  "Status",
                ]}
                rows={parents.map((parent) => [
                  parent.fullName,
                  parent.email,
                  parent.phone,
                  childNames(parent.childIds),
                  parent.status,
                ])}
              />
            ) : null}
            {canCreate ? (
              <Link
                href={portalRoutes.parentNew(role)}
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-curry-orange px-4 text-sm font-bold text-white transition-colors hover:bg-deep-orange"
              >
                <UserPlus aria-hidden="true" className="size-4" />
                Add parent
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Guardians"
          value={String(parents.length)}
          detail="On file"
          icon={<Users aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Active"
          value={String(
            parents.filter((item) => item.status === "active").length,
          )}
          detail="Enabled accounts"
          icon={<UserCheck aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Child links"
          value={String(
            parents.reduce((total, item) => total + item.childIds.length, 0),
          )}
          detail="Guardian to learner"
          icon={<Link2 aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="With email"
          value={String(parents.filter((item) => item.email).length)}
          detail="Can receive notices"
          icon={<Mail aria-hidden="true" className="size-5" />}
        />
      </div>

      <DashboardCard
        title="Parent and guardian records"
        description="Linking a guardian to a learner is what gives them portal access to that child."
        className="mt-8"
      >
        <DataTable
          caption="Parent register"
          columns={["Parent", "Email", "Phone", "Linked children", "Status"]}
          rows={rows}
          emptyMessage="No guardians are on file yet."
        />
      </DashboardCard>
    </>
  );
}
