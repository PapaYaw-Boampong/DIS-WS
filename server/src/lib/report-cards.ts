import type { GradebookEntry } from "@prisma/client";

import { prisma } from "../db";

// Building an end-of-term report card from the term's gradebook.
//
// Ghanaian basic-school reporting splits each subject into continuous
// assessment (class score, out of 50) and the end-of-term examination (out of
// 50), totalling 100. The gradebook stores individual assessments with their
// own totals, so each group is summed and rescaled to its half of the 100.

export type ReportCardSubject = {
  subject: string;
  classScore: number;
  examScore: number;
  total: number;
  grade: string;
  position?: number;
  remark: string;
};

// An assessment counts as the examination when its name says so; everything
// else is continuous assessment. Teachers name the column, so this is matched
// loosely rather than against a fixed list.
function isExamAssessment(assessment: string): boolean {
  return /\b(exam|examination|end[- ]of[- ]term)\b/i.test(assessment);
}

export function gradeFor(total: number): string {
  if (total >= 80) return "A";
  if (total >= 70) return "B";
  if (total >= 60) return "C";
  if (total >= 50) return "D";
  if (total >= 40) return "E";
  return "F";
}

export function remarkFor(total: number): string {
  if (total >= 80) return "Excellent";
  if (total >= 70) return "Very good";
  if (total >= 60) return "Good";
  if (total >= 50) return "Credit";
  if (total >= 40) return "Pass";
  return "Needs improvement";
}

// Sum a group of assessments and rescale to `outOf`. An empty group scores 0
// rather than dividing by zero.
function rescale(entries: readonly GradebookEntry[], outOf: number): number {
  const scored = entries.reduce((sum, entry) => sum + entry.score, 0);
  const possible = entries.reduce((sum, entry) => sum + entry.total, 0);
  if (possible <= 0) return 0;
  return Math.round((scored / possible) * outOf);
}

export function buildSubjects(
  entries: readonly GradebookEntry[],
): ReportCardSubject[] {
  const bySubject = new Map<string, GradebookEntry[]>();

  for (const entry of entries) {
    const list = bySubject.get(entry.subject) ?? [];
    list.push(entry);
    bySubject.set(entry.subject, list);
  }

  return [...bySubject.entries()]
    .map(([subject, subjectEntries]) => {
      const exams = subjectEntries.filter((entry) =>
        isExamAssessment(entry.assessment),
      );
      const continuous = subjectEntries.filter(
        (entry) => !isExamAssessment(entry.assessment),
      );

      // A subject with only one kind of assessment recorded is scaled across
      // the full 100 rather than being reported as half-marked.
      let classScore: number;
      let examScore: number;

      if (exams.length === 0) {
        classScore = rescale(continuous, 100);
        examScore = 0;
      } else if (continuous.length === 0) {
        classScore = 0;
        examScore = rescale(exams, 100);
      } else {
        classScore = rescale(continuous, 50);
        examScore = rescale(exams, 50);
      }

      const total = classScore + examScore;

      return {
        subject,
        classScore,
        examScore,
        total,
        grade: gradeFor(total),
        remark: remarkFor(total),
      };
    })
    .sort((first, second) => first.subject.localeCompare(second.subject));
}

export type DraftReportCard = {
  studentId: string;
  classId: string;
  className: string;
  academicYear: string;
  term: string;
  overallTotal: number;
  overallPercentage: number;
  positionInClass: number;
  classSize: number;
  attendancePresent: number;
  attendanceTotal: number;
  subjects: ReportCardSubject[];
  classTeacher: string;
};

/**
 * Build a draft report card for every learner in a class from that class's
 * gradebook. Nothing is written here — the caller decides whether to upsert
 * drafts, and published cards are never overwritten.
 */
export async function buildClassReportCards(
  classId: string,
  academicYear: string,
  term: string,
): Promise<DraftReportCard[]> {
  const [schoolClass, students, gradebook, attendance] = await Promise.all([
    prisma.schoolClass.findUnique({ where: { id: classId } }),
    prisma.student.findMany({
      where: { classId, status: "active" },
      orderBy: { fullName: "asc" },
    }),
    prisma.gradebookEntry.findMany({ where: { classId } }),
    prisma.dailyAttendanceRecord.findMany({ where: { classId } }),
  ]);

  if (!schoolClass || students.length === 0) return [];

  const gradesByStudent = new Map<string, GradebookEntry[]>();
  for (const entry of gradebook) {
    const list = gradesByStudent.get(entry.studentId) ?? [];
    list.push(entry);
    gradesByStudent.set(entry.studentId, list);
  }

  const drafts = students.map((student) => {
    const subjects = buildSubjects(gradesByStudent.get(student.id) ?? []);
    const overallTotal = subjects.reduce(
      (sum, subject) => sum + subject.total,
      0,
    );
    const overallPercentage = subjects.length
      ? Math.round(overallTotal / subjects.length)
      : 0;

    const studentAttendance = attendance.filter(
      (record) => record.studentId === student.id,
    );
    const present = studentAttendance.filter(
      (record) => record.mark === "present" || record.mark === "late",
    ).length;

    return {
      studentId: student.id,
      classId: schoolClass.id,
      className: schoolClass.name,
      academicYear,
      term,
      overallTotal,
      overallPercentage,
      positionInClass: 0,
      classSize: students.length,
      attendancePresent: present,
      attendanceTotal: studentAttendance.length,
      subjects,
      classTeacher: schoolClass.classTeacher,
    };
  });

  // Position in class: highest total is 1st. Equal totals share a position and
  // the next position skips accordingly (standard competition ranking), so two
  // learners tied on 2nd are followed by a 4th, not a 3rd.
  const ranked = [...drafts].sort(
    (first, second) => second.overallTotal - first.overallTotal,
  );
  ranked.forEach((draft, index) => {
    const tie = ranked.findIndex(
      (other) => other.overallTotal === draft.overallTotal,
    );
    draft.positionInClass = (tie === -1 ? index : tie) + 1;
  });

  // Per-subject position within the class, on the same ranking rule.
  const subjectNames = new Set(
    drafts.flatMap((draft) => draft.subjects.map((subject) => subject.subject)),
  );
  for (const name of subjectNames) {
    const scores = drafts
      .map((draft) => ({
        draft,
        subject: draft.subjects.find((item) => item.subject === name),
      }))
      .filter(
        (row): row is { draft: DraftReportCard; subject: ReportCardSubject } =>
          Boolean(row.subject),
      )
      .sort((first, second) => second.subject.total - first.subject.total);

    scores.forEach((row, index) => {
      const tie = scores.findIndex(
        (other) => other.subject.total === row.subject.total,
      );
      row.subject.position = (tie === -1 ? index : tie) + 1;
    });
  }

  return drafts;
}
