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
import { listFeeItems } from "@/lib/portal/data/finance";
import {
  getParentInvoices,
  getParentPayments,
  getParentTransport,
} from "@/lib/portal/data/parent";
import { getParentWallets } from "@/lib/portal/data/wallets";
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
  const [wallets, invoices, payments, feeItems, transportEntries] =
    await Promise.all([
      getParentWallets(),
      getParentInvoices(),
      getParentPayments(),
      listFeeItems(),
      getParentTransport(),
    ]);
  const transportFee = feeItems.find((item) => item.category === "transport");
  const balances = wallets.transport.filter((balance) =>
    selectedStudentIds.includes(balance.studentId),
  );
  const totalBalance = balances.reduce(
    (total, balance) => total + balance.balance,
    0,
  );
  const lowBalanceCount = balances.filter(
    (balance) => balance.status !== "active",
  ).length;
  const assignments = transportEntries
    .map((entry) => entry.assignment)
    .filter((assignment) => selectedStudentIds.includes(assignment.studentId));
  const transportInvoices = invoices.filter(
    (invoice) =>
      selectedStudentIds.includes(invoice.studentId) &&
      invoice.feeItemIds.some((feeItemId) => feeItemId === transportFee?.id),
  );
  const transportPaid = payments
    .filter(
      (payment) =>
        selectedStudentIds.includes(payment.studentId) &&
        payment.category === "transport" &&
        payment.status === "verified",
    )
    .reduce((total, payment) => total + payment.amount, 0);
  const transportBalance = transportInvoices.reduce(
    (total, invoice) => total + invoice.balance,
    0,
  );

  const ledgerRows: readonly DataTableRow[] = wallets.transactions
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
            <div className="grid gap-5 sm:grid-cols-2">
              {balances.map((balance) => {
                const student = context.students.find(
                  (item) => item.id === balance.studentId,
                );
                const route =
                  transportEntries.find(
                    (item) => item.assignment.studentId === balance.studentId,
                  )?.route ?? null;
                const arrears = transportInvoices
                  .filter((invoice) => invoice.studentId === balance.studentId)
                  .reduce((total, invoice) => total + invoice.balance, 0);

                return (
                  <article
                    key={balance.id}
                    className="rounded-2xl border border-border bg-soft-white p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="font-bold text-charcoal">
                          {student?.fullName ?? "Student"}
                        </p>
                        <p className="mt-1 truncate text-sm text-muted-grey">
                          {route?.routeName ?? "No route assigned"}
                        </p>
                      </div>
                      <FinancialStatusBadge status={balance.status} />
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold tracking-[0.1em] text-muted-grey uppercase">
                          Wallet balance
                        </p>
                        <p className="mt-1 text-2xl font-extrabold tabular-nums text-charcoal">
                          {formatPortalCurrency(balance.balance)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold tracking-[0.1em] text-muted-grey uppercase">
                          Arrears
                        </p>
                        <p
                          className={`mt-1 text-2xl font-extrabold tabular-nums ${
                            arrears > 0 ? "text-red-700" : "text-emerald-700"
                          }`}
                        >
                          {formatPortalCurrency(arrears)}
                        </p>
                      </div>
                    </div>

                    <p className="mt-4 border-t border-border pt-4 text-sm text-muted-grey">
                      Last top-up:{" "}
                      <span className="font-semibold text-charcoal">
                        {balance.lastTopUpAt
                          ? formatPortalDate(balance.lastTopUpAt.slice(0, 10))
                          : "None yet"}
                      </span>
                    </p>
                  </article>
                );
              })}
            </div>
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
