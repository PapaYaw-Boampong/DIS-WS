import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  ChartNoAxesColumnIncreasing,
  FileCheck2,
  Users,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { GradebookWorkspace } from "@/components/portal/gradebook/GradebookWorkspace";
import { MetricCard } from "@/components/portal/MetricCard";
import { listGradebook } from "@/lib/portal/data/academics";
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

  const targetClass = context.classes[0];
  const classId = targetClass?.id ?? "";
  const entries = (await listGradebook()).filter(
    (entry) => entry.classId === classId,
  );
  const students = context.students
    .filter((student) => student.classId === classId)
    .map((student) => ({ id: student.id, fullName: student.fullName }));
  const average = entries.length
    ? Math.round(
        entries.reduce(
          (total, entry) => total + percentageScore(entry.score, entry.total),
          0,
        ) / entries.length,
      )
    : 0;

  return (
    <>
      <DashboardHeader
        eyebrow="Assessment records"
        title="Gradebook"
        description="Edit marks in the Canvas-style grid or open SpeedGrader to grade one student at a time. Changes are a local preview and are not saved to student records."
        badge="Mock grade records"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-3">
        <MetricCard
          label="Students"
          value={String(students.length)}
          detail="On this gradebook"
          icon={<Users aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Class average"
          value={`${average}%`}
          detail="Across recorded marks"
          icon={
            <ChartNoAxesColumnIncreasing aria-hidden="true" className="size-5" />
          }
        />
        <MetricCard
          label="Published"
          value={String(
            entries.filter((entry) => entry.status === "published").length,
          )}
          detail="Visible mock results"
          icon={<FileCheck2 aria-hidden="true" className="size-5" />}
        />
      </div>

      <DashboardCard
        title="Class gradebook"
        description="Rows are students, columns are assessments. Add an assignment to create an empty column to fill in."
        className="mt-8"
      >
        <GradebookWorkspace
          students={students}
          entries={entries}
          classId={classId}
        />
      </DashboardCard>
    </>
  );
}
