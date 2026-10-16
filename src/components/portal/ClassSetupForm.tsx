"use client";

import { useState, useTransition } from "react";
import { School } from "lucide-react";

import { createClass } from "@/app/(portal)/portal/actions/school";
import { cn } from "@/lib/utils";

const fieldClass =
  "mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal";

const levels = ["Primary School", "Junior High School", "Early Years"];

export function ClassSetupForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      const result = await createClass({
        name: String(formData.get("name") ?? ""),
        level: String(formData.get("level") ?? ""),
        classTeacher: String(formData.get("teacher") ?? ""),
      });

      setFailed(!result.ok);
      setMessage(result.message);
      if (result.ok) form.reset();
    });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block text-sm font-bold text-charcoal">
          Class name
          <input name="name" placeholder="Example: Primary 4" className={fieldClass} />
        </label>
        <label className="block text-sm font-bold text-charcoal">
          Level
          <select name="level" className={fieldClass}>
            {levels.map((level) => (
              <option key={level}>{level}</option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-bold text-charcoal">
          Class teacher
          <input name="teacher" placeholder="Teacher name" className={fieldClass} />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-40"
        >
          <School aria-hidden="true" className="size-5" />
          {pending ? "Creating…" : "Create class"}
        </button>
      </form>
      {message ? (
        <p
          role="status"
          className={cn(
            "mt-5 rounded-2xl border p-4 text-sm font-semibold text-charcoal",
            failed ? "border-red-300 bg-red-50" : "border-curry-orange/25 bg-soft-cream",
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
