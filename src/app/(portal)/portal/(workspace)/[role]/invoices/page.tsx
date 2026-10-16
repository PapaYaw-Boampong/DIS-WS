import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CircleCheckBig, FileText, TriangleAlert, WalletCards } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { FinancialStatusBadge } from "@/components/portal/FinancialStatusBadge";
import { MetricCard } from "@/components/portal/MetricCard";
import { InvoiceForm } from "@/components/portal/InvoiceForm";
import { listFeeItems, listInvoices } from "@/lib/portal/data/finance";
import { listStudents } from "@/lib/portal/data/students";
import {
  formatPortalCurrency,
  formatPortalDate,
} from "@/lib/portal/format";
import { getMockRoleSession } from "@/lib/portal/mock-role";

export const metadata: Metadata = { title: "Invoices" };

export default async function AccountsInvoicesPage() {
  if (!(await getMockRoleSession("accounts"))) {
    notFound();
  }

  const [mockInvoices, mockStudents, mockFeeItems] = await Promise.all([
    listInvoices(),
    listStudents(),
    listFeeItems(),
  ]);

  const rows: readonly DataTableRow[] = mockInvoices.map((invoice) => ({
    id: invoice.id,
    cells: [
      invoice.id.toUpperCase(),
      mockStudents.find((item) => item.id === invoice.studentId)?.fullName ??
        "Student",
      formatPortalDate(invoice.dueDate ?? "2026-09-18"),
      formatPortalCurrency(invoice.totalAmount),
      formatPortalCurrency(invoice.amountPaid),
      formatPortalCurrency(invoice.balance),
      <FinancialStatusBadge key={invoice.id} status={invoice.status} />,
    ],
  }));

  return (
    <>
      <DashboardHeader eyebrow="Accounts control" title="Invoice management" description="Review invoices and raise a new one for a learner from the fee catalogue." badge="Invoices" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Invoices" value={String(mockInvoices.length)} detail="Sample records" icon={<FileText aria-hidden="true" className="size-5" />} />
        <MetricCard label="Invoiced" value={formatPortalCurrency(mockInvoices.reduce((total, item) => total + item.totalAmount, 0))} detail="Combined value" icon={<WalletCards aria-hidden="true" className="size-5" />} />
        <MetricCard label="Paid" value={String(mockInvoices.filter((item) => item.status === "paid").length)} detail="Fully settled" icon={<CircleCheckBig aria-hidden="true" className="size-5" />} />
        <MetricCard label="Outstanding" value={String(mockInvoices.filter((item) => item.balance > 0).length)} detail="Needs collection" icon={<TriangleAlert aria-hidden="true" className="size-5" />} />
      </div>
      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
        <DashboardCard title="Invoice records" description="Every invoice raised, with what has been paid against it.">
          <DataTable caption="Accounts invoice records" columns={["Invoice", "Student", "Due", "Total", "Paid", "Balance", "Status"]} rows={rows} />
        </DashboardCard>
        <DashboardCard title="Raise invoice" description="Put one or more fee items on a learner's account. The total is calculated from the catalogue." className="h-fit">
          <InvoiceForm students={mockStudents.map((student) => ({ id: student.id, name: student.fullName }))} fees={mockFeeItems.map((fee) => ({ id: fee.id, title: fee.title, amount: fee.amount }))} />
        </DashboardCard>
      </div>
    </>
  );
}
