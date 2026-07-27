import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { GradebookWorkspace } from "@/components/portal/gradebook/GradebookWorkspace";
import { listGradebook } from "@/lib/portal/data/academics";
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
  return (
    <>
      <DashboardHeader
        eyebrow="Assessment records"
        title="Gradebook"
        description="Edit marks in the Canvas-style grid or open SpeedGrader to grade one student at a time. Changes are a local preview and are not saved to student records."
        badge="Mock grade records"
      />

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
