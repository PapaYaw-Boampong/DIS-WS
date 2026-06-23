import type { Metadata } from "next";
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
import { MockPaymentForm } from "@/components/portal/MockPaymentForm";
import { ReceiptPlaceholderButton } from "@/components/portal/ReceiptPlaceholderButton";
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

export const metadata: Metadata = {
  title: "Payment History",
};

type PaymentsPageProps = {
  readonly params: Promise<{ role: string }>;
};

export default async function PaymentsPage({ params }: PaymentsPageProps) {
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

  const payments = mockPayments
    .filter((payment) => payment.parentId === context.parent.id)
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
        <FinancialStatusBadge key={`${payment.id}-status`} status={payment.status} />,
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
        description="Review fictional transaction records and receipt placeholders. No payment provider or finance backend is connected."
        badge="Mock transactions"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Transactions"
          value={String(payments.length)}
          detail="Mock payment records"
          icon={<ReceiptText aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Successful total"
          value={formatPortalCurrency(totalPaid)}
          detail="Across linked children"
          icon={<CircleCheckBig aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Latest payment"
          value={
            payments[0]
              ? formatPortalDate(payments[0].paidAt.slice(0, 10))
              : "None"
          }
          detail="Most recent mock record"
          icon={<Clock3 aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Receipts"
          value={String(successfulPayments.length)}
          detail="Download placeholders"
          icon={<WalletCards aria-hidden="true" className="size-5" />}
        />
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

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(20rem,0.7fr)]">
          <DashboardCard
            title="New payment preview"
            description="Review the planned payment flow without initiating a transaction."
          >
            <MockPaymentForm
              students={context.students.map((student) => ({
                id: student.id,
                name: student.fullName,
              }))}
              categories={[
                { value: "school_fees", label: "School Fees" },
                { value: "feeding", label: "Feeding Fees" },
                { value: "transport", label: "Transport Fees" },
              ]}
            />
          </DashboardCard>

          <DashboardCard title="Payment flow boundary">
            <ol className="space-y-4 text-sm leading-6 text-muted-grey">
              {[
                "Choose a child and fee category.",
                "Enter an amount and payment method.",
                "Review the payment summary.",
                "A future backend creates the provider transaction.",
                "A verified callback records payment and generates a receipt.",
              ].map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-soft-cream text-xs font-extrabold text-deep-orange">
                    {index + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
