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
import { listPayments } from "@/lib/portal/data/finance";
import { listStudents } from "@/lib/portal/data/students";
import {
  formatPortalCurrency,
  formatPortalDate,
} from "@/lib/portal/format";
import { getDashboardSummary } from "@/lib/portal/data/dashboard";
import { getMockPortalSession } from "@/lib/portal/mock-session";

export async function AccountsDashboard() {
  const session = await getMockPortalSession();
  const userName = session?.user.name ?? "Accounts";
  const [mockPayments, mockStudents] = await Promise.all([
    listPayments(),
    listStudents(),
  ]);
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

  const summary = await getDashboardSummary();
  const { finance, alerts } = summary;

  const collectionPercentage =
    finance.expectedFees > 0
      ? Math.round((finance.receivedPayments / finance.expectedFees) * 100)
      : 0;

  // Per-category share of everything actually collected. A "percent collected"
  // per category would need payments allocated across the fee items on an
  // invoice, which the ledger does not record — so this reports the split of
  // real money received rather than inventing a completion rate.
  const categoryShare = (category: string) => {
    const received =
      finance.receivedByCategory.find((row) => row.category === category)
        ?.received ?? 0;
    return {
      value:
        finance.receivedPayments > 0
          ? Math.round((received / finance.receivedPayments) * 100)
          : 0,
      received,
    };
  };

  const schoolFees = categoryShare("school_fees");
  const feeding = categoryShare("feeding");
  const transport = categoryShare("transport");

  return (
    <>
      <DashboardHeader
        eyebrow="Finance overview"
        title={`Welcome back, ${userName.split(" ")[0]}`}
        description="Collection indicators for the school. Use the role navigation for invoice, payment, balance and reporting controls."
        badge="Accounts controls"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Expected fees"
          value={formatPortalCurrency(finance.expectedFees)}
          detail={summary.isLive ? "Total invoiced" : "Illustrative term total"}
          icon={<FileText aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Received"
          value={formatPortalCurrency(finance.receivedPayments)}
          detail={`${collectionPercentage}% collection rate`}
          icon={<CircleDollarSign aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Outstanding"
          value={formatPortalCurrency(finance.outstandingBalance)}
          detail={
            summary.isLive && finance.overdueInvoices > 0
              ? `${finance.overdueInvoices} invoice${finance.overdueInvoices === 1 ? "" : "s"} overdue`
              : "Across all invoices"
          }
          icon={<WalletCards aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Today's payments"
          value={formatPortalCurrency(finance.paymentsToday)}
          detail={summary.isLive ? "Verified so far today" : "Illustrative daily total"}
          icon={<ReceiptText aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <div className="space-y-8">
          <DashboardCard
            title="Collection summary"
            description="Overall collection against everything invoiced, then how the money received splits by category."
          >
            <div className="grid gap-6 md:grid-cols-2">
              <ProgressMeter
                label="Overall collection"
                value={collectionPercentage}
                detail={`${formatPortalCurrency(finance.outstandingBalance)} remains outstanding.`}
                tone="green"
              />
              <ProgressMeter
                label="School fees"
                value={schoolFees.value}
                detail={`${formatPortalCurrency(schoolFees.received)} of everything received.`}
                tone="green"
              />
              <ProgressMeter
                label="Feeding fees"
                value={feeding.value}
                detail={`${formatPortalCurrency(feeding.received)} of everything received.`}
              />
              <ProgressMeter
                label="Transport fees"
                value={transport.value}
                detail={`${formatPortalCurrency(transport.received)} of everything received.`}
                tone="blue"
              />
            </div>
          </DashboardCard>

          <DashboardCard
            title="Recent transactions"
            description="The most recent payments recorded against learner accounts."
          >
            <DataTable
              caption="Recent transactions"
              columns={["Reference", "Student", "Date", "Amount", "Status"]}
              rows={paymentRows}
            />
          </DashboardCard>
        </div>

        <div className="space-y-8">
          <DashboardCard title="Finance alerts">
            <ul className="space-y-3">
              {alerts.map((alert) => (
                <li
                  key={alert.id}
                  className="rounded-2xl border border-border bg-soft-white p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-charcoal">{alert.title}</p>
                    <StatusBadge
                      variant={
                        alert.severity === "critical"
                          ? "danger"
                          : alert.severity === "warning"
                            ? "warning"
                            : "info"
                      }
                    >
                      {alert.severity === "critical"
                        ? "Action needed"
                        : alert.severity === "warning"
                          ? "Review"
                          : "Information"}
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
                  {finance.paidInvoices}
                </p>
                <p className="mt-1 text-sm text-muted-grey">Paid invoices</p>
              </div>
              <div className="rounded-2xl bg-soft-cream p-4">
                <p className="text-2xl font-extrabold text-charcoal">
                  {finance.pendingConfirmations}
                </p>
                <p className="mt-1 text-sm text-muted-grey">
                  Pending confirmation
                </p>
              </div>
              <div className="col-span-2 rounded-2xl border border-border p-4">
                <p className="font-bold text-charcoal">Overdue</p>
                <p className="mt-2 text-sm text-muted-grey">
                  {finance.overdueInvoices} invoice
                  {finance.overdueInvoices === 1 ? "" : "s"} past the due date,{" "}
                  {formatPortalCurrency(finance.overdueAmount)} outstanding
                </p>
              </div>
            </div>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
