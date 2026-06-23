import { CircleAlert, CircleDollarSign, Soup, WalletCards } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { FinancialStatusBadge } from "@/components/portal/FinancialStatusBadge";
import { MetricCard } from "@/components/portal/MetricCard";
import {
  mockFeedingBalances,
  mockWalletTransactions,
} from "@/data/portal/fees";
import { mockStudents } from "@/data/portal/students";
import {
  formatPortalCurrency,
  formatPortalDate,
} from "@/lib/portal/format";

export function AccountsFeedingView() {
  const rows: readonly DataTableRow[] = mockFeedingBalances.map((balance) => {
    const student = mockStudents.find(
      (item) => item.id === balance.studentId,
    );

    return {
      id: balance.id,
      cells: [
        student?.fullName ?? "Student",
        student?.className ?? "Class",
        student?.feedingPlan ?? "None",
        formatPortalCurrency(balance.balance),
        balance.lastTopUpAt
          ? formatPortalDate(balance.lastTopUpAt.slice(0, 10))
          : "None",
        <FinancialStatusBadge key={balance.id} status={balance.status} />,
      ],
    };
  });
  const credits = mockWalletTransactions
    .filter((item) => item.wallet === "feeding" && item.type === "credit")
    .reduce((total, item) => total + item.amount, 0);

  return (
    <>
      <DashboardHeader eyebrow="Accounts control" title="Feeding balances" description="Review fictional feeding wallets, top-ups, and low-balance accounts without changing child balances." badge="Mock wallets" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Wallets" value={String(mockFeedingBalances.length)} detail="Sample child accounts" icon={<WalletCards aria-hidden="true" className="size-5" />} />
        <MetricCard label="Combined balance" value={formatPortalCurrency(mockFeedingBalances.reduce((total, item) => total + item.balance, 0))} detail="Available mock credit" icon={<Soup aria-hidden="true" className="size-5" />} />
        <MetricCard label="Top-ups" value={formatPortalCurrency(credits)} detail="Mock wallet credits" icon={<CircleDollarSign aria-hidden="true" className="size-5" />} />
        <MetricCard label="Low balances" value={String(mockFeedingBalances.filter((item) => item.status !== "active").length)} detail="Needs review" icon={<CircleAlert aria-hidden="true" className="size-5" />} />
      </div>
      <DashboardCard title="Feeding wallet records" description="Balances are fictional and read-only." className="mt-8">
        <DataTable caption="Accounts feeding balances" columns={["Student", "Class", "Plan", "Balance", "Last top-up", "Status"]} rows={rows} />
      </DashboardCard>
    </>
  );
}
