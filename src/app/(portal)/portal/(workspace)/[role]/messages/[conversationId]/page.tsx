import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { MessageComposer } from "@/components/portal/MessageComposer";
import { getConversation } from "@/lib/portal/data/messages";
import { formatPortalDate, formatPortalTime } from "@/lib/portal/format";
import { isPortalRole } from "@/lib/portal/roles";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = {
  title: "Conversation",
};

type ConversationPageProps = {
  readonly params: Promise<{
    role: string;
    conversationId: string;
  }>;
};

export default async function ConversationPage({
  params,
}: ConversationPageProps) {
  const { role, conversationId } = await params;

  if (!isPortalRole(role)) {
    notFound();
  }

  const conversation = await getConversation(conversationId);

  if (!conversation) {
    notFound();
  }

  return (
    <>
      <Link
        href={portalRoutes.messages(role)}
        className="mb-4 inline-flex items-center gap-2 text-sm font-bold text-deep-orange transition-colors hover:text-curry-orange"
      >
        <ArrowLeft aria-hidden="true" className="size-4" />
        Inbox
      </Link>

      <DashboardHeader
        eyebrow={conversation.counterpart}
        title={conversation.subject}
        description="Conversation history is fictional. Replies are a preview until the messaging backend is connected."
        badge="Mock messages"
      />

      <div className="mt-8 space-y-4">
        {conversation.messages.map((message) => (
          <article
            key={message.id}
            className={
              message.fromMe
                ? "ml-auto max-w-xl rounded-2xl border border-curry-orange/30 bg-soft-cream p-5 shadow-card"
                : "mr-auto max-w-xl rounded-2xl border border-border bg-white p-5 shadow-card"
            }
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-bold text-charcoal">
                {message.author.name}
              </p>
              <p className="text-xs font-semibold text-muted-grey">
                {formatPortalDate(message.sentAt.slice(0, 10))} ·{" "}
                {formatPortalTime(message.sentAt.slice(11, 16))}
              </p>
            </div>
            <p className="mt-2 text-sm leading-6 text-charcoal">
              {message.body}
            </p>
          </article>
        ))}
      </div>

      <div className="mt-8 rounded-3xl border border-border bg-white p-6 shadow-card">
        <MessageComposer conversationId={conversation.id} />
      </div>
    </>
  );
}
