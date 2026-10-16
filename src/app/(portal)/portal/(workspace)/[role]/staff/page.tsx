import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, School, UserCheck, UserPlus, Users } from "lucide-react";

import { AccountStatusBadge } from "@/components/portal/AccountStatusBadge";
import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { ExportButton } from "@/components/portal/ExportButton";
import { MetricCard } from "@/components/portal/MetricCard";
import { listClasses, listStaff } from "@/lib/portal/data/people";
import {
  getCapableSession,
  roleHasCapability,
} from "@/lib/portal/permissions";
import { isPortalRole } from "@/lib/portal/roles";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = { title: "Staff Register" };

type StaffPageProps = {
  readonly params: Promise<{ role: string }>;
};

export default async function StaffPage({ params }: StaffPageProps) {
  const { role } = await params;

  if (!isPortalRole(role) || !(await getCapableSession("staff.view"))) {
    notFound();
  }

  const [staff, classes, canCreate, canExport] = await Promise.all([
    listStaff(),
    listClasses(),
    roleHasCapability(role, "staff.create"),
    roleHasCapability(role, "students.export"),
  ]);

  const classNames = (classIds: readonly string[]) =>
    classIds
      .map((id) => classes.find((item) => item.id === id)?.name ?? id)
      .join(", ");

  const rows: readonly DataTableRow[] = staff.map((member) => ({
    id: member.id,
    cells: [
      member.fullName,
      member.staffId,
      member.title,
      classNames(member.classIds) || "None",
      member.subjectIds.join(", ") || "—",
      <AccountStatusBadge key={member.id} status={member.status} />,
    ],
  }));

  return (
    <>
      <DashboardHeader
        eyebrow="People"
        title="Staff register"
        description="Teaching and support staff, their teaching load and their record status."
        badge="Registry"
        action={
          <div className="flex flex-wrap gap-3">
            {canExport ? (
              <ExportButton
                fileName="dis-staff-register.csv"
                label="Export register"
                headers={[
                  "Full name",
                  "Staff ID",
                  "Title",
                  "Classes",
                  "Subjects",
                  "Status",
                ]}
                rows={staff.map((member) => [
                  member.fullName,
                  member.staffId,
                  member.title,
                  classNames(member.classIds),
                  member.subjectIds.join("; "),
                  member.status,
                ])}
              />
            ) : null}
            {canCreate ? (
              <Link
                href={portalRoutes.staffNew(role)}
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-curry-orange px-4 text-sm font-bold text-white transition-colors hover:bg-deep-orange"
              >
                <UserPlus aria-hidden="true" className="size-4" />
                Add staff
              </Link>
            ) : null}
          </div>
        }
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Staff records"
          value={String(staff.length)}
          detail="Teaching and support"
          icon={<Users aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Active"
          value={String(
            staff.filter((item) => item.status === "active").length,
          )}
          detail="Currently employed"
          icon={<UserCheck aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Class assignments"
          value={String(
            staff.reduce((total, item) => total + item.classIds.length, 0),
          )}
          detail="Across the register"
          icon={<School aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Subject assignments"
          value={String(
            staff.reduce((total, item) => total + item.subjectIds.length, 0),
          )}
          detail="Teaching areas covered"
          icon={<BookOpen aria-hidden="true" className="size-5" />}
        />
      </div>

      <DashboardCard
        title="Staff records"
        description="Class and subject assignments decide which registers and gradebooks each member of staff can open."
        className="mt-8"
      >
        <DataTable
          caption="Staff register"
          columns={[
            "Staff",
            "Staff ID",
            "Title",
            "Classes",
            "Subjects",
            "Status",
          ]}
          rows={rows}
          emptyMessage="No staff records yet."
        />
      </DashboardCard>
    </>
  );
}
