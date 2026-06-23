import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpen, School, UserCheck, Users } from "lucide-react";

import { AccountStatusBadge } from "@/components/portal/AccountStatusBadge";
import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { MockPersonForm } from "@/components/portal/MockPersonForm";
import { mockStaff } from "@/data/portal/staff";
import { getMockRoleSession } from "@/lib/portal/mock-role";

export const metadata: Metadata = { title: "Staff Management" };

export default async function AdminStaffPage() {
  if (!(await getMockRoleSession("admin"))) {
    notFound();
  }

  const rows: readonly DataTableRow[] = mockStaff.map((staff) => ({
    id: staff.id,
    cells: [
      staff.fullName,
      staff.staffId,
      staff.title,
      String(staff.classIds.length),
      staff.subjectIds.join(", "),
      <AccountStatusBadge key={staff.id} status={staff.status} />,
    ],
  }));

  return (
    <>
      <DashboardHeader eyebrow="Administration" title="Staff management" description="Review fictional teacher and staff assignments and preview new staff account creation." badge="Mock management" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Staff records" value={String(mockStaff.length)} detail="Sample employees" icon={<Users aria-hidden="true" className="size-5" />} />
        <MetricCard label="Active" value={String(mockStaff.filter((item) => item.status === "active").length)} detail="Enabled accounts" icon={<UserCheck aria-hidden="true" className="size-5" />} />
        <MetricCard label="Class assignments" value={String(mockStaff.reduce((total, item) => total + item.classIds.length, 0))} detail="Across staff records" icon={<School aria-hidden="true" className="size-5" />} />
        <MetricCard label="Subject assignments" value={String(mockStaff.reduce((total, item) => total + item.subjectIds.length, 0))} detail="Mock teaching areas" icon={<BookOpen aria-hidden="true" className="size-5" />} />
      </div>
      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
        <DashboardCard title="Staff records" description="Assignments and account states are fictional.">
          <DataTable caption="Admin staff records" columns={["Staff", "Staff ID", "Role", "Classes", "Subjects", "Status"]} rows={rows} />
        </DashboardCard>
        <DashboardCard title="Create staff account" description="Preview staff role and access setup." className="h-fit">
          <MockPersonForm entity="staff" />
        </DashboardCard>
      </div>
    </>
  );
}
