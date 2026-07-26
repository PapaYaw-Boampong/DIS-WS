"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

import { uploadCourseMaterial } from "@/app/(portal)/portal/actions/academics";

type CourseMaterialFormProps = {
  readonly classId: string;
  readonly courseId: string;
  readonly subject: string;
};

export function CourseMaterialForm({
  classId,
  courseId,
  subject,
}: CourseMaterialFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") ?? "").trim();
    const file = formData.get("file");

    if (!title || !(file instanceof File) || !file.name) {
      setMessage("Add a title and select a file to upload.");
      return;
    }

    formData.set("classId", classId);
    formData.set("courseId", courseId);
    formData.set("subject", subject);

    startTransition(async () => {
      const result = await uploadCourseMaterial(formData);

      if (!result.ok) {
        setMessage("Could not upload the file. Please try again.");
        return;
      }

      if (result.mode === "real") {
        setMessage(`"${title}" was uploaded and shared with the class.`);
        form.reset();
        router.refresh();
      } else {
        setMessage(
          `"${file.name}" would be added as "${title}". No file was uploaded (preview).`,
        );
      }
    });
  }

  return (
    <div>
      <p className="rounded-2xl border border-blue-200 bg-blue-50 p-4 text-sm leading-6 text-blue-900">
        Files upload to the school&apos;s secure storage and become visible to
        students in this class once shared.
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
          disabled={pending}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-60"
        >
          <Upload aria-hidden="true" className="size-5" />
          {pending ? "Uploading…" : "Share course material"}
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
