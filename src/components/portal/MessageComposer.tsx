"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { SendHorizonal } from "lucide-react";

import { sendConversationMessage } from "@/app/(portal)/portal/actions/messages";

type MessageComposerProps = {
  readonly conversationId: string;
};

export function MessageComposer({ conversationId }: MessageComposerProps) {
  const [body, setBody] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = body.trim();

    if (!trimmed) {
      setMessage("Write a message before sending.");
      return;
    }

    startTransition(async () => {
      const result = await sendConversationMessage(conversationId, trimmed);

      if (!result.ok) {
        setMessage("Could not send the message. Please try again.");
        return;
      }

      setBody("");

      if (result.mode === "real") {
        setMessage("Sent.");
        router.refresh();
      } else {
        setMessage(
          "Message preview only. Replies are delivered once the messaging backend is enabled.",
        );
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block text-sm font-bold text-charcoal">
        Reply
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          rows={3}
          placeholder="Write a reply…"
          className="mt-2 w-full rounded-2xl border border-border bg-white p-3 text-sm font-normal"
        />
      </label>
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-muted-grey">
          Sends when the backend is enabled; a local preview otherwise.
        </p>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex min-h-10 items-center gap-2 rounded-full bg-curry-orange px-4 text-sm font-bold text-white transition-colors hover:bg-deep-orange disabled:opacity-60"
        >
          <SendHorizonal aria-hidden="true" className="size-4" />
          {pending ? "Sending…" : "Send"}
        </button>
      </div>
      {message ? (
        <p
          role="status"
          className="rounded-2xl border border-curry-orange/25 bg-soft-cream p-3 text-sm font-semibold text-charcoal"
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
