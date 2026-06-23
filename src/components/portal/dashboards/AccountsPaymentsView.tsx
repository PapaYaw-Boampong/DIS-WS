import { CircleCheckBig, Clock3, ReceiptText, TriangleAlert } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { FinancialStatusBadge } from "@/components/portal/FinancialStatusBadge";
import { MetricCard } from "@/components/portal/MetricCard";
import { MockManualPaymentForm } from "@/components/portal/MockManualPaymentForm";
import { mockPayments } from "@/data/portal/payments";
import { mockStudents } from "@/data/portal/students";
import {
  formatFeeCategory,
  formatPaymentMethod,
  formatPortalCurrency,
  formatPortalDate,
} from "@/lib/portal/format";

export function AccountsPaymentsView() {
  const rows: readonly DataTableRow[] = mockPayments
    .toSorted((a, b) => b.paidAt.localeCompare(a.paidAt))
    .map((payment) => {
      const student = mockStudents.find(
        (item) => item.id === payment.studentId,
      );

      return {
        id: payment.id,
        cells: [
          payment.reference,
          student?.fullName ?? "Student",
          formatFeeCategory(payment.category),
          formatPaymentMethod(payment.method),
          formatPortalDate(payment.paidAt.slice(0, 10)),
          formatPortalCurrency(payment.amount),
          <FinancialStatusBadge key={payment.id} status={payment.status} />,
        ],
      };
    });
  const successful = mockPayments.filter(
    (payment) => payment.status === "successful",
  );

  return (
    <>
      <DashboardHeader eyebrow="Accounts control" title="Payment management" description="Review fictional transactions and preview manual payment recording without reconciling invoices." badge="Mock transactions" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Transactions" value={String(mockPayments.length)} detail="All mock records" icon={<ReceiptText aria-hidden="true" className="size-5" />} />
        <MetricCard label="Successful" value={String(successful.length)} detail={formatPortalCurrency(successful.reduce((total, item) => total + item.amount, 0))} icon={<CircleCheckBig aria-hidden="true" className="size-5" />} />
        <MetricCard label="Pending" value={String(mockPayments.filter((item) => item.status === "pending").length)} detail="Awaiting confirmation" icon={<Clock3 aria-hidden="true" className="size-5" />} />
        <MetricCard label="Failed" value={String(mockPayments.filter((item) => item.status === "failed").length)} detail="Needs review" icon={<TriangleAlert aria-hidden="true" className="size-5" />} />
      </div>
      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
        <DashboardCard title="Payment transactions" description="No provider or bank feed is connected.">
          <DataTable caption="Accounts payment records" columns={["Reference", "Student", "Category", "Method", "Date", "Amount", "Status"]} rows={rows} />
        </DashboardCard>
        <DashboardCard title="Record manual payment" description="Preview the accounts-office workflow." className="h-fit">
          <MockManualPaymentForm students={mockStudents.map((student) => ({ id: student.id, name: student.fullName }))} />
        </DashboardCard>
      </div>
    </>
  );
}
