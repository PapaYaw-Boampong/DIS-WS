import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GraduationCap, ShieldAlert, UserCheck, Users } from "lucide-react";

import { AccountStatusBadge } from "@/components/portal/AccountStatusBadge";
import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { MockPersonForm } from "@/components/portal/MockPersonForm";
import { mockStudents } from "@/data/portal/students";
import { getMockRoleSession } from "@/lib/portal/mock-role";

export const metadata: Metadata = { title: "Student Management" };

export default async function AdminStudentsPage() {
  if (!(await getMockRoleSession("admin"))) {
    notFound();
  }

  const rows: readonly DataTableRow[] = mockStudents.map((student) => ({
    id: student.id,
    cells: [
      student.fullName,
      student.studentId,
      student.className,
      student.level,
      student.parentIds.length ? String(student.parentIds.length) : "Unlinked",
      <AccountStatusBadge key={student.id} status={student.status} />,
    ],
  }));
  const active = mockStudents.filter(
    (student) => student.status === "active",
  ).length;

  return (
    <>
      <DashboardHeader
        eyebrow="Administration"
        title="Student management"
        description="Review fictional learner records and preview account creation without writing to a database."
        badge="Mock management"
      />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Sample records" value={String(mockStudents.length)} detail="Fictional learners" icon={<GraduationCap aria-hidden="true" className="size-5" />} />
        <MetricCard label="Active" value={String(active)} detail="Enabled mock records" icon={<UserCheck aria-hidden="true" className="size-5" />} />
        <MetricCard label="Linked families" value={String(mockStudents.filter((item) => item.parentIds.length).length)} detail="Has parent relationship" icon={<Users aria-hidden="true" className="size-5" />} />
        <MetricCard label="Needs review" value={String(mockStudents.length - active)} detail="Inactive or suspended" icon={<ShieldAlert aria-hidden="true" className="size-5" />} />
      </div>
      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
        <DashboardCard title="Student records" description="These records are fictional and read-only.">
          <DataTable caption="Admin student records" columns={["Student", "Student ID", "Class", "Level", "Parents", "Status"]} rows={rows} />
        </DashboardCard>
        <DashboardCard title="Create student" description="Preview the planned administrative workflow." className="h-fit">
          <MockPersonForm entity="student" />
        </DashboardCard>
      </div>
    </>
  );
}
