"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LayoutGrid, UserRoundPen } from "lucide-react";

import { saveGradebook } from "@/app/(portal)/portal/actions/academics";
import { GradebookGrid } from "@/components/portal/gradebook/GradebookGrid";
import { SpeedGrader } from "@/components/portal/gradebook/SpeedGrader";
import {
  cellKey,
  type GradebookStudent,
  type GradeColumn,
} from "@/components/portal/gradebook/types";
import type { GradebookEntry } from "@/types/portal";

type GradebookWorkspaceProps = {
  readonly students: readonly GradebookStudent[];
  readonly entries: readonly GradebookEntry[];
  readonly classId: string;
};

type View = "grid" | "speedgrader";

function initialColumns(
  entries: readonly GradebookEntry[],
): GradeColumn[] {
  const columns: GradeColumn[] = [];
  const seen = new Set<string>();

  for (const entry of entries) {
    const id = `${entry.subject}::${entry.assessment}`;

    if (seen.has(id)) {
      continue;
    }

    seen.add(id);
    columns.push({
      id,
      title: entry.assessment,
      subject: entry.subject,
      total: entry.total,
    });
  }

  return columns;
}

function initialScores(
  entries: readonly GradebookEntry[],
): Record<string, string> {
  const scores: Record<string, string> = {};

  for (const entry of entries) {
    const columnId = `${entry.subject}::${entry.assessment}`;
    scores[cellKey(entry.studentId, columnId)] = String(entry.score);
  }

  return scores;
}

export function GradebookWorkspace({
  students,
  entries,
  classId,
}: GradebookWorkspaceProps) {
  const [view, setView] = useState<View>("grid");
  const [pending, startTransition] = useTransition();
  const router = useRouter();
  const [columns, setColumns] = useState<GradeColumn[]>(() =>
    initialColumns(entries),
  );
  const [scores, setScores] = useState<Record<string, string>>(() =>
    initialScores(entries),
  );
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [activeColumnId, setActiveColumnId] = useState<string>(
    () => initialColumns(entries)[0]?.id ?? "",
  );
  const [message, setMessage] = useState<string | null>(null);

  function handleScoreChange(
    studentId: string,
    columnId: string,
    value: string,
  ) {
    setScores((prev) => ({ ...prev, [cellKey(studentId, columnId)]: value }));
    setMessage(null);
  }

  function handleAddColumn(title: string, total: number) {
    const id = `new::${title}::${Date.now()}`;
    setColumns((prev) => [
      ...prev,
      { id, title, subject: "New assignment", total, isNew: true },
    ]);
    setActiveColumnId(id);
    setMessage(null);
  }

  function handleOpenSpeedGrader(columnId: string) {
    setActiveColumnId(columnId);
    setView("speedgrader");
  }

  function handleSave() {
    const payload = columns.flatMap((column) =>
      students.flatMap((student) => {
        const raw = scores[cellKey(student.id, column.id)];
        if (raw === undefined || raw.trim() === "") {
          return [];
        }
        const score = Number(raw);
        if (Number.isNaN(score)) {
          return [];
        }
        return [
          {
            studentId: student.id,
            subject: column.subject,
            assessment: column.title,
            score,
            total: column.total,
            status: "draft",
          },
        ];
      }),
    );

    if (payload.length === 0) {
      setMessage("Enter at least one score before saving.");
      return;
    }

    startTransition(async () => {
      const result = await saveGradebook(classId, payload);

      if (!result.ok) {
        setMessage("Could not save grades. Please try again.");
        return;
      }

      if (result.mode === "real") {
        setMessage(`Saved ${result.saved ?? payload.length} grade entries.`);
        router.refresh();
      } else {
        setMessage(
          `Prepared ${payload.length} grade entries. Nothing was saved to student records (preview).`,
        );
      }
    });
  }

  const tabClass = (active: boolean) =>
    active
      ? "inline-flex min-h-10 items-center gap-2 rounded-full bg-curry-orange px-4 text-sm font-bold text-white"
      : "inline-flex min-h-10 items-center gap-2 rounded-full border border-border px-4 text-sm font-bold text-charcoal transition-colors hover:bg-soft-white";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setView("grid")}
            className={tabClass(view === "grid")}
          >
            <LayoutGrid aria-hidden="true" className="size-4" />
            Gradebook
          </button>
          <button
            type="button"
            onClick={() => setView("speedgrader")}
            className={tabClass(view === "speedgrader")}
          >
            <UserRoundPen aria-hidden="true" className="size-4" />
            SpeedGrader
          </button>
        </div>

        {view === "grid" ? (
          <button
            type="button"
            onClick={handleSave}
            disabled={pending}
            className="inline-flex min-h-10 items-center rounded-full border border-curry-orange px-4 text-sm font-bold text-deep-orange transition-colors hover:bg-soft-cream disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
        ) : null}
      </div>

      {message ? (
        <p
          role="status"
          className="rounded-2xl border border-curry-orange/25 bg-soft-cream p-4 text-sm font-semibold text-charcoal"
        >
          {message}
        </p>
      ) : null}

      {view === "grid" ? (
        <GradebookGrid
          students={students}
          columns={columns}
          scores={scores}
          onScoreChange={handleScoreChange}
          onAddColumn={handleAddColumn}
          onOpenSpeedGrader={handleOpenSpeedGrader}
        />
      ) : (
        <SpeedGrader
          students={students}
          columns={columns}
          activeColumnId={activeColumnId}
          onSelectColumn={setActiveColumnId}
          scores={scores}
          onScoreChange={handleScoreChange}
          feedback={feedback}
          onFeedbackChange={(key, value) =>
            setFeedback((prev) => ({ ...prev, [key]: value }))
          }
        />
      )}
    </div>
  );
}
