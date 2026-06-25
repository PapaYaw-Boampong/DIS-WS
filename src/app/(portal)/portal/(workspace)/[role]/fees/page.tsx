import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  Bus,
  CalendarClock,
  CircleDollarSign,
  WalletCards,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { FinancialStatusBadge } from "@/components/portal/FinancialStatusBadge";
import { MetricCard } from "@/components/portal/MetricCard";
import { WardFilterSelect } from "@/components/portal/WardFilterSelect";
import { AdminFeesView } from "@/components/portal/dashboards/AdminFeesView";
import { mockFeeItems, mockInvoices } from "@/data/portal/fees";
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
import type { FeeCategory } from "@/types/portal";

export const metadata: Metadata = {
  title: "Fees",
};

type FeesPageProps = {
  readonly params: Promise<{ role: string }>;
  readonly searchParams?: Promise<{ ward?: string }>;
};

const visibleCategories = [
  "school_fees",
  "feeding",
  "transport",
] satisfies readonly FeeCategory[];

export default async function FeesPage({
  params,
  searchParams,
}: FeesPageProps) {
  const { role } = await params;

  if (role === "admin") {
    if (!(await getMockRoleSession("admin"))) {
      notFound();
    }

    return <AdminFeesView />;
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
  const selectedStudents = context.students.filter((student) =>
    selectedStudentIds.includes(student.id),
  );
  const wardQuery = selectedWard === "all" ? "" : `?ward=${selectedWard}`;

  const invoices = mockInvoices.filter((invoice) =>
    selectedStudentIds.includes(invoice.studentId),
  );
  const totalPaid = invoices.reduce(
    (total, invoice) => total + invoice.amountPaid,
    0,
  );
  const outstanding = invoices.reduce(
    (total, invoice) => total + invoice.balance,
    0,
  );
  const nextDueDate = invoices
    .map((invoice) => invoice.dueDate)
    .filter((date): date is string => Boolean(date))
    .toSorted()[0];

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
        formatPortalCurrency(invoice.amountPaid),
        formatPortalCurrency(invoice.balance),
        invoice.dueDate ? formatPortalDate(invoice.dueDate) : "No due date",
        <FinancialStatusBadge key={invoice.id} status={invoice.status} />,
      ],
    };
  });

  const paymentRows: readonly DataTableRow[] = mockPayments
    .filter(
      (payment) =>
        payment.parentId === context.parent.id &&
        selectedStudentIds.includes(payment.studentId),
    )
    .toSorted((a, b) => b.paidAt.localeCompare(a.paidAt))
    .slice(0, 5)
    .map((payment) => {
      const student = context.students.find(
        (item) => item.id === payment.studentId,
      );

      return {
        id: payment.id,
        cells: [
          student?.fullName ?? "Student",
          formatFeeCategory(payment.category),
          formatPaymentMethod(payment.method),
          formatPortalDate(payment.paidAt.slice(0, 10)),
          formatPortalCurrency(payment.amount),
          <FinancialStatusBadge key={payment.id} status={payment.status} />,
        ],
      };
    });

  const categoryTotals = visibleCategories.map((category) => {
    const feeItemIds = mockFeeItems
      .filter((item) => item.category === category)
      .map((item) => item.id);
    const assignedAmount = invoices.reduce((total, invoice) => {
      const matchingItems = mockFeeItems.filter(
        (item) =>
          feeItemIds.includes(item.id) && invoice.feeItemIds.includes(item.id),
      );

      return total + matchingItems.reduce((sum, item) => sum + item.amount, 0);
    }, 0);

    return {
      category,
      assignedAmount,
    };
  });

  return (
    <>
      <DashboardHeader
        eyebrow="Parent finances"
        title="Fees overview"
        description="Focus all wards or one child, review open balances, and start a secure payment from the grouped Fees area."
        badge="Backend payment required"
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.35fr)]">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            label="Outstanding"
            value={formatPortalCurrency(outstanding)}
            detail="Mock balance remaining"
            icon={<WalletCards aria-hidden="true" className="size-5" />}
          />
          <MetricCard
            label="Amount paid"
            value={formatPortalCurrency(totalPaid)}
            detail="Verified mock payments"
            icon={<CircleDollarSign aria-hidden="true" className="size-5" />}
          />
          <MetricCard
            label="Next due date"
            value={nextDueDate ? formatPortalDate(nextDueDate) : "None"}
            detail="Filtered ward view"
            icon={<CalendarClock aria-hidden="true" className="size-5" />}
          />
        </div>

        <DashboardCard
          title="Ward focus"
          description="Filter this Fees view by one linked child."
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

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <div className="space-y-8">
          <DashboardCard
            title="Invoice list"
            description="Filtered fictional invoice records. Payment status is not changed by the frontend."
          >
            <DataTable
              caption="Parent invoice list"
              columns={[
                "Invoice",
                "Child",
                "Term",
                "Paid",
                "Balance",
                "Due",
                "Status",
              ]}
              rows={invoiceRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Recent payments"
            description="Filtered payment history preview. Open the full history tab for all matching records."
          >
            <DataTable
              caption="Recent parent payments"
              columns={[
                "Child",
                "Category",
                "Method",
                "Date",
                "Amount",
                "Status",
              ]}
              rows={paymentRows}
            />
          </DashboardCard>
        </div>

        <div className="space-y-8">
          <DashboardCard
            title="Pay fees"
            description="Start here when you are ready to pay. The actual checkout still waits for the backend payment API."
          >
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-900">
              The frontend cannot charge mobile money, cards, or bank transfer
              directly. A future Render backend must initialize the provider
              transaction and verify the callback before any balance changes.
            </div>
            <Link
              href={`${portalRoutes.parentFeesPay}${wardQuery}`}
              className="mt-5 inline-flex min-h-12 items-center justify-center rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange"
            >
              Pay now
            </Link>
          </DashboardCard>

          <DashboardCard
            title="Fee categories"
            description={`Assigned mock charges for ${selectedWard === "all" ? "all linked wards" : selectedStudents[0]?.fullName ?? "selected ward"}.`}
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
                        Filtered assigned amount
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
        </div>
      </div>
    </>
  );
}
