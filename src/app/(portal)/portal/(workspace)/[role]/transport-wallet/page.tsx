import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  Bus,
  CircleAlert,
  CircleDollarSign,
  Route,
  WalletCards,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { FinancialStatusBadge } from "@/components/portal/FinancialStatusBadge";
import { MetricCard } from "@/components/portal/MetricCard";
import { MockPaymentForm } from "@/components/portal/MockPaymentForm";
import { WardFilterSelect } from "@/components/portal/WardFilterSelect";
import {
  mockFeeItems,
  mockInvoices,
  mockTransportWalletBalances,
  mockWalletTransactions,
} from "@/data/portal/fees";
import { mockPayments } from "@/data/portal/payments";
import {
  mockTransportAssignments,
  mockTransportRoutes,
} from "@/data/portal/transport";
import {
  formatPortalCurrency,
  formatPortalDate,
} from "@/lib/portal/format";
import { getMockParentPortalContext } from "@/lib/portal/mock-parent";

export const metadata: Metadata = {
  title: "Transport Wallet",
};

type TransportWalletPageProps = {
  readonly searchParams?: Promise<{ ward?: string }>;
};

export default async function TransportWalletPage({
  searchParams,
}: TransportWalletPageProps) {
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
  const transportFee = mockFeeItems.find((item) => item.category === "transport");
  const balances = mockTransportWalletBalances.filter((balance) =>
    selectedStudentIds.includes(balance.studentId),
  );
  const totalBalance = balances.reduce(
    (total, balance) => total + balance.balance,
    0,
  );
  const lowBalanceCount = balances.filter(
    (balance) => balance.status !== "active",
  ).length;
  const assignments = mockTransportAssignments.filter((assignment) =>
    selectedStudentIds.includes(assignment.studentId),
  );
  const transportInvoices = mockInvoices.filter(
    (invoice) =>
      selectedStudentIds.includes(invoice.studentId) &&
      invoice.feeItemIds.some((feeItemId) => feeItemId === transportFee?.id),
  );
  const transportPaid = mockPayments
    .filter(
      (payment) =>
        payment.parentId === context.parent.id &&
        selectedStudentIds.includes(payment.studentId) &&
        payment.category === "transport" &&
        payment.status === "successful",
    )
    .reduce((total, payment) => total + payment.amount, 0);
  const transportBalance = transportInvoices.reduce(
    (total, invoice) => total + invoice.balance,
    0,
  );

  const walletRows: readonly DataTableRow[] = balances.map((balance) => {
    const student = context.students.find(
      (item) => item.id === balance.studentId,
    );
    const assignment = mockTransportAssignments.find(
      (item) => item.studentId === balance.studentId,
    );
    const route = mockTransportRoutes.find(
      (item) => item.id === assignment?.routeId,
    );

    return {
      id: balance.id,
      cells: [
        student?.fullName ?? "Student",
        route?.routeName ?? "No route assigned",
        formatPortalCurrency(balance.balance),
        balance.lastTopUpAt
          ? formatPortalDate(balance.lastTopUpAt.slice(0, 10))
          : "No top-up",
        <FinancialStatusBadge key={balance.id} status={balance.status} />,
      ],
    };
  });

  const ledgerRows: readonly DataTableRow[] = mockWalletTransactions
    .filter(
      (entry) =>
        entry.wallet === "transport" &&
        selectedStudentIds.includes(entry.studentId),
    )
    .toSorted((a, b) => b.occurredAt.localeCompare(a.occurredAt))
    .map((entry) => {
      const student = context.students.find(
        (item) => item.id === entry.studentId,
      );

      return {
        id: entry.id,
        cells: [
          formatPortalDate(entry.occurredAt.slice(0, 10)),
          student?.fullName ?? "Student",
          entry.description,
          entry.reference,
          <span
            key={entry.id}
            className={
              entry.type === "credit"
                ? "font-bold text-emerald-700"
                : "font-bold text-charcoal"
            }
          >
            {entry.type === "credit" ? "+" : "-"}
            {formatPortalCurrency(entry.amount)}
          </span>,
        ],
      };
    });

  return (
    <>
      <DashboardHeader
        eyebrow="Fees · Transport wallet"
        title="Transport wallet"
        description="Review route-linked transport balances and prepare transport top-ups without changing live records."
        badge="Backend payment required"
      />

      <div className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.35fr)]">
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Wallet balance"
            value={formatPortalCurrency(totalBalance)}
            detail="Filtered ward view"
            icon={<WalletCards aria-hidden="true" className="size-5" />}
          />
          <MetricCard
            label="Route assignments"
            value={String(assignments.length)}
            detail="Linked transport accounts"
            icon={<Route aria-hidden="true" className="size-5" />}
          />
          <MetricCard
            label="Transport paid"
            value={formatPortalCurrency(transportPaid)}
            detail="Verified mock payments"
            icon={<CircleDollarSign aria-hidden="true" className="size-5" />}
          />
          <MetricCard
            label="Transport balance"
            value={formatPortalCurrency(transportBalance)}
            detail={`${lowBalanceCount} wallet(s) need review`}
            icon={<CircleAlert aria-hidden="true" className="size-5" />}
          />
        </div>

        <DashboardCard
          title="Ward focus"
          description="Filter transport wallet records by one child."
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

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(20rem,0.8fr)]">
        <div className="space-y-8">
          <DashboardCard
            title="Transport wallet accounts"
            description="Balances and route context are fictional."
          >
            <DataTable
              caption="Transport wallet accounts"
              columns={["Child", "Route", "Wallet balance", "Last top-up", "Status"]}
              rows={walletRows}
            />
          </DashboardCard>

          <DashboardCard
            title="Transport wallet activity"
            description="Top-ups and deductions are illustrative placeholders for future transport records."
          >
            <DataTable
              caption="Transport wallet activity"
              columns={["Date", "Child", "Description", "Reference", "Amount"]}
              rows={ledgerRows}
            />
          </DashboardCard>
        </div>

        <DashboardCard
          title="Advance transport payment"
          description="Prepare a transport top-up. Charging and reconciliation still require the backend payment API."
          className="h-fit"
        >
          <MockPaymentForm
            students={selectedStudents.map((student) => ({
              id: student.id,
              name: student.fullName,
            }))}
            categories={[{ value: "transport", label: "Transport Advance" }]}
            defaultCategory="transport"
            title="Transport top-up"
            notice="Transport top-up checkout is backend-gated. No transport wallet or invoice balance changes until a future provider callback is verified by the Render API."
            submitLabel="Start transport payment"
          />
          <div className="mt-6 rounded-2xl border border-border bg-soft-white p-4 text-sm leading-6 text-muted-grey">
            <Bus
              aria-hidden="true"
              className="mb-3 size-5 text-curry-orange"
            />
            Transport wallet funds should be reconciled by accounts before the
            transport fee balance is marked settled.
          </div>
        </DashboardCard>
      </div>
    </>
  );
}
