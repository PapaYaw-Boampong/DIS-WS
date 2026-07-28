"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Download, Send } from "lucide-react";

import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  sendMailingBroadcast,
  setMailingStatus,
} from "@/app/(portal)/portal/actions/forms";
import type { MailingSignup } from "@/lib/portal/data/forms";

type MailingListManagerProps = {
  readonly signups: readonly MailingSignup[];
};

const fieldClass =
  "mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 font-normal";

const broadcastError: Record<string, string> = {
  backend_required: "Sending requires the live backend (USE_REAL_PORTAL_AUTH).",
  missing_content: "Add a subject and a message.",
  no_subscribers: "There are no active subscribers to send to.",
  email_not_configured:
    "Email delivery isn't configured yet (set RESEND_API_KEY + FORMS_FROM_EMAIL). Subscribers are saved — you can export them below and send from your email tool.",
  send_failed: "Could not send the update. Please try again.",
};

export function MailingListManager({ signups }: MailingListManagerProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const active = signups.filter((s) => s.status === "active");

  function handleSend(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    startTransition(async () => {
      const result = await sendMailingBroadcast(subject, body);
      if (!result.ok) {
        setMessage(broadcastError[result.error ?? "send_failed"]);
        return;
      }
      setSubject("");
      setBody("");
      setMessage(`Sent to ${result.sent} subscriber${result.sent === 1 ? "" : "s"}.`);
    });
  }

  function toggleStatus(signup: MailingSignup) {
    startTransition(async () => {
      await setMailingStatus(
        signup.id,
        signup.status === "active" ? "unsubscribed" : "active",
      );
      router.refresh();
    });
  }

  function exportCsv() {
    const rows = [
      ["email", "firstName", "status", "signedUp"],
      ...signups.map((s) => [
        s.email,
        s.firstName,
        s.status,
        s.createdAt.slice(0, 10),
      ]),
    ];
    const csv = rows
      .map((r) => r.map((v) => `"${String(v).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const url = URL.createObjectURL(
      new Blob([csv], { type: "text/csv;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "mailing-list.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-8">
      <form
        onSubmit={handleSend}
        className="space-y-4 rounded-2xl border border-border bg-soft-white p-5"
      >
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-charcoal">Compose an update</h3>
          <span className="text-sm font-semibold text-muted-grey">
            {active.length} active subscriber{active.length === 1 ? "" : "s"}
          </span>
        </div>
        <label className="block text-sm font-bold text-charcoal">
          Subject
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            className={fieldClass}
            placeholder="e.g. Term 2 reopening & key dates"
          />
        </label>
        <label className="block text-sm font-bold text-charcoal">
          Message
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            rows={6}
            className={fieldClass}
            placeholder="Write the update to send to the mailing list…"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-11 items-center gap-2 rounded-full bg-curry-orange px-6 font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-60"
        >
          <Send aria-hidden="true" className="size-5" />
          {pending ? "Sending…" : `Send to ${active.length} subscribers`}
        </button>
        {message ? (
          <p
            role="status"
            className="rounded-2xl border border-curry-orange/25 bg-white p-4 text-sm font-semibold text-charcoal"
          >
            {message}
          </p>
        ) : null}
      </form>

      <div>
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-charcoal">Subscribers</h3>
          <button
            type="button"
            onClick={exportCsv}
            className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-bold text-charcoal transition-colors hover:border-curry-orange"
          >
            <Download aria-hidden="true" className="size-4" />
            Export CSV
          </button>
        </div>
        <ul className="mt-4 divide-y divide-border">
          {signups.length === 0 ? (
            <li className="py-6 text-sm text-muted-grey">
              No subscribers yet.
            </li>
          ) : (
            signups.map((signup) => (
              <li
                key={signup.id}
                className="flex flex-wrap items-center justify-between gap-4 py-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-charcoal">
                      {signup.email}
                    </span>
                    <StatusBadge
                      variant={
                        signup.status === "active" ? "success" : "neutral"
                      }
                    >
                      {signup.status}
                    </StatusBadge>
                  </div>
                  <p className="mt-0.5 truncate text-sm text-muted-grey">
                    {signup.firstName || "—"} · joined{" "}
                    {signup.createdAt.slice(0, 10)}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleStatus(signup)}
                  disabled={pending}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-bold text-charcoal transition-colors hover:border-curry-orange disabled:opacity-60"
                >
                  {signup.status === "active" ? "Unsubscribe" : "Reactivate"}
                </button>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}
