import {
  CircleDollarSign,
  FileText,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { ProgressMeter } from "@/components/portal/ProgressMeter";
import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  mockAccountsAlerts,
  mockAccountsSummary,
} from "@/data/portal/dashboard";
import { mockInvoices } from "@/data/portal/fees";
import { mockPayments } from "@/data/portal/payments";
import { mockStudents } from "@/data/portal/students";
import {
  formatPortalCurrency,
  formatPortalDate,
} from "@/lib/portal/format";

type AccountsDashboardProps = {
  readonly userName: string;
};

export function AccountsDashboard({ userName }: AccountsDashboardProps) {
  const paymentRows: readonly DataTableRow[] = mockPayments.map((payment) => {
    const student = mockStudents.find((item) => item.id === payment.studentId);

    return {
      id: payment.id,
      cells: [
        payment.reference,
        student?.fullName ?? "Student",
        formatPortalDate(payment.paidAt.slice(0, 10)),
        formatPortalCurrency(payment.amount),
        <StatusBadge key={payment.id} variant="success">
          Successful
        </StatusBadge>,
      ],
    };
  });

  const collectionPercentage = Math.round(
    (mockAccountsSummary.receivedPayments /
      mockAccountsSummary.expectedFees) *
      100,
  );

  return (
    <>
      <DashboardHeader
        eyebrow="Finance overview"
        title={`Welcome back, ${userName.split(" ")[0]}`}
        description="Review fictional collection indicators and use the role navigation for invoice, payment, balance, and reporting controls."
        badge="Accounts controls"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Expected fees"
          value={formatPortalCurrency(mockAccountsSummary.expectedFees)}
          detail="Current mock term"
          icon={<FileText aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Received"
          value={formatPortalCurrency(mockAccountsSummary.receivedPayments)}
          detail={`${collectionPercentage}% collection rate`}
          icon={<CircleDollarSign aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Outstanding"
          value={formatPortalCurrency(mockAccountsSummary.outstandingBalance)}
          detail="Across fictional invoices"
          icon={<WalletCards aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Today's payments"
          value={formatPortalCurrency(mockAccountsSummary.paymentsToday)}
          detail="Mock daily total"
          icon={<ReceiptText aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <div className="space-y-8">
          <DashboardCard
            title="Collection summary"
            description="Illustrative category progress without a live finance backend."
          >
            <div className="grid gap-6 md:grid-cols-2">
              <ProgressMeter
                label="Overall collection"
                value={collectionPercentage}
                detail={`${formatPortalCurrency(mockAccountsSummary.outstandingBalance)} remains outstanding.`}
                tone="green"
              />
              <ProgressMeter
                label="School fees"
                value={76}
                detail="Fictional current-term collection."
                tone="green"
              />
              <ProgressMeter
                label="Feeding fees"
                value={68}
                detail="Fictional feeding balance collection."
              />
              <ProgressMeter
                label="Transport fees"
                value={61}
                detail="Fictional transport fee collection."
                tone="blue"
              />
            </div>
          </DashboardCard>

          <DashboardCard
            title="Recent transactions"
            description="No payment provider or bank feed is connected."
          >
            <DataTable
              caption="Recent mock transactions"
              columns={["Reference", "Student", "Date", "Amount", "Status"]}
              rows={paymentRows}
            />
          </DashboardCard>
        </div>

        <div className="space-y-8">
          <DashboardCard title="Finance alerts">
            <ul className="space-y-3">
              {mockAccountsAlerts.map((alert) => (
                <li
                  key={alert.id}
                  className="rounded-2xl border border-border bg-soft-white p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-charcoal">{alert.title}</p>
                    <StatusBadge
                      variant={
                        alert.severity === "warning" ? "warning" : "info"
                      }
                    >
                      {alert.severity === "warning" ? "Review" : "Information"}
                    </StatusBadge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-grey">
                    {alert.description}
                  </p>
                </li>
              ))}
            </ul>
          </DashboardCard>

          <DashboardCard title="Invoice status">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-soft-cream p-4">
                <p className="text-2xl font-extrabold text-charcoal">
                  {mockAccountsSummary.paidInvoices}
                </p>
                <p className="mt-1 text-sm text-muted-grey">Paid invoices</p>
              </div>
              <div className="rounded-2xl bg-soft-cream p-4">
                <p className="text-2xl font-extrabold text-charcoal">
                  {mockAccountsSummary.pendingConfirmations}
                </p>
                <p className="mt-1 text-sm text-muted-grey">
                  Pending confirmation
                </p>
              </div>
              <div className="col-span-2 rounded-2xl border border-border p-4">
                <p className="font-bold text-charcoal">
                  Sample invoice balance
                </p>
                <p className="mt-2 text-sm text-muted-grey">
                  {mockInvoices[0]
                    ? formatPortalCurrency(mockInvoices[0].balance)
                    : formatPortalCurrency(0)}{" "}
                  outstanding
                </p>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
