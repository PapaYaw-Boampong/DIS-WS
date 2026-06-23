"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

import type { CourseSummary } from "@/types/portal";

type MockCourseMaterialFormProps = {
  readonly courses: readonly CourseSummary[];
};

export function MockCourseMaterialForm({
  courses,
}: MockCourseMaterialFormProps) {
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title")).trim();
    const file = formData.get("file");
    const courseId = String(formData.get("course"));
    const course = courses.find((item) => item.id === courseId);

    if (!title || !course || !(file instanceof File) || !file.name) {
      setMessage("Choose a course, add a title, and select a file to preview.");
      return;
    }

    setMessage(
      `${file.name} would be added to ${course.title} as "${title}". No file was uploaded.`,
    );
  }

  return (
    <div>
      <p className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        Course material preview only. Files remain on your device and are not
        sent to storage, students, or a backend.
      </p>
      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <label className="block text-sm font-bold text-charcoal">
          Material title
          <input
            name="title"
            placeholder="Example: Fractions revision notes"
            className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
          />
        </label>
        <label className="block text-sm font-bold text-charcoal">
          Course
          <select
            name="course"
            className="mt-2 min-h-12 w-full rounded-2xl border border-border bg-white px-4 font-normal"
          >
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-bold text-charcoal">
          Select file
          <input
            type="file"
            name="file"
            accept=".pdf,.doc,.docx,.ppt,.pptx"
            className="mt-2 block w-full rounded-2xl border border-dashed border-border bg-soft-white p-4 text-sm font-normal text-muted-grey file:mr-4 file:rounded-full file:border-0 file:bg-curry-orange file:px-4 file:py-2 file:font-bold file:text-white"
          />
        </label>
        <button
          type="submit"
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange"
        >
          <Upload aria-hidden="true" className="size-5" />
          Preview course material
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
