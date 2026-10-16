"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, Users } from "lucide-react";

import { cn } from "@/lib/utils";

type WardFilterOption = {
  readonly id: string;
  readonly name: string;
};

type WardFilterSelectProps = {
  readonly students: readonly WardFilterOption[];
  readonly selectedWard: string;
  // Compact renders the header pill (page top-right); the default is a
  // full-width labelled field inside a card.
  readonly compact?: boolean;
};

export function WardFilterSelect({
  students,
  selectedWard,
  compact = false,
}: WardFilterSelectProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(event: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    const value = event.target.value;

    if (value === "all") {
      params.delete("ward");
    } else {
      params.set("ward", value);
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
  }

  const options = (
    <>
      <option value="all">All wards</option>
      {students.map((student) => (
        <option key={student.id} value={student.id}>
          {student.name}
        </option>
      ))}
    </>
  );

  const filtered = selectedWard !== "all";
  const selectedName =
    students.find((student) => student.id === selectedWard)?.name ??
    "All wards";

  if (compact) {
    // The filter changes every number on the page, so it reads as a control
    // rather than a chip: cream field, orange rule, and the active ward named
    // in full.
    return (
      <div
        className={cn(
          "relative flex min-h-14 items-center gap-3 rounded-2xl border-2 bg-soft-cream pr-11 pl-4 transition-colors focus-within:border-deep-orange",
          filtered ? "border-deep-orange" : "border-curry-orange",
        )}
      >
        <Users
          aria-hidden="true"
          className="size-5 shrink-0 text-deep-orange"
        />
        <span className="pointer-events-none flex flex-col justify-center">
          <span className="text-[0.625rem] font-bold tracking-[0.14em] text-deep-orange uppercase">
            Viewing
          </span>
          <span className="text-sm font-extrabold text-charcoal">
            {selectedName}
          </span>
        </span>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-4 size-5 text-deep-orange"
        />
        {/* The real select sits on top so the whole field is the hit target. */}
        <select
          value={selectedWard}
          onChange={handleChange}
          aria-label="Filter by ward"
          className="absolute inset-0 size-full cursor-pointer appearance-none rounded-2xl bg-transparent text-transparent focus:outline-none [&>option]:text-charcoal"
        >
          {options}
        </select>
      </div>
    );
  }

  return (
    <label className="block">
      <span className="flex items-center gap-2 text-sm font-extrabold tracking-[0.08em] text-deep-orange uppercase">
        <Users aria-hidden="true" className="size-4" />
        Filter by ward
      </span>
      <span className="relative mt-2 block">
        <select
          value={selectedWard}
          onChange={handleChange}
          className={cn(
            "min-h-14 w-full cursor-pointer appearance-none rounded-2xl border-2 bg-soft-cream pr-11 pl-4 text-base font-bold text-charcoal transition-colors focus:border-deep-orange focus:outline-none",
            filtered ? "border-deep-orange" : "border-curry-orange",
          )}
        >
          {options}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-deep-orange"
        />
      </span>
    </label>
  );
}
