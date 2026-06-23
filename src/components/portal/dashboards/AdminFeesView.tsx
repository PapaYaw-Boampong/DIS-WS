import { BadgePlus, CalendarClock, Layers3, WalletCards } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { MockFeeItemForm } from "@/components/portal/MockFeeItemForm";
import { mockFeeItems } from "@/data/portal/fees";
import {
  formatFeeCategory,
  formatPortalCurrency,
  formatPortalDate,
} from "@/lib/portal/format";

export function AdminFeesView() {
  const rows: readonly DataTableRow[] = mockFeeItems.map((fee) => ({
    id: fee.id,
    cells: [
      fee.title,
      formatFeeCategory(fee.category),
      fee.term,
      fee.academicYear,
      formatPortalCurrency(fee.amount),
      fee.dueDate ? formatPortalDate(fee.dueDate) : "Not set",
    ],
  }));

  return (
    <>
      <DashboardHeader eyebrow="Administration" title="Fee item setup" description="Review fictional fee definitions and preview new fee setup without assigning charges to students." badge="Mock finance setup" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Fee items" value={String(mockFeeItems.length)} detail="Configured samples" icon={<WalletCards aria-hidden="true" className="size-5" />} />
        <MetricCard label="Categories" value={String(new Set(mockFeeItems.map((item) => item.category)).size)} detail="Across fee records" icon={<Layers3 aria-hidden="true" className="size-5" />} />
        <MetricCard label="Assigned value" value={formatPortalCurrency(mockFeeItems.reduce((total, item) => total + item.amount, 0))} detail="Combined sample value" icon={<BadgePlus aria-hidden="true" className="size-5" />} />
        <MetricCard label="Next due date" value={formatPortalDate("2026-09-18")} detail="Mock Term 1 deadline" icon={<CalendarClock aria-hidden="true" className="size-5" />} />
      </div>
      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
        <DashboardCard title="Fee item catalogue" description="Definitions are fictional and read-only.">
          <DataTable caption="Admin fee item records" columns={["Fee", "Category", "Term", "Year", "Amount", "Due"]} rows={rows} />
        </DashboardCard>
        <DashboardCard title="Create fee item" description="Preview category, amount, term, and due date." className="h-fit">
          <MockFeeItemForm />
        </DashboardCard>
      </div>
    </>
  );
}
