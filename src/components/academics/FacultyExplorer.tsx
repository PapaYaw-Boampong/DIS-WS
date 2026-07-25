"use client";

import { useState } from "react";

import { ContentIcon } from "@/components/ui/ContentIcon";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { cn } from "@/lib/utils";
import type { AcademicLevelSlug, TeacherProfile } from "@/types/content";

type FacultyExplorerProps = {
  teams: readonly TeacherProfile[];
};

export function FacultyExplorer({ teams }: FacultyExplorerProps) {
  const [activeTeam, setActiveTeam] = useState<AcademicLevelSlug | undefined>(
    teams[0]?.team,
  );
  const current = teams.find((team) => team.team === activeTeam) ?? teams[0];

  if (!current) {
    return null;
  }

  return (
    <div className="mt-12">
      <div
        role="tablist"
        aria-label="Teaching teams"
        className="flex flex-wrap gap-2"
      >
        {teams.map((team) => {
          const isActive = team.team === current.team;

          return (
            <button
              key={team.team}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTeam(team.team)}
              className={cn(
                "inline-flex min-h-11 items-center gap-2 rounded-full border px-5 text-sm font-bold transition-colors",
                isActive
                  ? "border-curry-orange bg-curry-orange text-white"
                  : "border-border bg-white text-charcoal hover:border-curry-orange hover:text-curry-orange",
              )}
            >
              <ContentIcon name={team.icon} className="size-4" />
              {team.title}
            </button>
          );
        })}
      </div>

      <div className="mt-8 overflow-hidden rounded-card border border-border bg-white shadow-card">
        <ImagePlaceholder
          label={current.title}
          description={current.imageDescription}
          icon={current.icon}
          image={current.image}
          aspect="landscape"
          className="rounded-none border-0"
        />
        <div className="p-6 text-center sm:p-8">
          <p className="text-xs font-extrabold tracking-[0.14em] text-curry-orange uppercase">
            {current.role}
          </p>
          <h3 className="mt-2 text-2xl font-bold text-charcoal">
            {current.title}
          </h3>
          {current.quip ? (
            <p className="mx-auto mt-3 max-w-2xl text-lg leading-8 text-muted-grey italic">
              “{current.quip}”
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
