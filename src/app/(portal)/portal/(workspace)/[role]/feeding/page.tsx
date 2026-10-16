import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { FinancialStatusBadge } from "@/components/portal/FinancialStatusBadge";
import { WalletTopUpLink } from "@/components/portal/WalletTopUpLink";
import { WardFilterSelect } from "@/components/portal/WardFilterSelect";
import { AccountsFeedingView } from "@/components/portal/dashboards/AccountsFeedingView";
import { getParentWallets } from "@/lib/portal/data/wallets";
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

  const wallets = await getParentWallets();
  const balances = wallets.feeding.filter((balance) =>
    selectedStudentIds.includes(balance.studentId),
  );

  const ledgerRows: readonly DataTableRow[] = wallets.transactions
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
        action={
          <WardFilterSelect
            compact
            selectedWard={selectedWard}
            students={context.students.map((student) => ({
              id: student.id,
              name: student.fullName,
            }))}
          />
        }
      />

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
            description="Top-ups appear here once the payment is verified; usage deductions come from the daily feeding register."
          >
            <DataTable
              caption="Feeding wallet activity"
              columns={["Date", "Child", "Description", "Reference", "Amount"]}
              rows={ledgerRows}
            />
          </DashboardCard>
        </div>

        <DashboardCard
          title="Top up the feeding wallet"
          description="A feeding top-up is paid the same way as any school payment."
          className="h-fit"
        >
          <WalletTopUpLink
            role={role}
            category="feeding"
            studentId={selectedStudents[0]?.id}
            label="Top up feeding wallet"
            description="Pay by Mobile Money, bank deposit or card. The feeding balance and its activity list update automatically once the payment is verified."
          />
        </DashboardCard>
      </div>
    </>
  );
}
