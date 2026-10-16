"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Send } from "lucide-react";

import {
  publishReportCards,
  withdrawReportCard,
} from "@/app/(portal)/portal/actions/report-cards";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { formatPortalDate } from "@/lib/portal/format";
import { cn } from "@/lib/utils";

export type PublishableReportCard = {
  readonly id: string;
  readonly studentName: string;
  readonly studentId: string;
  readonly className: string;
  readonly academicYear: string;
  readonly term: string;
  readonly overallPercentage: number;
  readonly status: "draft" | "published";
  readonly publishedAt?: string;
};

type ReportCardPublisherProps = {
  readonly cards: readonly PublishableReportCard[];
};

/**
 * End-of-term release: pick the drafts that are ready and publish them to the
 * families. Published cards stay listed so an earlier term can be checked or
 * pulled back for a correction.
 */
export function ReportCardPublisher({ cards }: ReportCardPublisherProps) {
  const [published, setPublished] = useState<ReadonlySet<string>>(
    () =>
      new Set(
        cards.filter((card) => card.status === "published").map((c) => c.id),
      ),
  );
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  const drafts = cards.filter((card) => !published.has(card.id));

  function toggleSelected(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  function selectAllDrafts() {
    setSelected(new Set(drafts.map((card) => card.id)));
  }

  function publishSelected() {
    if (selected.size === 0 || pending) {
      return;
    }

    const ids = [...selected];

    startTransition(async () => {
      const result = await publishReportCards(ids);
      setFailed(!result.ok);
      setMessage(result.message);

      // Only move the cards into the published column when the release
      // actually happened — showing them as released after a failed save would
      // tell the teacher families can see reports that they cannot.
      if (result.ok) {
        setPublished((prev) => new Set([...prev, ...ids]));
        setSelected(new Set());
      }
    });
  }

  function withdraw(id: string) {
    if (pending) {
      return;
    }

    startTransition(async () => {
      const result = await withdrawReportCard(id);
      setFailed(!result.ok);
      setMessage(result.message);

      if (result.ok) {
        setPublished((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    });
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm font-semibold text-muted-grey">
          {drafts.length} draft{drafts.length === 1 ? "" : "s"} ·{" "}
          {published.size} published
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={selectAllDrafts}
            disabled={drafts.length === 0}
            className="inline-flex min-h-10 items-center rounded-full border border-border px-4 text-sm font-bold text-charcoal transition-colors hover:bg-soft-white disabled:opacity-40"
          >
            Select all drafts
          </button>
          <button
            type="button"
            onClick={publishSelected}
            disabled={selected.size === 0 || pending}
            className="inline-flex min-h-10 items-center gap-2 rounded-full bg-curry-orange px-4 text-sm font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-40"
          >
            <Send aria-hidden="true" className="size-4" />
            {pending ? "Releasing…" : `Publish ${selected.size ? `(${selected.size})` : ""}`}
          </button>
        </div>
      </div>

      {message ? (
        <p
          role="status"
          className={cn(
            "mt-5 rounded-2xl border p-4 text-sm leading-6 font-semibold text-charcoal",
            failed
              ? "border-red-300 bg-red-50"
              : "border-curry-orange/25 bg-soft-cream",
          )}
        >
          {message}
        </p>
      ) : null}

      <ul className="mt-5 space-y-3">
        {cards.map((card) => {
          const isPublished = published.has(card.id);
          const isSelected = selected.has(card.id);

          return (
            <li
              key={card.id}
              className={cn(
                "flex flex-wrap items-center justify-between gap-4 rounded-2xl border p-4",
                isSelected
                  ? "border-curry-orange bg-soft-cream"
                  : "border-border bg-soft-white",
              )}
            >
              <div className="flex min-w-0 items-center gap-3">
                {isPublished ? (
                  <CheckCircle2
                    aria-hidden="true"
                    className="size-5 shrink-0 text-emerald-600"
                  />
                ) : (
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleSelected(card.id)}
                    aria-label={`Select ${card.studentName} ${card.term} report card`}
                    className="size-5 shrink-0 accent-[var(--color-curry-orange,#e07a1f)]"
                  />
                )}
                <div className="min-w-0">
                  <p className="font-bold text-charcoal">{card.studentName}</p>
                  <p className="mt-0.5 text-sm text-muted-grey">
                    {card.studentId} · {card.className} · {card.academicYear}{" "}
                    {card.term} · {card.overallPercentage}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {isPublished ? (
                  <>
                    <StatusBadge variant="success">
                      {card.publishedAt
                        ? `Published ${formatPortalDate(card.publishedAt)}`
                        : "Published"}
                    </StatusBadge>
                    <button
                      type="button"
                      onClick={() => withdraw(card.id)}
                      disabled={pending}
                      className="text-sm font-bold text-deep-orange transition-colors hover:text-curry-orange disabled:opacity-40"
                    >
                      Withdraw
                    </button>
                  </>
                ) : (
                  <StatusBadge variant="warning">Draft</StatusBadge>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {cards.length === 0 ? (
        <p className="mt-5 text-sm text-muted-grey">
          No report cards have been prepared for this term yet.
        </p>
      ) : null}
    </div>
  );
}
