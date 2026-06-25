import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  CircleCheckBig,
  Clock3,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { FinancialStatusBadge } from "@/components/portal/FinancialStatusBadge";
import { MetricCard } from "@/components/portal/MetricCard";
import { ReceiptPlaceholderButton } from "@/components/portal/ReceiptPlaceholderButton";
import { WardFilterSelect } from "@/components/portal/WardFilterSelect";
import { AccountsPaymentsView } from "@/components/portal/dashboards/AccountsPaymentsView";
import { mockPayments } from "@/data/portal/payments";
import {
  formatFeeCategory,
  formatPaymentMethod,
  formatPortalCurrency,
  formatPortalDate,
} from "@/lib/portal/format";
import { getMockParentPortalContext } from "@/lib/portal/mock-parent";
import { getMockRoleSession } from "@/lib/portal/mock-role";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = {
  title: "Payment History",
};

type PaymentsPageProps = {
  readonly params: Promise<{ role: string }>;
  readonly searchParams?: Promise<{ ward?: string }>;
};

export default async function PaymentsPage({
  params,
  searchParams,
}: PaymentsPageProps) {
  const { role } = await params;

  if (role === "accounts") {
    if (!(await getMockRoleSession("accounts"))) {
      notFound();
    }

    return <AccountsPaymentsView />;
  }

  const context = await getMockParentPortalContext();

  if (!context) {
    notFound();
  }

  const query = await searchParams;
  const requestedWard = query?.ward;
  const selectedWard =
    requestedWard && context.parent.childIds.includes(requestedWard)
      ? requestedWard
      : "all";
  const selectedStudentIds =
    selectedWard === "all" ? context.parent.childIds : [selectedWard];
  const wardQuery = selectedWard === "all" ? "" : `?ward=${selectedWard}`;

  const payments = mockPayments
    .filter(
      (payment) =>
        payment.parentId === context.parent.id &&
        selectedStudentIds.includes(payment.studentId),
    )
    .toSorted((a, b) => b.paidAt.localeCompare(a.paidAt));
  const successfulPayments = payments.filter(
    (payment) => payment.status === "successful",
  );
  const totalPaid = successfulPayments.reduce(
    (total, payment) => total + payment.amount,
    0,
  );

  const paymentRows: readonly DataTableRow[] = payments.map((payment) => {
    const student = context.students.find(
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
        <FinancialStatusBadge
          key={`${payment.id}-status`}
          status={payment.status}
        />,
        <ReceiptPlaceholderButton
          key={`${payment.id}-receipt`}
          reference={payment.reference}
        />,
      ],
    };
  });

  return (
    <>
      <DashboardHeader
        eyebrow="Parent finances"
        title="Payment history"
        description="Review filtered transaction records and receipt placeholders. New payment actions now live under Fees > Pay Now."
        badge="Mock transactions"
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.35fr)]">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Transactions"
            value={String(payments.length)}
            detail="Filtered mock records"
            icon={<ReceiptText aria-hidden="true" className="size-5" />}
          />
          <MetricCard
            label="Successful total"
            value={formatPortalCurrency(totalPaid)}
            detail="Filtered linked wards"
            icon={<CircleCheckBig aria-hidden="true" className="size-5" />}
          />
          <MetricCard
            label="Latest payment"
            value={
              payments[0]
                ? formatPortalDate(payments[0].paidAt.slice(0, 10))
                : "None"
            }
            detail="Most recent record"
            icon={<Clock3 aria-hidden="true" className="size-5" />}
          />
          <MetricCard
            label="Receipts"
            value={String(successfulPayments.length)}
            detail="Download placeholders"
            icon={<WalletCards aria-hidden="true" className="size-5" />}
          />
        </div>

        <DashboardCard
          title="Ward focus"
          description="Filter history by one linked child."
          className="h-fit"
        >
          <WardFilterSelect
            selectedWard={selectedWard}
            students={context.students.map((student) => ({
              id: student.id,
              name: student.fullName,
            }))}
          />
        </DashboardCard>
      </div>

      <div className="mt-8 space-y-8">
        <DashboardCard
          title="Transaction history"
          description="Receipt buttons explain the future backend dependency and do not download a file."
        >
          <DataTable
            caption="Parent payment history"
            columns={[
              "Reference",
              "Child",
              "Category",
              "Method",
              "Date",
              "Amount",
              "Status",
              "Receipt",
            ]}
            rows={paymentRows}
          />
        </DashboardCard>

        <DashboardCard
          title="Need to make a payment?"
          description="Payment initiation is now separated from history."
        >
          <Link
            href={`${portalRoutes.parentFeesPay}${wardQuery}`}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange"
          >
            Open Pay Now
          </Link>
        </DashboardCard>
      </div>
    </>
  );
}
