import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { ReportCardBoard } from "@/components/portal/ReportCardBoard";
import { ReportCardGenerator } from "@/components/portal/ReportCardGenerator";
import {
  ReportCardPublisher,
  type PublishableReportCard,
} from "@/components/portal/ReportCardPublisher";
import { listClasses } from "@/lib/portal/data/people";
import {
  getMyReportCards,
  listReportCards,
  publishedReportCards,
  sortReportCards,
} from "@/lib/portal/data/reports";
import { listStudents } from "@/lib/portal/data/students";
import { getMockParentPortalContext } from "@/lib/portal/mock-parent";
import { getMockStaffPortalContext } from "@/lib/portal/mock-staff";
import { getMockStudentPortalContext } from "@/lib/portal/mock-student";
import { getAdminAreaSession } from "@/lib/portal/mock-role";
import { isPortalRole } from "@/lib/portal/roles";

export const metadata: Metadata = {
  title: "Report Cards",
};

type ResultsPageProps = {
  readonly params: Promise<{ role: string }>;
};

const currentAcademicYear = "2025/2026";
const terms = ["Term 1", "Term 2", "Term 3"] as const;

async function FamilyResults({ role }: { readonly role: "student" | "parent" }) {
  if (role === "student") {
    const context = await getMockStudentPortalContext();

    if (!context) {
      notFound();
    }

    const cards = sortReportCards(
      publishedReportCards(
        (await getMyReportCards()).filter(
          (card) => card.studentId === context.student.id,
        ),
      ),
    );

    return (
      <>
        <DashboardHeader
          eyebrow={`${context.student.className} · ${context.student.studentId}`}
          title="Report cards"
          description="Your end-of-term report cards. Earlier terms stay here, so you can open or print an old one at any time."
          badge="End of term"
        />

        <div className="mt-8">
          <ReportCardBoard students={[context.student]} reportCards={cards} />
        </div>
      </>
    );
  }

  const context = await getMockParentPortalContext();

  if (!context) {
    notFound();
  }

  const childIds = new Set(context.students.map((student) => student.id));
  const cards = sortReportCards(
    publishedReportCards(
      (await getMyReportCards()).filter((card) => childIds.has(card.studentId)),
    ),
  );

  return (
    <>
      <DashboardHeader
        eyebrow="Academic reports"
        title="Report cards"
        description="End-of-term report cards for each of your children, including every term already released."
        badge="End of term"
      />

      <div className="mt-8">
        <ReportCardBoard students={context.students} reportCards={cards} />
      </div>
    </>
  );
}

async function SchoolResults({ role }: { readonly role: "staff" | "admin" }) {
  const [allCards, students, allClasses] = await Promise.all([
    listReportCards(),
    listStudents(),
    listClasses(),
  ]);

  // A teacher only releases the classes they teach; school admin sees them all.
  let visible = allCards;
  let classOptions = allClasses;

  if (role === "staff") {
    const context = await getMockStaffPortalContext();

    if (!context) {
      notFound();
    }

    const classIds = new Set(context.staff.classIds);
    const studentsInScope = new Set(
      students
        .filter((student) => classIds.has(student.classId))
        .map((student) => student.id),
    );
    visible = allCards.filter((card) => studentsInScope.has(card.studentId));
    classOptions = allClasses.filter((item) => classIds.has(item.id));
  }

  const cards: readonly PublishableReportCard[] = sortReportCards(visible).map(
    (card) => {
      const student = students.find((item) => item.id === card.studentId);

      return {
        id: card.id,
        studentName: student?.fullName ?? card.studentId,
        studentId: student?.studentId ?? card.studentId,
        className: card.className,
        academicYear: card.academicYear,
        term: card.term,
        overallPercentage: card.overallPercentage,
        status: card.status,
        publishedAt: card.publishedAt,
      };
    },
  );

  return (
    <>
      <DashboardHeader
        eyebrow="End of term"
        title="Report cards"
        description="Release end-of-term report cards to families, and check what has already been published."
        badge="Publishing"
      />

      <DashboardCard
        title="Prepare report cards"
        description="Builds a draft for every learner in the class from that term's gradebook: class score, examination score, grade, position and attendance. Report cards already published are left untouched."
        className="mt-8"
      >
        <ReportCardGenerator
          classes={classOptions}
          academicYear={currentAcademicYear}
          terms={terms}
        />
      </DashboardCard>

      <DashboardCard
        title="Release report cards"
        description="Select the drafts that have been checked, then publish. Families see a report card only after it is published."
        className="mt-8"
      >
        <ReportCardPublisher cards={cards} />
      </DashboardCard>
    </>
  );
}

export default async function ResultsPage({ params }: ResultsPageProps) {
  const { role } = await params;

  if (!isPortalRole(role)) {
    notFound();
  }

  if (role === "student" || role === "parent") {
    return <FamilyResults role={role} />;
  }

  if (role === "staff") {
    return <SchoolResults role="staff" />;
  }

  if (role === "admin") {
    if (!(await getAdminAreaSession())) {
      notFound();
    }

    return <SchoolResults role="admin" />;
  }

  notFound();
}
