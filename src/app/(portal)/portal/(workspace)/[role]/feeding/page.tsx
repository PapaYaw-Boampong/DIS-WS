import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  CircleAlert,
  CircleDollarSign,
  Soup,
  WalletCards,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { FinancialStatusBadge } from "@/components/portal/FinancialStatusBadge";
import { MetricCard } from "@/components/portal/MetricCard";
import { MockPaymentForm } from "@/components/portal/MockPaymentForm";
import { WardFilterSelect } from "@/components/portal/WardFilterSelect";
import { AccountsFeedingView } from "@/components/portal/dashboards/AccountsFeedingView";
import {
  mockFeedingBalances,
  mockWalletTransactions,
} from "@/data/portal/fees";
import {
  formatPortalCurrency,
  formatPortalDate,
} from "@/lib/portal/format";
import { getMockParentPortalContext } from "@/lib/portal/mock-parent";
import { getMockRoleSession } from "@/lib/portal/mock-role";

export const metadata: Metadata = {
  title: "Feeding",
};

type FeedingPageProps = {
  readonly params: Promise<{ role: string }>;
  readonly searchParams?: Promise<{ ward?: string }>;
};

export default async function FeedingPage({
  params,
  searchParams,
}: FeedingPageProps) {
  const { role } = await params;

  if (role === "accounts") {
    if (!(await getMockRoleSession("accounts"))) {
      notFound();
    }

    return <AccountsFeedingView />;
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

  const balances = mockFeedingBalances.filter((balance) =>
    selectedStudentIds.includes(balance.studentId),
  );
  const totalBalance = balances.reduce(
    (total, balance) => total + balance.balance,
    0,
  );
  const lowBalanceCount = balances.filter(
    (balance) => balance.status !== "active",
  ).length;

  const ledgerRows: readonly DataTableRow[] = mockWalletTransactions
    .filter(
      (entry) =>
        entry.wallet === "feeding" && selectedStudentIds.includes(entry.studentId),
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
        eyebrow="Fees · Feeding wallet"
        title="Feeding balances"
        description="Review filtered child-level balances, top-ups and usage records before preparing an advance feeding payment."
        badge="Mock wallet data"
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
            label="Active plans"
            value={String(balances.length)}
            detail="Fictional feeding accounts"
            icon={<Soup aria-hidden="true" className="size-5" />}
          />
          <MetricCard
            label="Low balances"
            value={String(lowBalanceCount)}
            detail="Needs parent review"
            icon={<CircleAlert aria-hidden="true" className="size-5" />}
          />
          <MetricCard
            label="Advance payments"
            value="Ready"
            detail="Backend required"
            icon={<CircleDollarSign aria-hidden="true" className="size-5" />}
          />
        </div>

        <DashboardCard
          title="Ward focus"
          description="Filter feeding wallet records by one child."
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
            title="Child feeding accounts"
            description="Balances and status are fictional."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              {balances.map((balance) => {
                const student = context.students.find(
                  (item) => item.id === balance.studentId,
                );

                return (
                  <article
                    key={balance.id}
                    className="rounded-2xl border border-border bg-soft-white p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-bold text-charcoal">
                          {student?.fullName ?? "Student"}
                        </p>
                        <p className="mt-1 text-sm text-muted-grey">
                          {student?.feedingPlan ?? "No"} feeding plan
                        </p>
                      </div>
                      <FinancialStatusBadge status={balance.status} />
                    </div>
                    <p className="mt-6 text-3xl font-extrabold text-charcoal">
                      {formatPortalCurrency(balance.balance)}
                    </p>
                    <p className="mt-2 text-xs text-muted-grey">
                      Last top-up:{" "}
                      {balance.lastTopUpAt
                        ? formatPortalDate(balance.lastTopUpAt.slice(0, 10))
                        : "No top-up"}
                    </p>
                  </article>
                );
              })}
            </div>
          </DashboardCard>

          <DashboardCard
            title="Feeding wallet activity"
            description="Usage deductions are illustrative placeholders for future school records."
          >
            <DataTable
              caption="Feeding wallet activity"
              columns={["Date", "Child", "Description", "Reference", "Amount"]}
              rows={ledgerRows}
            />
          </DashboardCard>
        </div>

        <DashboardCard
          title="Advance feeding payment"
          description="Prepare a feeding top-up. Charging and reconciliation still require the backend payment API."
          className="h-fit"
        >
          <MockPaymentForm
            students={selectedStudents.map((student) => ({
              id: student.id,
              name: student.fullName,
            }))}
            categories={[{ value: "feeding", label: "Feeding Advance" }]}
            defaultCategory="feeding"
            title="Feeding top-up"
            notice="Feeding top-up checkout is backend-gated. No wallet balance changes until a future provider callback is verified by the Render API."
            submitLabel="Start feeding payment"
          />
        </DashboardCard>
      </div>
    </>
  );
}
