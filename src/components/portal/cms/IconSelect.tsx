"use client";

import { contentIconNames } from "@/lib/content-icons";

type IconSelectProps = {
  readonly name: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly id?: string;
};

// A simple select over the ContentIcon allowlist. The public site renders the
// chosen icon next to the content; the backend re-validates against the same
// allowlist on write.
export function IconSelect({ name, value, onChange, id }: IconSelectProps) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
    >
      {contentIconNames.map((icon) => (
        <option key={icon} value={icon}>
          {icon}
        </option>
      ))}
    </select>
  );
}
