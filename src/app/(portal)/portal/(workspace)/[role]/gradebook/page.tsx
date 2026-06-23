import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ChartNoAxesColumnIncreasing,
  FileCheck2,
  PencilLine,
  Users,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { MockGradeEntryForm } from "@/components/portal/MockGradeEntryForm";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { mockGradebookEntries } from "@/data/portal/academics";
import { percentageScore } from "@/lib/portal/format";
import { getMockStaffPortalContext } from "@/lib/portal/mock-staff";

export const metadata: Metadata = {
  title: "Gradebook",
};

export default async function StaffGradebookPage() {
  const context = await getMockStaffPortalContext();

  if (!context) {
    notFound();
  }

  const entries = mockGradebookEntries.filter((entry) =>
    context.staff.classIds.includes(entry.classId),
  );
  const average = Math.round(
    entries.reduce(
      (total, entry) => total + percentageScore(entry.score, entry.total),
      0,
    ) / entries.length,
  );
  const gradeRows: readonly DataTableRow[] = entries.map((entry) => {
    const student = context.students.find(
      (item) => item.id === entry.studentId,
    );

    return {
      id: entry.id,
      cells: [
        student?.fullName ?? "Student",
        entry.subject,
        entry.assessment,
        `${entry.score}/${entry.total}`,
        `${percentageScore(entry.score, entry.total)}%`,
        <StatusBadge
          key={entry.id}
          variant={entry.status === "published" ? "success" : "warning"}
        >
          {entry.status === "published" ? "Published" : "Draft"}
        </StatusBadge>,
      ],
    };
  });

  return (
    <>
      <DashboardHeader
        eyebrow="Assessment records"
        title="Gradebook"
        description="Review fictional marks and preview grade entry without changing student results or report cards. No gradebook record is saved."
        badge="Mock grade records"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Grade entries"
          value={String(entries.length)}
          detail="Sample Mathematics records"
          icon={<ChartNoAxesColumnIncreasing aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Class average"
          value={`${average}%`}
          detail="Class Test 3 sample"
          icon={<Users aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Published"
          value={String(
            entries.filter((entry) => entry.status === "published").length,
          )}
          detail="Visible mock results"
          icon={<FileCheck2 aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Draft"
          value={String(
            entries.filter((entry) => entry.status === "draft").length,
          )}
          detail="Awaiting review"
          icon={<PencilLine aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.2fr)_minmax(22rem,0.8fr)]">
        <DashboardCard
          title="Gradebook records"
          description="Published and draft states are illustrative."
        >
          <DataTable
            caption="Staff gradebook"
            columns={[
              "Student",
              "Subject",
              "Assessment",
              "Score",
              "Percentage",
              "Status",
            ]}
            rows={gradeRows}
          />
        </DashboardCard>

        <DashboardCard
          title="Enter grade"
          description="Preview a new result without saving it."
          className="h-fit"
        >
          <MockGradeEntryForm
            classes={context.classes}
            students={context.students}
          />
        </DashboardCard>
      </div>
    </>
  );
}
