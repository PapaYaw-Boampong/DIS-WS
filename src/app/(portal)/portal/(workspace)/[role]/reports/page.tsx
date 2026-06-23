import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChartNoAxesColumnIncreasing, CircleDollarSign, FileChartColumn, WalletCards } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { MetricCard } from "@/components/portal/MetricCard";
import { ProgressMeter } from "@/components/portal/ProgressMeter";
import { ReportExportPlaceholder } from "@/components/portal/ReportExportPlaceholder";
import { mockInvoices } from "@/data/portal/fees";
import { mockPayments } from "@/data/portal/payments";
import {
  formatPortalCurrency,
} from "@/lib/portal/format";
import { getMockRoleSession } from "@/lib/portal/mock-role";

export const metadata: Metadata = { title: "Reports" };

export default async function AccountsReportsPage() {
  if (!(await getMockRoleSession("accounts"))) {
    notFound();
  }

  const invoiced = mockInvoices.reduce(
    (total, invoice) => total + invoice.totalAmount,
    0,
  );
  const received = mockPayments
    .filter((payment) => payment.status === "successful")
    .reduce((total, payment) => total + payment.amount, 0);
  const rate = invoiced ? Math.round((received / invoiced) * 100) : 0;

  return (
    <>
      <DashboardHeader eyebrow="Accounts control" title="Reports overview" description="Review fictional collection indicators and preview report export without generating a file." badge="Mock reporting" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Invoiced" value={formatPortalCurrency(invoiced)} detail="Sample invoices" icon={<FileChartColumn aria-hidden="true" className="size-5" />} />
        <MetricCard label="Received" value={formatPortalCurrency(received)} detail="Successful samples" icon={<CircleDollarSign aria-hidden="true" className="size-5" />} />
        <MetricCard label="Outstanding" value={formatPortalCurrency(mockInvoices.reduce((total, item) => total + item.balance, 0))} detail="Open sample balances" icon={<WalletCards aria-hidden="true" className="size-5" />} />
        <MetricCard label="Collection rate" value={`${rate}%`} detail="Sample performance" icon={<ChartNoAxesColumnIncreasing aria-hidden="true" className="size-5" />} />
      </div>
      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(22rem,0.7fr)]">
        <DashboardCard title="Collection performance" description="Illustrative category performance only.">
          <div className="space-y-6">
            <ProgressMeter label="Overall collection" value={rate} detail={`${formatPortalCurrency(received)} received of ${formatPortalCurrency(invoiced)}`} tone="green" />
            <ProgressMeter label="School fees" value={72} detail="Mock school-fee collection." tone="green" />
            <ProgressMeter label="Feeding fees" value={68} detail="Mock feeding-fee collection." />
            <ProgressMeter label="Transport fees" value={50} detail="Mock transport-fee collection." tone="blue" />
          </div>
        </DashboardCard>
        <DashboardCard title="Export report" description="Preview report selection and export." className="h-fit">
          <ReportExportPlaceholder />
        </DashboardCard>
      </div>
    </>
  );
}
