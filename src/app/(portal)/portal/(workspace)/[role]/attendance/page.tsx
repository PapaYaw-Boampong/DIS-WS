import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AttendanceMarker } from "@/components/portal/AttendanceMarker";
import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { listDailyAttendance } from "@/lib/portal/data/academics";
import { formatPortalDate } from "@/lib/portal/format";
import { getMockStaffPortalContext } from "@/lib/portal/mock-staff";

export const metadata: Metadata = {
  title: "Attendance",
};

export default async function StaffAttendancePage() {
  const context = await getMockStaffPortalContext();

  if (!context) {
    notFound();
  }

  const targetClass = context.classes[0];
  const classId = targetClass?.id ?? "";
  const registerDate = "2026-06-23";
  const students = context.students.filter(
    (student) => student.classId === classId,
  );
  const records = (await listDailyAttendance()).filter(
    (record) => record.classId === classId,
  );
  return (
    <>
      <DashboardHeader
        eyebrow={`${targetClass?.name ?? "Class"} · ${formatPortalDate(registerDate)}`}
        title="Attendance register"
        description="Mark a fictional daily class register and preview submission without saving attendance or notifying families."
        badge="Unsaved preview"
      />

      <DashboardCard
        title="Mark attendance"
        description="Changes stay in the browser and reset when the page reloads."
        className="mt-8"
      >
        <AttendanceMarker
          students={students}
          records={records}
          classId={classId}
          date={registerDate}
        />
      </DashboardCard>
    </>
  );
}
