"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

type WardFilterOption = {
  readonly id: string;
  readonly name: string;
};

type WardFilterSelectProps = {
  readonly students: readonly WardFilterOption[];
  readonly selectedWard: string;
  // Compact renders an inline pill select (used in the page header top-right);
  // the default is a full-width labelled field.
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

  if (compact) {
    return (
      <select
        value={selectedWard}
        onChange={handleChange}
        aria-label="Focus ward"
        className="min-h-10 rounded-full border border-border bg-white px-4 text-sm font-semibold text-charcoal"
      >
        {options}
      </select>
    );
  }

  return (
    <label className="block text-sm font-bold text-charcoal">
      Focus ward
      <select
        value={selectedWard}
        onChange={handleChange}
        className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
      >
        {options}
      </select>
    </label>
  );
}
