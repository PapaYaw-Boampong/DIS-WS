"use client";

import {
  type CSSProperties,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { X } from "lucide-react";

import { CardCarousel } from "@/components/ui/CardCarousel";
import { ContentIcon } from "@/components/ui/ContentIcon";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { ResponsiveImage } from "@/components/ui/ResponsiveImage";
import { cn } from "@/lib/utils";
import type {
  AcademicLevelSlug,
  FacultyMember,
  TeacherProfile,
} from "@/types/content";

type FacultyExplorerProps = {
  teams: readonly TeacherProfile[];
  faculty: readonly FacultyMember[];
};

type ExplorerPhase = "idle" | "opening" | "open" | "closing";

type TeamCardProps = {
  team: TeacherProfile;
  interactive?: boolean;
  expanded?: boolean;
  controls?: string;
  tabIndex?: number;
  compact?: boolean;
  onSelect?: (button: HTMLButtonElement) => void;
};

function TeamCard({
  team,
  interactive = true,
  expanded = false,
  controls,
  tabIndex,
  compact = false,
  onSelect,
}: TeamCardProps) {
  if (compact) {
    return (
      <article className="flex h-full flex-col items-center justify-center rounded-card border border-border bg-white p-6 text-center shadow-card">
        <div
          role="img"
          aria-label={team.imageDescription}
          className="flex size-20 items-center justify-center rounded-2xl bg-soft-cream text-curry-orange"
        >
          <ContentIcon name={team.icon} className="size-9" />
        </div>
        <p className="mt-5 text-xs font-extrabold tracking-[0.12em] text-curry-orange uppercase">
          {team.role}
        </p>
        <h2 className="mt-2 text-xl font-bold text-charcoal">{team.title}</h2>
      </article>
    );
  }

  const content = (
    <>
      <ImagePlaceholder
        label={team.title}
        description={team.imageDescription}
        icon={team.icon}
        aspect="square"
        className="rounded-none border-0 border-b border-border"
      />
      <div className="p-6">
        <p className="text-xs font-extrabold tracking-[0.14em] text-curry-orange uppercase">
          {team.role}
        </p>
        <h2 className="mt-2 text-xl font-bold text-charcoal">{team.title}</h2>
        <p className="mt-3 leading-7 text-muted-grey">{team.description}</p>
        {interactive ? (
          <span className="mt-5 inline-flex text-sm font-bold text-curry-orange">
            View faculty
          </span>
        ) : null}
      </div>
    </>
  );

  if (!interactive) {
    return (
      <article className="h-full overflow-hidden rounded-card border border-border bg-white text-left shadow-card">
        {content}
      </article>
    );
  }

  return (
    <button
      type="button"
      data-team-card={team.team}
      className="h-full w-full overflow-hidden rounded-card border border-border bg-white text-left shadow-card transition-[border-color,box-shadow,transform] hover:-translate-y-1 hover:border-curry-orange/40 hover:shadow-card-strong"
      aria-expanded={expanded}
      aria-controls={controls}
      tabIndex={tabIndex}
      onClick={(event) => onSelect?.(event.currentTarget)}
    >
      {content}
    </button>
  );
}

type FacultyPanelProps = {
  id: string;
  team: TeacherProfile;
  members: readonly FacultyMember[];
  onClose: () => void;
  className?: string;
};

function FacultyCard({ member }: { member: FacultyMember }) {
  return (
    <article className="flex h-full min-h-[190px] flex-col items-center justify-center rounded-card border border-border bg-white p-5 text-center shadow-card">
      {member.image ? (
        <div className="relative size-20 overflow-hidden rounded-2xl bg-soft-cream">
          <ResponsiveImage
            image={member.image}
            sizes="80px"
          />
        </div>
      ) : (
        <div
          role="img"
          aria-label={member.imageDescription}
          className="flex size-20 items-center justify-center rounded-2xl bg-soft-cream text-curry-orange"
        >
          <ContentIcon name={member.icon} className="size-9" />
        </div>
      )}
      <p className="mt-5 text-xs font-extrabold tracking-[0.12em] text-curry-orange uppercase">
        {member.role}
      </p>
      <h3 className="mt-2 text-lg font-bold text-charcoal">
        {member.displayName}
      </h3>
    </article>
  );
}

function FacultyPanel({
  id,
  team,
  members,
  onClose,
  className,
}: FacultyPanelProps) {
  const titleId = `${id}-title`;

  return (
    <section
      id={id}
      data-faculty-panel={team.team}
      role="region"
      aria-labelledby={titleId}
      className={cn(
        "min-w-0 overflow-hidden rounded-[1.75rem] border border-curry-orange/20 bg-soft-cream p-5 shadow-card sm:p-7",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-5">
        <div>
          <p className="text-xs font-extrabold tracking-[0.14em] text-curry-orange uppercase">
            {team.role}
          </p>
          <h2
            id={titleId}
            className="mt-2 text-2xl font-extrabold tracking-[-0.02em] text-charcoal"
          >
            {team.title} Faculty
          </h2>
        </div>
        <button
          type="button"
          data-faculty-close
          onPointerDown={(event) => event.stopPropagation()}
          onClick={(event) => {
            event.stopPropagation();
            onClose();
          }}
          className="pointer-events-auto relative z-30 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-border bg-white text-charcoal transition-colors hover:border-curry-orange hover:text-curry-orange"
          aria-label={`Close ${team.title} faculty`}
        >
          <X aria-hidden="true" className="size-5" />
        </button>
      </div>
      <CardCarousel
        label={`${team.title} faculty`}
        desktopVisible={3}
        className="mt-6"
      >
        {members.map((member) => (
          <FacultyCard
            key={member.role}
            member={member}
          />
        ))}
      </CardCarousel>
    </section>
  );
}

export function FacultyExplorer({ teams, faculty }: FacultyExplorerProps) {
  const [selectedTeam, setSelectedTeam] =
    useState<AcademicLevelSlug | null>(null);
  const [phase, setPhase] = useState<ExplorerPhase>("idle");
  const [mobileHeight, setMobileHeight] = useState<number | null>(null);
  const [mobileGridHeight, setMobileGridHeight] = useState(0);
  const [mobilePanelHeight, setMobilePanelHeight] = useState(0);
  const [restoreMobileGrid, setRestoreMobileGrid] = useState(false);
  const [showRestoredMobileGrid, setShowRestoredMobileGrid] =
    useState(false);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const mobileGridRef = useRef<HTMLDivElement | null>(null);
  const mobilePanelRef = useRef<HTMLDivElement | null>(null);
  const phaseRef = useRef<ExplorerPhase>("idle");
  const animationFrames = useRef<number[]>([]);
  const transitionTimers = useRef<number[]>([]);

  const selectedProfile = teams.find((team) => team.team === selectedTeam);
  const selectedIndex = teams.findIndex((team) => team.team === selectedTeam);
  const selectedFaculty = faculty.filter(
    (member) => member.team === selectedTeam,
  );
  const anchorsLeft = selectedIndex < 2;
  const desktopPanelId = selectedTeam
    ? `faculty-panel-${selectedTeam}-desktop`
    : "";
  const mobilePanelId = selectedTeam
    ? `faculty-panel-${selectedTeam}-mobile`
    : "";
  const isExpanded = phase === "open";

  const clearScheduledWork = useCallback(() => {
    animationFrames.current.forEach((frame) => cancelAnimationFrame(frame));
    transitionTimers.current.forEach((timer) => window.clearTimeout(timer));
    animationFrames.current = [];
    transitionTimers.current = [];
  }, []);

  const restoreTriggerFocus = useCallback(() => {
    const trigger = triggerRef.current;
    triggerRef.current = null;

    const frame = requestAnimationFrame(() => trigger?.focus());
    animationFrames.current.push(frame);
  }, []);

  const finishClose = useCallback(() => {
    setSelectedTeam(null);
    setPhase("idle");
    setMobileHeight(null);
    setRestoreMobileGrid(false);
    setShowRestoredMobileGrid(false);
    restoreTriggerFocus();
  }, [restoreTriggerFocus]);

  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const grid = mobileGridRef.current;

    if (!grid) {
      return;
    }

    const updateHeight = () => {
      setMobileGridHeight(grid.getBoundingClientRect().height);
    };
    const observer = new ResizeObserver(updateHeight);

    observer.observe(grid);
    updateHeight();

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const panel = mobilePanelRef.current;

    if (!panel) {
      setMobilePanelHeight(0);
      return;
    }

    const updateHeight = () => {
      const nextHeight = panel.getBoundingClientRect().height;

      setMobilePanelHeight(nextHeight);
      if (phaseRef.current === "open") {
        setMobileHeight(nextHeight);
      }
    };
    const observer = new ResizeObserver(updateHeight);

    observer.observe(panel);
    updateHeight();

    return () => observer.disconnect();
  }, [selectedTeam]);

  useEffect(() => {
    if (phase !== "opening" || mobilePanelHeight <= 0) {
      return;
    }

    const firstFrame = requestAnimationFrame(() => {
      const secondFrame = requestAnimationFrame(() => {
        setMobileHeight(mobilePanelHeight);
        setPhase("open");
      });
      animationFrames.current.push(secondFrame);
    });
    animationFrames.current.push(firstFrame);
  }, [mobilePanelHeight, phase]);

  useEffect(
    () => () => {
      clearScheduledWork();
    },
    [clearScheduledWork],
  );

  function openFaculty(
    team: AcademicLevelSlug,
    trigger: HTMLButtonElement,
  ) {
    clearScheduledWork();

    triggerRef.current = trigger;
    setMobileHeight(
      mobileGridRef.current?.getBoundingClientRect().height ||
        mobileGridHeight ||
        null,
    );
    setSelectedTeam(team);
    setRestoreMobileGrid(false);
    setShowRestoredMobileGrid(false);
    setPhase("opening");

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setPhase("open");
    }
  }

  const closeFaculty = useCallback(() => {
    if (!selectedTeam || phase === "closing") {
      return;
    }

    clearScheduledWork();

    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      finishClose();
      return;
    }

    setMobileHeight(
      mobilePanelRef.current?.getBoundingClientRect().height ||
        mobilePanelHeight ||
        null,
    );
    setPhase("closing");

    if (window.matchMedia("(min-width: 1024px)").matches) {
      const desktopTimer = window.setTimeout(finishClose, 300);
      transitionTimers.current.push(desktopTimer);
      return;
    }

    const restoreGridTimer = window.setTimeout(() => {
      const nextGridHeight =
        mobileGridRef.current?.getBoundingClientRect().height ||
        mobileGridHeight;

      setRestoreMobileGrid(true);
      setMobileHeight(nextGridHeight || null);
    }, 300);
    const showGridTimer = window.setTimeout(() => {
      setShowRestoredMobileGrid(true);
    }, 800);
    const finishTimer = window.setTimeout(finishClose, 1100);

    transitionTimers.current.push(
      restoreGridTimer,
      showGridTimer,
      finishTimer,
    );
  }, [
    clearScheduledWork,
    finishClose,
    mobileGridHeight,
    mobilePanelHeight,
    phase,
    selectedTeam,
  ]);

  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape" && selectedTeam) {
        closeFaculty();
      }
    }

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [closeFaculty, selectedTeam]);

  useEffect(() => {
    if (!isExpanded) {
      return;
    }

    const closeButtons = document.querySelectorAll<HTMLButtonElement>(
      "[data-faculty-close]",
    );
    const visibleCloseButton = Array.from(closeButtons).find(
      (button) => button.offsetParent !== null,
    );
    visibleCloseButton?.focus();
  }, [isExpanded]);

  const selectedTransform = (() => {
    if (isExpanded || selectedIndex === 0 || selectedIndex === 3) {
      return "translateX(0)";
    }

    return anchorsLeft
      ? "translateX(calc(100% + 1.5rem))"
      : "translateX(calc(-100% - 1.5rem))";
  })();

  const selectedCardStyle = {
    transform: selectedTransform,
  } satisfies CSSProperties;

  return (
    <>
      <div
        className={cn(
          "relative mt-12 hidden transition-[min-height] duration-500 lg:block motion-reduce:transition-none",
          selectedTeam && "min-h-[460px]",
        )}
      >
        <div
          aria-hidden={selectedTeam ? "true" : undefined}
          className={cn(
            "grid grid-cols-4 gap-6 transition-[opacity,transform] duration-300 motion-reduce:transition-none",
            selectedTeam &&
              "pointer-events-none absolute inset-x-0 top-0 opacity-0 scale-[0.98]",
          )}
        >
          {teams.map((team) => (
            <TeamCard
              key={team.team}
              team={team}
              expanded={selectedTeam === team.team}
              controls={`faculty-panel-${team.team}-desktop`}
              tabIndex={selectedTeam ? -1 : 0}
              onSelect={(button) => openFaculty(team.team, button)}
            />
          ))}
        </div>

        {selectedProfile ? (
          <div
            className="pointer-events-none absolute inset-0 grid grid-cols-4 gap-6"
          >
            {anchorsLeft ? (
              <>
                <div
                  aria-hidden="true"
                  data-selected-team-card={selectedProfile.team}
                  style={selectedCardStyle}
                  className="col-start-1 h-full transition-transform duration-500 ease-out motion-reduce:transition-none"
                >
                  <TeamCard
                    team={selectedProfile}
                    interactive={false}
                    compact
                  />
                </div>
                <FacultyPanel
                  id={desktopPanelId}
                  team={selectedProfile}
                  members={selectedFaculty}
                  onClose={closeFaculty}
                  className={cn(
                    "pointer-events-auto relative z-10 col-span-3 col-start-2 transition-[opacity,transform] duration-300 motion-reduce:transition-none",
                    isExpanded
                      ? "translate-y-0 opacity-100 delay-100"
                      : "translate-y-3 opacity-0",
                  )}
                />
              </>
            ) : (
              <>
                <FacultyPanel
                  id={desktopPanelId}
                  team={selectedProfile}
                  members={selectedFaculty}
                  onClose={closeFaculty}
                  className={cn(
                    "pointer-events-auto relative z-10 col-span-3 col-start-1 transition-[opacity,transform] duration-300 motion-reduce:transition-none",
                    isExpanded
                      ? "translate-y-0 opacity-100 delay-100"
                      : "translate-y-3 opacity-0",
                  )}
                />
                <div
                  aria-hidden="true"
                  data-selected-team-card={selectedProfile.team}
                  style={selectedCardStyle}
                  className="col-start-4 h-full transition-transform duration-500 ease-out motion-reduce:transition-none"
                >
                  <TeamCard
                    team={selectedProfile}
                    interactive={false}
                    compact
                  />
                </div>
              </>
            )}
          </div>
        ) : null}
      </div>

      <div
        data-mobile-faculty-wrapper
        className={cn(
          "relative mt-12 transition-[height] duration-500 ease-out lg:hidden motion-reduce:transition-none",
          phase !== "idle" && "overflow-hidden",
        )}
        style={
          phase !== "idle" && mobileHeight
            ? { height: `${mobileHeight}px` }
            : undefined
        }
      >
        <div
          ref={mobileGridRef}
          aria-hidden={phase !== "idle" && !showRestoredMobileGrid}
          className={cn(
            "grid gap-6 transition-[opacity,transform] duration-300 sm:grid-cols-2 motion-reduce:transition-none",
            phase === "idle" || restoreMobileGrid
              ? "relative"
              : "pointer-events-none absolute inset-x-0 top-0",
            phase === "idle" || showRestoredMobileGrid
              ? "scale-100 opacity-100"
              : "pointer-events-none scale-[0.98] opacity-0",
          )}
        >
          {teams.map((team) => (
            <TeamCard
              key={team.team}
              team={team}
              expanded={selectedTeam === team.team}
              controls={`faculty-panel-${team.team}-mobile`}
              tabIndex={selectedTeam ? -1 : 0}
              onSelect={(button) => openFaculty(team.team, button)}
            />
          ))}
        </div>

        {selectedProfile ? (
          <div
            ref={mobilePanelRef}
            className={cn(
              "transition-[opacity,transform] duration-300 motion-reduce:transition-none",
              restoreMobileGrid && "absolute inset-x-0 top-0",
              isExpanded
                ? "translate-y-0 opacity-100"
                : "translate-y-3 opacity-0",
            )}
          >
            <FacultyPanel
              id={mobilePanelId}
              team={selectedProfile}
              members={selectedFaculty}
              onClose={closeFaculty}
            />
          </div>
        ) : null}
      </div>
    </>
  );
}
