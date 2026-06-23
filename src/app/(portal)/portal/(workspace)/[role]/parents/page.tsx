import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Link2, Mail, UserCheck, Users } from "lucide-react";

import { AccountStatusBadge } from "@/components/portal/AccountStatusBadge";
import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { MockPersonForm } from "@/components/portal/MockPersonForm";
import { mockParents } from "@/data/portal/parents";
import { mockStudents } from "@/data/portal/students";
import { getMockRoleSession } from "@/lib/portal/mock-role";

export const metadata: Metadata = { title: "Parent Management" };

export default async function AdminParentsPage() {
  if (!(await getMockRoleSession("admin"))) {
    notFound();
  }

  const rows: readonly DataTableRow[] = mockParents.map((parent) => ({
    id: parent.id,
    cells: [
      parent.fullName,
      parent.email,
      parent.phone,
      parent.childIds
        .map((id) => mockStudents.find((student) => student.id === id)?.fullName)
        .filter(Boolean)
        .join(", ") || "Unlinked",
      <AccountStatusBadge key={parent.id} status={parent.status} />,
    ],
  }));

  return (
    <>
      <DashboardHeader eyebrow="Administration" title="Parent management" description="Review fictional guardian accounts and child relationships without changing credentials or school records." badge="Mock management" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Parent accounts" value={String(mockParents.length)} detail="Sample guardians" icon={<Users aria-hidden="true" className="size-5" />} />
        <MetricCard label="Active" value={String(mockParents.filter((item) => item.status === "active").length)} detail="Enabled accounts" icon={<UserCheck aria-hidden="true" className="size-5" />} />
        <MetricCard label="Child links" value={String(mockParents.reduce((total, item) => total + item.childIds.length, 0))} detail="Mock relationships" icon={<Link2 aria-hidden="true" className="size-5" />} />
        <MetricCard label="Email records" value={String(mockParents.filter((item) => item.email).length)} detail="Contactable samples" icon={<Mail aria-hidden="true" className="size-5" />} />
      </div>
      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
        <DashboardCard title="Parent and guardian records" description="Child links are fictional.">
          <DataTable caption="Admin parent records" columns={["Parent", "Email", "Phone", "Linked children", "Status"]} rows={rows} />
        </DashboardCard>
        <DashboardCard title="Create parent account" description="Preview account and contact setup." className="h-fit">
          <MockPersonForm entity="parent" />
        </DashboardCard>
      </div>
    </>
  );
}
