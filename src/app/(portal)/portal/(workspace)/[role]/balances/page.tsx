import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleCheckBig, GraduationCap, TriangleAlert, WalletCards } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { FinancialStatusBadge } from "@/components/portal/FinancialStatusBadge";
import { MetricCard } from "@/components/portal/MetricCard";
import { mockInvoices } from "@/data/portal/fees";
import { mockStudents } from "@/data/portal/students";
import { formatPortalCurrency } from "@/lib/portal/format";
import { getMockRoleSession } from "@/lib/portal/mock-role";

export const metadata: Metadata = { title: "Balances" };

export default async function AccountsBalancesPage() {
  if (!(await getMockRoleSession("accounts"))) {
    notFound();
  }

  const rows: readonly DataTableRow[] = mockInvoices.map((invoice) => {
    const student = mockStudents.find((item) => item.id === invoice.studentId);

    return {
      id: invoice.id,
      cells: [
        student?.fullName ?? "Student",
        student?.studentId ?? "ID",
        student?.className ?? "Class",
        formatPortalCurrency(invoice.totalAmount),
        formatPortalCurrency(invoice.amountPaid),
        formatPortalCurrency(invoice.balance),
        <FinancialStatusBadge key={invoice.id} status={invoice.status} />,
      ],
    };
  });
  const outstanding = mockInvoices.reduce(
    (total, invoice) => total + invoice.balance,
    0,
  );

  return (
    <>
      <DashboardHeader eyebrow="Accounts control" title="Outstanding balances" description="Review fictional student balances by class and payment status." badge="Mock balances" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Students invoiced" value={String(mockInvoices.length)} detail="Sample accounts" icon={<GraduationCap aria-hidden="true" className="size-5" />} />
        <MetricCard label="Outstanding" value={formatPortalCurrency(outstanding)} detail="Combined sample balance" icon={<WalletCards aria-hidden="true" className="size-5" />} />
        <MetricCard label="Settled" value={String(mockInvoices.filter((item) => item.balance === 0).length)} detail="Fully paid" icon={<CircleCheckBig aria-hidden="true" className="size-5" />} />
        <MetricCard label="Needs collection" value={String(mockInvoices.filter((item) => item.balance > 0).length)} detail="Open balances" icon={<TriangleAlert aria-hidden="true" className="size-5" />} />
      </div>
      <DashboardCard title="Student balance records" description="Use future filters to narrow by class, term, category, or status." className="mt-8">
        <DataTable caption="Accounts outstanding balances" columns={["Student", "Student ID", "Class", "Invoiced", "Paid", "Balance", "Status"]} rows={rows} />
      </DashboardCard>
    </>
  );
}
