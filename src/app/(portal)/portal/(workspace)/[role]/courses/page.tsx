import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  BookOpen,
  ClipboardCheck,
  FilePenLine,
  FolderOpen,
  GraduationCap,
  LayoutList,
} from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DataTable, type DataTableRow } from "@/components/portal/DataTable";
import { MetricCard } from "@/components/portal/MetricCard";
import { MockAssignmentForm } from "@/components/portal/MockAssignmentForm";
import { MockCourseMaterialForm } from "@/components/portal/MockCourseMaterialForm";
import { ProgressMeter } from "@/components/portal/ProgressMeter";
import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  mockAssignments,
  mockCourseModules,
  mockCourses,
  mockLearningResources,
} from "@/data/portal/academics";
import { formatPortalDate } from "@/lib/portal/format";
import { getMockStaffPortalContext } from "@/lib/portal/mock-staff";
import { getMockStudentPortalContext } from "@/lib/portal/mock-student";
import { isPortalRole } from "@/lib/portal/roles";
import { portalRoutes } from "@/lib/portal/routes";
import type {
  AssignmentSummary,
  CourseModuleItem,
  CourseSummary,
  LearningResource,
} from "@/types/portal";

export const metadata: Metadata = {
  title: "Courses",
};

type CoursesPageProps = {
  readonly params: Promise<{
    role: string;
  }>;
};

function moduleItemBadge(item: CourseModuleItem) {
  if (item.status === "completed") {
    return <StatusBadge variant="success">Complete</StatusBadge>;
  }

  if (item.status === "locked") {
    return <StatusBadge>Locked</StatusBadge>;
  }

  if (item.type === "assignment") {
    return <StatusBadge variant="warning">Due</StatusBadge>;
  }

  return <StatusBadge variant="info">Available</StatusBadge>;
}

function assignmentBadge(assignment: AssignmentSummary) {
  if (assignment.status === "submitted") {
    return <StatusBadge variant="success">Submitted</StatusBadge>;
  }

  if (assignment.status === "review") {
    return <StatusBadge variant="warning">Review</StatusBadge>;
  }

  if (assignment.status === "in_progress") {
    return <StatusBadge variant="info">Open</StatusBadge>;
  }

  return <StatusBadge>Not started</StatusBadge>;
}

function materialBadge(material: LearningResource) {
  return (
    <StatusBadge variant={material.status === "published" ? "success" : "warning"}>
      {material.status === "published" ? "Published" : "Draft"}
    </StatusBadge>
  );
}

function CourseCards({ courses }: { readonly courses: readonly CourseSummary[] }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      {courses.map((course) => (
        <article
          key={course.id}
          className="rounded-3xl border border-border bg-white p-6 shadow-card"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold tracking-[0.12em] text-curry-orange uppercase">
                {course.courseCode}
              </p>
              <h2 className="mt-2 text-xl font-extrabold text-charcoal">
                {course.title}
              </h2>
            </div>
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-soft-cream text-curry-orange">
              <BookOpen aria-hidden="true" className="size-5" />
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-muted-grey">
            {course.description}
          </p>
          <p className="mt-4 text-sm font-semibold text-charcoal">
            Teacher: {course.teacher}
          </p>
          <div className="mt-5">
            <ProgressMeter
              label="Course progress"
              value={course.progress}
              detail={course.term}
              tone={course.progress >= 65 ? "green" : "orange"}
            />
          </div>
          <a
            href={`#${course.id}`}
            className="mt-5 inline-flex min-h-10 items-center rounded-full border border-curry-orange px-4 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream"
          >
            View course home
          </a>
        </article>
      ))}
    </div>
  );
}

function CourseHomePreview({
  course,
  assignments,
  materials,
}: {
  readonly course: CourseSummary;
  readonly assignments: readonly AssignmentSummary[];
  readonly materials: readonly LearningResource[];
}) {
  const modules = mockCourseModules.filter(
    (module) => module.courseId === course.id,
  );
  const moduleRows: readonly DataTableRow[] = modules.flatMap((module) =>
    module.items.map((item) => ({
      id: item.id,
      cells: [
        module.title,
        item.title,
        item.type.charAt(0).toUpperCase() + item.type.slice(1),
        "dueDate" in item && item.dueDate
          ? formatPortalDate(item.dueDate)
          : "No due date",
        moduleItemBadge(item),
      ],
    })),
  );
  const assignmentRows: readonly DataTableRow[] = assignments.map((assignment) => ({
    id: assignment.id,
    cells: [
      assignment.title,
      assignment.dueDate ? formatPortalDate(assignment.dueDate) : "No due date",
      `${assignment.submittedCount ?? 0}/${assignment.totalStudents ?? 0}`,
      assignmentBadge(assignment),
    ],
  }));
  const materialRows: readonly DataTableRow[] = materials.map((material) => ({
    id: material.id,
    cells: [
      material.title,
      material.fileName,
      formatPortalDate(material.sharedAt),
      materialBadge(material),
    ],
  }));

  return (
    <DashboardCard
      title={course.title}
      description="Canvas-inspired course home with course navigation, module work, assignments, materials and progress in one place."
      className="scroll-mt-28"
    >
      <div id={course.id} className="grid gap-6 xl:grid-cols-[14rem_minmax(0,1fr)]">
        <nav
          aria-label={`${course.title} course navigation`}
          className="rounded-2xl border border-border bg-soft-white p-3"
        >
          {["Home", "Modules", "Assignments", "Grades", "People"].map(
            (item, index) => (
              <div
                key={item}
                className={
                  index === 0
                    ? "rounded-xl bg-curry-orange px-4 py-3 text-sm font-bold text-white"
                    : "px-4 py-3 text-sm font-semibold text-charcoal"
                }
              >
                {item}
              </div>
            ),
          )}
        </nav>

        <div className="min-w-0 space-y-6">
          <div className="rounded-2xl border border-border bg-white p-5">
            <p className="text-xs font-bold tracking-[0.12em] text-curry-orange uppercase">
              Course home
            </p>
            <h3 className="mt-2 text-2xl font-extrabold text-charcoal">
              {course.term} workspace
            </h3>
            <p className="mt-3 leading-7 text-muted-grey">
              {course.description}
            </p>
          </div>

          <DataTable
            caption={`${course.title} modules`}
            columns={["Module", "Item", "Type", "Due", "Status"]}
            rows={moduleRows}
            emptyMessage="No module items are available for this course."
          />

          <div className="grid gap-6 lg:grid-cols-2">
            <DashboardCard
              title="Assignments"
              description="Course-level work, shown inside the course area instead of on the dashboard."
              className="shadow-none"
            >
              <DataTable
                caption={`${course.title} assignments`}
                columns={["Assignment", "Due", "Submitted", "Status"]}
                rows={assignmentRows}
                emptyMessage="No assignments are listed for this course."
              />
            </DashboardCard>

            <DashboardCard
              title="Course materials"
              description="Shared files remain fictional and are not downloadable in this preview."
              className="shadow-none"
            >
              <DataTable
                caption={`${course.title} materials`}
                columns={["Material", "File", "Shared", "Status"]}
                rows={materialRows}
                emptyMessage="No materials are listed for this course."
              />
            </DashboardCard>
          </div>
        </div>
      </div>
    </DashboardCard>
  );
}

async function StudentCoursesView() {
  const context = await getMockStudentPortalContext();

  if (!context) {
    notFound();
  }

  const openTodo = context.assignments.filter(
    (assignment) => assignment.status !== "submitted",
  );
  const publishedModules = context.modules.filter(
    (module) => module.status === "published",
  );

  return (
    <>
      <DashboardHeader
        eyebrow={`${context.student.className} courses`}
        title="My courses"
        description="A Canvas-inspired course hub where students review modules, assignments, materials and grades without leaving the portal course area."
        badge="Mock LMS"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Courses"
          value={String(context.courses.length)}
          detail="Current mock term"
          icon={<BookOpen aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Published modules"
          value={String(publishedModules.length)}
          detail="Visible course units"
          icon={<LayoutList aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="To Do"
          value={String(openTodo.length)}
          detail="Open student tasks"
          icon={<ClipboardCheck aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Mode"
          value="Preview"
          detail="No submissions are saved"
          icon={<GraduationCap aria-hidden="true" className="size-5" />}
        />
      </div>

      <section className="mt-8">
        <CourseCards courses={context.courses} />
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(20rem,0.65fr)]">
        <div className="space-y-8">
          {context.courses.map((course) => (
            <CourseHomePreview
              key={course.id}
              course={course}
              assignments={context.assignments.filter(
                (assignment) => assignment.courseId === course.id,
              )}
              materials={context.resources.filter(
                (material) => material.courseId === course.id,
              )}
            />
          ))}
        </div>

        <div className="space-y-8">
          <DashboardCard
            title="Course To Do"
            description="Open work is now managed on the dedicated To Do page."
          >
            <div className="space-y-4">
              {openTodo.slice(0, 3).map((assignment) => {
                const course = context.courses.find(
                  (item) => item.id === assignment.courseId,
                );

                return (
                  <div
                    key={assignment.id}
                    className="rounded-2xl border border-border bg-soft-white p-4"
                  >
                    <p className="font-bold text-charcoal">
                      {assignment.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-grey">
                      {course?.title ?? assignment.subject} · Due{" "}
                      {formatPortalDate(assignment.dueDate)}
                    </p>
                  </div>
                );
              })}
            </div>
            <Link
              href={portalRoutes.studentTodo}
              className="mt-5 inline-flex min-h-10 items-center rounded-full border border-curry-orange px-4 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream"
            >
              Open To Do page
            </Link>
          </DashboardCard>

          <DashboardCard
            title="Preview boundary"
            description="Course pages use fictional modules, assignments and materials only."
          >
            <p className="text-sm leading-6 text-muted-grey">
              Student submissions, discussion posts, file downloads and grade
              updates are not connected to a backend in this phase.
            </p>
          </DashboardCard>
        </div>
      </div>
    </>
  );
}

async function StaffCoursesView() {
  const context = await getMockStaffPortalContext();

  if (!context) {
    notFound();
  }

  const courses = mockCourses.filter(
    (course) =>
      context.staff.classIds.includes(course.classId) &&
      (context.staff.subjectIds.includes(course.subjectId) ||
        course.teacher === context.staff.fullName),
  );
  const courseIds = courses.map((course) => course.id);
  const assignments = mockAssignments.filter(
    (assignment) =>
      assignment.courseId && courseIds.includes(assignment.courseId),
  );
  const materials = mockLearningResources.filter(
    (material) => material.courseId && courseIds.includes(material.courseId),
  );
  const modules = mockCourseModules.filter((module) =>
    courseIds.includes(module.courseId),
  );
  const classRows: readonly DataTableRow[] = context.classes.map((classItem) => ({
    id: classItem.id,
    cells: [
      classItem.name,
      classItem.level,
      String(classItem.studentCount),
      classItem.classTeacher,
    ],
  }));

  return (
    <>
      <DashboardHeader
        eyebrow={`${context.staff.title} · ${context.staff.staffId}`}
        title="Courses"
        description="A Canvas-inspired staff course workspace where teachers can review modules and preview course-level actions in one place."
        badge="Mock LMS"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Courses"
          value={String(courses.length)}
          detail="Assigned course shells"
          icon={<BookOpen aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Modules"
          value={String(modules.length)}
          detail="Published and draft units"
          icon={<LayoutList aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Assignments"
          value={String(assignments.length)}
          detail="Course work records"
          icon={<FilePenLine aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Materials"
          value={String(materials.length)}
          detail="Course file records"
          icon={<FolderOpen aria-hidden="true" className="size-5" />}
        />
      </div>

      <section className="mt-8">
        <CourseCards courses={courses} />
      </section>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
        <div className="space-y-8">
          {courses.map((course) => (
            <CourseHomePreview
              key={course.id}
              course={course}
              assignments={assignments.filter(
                (assignment) => assignment.courseId === course.id,
              )}
              materials={materials.filter(
                (material) => material.courseId === course.id,
              )}
            />
          ))}
        </div>

        <div className="space-y-8">
          <DashboardCard
            title="Create course assignment"
            description="Preview a teacher action inside the course workspace."
          >
            <MockAssignmentForm classes={context.classes} />
          </DashboardCard>

          <DashboardCard
            title="Add course material"
            description="Preview adding files to a course without uploading anything."
          >
            <MockCourseMaterialForm courses={courses} />
          </DashboardCard>

          <DashboardCard
            title="Assigned classes"
            description="Course shells are based on these mock class assignments."
          >
            <DataTable
              caption="Course workspace classes"
              columns={["Class", "Level", "Students", "Class teacher"]}
              rows={classRows}
            />
          </DashboardCard>
        </div>
      </div>
    </>
  );
}

export default async function CoursesPage({ params }: CoursesPageProps) {
  const { role } = await params;

  if (!isPortalRole(role)) {
    notFound();
  }

  if (role === "student") {
    return <StudentCoursesView />;
  }

  if (role === "staff") {
    return <StaffCoursesView />;
  }

  notFound();
}
