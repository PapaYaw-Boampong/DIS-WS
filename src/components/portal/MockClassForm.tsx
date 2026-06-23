"use client";

import { useState } from "react";
import { School } from "lucide-react";

export function MockClassForm() {
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name")).trim();
    const teacher = String(formData.get("teacher")).trim();

    if (!name || !teacher) {
      setMessage("Enter a class name and class teacher.");
      return;
    }

    setMessage(
      `${name} with ${teacher} as class teacher was previewed. No class was created.`,
    );
  }

  return (
    <div>
      <p className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        Class setup preview only. No timetable, roster, or teacher assignment is
        changed.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <label className="block text-sm font-bold text-charcoal">
          Class name
          <input name="name" placeholder="Example: Primary 4" className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal" />
        </label>
        <label className="block text-sm font-bold text-charcoal">
          Level
          <select name="level" className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal">
            <option>Primary School</option>
            <option>Junior High School</option>
            <option>Early Years</option>
          </select>
        </label>
        <label className="block text-sm font-bold text-charcoal">
          Class teacher
          <input name="teacher" placeholder="Teacher name" className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal" />
        </label>
        <button type="submit" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange">
          <School aria-hidden="true" className="size-5" />
          Preview class setup
        </button>
      </form>
      {message ? (
        <p role="status" className="mt-5 rounded-2xl border border-curry-orange/25 bg-soft-cream p-4 text-sm font-semibold text-charcoal">
          {message}
        </p>
      ) : null}
    </div>
  );
}
