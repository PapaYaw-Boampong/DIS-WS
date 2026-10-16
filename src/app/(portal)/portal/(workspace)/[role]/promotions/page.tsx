import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GraduationCap, MoveUp, School, Users } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { MetricCard } from "@/components/portal/MetricCard";
import { PromotionWorkspace } from "@/components/portal/forms/PromotionWorkspace";
import { listClasses } from "@/lib/portal/data/people";
import { listStudents } from "@/lib/portal/data/students";
import { getCapableSession } from "@/lib/portal/permissions";
import { isPortalRole } from "@/lib/portal/roles";

export const metadata: Metadata = { title: "Promotions" };

type PromotionsPageProps = {
  readonly params: Promise<{ role: string }>;
};

// Offered on the promotion screen; the school picks the year the move belongs to.
const academicYears = ["2026/2027", "2025/2026"] as const;

export default async function PromotionsPage({ params }: PromotionsPageProps) {
  const { role } = await params;

  if (!isPortalRole(role) || !(await getCapableSession("students.promote"))) {
    notFound();
  }

  const [classes, students] = await Promise.all([
    listClasses(),
    listStudents(),
  ]);
  const active = students.filter((student) => student.status === "active");
  const leaving = classes.at(-1);

  return (
    <>
      <DashboardHeader
        eyebrow="End of year"
        title="Class promotions"
        description="Move a whole class up a grade in one pass, while marking the learners who repeat, graduate or leave the school."
        badge="Bulk progression"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Learners on roll"
          value={String(students.length)}
          detail={`${active.length} active`}
          icon={<Users aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Classes"
          value={String(classes.length)}
          detail="In the progression order"
          icon={<School aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Exit class"
          value={leaving?.name ?? "—"}
          detail="Graduates from here"
          icon={<GraduationCap aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Next year"
          value={academicYears[0]}
          detail="Default progression year"
          icon={<MoveUp aria-hidden="true" className="size-5" />}
        />
      </div>

      <DashboardCard
        title="Progress a class"
        description="Pick the class to move, check the learners, and set anyone whose outcome differs before applying."
        className="mt-8"
      >
        <PromotionWorkspace
          classes={classes.map((item) => ({
            id: item.id,
            name: item.name,
            level: item.level,
          }))}
          students={students.map((student) => ({
            id: student.id,
            fullName: student.fullName,
            studentId: student.studentId,
            classId: student.classId,
            status: student.status,
          }))}
          academicYears={academicYears}
        />
      </DashboardCard>
    </>
  );
}
