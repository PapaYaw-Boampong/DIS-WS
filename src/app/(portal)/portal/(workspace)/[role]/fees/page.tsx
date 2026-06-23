import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bus,
  CalendarClock,
  CircleDollarSign,
  ReceiptText,
  WalletCards,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { FinancialStatusBadge } from "@/components/portal/FinancialStatusBadge";
import { MetricCard } from "@/components/portal/MetricCard";
import { MockPaymentForm } from "@/components/portal/MockPaymentForm";
import { ProgressMeter } from "@/components/portal/ProgressMeter";
import { mockFeeItems, mockInvoices } from "@/data/portal/fees";
import {
  formatFeeCategory,
  formatPortalCurrency,
  formatPortalDate,
} from "@/lib/portal/format";
import { getMockParentPortalContext } from "@/lib/portal/mock-parent";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = {
  title: "Fees",
};

export default async function ParentFeesPage() {
  const context = await getMockParentPortalContext();

  if (!context) {
    notFound();
  }

  const invoices = mockInvoices.filter((invoice) =>
    context.parent.childIds.includes(invoice.studentId),
  );
  const totalDue = invoices.reduce(
    (total, invoice) => total + invoice.totalAmount,
    0,
  );
  const totalPaid = invoices.reduce(
    (total, invoice) => total + invoice.amountPaid,
    0,
  );
  const outstanding = invoices.reduce(
    (total, invoice) => total + invoice.balance,
    0,
  );
  const collectionPercentage = totalDue
    ? Math.round((totalPaid / totalDue) * 100)
    : 0;

  const invoiceRows: readonly DataTableRow[] = invoices.map((invoice) => {
    const student = context.students.find(
      (item) => item.id === invoice.studentId,
    );
    const invoiceItems = mockFeeItems.filter((item) =>
      invoice.feeItemIds.includes(item.id),
    );
    const term = invoiceItems[0]
      ? `${invoiceItems[0].term} · ${invoiceItems[0].academicYear}`
      : "Current term";

    return {
      id: invoice.id,
      cells: [
        invoice.id.toUpperCase(),
        student?.fullName ?? "Student",
        term,
        formatPortalCurrency(invoice.totalAmount),
        formatPortalCurrency(invoice.amountPaid),
        formatPortalCurrency(invoice.balance),
        <FinancialStatusBadge key={invoice.id} status={invoice.status} />,
      ],
    };
  });

  const categoryTotals = ["school_fees", "feeding", "transport"].map(
    (category) => {
      const feeItemIds = mockFeeItems
        .filter((item) => item.category === category)
        .map((item) => item.id);
      const assignedAmount = invoices.reduce((total, invoice) => {
        const matchingItems = mockFeeItems.filter(
          (item) =>
            feeItemIds.includes(item.id) &&
            invoice.feeItemIds.includes(item.id),
        );

        return (
          total +
          matchingItems.reduce((sum, item) => sum + item.amount, 0)
        );
      }, 0);

      return {
        category,
        assignedAmount,
      };
    },
  );

  return (
    <>
      <DashboardHeader
        eyebrow="Parent finances"
        title="Fees and invoices"
        description="Review fictional child-specific charges, balances and due dates before choosing a mock payment preview."
        badge="No live payments"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Total invoiced"
          value={formatPortalCurrency(totalDue)}
          detail="Across linked children"
          icon={<ReceiptText aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Amount paid"
          value={formatPortalCurrency(totalPaid)}
          detail={`${collectionPercentage}% of invoices`}
          icon={<CircleDollarSign aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Outstanding"
          value={formatPortalCurrency(outstanding)}
          detail="Mock balance remaining"
          icon={<WalletCards aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Next due date"
          value={formatPortalDate("2026-09-18")}
          detail="Term 1 mock deadline"
          icon={<CalendarClock aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <div className="space-y-8">
          <DashboardCard
            title="Invoice list"
            description="All records are fictional and read-only."
          >
            <DataTable
              caption="Parent invoice list"
              columns={[
                "Invoice",
                "Child",
                "Term",
                "Total",
                "Paid",
                "Balance",
                "Status",
              ]}
              rows={invoiceRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Payment progress"
            description="Combined progress across all mock invoices."
          >
            <ProgressMeter
              label="Family invoice collection"
              value={collectionPercentage}
              detail={`${formatPortalCurrency(totalPaid)} paid of ${formatPortalCurrency(totalDue)}`}
              tone="green"
            />
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href={portalRoutes.parentPayments}
                className="inline-flex min-h-11 items-center rounded-full border border-curry-orange px-5 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream"
              >
                View payment history
              </Link>
              <Link
                href={portalRoutes.parentFeeding}
                className="inline-flex min-h-11 items-center rounded-full border border-border px-5 text-sm font-bold text-charcoal transition-colors hover:bg-soft-white"
              >
                View feeding balances
              </Link>
            </div>
          </DashboardCard>
        </div>

        <div className="space-y-8">
          <DashboardCard
            title="Fee categories"
            description="Assigned mock charges for the current term."
          >
            <div className="space-y-4">
              {categoryTotals.map((item) => (
                <div
                  key={item.category}
                  className="rounded-2xl border border-border bg-soft-white p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-bold text-charcoal">
                        {formatFeeCategory(item.category)}
                      </p>
                      <p className="mt-1 text-sm text-muted-grey">
                        Family assigned amount
                      </p>
                    </div>
                    {item.category === "transport" ? (
                      <Bus
                        aria-hidden="true"
                        className="size-5 text-curry-orange"
                      />
                    ) : (
                      <WalletCards
                        aria-hidden="true"
                        className="size-5 text-curry-orange"
                      />
                    )}
                  </div>
                  <p className="mt-4 text-2xl font-extrabold text-charcoal">
                    {formatPortalCurrency(item.assignedAmount)}
                  </p>
                </div>
              ))}
            </div>
          </DashboardCard>

          <DashboardCard
            title="Advance payment preview"
            description="Preview school, feeding or transport payments without submitting a transaction."
          >
            <MockPaymentForm
              students={context.students.map((student) => ({
                id: student.id,
                name: student.fullName,
              }))}
              categories={[
                { value: "school_fees", label: "School Fees" },
                { value: "feeding", label: "Feeding Advance" },
                { value: "transport", label: "Transport Advance" },
              ]}
            />
          </DashboardCard>
        </div>
      </div>
    </>
  );
}
