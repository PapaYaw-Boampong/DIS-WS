import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Bus, CircleCheckBig, TriangleAlert, WalletCards } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { FinancialStatusBadge } from "@/components/portal/FinancialStatusBadge";
import { MetricCard } from "@/components/portal/MetricCard";
import { mockFeeItems } from "@/data/portal/fees";
import { mockPayments } from "@/data/portal/payments";
import { mockStudents } from "@/data/portal/students";
import { mockTransportAssignments, mockTransportRoutes } from "@/data/portal/transport";
import { formatPortalCurrency } from "@/lib/portal/format";
import { getMockRoleSession } from "@/lib/portal/mock-role";
import type { TransportAssignment } from "@/types/portal";

export const metadata: Metadata = { title: "Transport Fees" };

export default async function AccountsTransportFeesPage() {
  if (!(await getMockRoleSession("accounts"))) {
    notFound();
  }

  const transportFee = mockFeeItems.find((item) => item.category === "transport");
  const assignments: readonly TransportAssignment[] =
    mockTransportAssignments;
  const rows: readonly DataTableRow[] = assignments.map((assignment) => {
    const student = mockStudents.find((item) => item.id === assignment.studentId);
    const route = mockTransportRoutes.find((item) => item.id === assignment.routeId);
    const paid = mockPayments
      .filter((item) => item.studentId === assignment.studentId && item.category === "transport" && item.status === "successful")
      .reduce((total, item) => total + item.amount, 0);
    const charge = transportFee?.amount ?? 0;

    return {
      id: assignment.id,
      cells: [
        student?.fullName ?? "Student",
        route?.routeName ?? "Route",
        route?.busName ?? "Bus",
        formatPortalCurrency(charge),
        formatPortalCurrency(paid),
        formatPortalCurrency(Math.max(0, charge - paid)),
        <FinancialStatusBadge key={assignment.id} status={assignment.feeStatus} />,
      ],
    };
  });

  return (
    <>
      <DashboardHeader eyebrow="Accounts control" title="Transport fee balances" description="Review fictional route assignments and fee collection without changing transport or invoice records." badge="Mock transport fees" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Assignments" value={String(assignments.length)} detail="Sample transport accounts" icon={<Bus aria-hidden="true" className="size-5" />} />
        <MetricCard label="Term charge" value={formatPortalCurrency(transportFee?.amount ?? 0)} detail="Per assigned student" icon={<WalletCards aria-hidden="true" className="size-5" />} />
        <MetricCard label="Paid accounts" value={String(assignments.filter((item) => item.feeStatus === "paid").length)} detail="Fully settled" icon={<CircleCheckBig aria-hidden="true" className="size-5" />} />
        <MetricCard label="Open accounts" value={String(assignments.filter((item) => item.feeStatus !== "paid").length)} detail="Needs collection" icon={<TriangleAlert aria-hidden="true" className="size-5" />} />
      </div>
      <DashboardCard title="Transport fee records" description="Route and balance values are fictional." className="mt-8">
        <DataTable caption="Accounts transport fee records" columns={["Student", "Route", "Bus", "Charge", "Paid", "Balance", "Status"]} rows={rows} />
      </DashboardCard>
    </>
  );
}
