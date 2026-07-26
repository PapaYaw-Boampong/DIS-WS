import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Bell, Download, FileText } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { MetricCard } from "@/components/portal/MetricCard";
import { StatusBadge } from "@/components/portal/StatusBadge";
import {
  getParentDocuments,
  getPortalNotifications,
} from "@/lib/portal/data/documents";
import { formatPortalDate } from "@/lib/portal/format";
import { getMockRoleSession } from "@/lib/portal/mock-role";

export const metadata: Metadata = { title: "Documents" };

export default async function ParentDocumentsPage() {
  if (!(await getMockRoleSession("parent"))) {
    notFound();
  }

  const [documents, notifications] = await Promise.all([
    getParentDocuments(),
    getPortalNotifications(),
  ]);

  return (
    <>
      <DashboardHeader
        eyebrow="Parent"
        title="Documents & notifications"
        description="Read school documents shared with your family and review recent notifications."
        badge="School documents"
      />

      <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          label="Documents"
          value={String(documents.length)}
          detail="Shared with you"
          icon={<FileText aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Downloadable"
          value={String(documents.filter((doc) => doc.downloadable).length)}
          detail="Available to save"
          icon={<Download aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Notifications"
          value={String(notifications.length)}
          detail="Recent messages"
          icon={<Bell aria-hidden="true" className="size-5" />}
        />
        <MetricCard
          label="Important"
          value={String(
            notifications.filter((note) => note.priority === "important")
              .length,
          )}
          detail="Flagged for attention"
          icon={<Bell aria-hidden="true" className="size-5" />}
        />
      </div>

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
        <DashboardCard
          title="Your documents"
          description="Bills, receipts, menus and the school calendar shared with your family."
        >
          <ul className="space-y-4">
            {documents.map((doc) => (
              <li
                key={doc.id}
                className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-soft-white p-5"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <FileText
                      aria-hidden="true"
                      className="size-4 text-curry-orange"
                    />
                    <p className="font-bold text-charcoal">{doc.title}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-grey">
                    {doc.description}
                  </p>
                  <p className="mt-2 text-xs font-semibold tracking-wide text-muted-grey uppercase">
                    {doc.category} · {formatPortalDate(doc.publishedAt)}
                  </p>
                </div>
                {doc.downloadable ? (
                  <StatusBadge variant="success">Downloadable</StatusBadge>
                ) : (
                  <StatusBadge variant="neutral">View</StatusBadge>
                )}
              </li>
            ))}
            {documents.length === 0 ? (
              <li className="rounded-2xl border border-border bg-soft-white p-5 text-sm text-muted-grey">
                No documents have been shared yet.
              </li>
            ) : null}
          </ul>
        </DashboardCard>

        <DashboardCard
          title="Notifications"
          description="Recent reminders and announcements."
          className="h-fit"
        >
          <ul className="space-y-3">
            {notifications.map((note) => (
              <li
                key={note.id}
                className="rounded-2xl border border-border bg-soft-white p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="font-bold text-charcoal">{note.title}</p>
                  {note.priority === "important" ? (
                    <StatusBadge variant="warning">Important</StatusBadge>
                  ) : null}
                </div>
                <p className="mt-1 text-sm leading-6 text-muted-grey">
                  {note.body}
                </p>
                <p className="mt-2 text-xs font-semibold text-muted-grey">
                  {formatPortalDate(note.createdAt.slice(0, 10))}
                </p>
              </li>
            ))}
            {notifications.length === 0 ? (
              <li className="rounded-2xl border border-border bg-soft-white p-4 text-sm text-muted-grey">
                No notifications right now.
              </li>
            ) : null}
          </ul>
        </DashboardCard>
      </div>
    </>
  );
}
