"use client";

import { useMemo, useState } from "react";
import { BookOpenText } from "lucide-react";

import { DocumentViewer } from "@/components/documents/DocumentViewer";
import { Container } from "@/components/ui/Container";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { documentCategories, schoolDocuments } from "@/data/documents";
import { cn } from "@/lib/utils";
import type { DocumentCategory, SchoolDocument } from "@/types/content";

type Filter = "all" | DocumentCategory;

export function DocumentLibrary() {
  const [filter, setFilter] = useState<Filter>("all");
  const [activeDoc, setActiveDoc] = useState<SchoolDocument | null>(null);

  const visibleDocuments = useMemo(
    () =>
      filter === "all"
        ? schoolDocuments
        : schoolDocuments.filter((doc) => doc.category === filter),
    [filter],
  );

  const availableCategories = documentCategories.filter((category) =>
    schoolDocuments.some((doc) => doc.category === category.id),
  );

  return (
    <section className="bg-white py-20 sm:py-24 lg:py-28">
      <Container>
        <SectionHeader
          eyebrow="Document Library"
          title="Read our documents online"
          description="Open any available document to read it page by page — no download needed."
        />

        <div
          className="mt-8 flex gap-2 overflow-x-auto pb-2 sm:flex-wrap"
          role="group"
          aria-label="Filter documents by type"
        >
          <FilterChip
            active={filter === "all"}
            label="All"
            onClick={() => setFilter("all")}
          />
          {availableCategories.map((category) => (
            <FilterChip
              key={category.id}
              active={filter === category.id}
              label={category.title}
              onClick={() => setFilter(category.id)}
            />
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleDocuments.map((doc) => {
            const hasPages = doc.pages.length > 0;

            return (
              <article
                key={doc.slug}
                className="flex h-full flex-col rounded-card border border-border bg-white p-6 shadow-card sm:p-7"
              >
                <div className="flex size-12 items-center justify-center rounded-[0.875rem] bg-soft-cream text-curry-orange">
                  <ContentIcon name={doc.icon} className="size-6" />
                </div>
                <h3 className="mt-5 text-xl font-bold text-charcoal">
                  {doc.title}
                </h3>
                <p className="mt-3 flex-1 leading-7 text-muted-grey">
                  {doc.description}
                </p>
                {doc.updatedAt ? (
                  <p className="mt-4 text-xs font-semibold tracking-wide text-muted-grey uppercase">
                    {doc.updatedAt}
                  </p>
                ) : null}

                {hasPages ? (
                  <button
                    type="button"
                    className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 text-sm font-semibold text-white transition-colors hover:bg-deep-orange"
                    onClick={() => setActiveDoc(doc)}
                  >
                    <BookOpenText aria-hidden="true" className="size-4" />
                    Read document
                    <span className="opacity-80">
                      · {doc.pages.length}{" "}
                      {doc.pages.length === 1 ? "page" : "pages"}
                    </span>
                  </button>
                ) : (
                  <div className="mt-6">
                    <span className="inline-flex rounded-full bg-soft-cream px-3 py-1 text-xs font-bold tracking-wide text-deep-orange uppercase">
                      Coming soon
                    </span>
                    {doc.pickupNote ? (
                      <p className="mt-3 text-sm leading-6 text-muted-grey">
                        {doc.pickupNote}
                      </p>
                    ) : null}
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </Container>

      {activeDoc ? (
        <DocumentViewer
          document={activeDoc}
          onClose={() => setActiveDoc(null)}
        />
      ) : null}
    </section>
  );
}

function FilterChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "min-h-11 shrink-0 rounded-full border px-5 text-sm font-bold transition-colors",
        active
          ? "border-curry-orange bg-curry-orange text-white"
          : "border-border bg-white text-charcoal hover:border-curry-orange hover:text-curry-orange",
      )}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  );
}
