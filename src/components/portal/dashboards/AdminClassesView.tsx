import { GraduationCap, School, UserRound, Users } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { MockClassForm } from "@/components/portal/MockClassForm";
import { mockClasses } from "@/data/portal/academics";
import { mockStudents } from "@/data/portal/students";

export function AdminClassesView() {
  const rows: readonly DataTableRow[] = mockClasses.map((classItem) => ({
    id: classItem.id,
    cells: [
      classItem.name,
      classItem.level,
      String(classItem.studentCount),
      classItem.classTeacher,
      String(
        mockStudents.filter((student) => student.classId === classItem.id)
          .length,
      ),
    ],
  }));

  return (
    <>
      <DashboardHeader eyebrow="Administration" title="Class management" description="Review fictional class structures and preview class setup without changing rosters or timetables." badge="Mock management" />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Classes" value={String(mockClasses.length)} detail="Sample class records" icon={<School aria-hidden="true" className="size-5" />} />
        <MetricCard label="Enrolment" value={String(mockClasses.reduce((total, item) => total + item.studentCount, 0))} detail="Fictional total" icon={<Users aria-hidden="true" className="size-5" />} />
        <MetricCard label="Class teachers" value={String(new Set(mockClasses.map((item) => item.classTeacher)).size)} detail="Assigned mock teachers" icon={<UserRound aria-hidden="true" className="size-5" />} />
        <MetricCard label="Levels" value={String(new Set(mockClasses.map((item) => item.level)).size)} detail="Primary and JHS" icon={<GraduationCap aria-hidden="true" className="size-5" />} />
      </div>
      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
        <DashboardCard title="Class records" description="Sample roster counts show only the mock subset.">
          <DataTable caption="Admin class records" columns={["Class", "Level", "Enrolled", "Class teacher", "Sample roster"]} rows={rows} />
        </DashboardCard>
        <DashboardCard title="Create class" description="Preview class and teacher setup." className="h-fit">
          <MockClassForm />
        </DashboardCard>
      </div>
    </>
  );
}
