"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

import { submitAssignmentWork } from "@/app/(portal)/portal/actions/academics";
import { formatPortalDate } from "@/lib/portal/format";

type AssignmentSubmissionFormProps = {
  readonly assignmentId: string;
  readonly submission: {
    readonly fileName: string;
    readonly submittedAt: string;
  } | null;
  readonly downloadHref: string | null;
};

export function AssignmentSubmissionForm({
  assignmentId,
  submission,
  downloadHref,
}: AssignmentSubmissionFormProps) {
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("file");

    if (!(file instanceof File) || !file.name) {
      setMessage("Select a file to submit.");
      return;
    }

    startTransition(async () => {
      const result = await submitAssignmentWork(assignmentId, formData);

      if (!result.ok) {
        setMessage("Could not submit your work. Please try again.");
        return;
      }

      if (result.mode === "real") {
        setMessage(`"${file.name}" was submitted.`);
        form.reset();
        router.refresh();
      } else {
        setMessage(
          `"${file.name}" is ready for backend-secured submission. No file was submitted (preview).`,
        );
      }
    });
  }

  return (
    <div className="mt-6 space-y-4">
      {submission ? (
        <p className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-900">
          Submitted <span className="font-bold">{submission.fileName}</span>{" "}
          on {formatPortalDate(submission.submittedAt.slice(0, 10))}.{" "}
          {downloadHref ? (
            <a href={downloadHref} className="font-bold underline">
              Download
            </a>
          ) : null}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block text-sm font-bold text-charcoal">
          {submission ? "Replace submission" : "Upload your work"}
          <input
            type="file"
            name="file"
            className="mt-2 block w-full rounded-2xl border border-dashed border-border bg-soft-white p-4 text-sm font-normal text-muted-grey file:mr-4 file:rounded-full file:border-0 file:bg-curry-orange file:px-4 file:py-2 file:font-bold file:text-white"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-60"
        >
          <Upload aria-hidden="true" className="size-5" />
          {pending ? "Submitting…" : submission ? "Submit new file" : "Submit"}
        </button>
      </form>

      {message ? (
        <p
          role="status"
          className="rounded-2xl border border-curry-orange/25 bg-soft-cream p-4 text-sm font-semibold text-charcoal"
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}
