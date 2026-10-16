"use client";

import { useState } from "react";
import { CalendarCheck, GraduationCap, Printer, Trophy } from "lucide-react";

import { StatusBadge } from "@/components/portal/StatusBadge";
import { formatPortalDate } from "@/lib/portal/format";
import { cn } from "@/lib/utils";
import type { ReportCard, StudentProfile } from "@/types/portal";

type ReportCardBoardProps = {
  readonly students: readonly StudentProfile[];
  readonly reportCards: readonly ReportCard[];
};

function gradeVariant(grade: string) {
  if (grade.startsWith("A")) return "success" as const;
  if (grade.startsWith("B")) return "info" as const;
  if (grade.startsWith("C")) return "warning" as const;
  return "danger" as const;
}

function ordinal(value: number) {
  const remainderTen = value % 10;
  const remainderHundred = value % 100;

  if (remainderTen === 1 && remainderHundred !== 11) return `${value}st`;
  if (remainderTen === 2 && remainderHundred !== 12) return `${value}nd`;
  if (remainderTen === 3 && remainderHundred !== 13) return `${value}rd`;
  return `${value}th`;
}

function ReportCardSheet({
  card,
  student,
}: {
  readonly card: ReportCard;
  readonly student?: StudentProfile;
}) {
  return (
    <article className="rounded-3xl border border-border bg-white p-6 shadow-card sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
        <div>
          <p className="text-xs font-bold tracking-[0.14em] text-curry-orange uppercase">
            {card.academicYear} · {card.term}
          </p>
          <h3 className="mt-2 text-2xl font-extrabold tracking-[-0.02em] text-charcoal">
            {student?.fullName ?? "Report card"}
          </h3>
          <p className="mt-1 text-sm text-muted-grey">
            {card.className}
            {student ? ` · ${student.studentId}` : ""} · Class teacher{" "}
            {card.classTeacher}
          </p>
        </div>
        <div className="text-right">
          {card.publishedAt ? (
            <p className="text-xs font-semibold text-muted-grey">
              Published {formatPortalDate(card.publishedAt)}
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => window.print()}
            className="mt-2 inline-flex min-h-10 items-center gap-2 rounded-full border border-curry-orange px-4 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream"
          >
            <Printer aria-hidden="true" className="size-4" />
            Print or save
          </button>
        </div>
      </header>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-soft-white p-4">
          <GraduationCap
            aria-hidden="true"
            className="size-5 text-curry-orange"
          />
          <p className="mt-3 text-2xl font-extrabold text-charcoal tabular-nums">
            {card.overallPercentage}%
          </p>
          <p className="mt-1 text-sm text-muted-grey">
            Overall · {card.overallTotal} marks
          </p>
        </div>
        <div className="rounded-2xl bg-soft-white p-4">
          <Trophy aria-hidden="true" className="size-5 text-curry-orange" />
          <p className="mt-3 text-2xl font-extrabold text-charcoal">
            {card.positionInClass ? ordinal(card.positionInClass) : "—"}
          </p>
          <p className="mt-1 text-sm text-muted-grey">
            {card.classSize ? `Of ${card.classSize} learners` : "Class position"}
          </p>
        </div>
        <div className="rounded-2xl bg-soft-white p-4">
          <CalendarCheck
            aria-hidden="true"
            className="size-5 text-curry-orange"
          />
          <p className="mt-3 text-2xl font-extrabold text-charcoal tabular-nums">
            {card.attendancePresent}/{card.attendanceTotal}
          </p>
          <p className="mt-1 text-sm text-muted-grey">Days present</p>
        </div>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[40rem] border-collapse text-left">
          <caption className="sr-only">
            {card.term} subject results for {student?.fullName ?? "the learner"}
          </caption>
          <thead>
            <tr className="border-b border-border">
              <th className="py-3 text-sm font-bold text-charcoal">Subject</th>
              <th className="py-3 text-sm font-bold text-charcoal">Class (50)</th>
              <th className="py-3 text-sm font-bold text-charcoal">Exam (50)</th>
              <th className="py-3 text-sm font-bold text-charcoal">Total</th>
              <th className="py-3 text-sm font-bold text-charcoal">Grade</th>
              <th className="py-3 text-sm font-bold text-charcoal">Position</th>
              <th className="py-3 text-sm font-bold text-charcoal">Remark</th>
            </tr>
          </thead>
          <tbody>
            {card.subjects.map((subject) => (
              <tr key={subject.subject} className="border-b border-border/70">
                <td className="py-3 text-sm font-bold text-charcoal">
                  {subject.subject}
                </td>
                <td className="py-3 text-sm text-muted-grey tabular-nums">
                  {subject.classScore}
                </td>
                <td className="py-3 text-sm text-muted-grey tabular-nums">
                  {subject.examScore}
                </td>
                <td className="py-3 text-sm font-bold text-charcoal tabular-nums">
                  {subject.total}
                </td>
                <td className="py-3">
                  <StatusBadge variant={gradeVariant(subject.grade)}>
                    {subject.grade}
                  </StatusBadge>
                </td>
                <td className="py-3 text-sm text-muted-grey tabular-nums">
                  {subject.position ? ordinal(subject.position) : "—"}
                </td>
                <td className="py-3 text-sm text-muted-grey">
                  {subject.remark}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-soft-white p-5">
          <p className="text-xs font-bold tracking-[0.12em] text-muted-grey uppercase">
            Class teacher&apos;s remark
          </p>
          <p className="mt-2 text-sm leading-6 text-charcoal">
            {card.classTeacherRemark}
          </p>
          <p className="mt-3 text-sm font-bold text-charcoal">
            {card.classTeacher}
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-soft-white p-5">
          <p className="text-xs font-bold tracking-[0.12em] text-muted-grey uppercase">
            Head teacher&apos;s remark
          </p>
          <p className="mt-2 text-sm leading-6 text-charcoal">
            {card.headTeacherRemark}
          </p>
          {card.nextTermBegins ? (
            <p className="mt-3 text-sm font-bold text-charcoal">
              Next term begins {formatPortalDate(card.nextTermBegins)}
            </p>
          ) : null}
        </div>
      </div>
    </article>
  );
}

/**
 * Report cards for one learner or for several children, newest term first.
 * A term row acts as the archive: selecting an earlier term opens that sheet.
 */
export function ReportCardBoard({
  students,
  reportCards,
}: ReportCardBoardProps) {
  const [studentId, setStudentId] = useState(students[0]?.id ?? "");
  const active = students.find((student) => student.id === studentId);
  const cards = reportCards.filter((card) => card.studentId === studentId);
  const [cardId, setCardId] = useState(cards[0]?.id ?? "");
  const card = cards.find((item) => item.id === cardId) ?? cards[0];

  function selectStudent(id: string) {
    setStudentId(id);
    const first = reportCards.find((item) => item.studentId === id);
    setCardId(first?.id ?? "");
  }

  return (
    <div className="space-y-6">
      {students.length > 1 ? (
        <div
          role="tablist"
          aria-label="Children"
          className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-soft-white p-2"
        >
          {students.map((student) => {
            const selected = student.id === studentId;

            return (
              <button
                key={student.id}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => selectStudent(student.id)}
                className={cn(
                  "shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors",
                  selected
                    ? "bg-curry-orange text-white"
                    : "text-charcoal hover:bg-white",
                )}
              >
                {student.fullName}
              </button>
            );
          })}
        </div>
      ) : null}

      {cards.length ? (
        <>
          <div
            role="tablist"
            aria-label="Report card terms"
            className="flex gap-1 overflow-x-auto rounded-2xl border border-border bg-soft-white p-2"
          >
            {cards.map((item) => {
              const selected = item.id === card?.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  onClick={() => setCardId(item.id)}
                  className={cn(
                    "shrink-0 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors",
                    selected
                      ? "bg-curry-orange text-white"
                      : "text-charcoal hover:bg-white",
                  )}
                >
                  {item.term}
                  <span className="ml-2 text-xs font-semibold opacity-70">
                    {item.academicYear}
                  </span>
                </button>
              );
            })}
          </div>

          {card ? <ReportCardSheet card={card} student={active} /> : null}
        </>
      ) : (
        <div className="rounded-3xl border border-border bg-white p-8 text-center shadow-card">
          <GraduationCap
            aria-hidden="true"
            className="mx-auto size-8 text-curry-orange"
          />
          <p className="mt-4 font-bold text-charcoal">
            No report card has been published yet
          </p>
          <p className="mt-1 text-sm text-muted-grey">
            End-of-term report cards appear here as soon as the school releases
            them.
          </p>
        </div>
      )}
    </div>
  );
}
