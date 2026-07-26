import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MessagesSquare } from "lucide-react";

import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { listConversations } from "@/lib/portal/data/messages";
import { formatPortalDate } from "@/lib/portal/format";
import { isPortalRole } from "@/lib/portal/roles";
import { portalRoutes } from "@/lib/portal/routes";

export const metadata: Metadata = {
  title: "Messages",
};

type MessagesPageProps = {
  readonly params: Promise<{
    role: string;
  }>;
};

export default async function MessagesPage({ params }: MessagesPageProps) {
  const { role } = await params;

  if (!isPortalRole(role)) {
    notFound();
  }

  const conversations = await listConversations();

  return (
    <>
      <DashboardHeader
        eyebrow="Inbox"
        title="Messages"
        description="Read your school conversations. Composing and replying are previews until the messaging backend is connected."
        badge="Mock messages"
      />

      <div className="mt-8">
        {conversations.length === 0 ? (
          <div className="rounded-3xl border border-border bg-white p-10 text-center shadow-card">
            <MessagesSquare
              aria-hidden="true"
              className="mx-auto size-8 text-curry-orange"
            />
            <p className="mt-4 font-bold text-charcoal">No messages yet</p>
            <p className="mt-1 text-sm text-muted-grey">
              School conversations will appear here.
            </p>
          </div>
        ) : (
          <ul className="space-y-3">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <Link
                  href={portalRoutes.messageThread(role, conversation.id)}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-white p-5 shadow-card transition-colors hover:border-curry-orange/40"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {conversation.unread ? (
                        <span
                          aria-hidden="true"
                          className="size-2 rounded-full bg-curry-orange"
                        />
                      ) : null}
                      <p className="font-bold text-charcoal">
                        {conversation.subject}
                      </p>
                    </div>
                    <p className="mt-1 text-sm font-semibold text-deep-orange">
                      {conversation.counterpart}
                    </p>
                    <p className="mt-1 line-clamp-1 text-sm text-muted-grey">
                      {conversation.preview}
                    </p>
                  </div>
                  <p className="shrink-0 text-xs font-semibold text-muted-grey">
                    {formatPortalDate(conversation.updatedAt.slice(0, 10))}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
