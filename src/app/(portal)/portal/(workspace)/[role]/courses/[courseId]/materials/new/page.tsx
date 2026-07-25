import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CourseMaterialForm } from "@/components/portal/CourseMaterialForm";
import { DashboardCard } from "@/components/portal/DashboardCard";
import { resolveCourseAccess } from "@/lib/portal/course";

export const metadata: Metadata = {
  title: "Add Course Material",
};

type NewMaterialPageProps = {
  readonly params: Promise<{
    role: string;
    courseId: string;
  }>;
};

export default async function NewCourseMaterialPage({
  params,
}: NewMaterialPageProps) {
  const { role, courseId } = await params;
  const access = await resolveCourseAccess(role, courseId);

  if (!access || access.role !== "staff") {
    notFound();
  }

  return (
    <div className="max-w-2xl">
      <DashboardCard
        title="Add course material"
        description="Attach a study file to this course. Students in the class can view and download it."
      >
        <CourseMaterialForm
          classId={access.course.classId}
          courseId={access.course.id}
          subject={access.course.subject}
        />
      </DashboardCard>
    </div>
  );
}
