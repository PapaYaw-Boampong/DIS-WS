"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";

type MockPersonFormProps = {
  readonly entity: "student" | "parent" | "staff";
};

export function MockPersonForm({ entity }: MockPersonFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const label = entity.charAt(0).toUpperCase() + entity.slice(1);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name")).trim();

    if (!name) {
      setMessage(`Enter a ${entity} name to preview account creation.`);
      return;
    }

    setMessage(
      `${label} account for ${name} was previewed. No account or credential was created.`,
    );
  }

  return (
    <div>
      <p className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        Account creation preview only. No user, credential, email, or database
        record will be created.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <label className="block text-sm font-bold text-charcoal">
          Full name
          <input
            name="name"
            placeholder={`${label} full name`}
            className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
          />
        </label>
        <div className="grid gap-5 sm:grid-cols-2">
          <label className="text-sm font-bold text-charcoal">
            {entity === "student" ? "Class" : "Email"}
            {entity === "student" ? (
              <select
                name="class"
                className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
              >
                <option>Primary 6</option>
                <option>Primary 5</option>
                <option>Primary 3</option>
                <option>JHS 1</option>
              </select>
            ) : (
              <input
                type="email"
                name="email"
                placeholder={`${entity}@example.com`}
                className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
              />
            )}
          </label>
          <label className="text-sm font-bold text-charcoal">
            {entity === "staff" ? "Staff role" : "Account status"}
            {entity === "staff" ? (
              <select
                name="staffRole"
                className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
              >
                <option>Class Teacher</option>
                <option>Subject Teacher</option>
                <option>Support Staff</option>
              </select>
            ) : (
              <select
                name="status"
                className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
              >
                <option>Active</option>
                <option>Inactive</option>
              </select>
            )}
          </label>
        </div>
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange"
        >
          <UserPlus aria-hidden="true" className="size-5" />
          Preview {entity} account
        </button>
      </form>
      {message ? (
        <p
          role="status"
          className="mt-5 rounded-2xl border border-curry-orange/25 bg-soft-cream p-4 text-sm font-semibold text-charcoal"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
