import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Download, FileText } from "lucide-react";

import { DashboardCard } from "@/components/portal/DashboardCard";
import { DashboardHeader } from "@/components/portal/DashboardHeader";
import { DocumentsManager } from "@/components/portal/DocumentsManager";
import { StatusBadge } from "@/components/portal/StatusBadge";
import { useRealPortalAuth } from "@/lib/portal/auth-config";
import {
  getParentDocuments,
  getPortalNotifications,
  listCmsDocuments,
} from "@/lib/portal/data/documents";
import { formatPortalDate } from "@/lib/portal/format";
import { isPortalRole } from "@/lib/portal/roles";
import type { PortalRole } from "@/types/portal";

export const metadata: Metadata = { title: "Documents" };

type DocumentsPageProps = {
  readonly params: Promise<{ role: string }>;
};

async function AdminDocumentsView({ role }: { role: PortalRole }) {
  const documents = await listCmsDocuments();
  return (
    <>
      <DashboardHeader
        eyebrow="Administration"
        title="Documents"
        description="Upload documents (bills, menus, calendars, policies) and choose who can see and download them."
        badge="Live documents"
      />
      <div className="mt-8">
        <DashboardCard
          title="Documents"
          description="Set the audience and whether each document can be downloaded."
        >
          <DocumentsManager documents={documents} role={role} />
        </DashboardCard>
      </div>
    </>
  );
}

async function MemberDocumentsView({ role }: { role: PortalRole }) {
  const [documents, notifications] = await Promise.all([
    getParentDocuments(),
    getPortalNotifications(),
  ]);

  return (
    <>
      <DashboardHeader
        eyebrow={role === "staff" ? "Staff" : "Parent"}
        title="Documents & notifications"
        description="Read documents the school has shared with you and review recent notifications."
        badge="School documents"
      />

      <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,0.65fr)]">
        <DashboardCard
          title="Your documents"
          description="Documents the school has shared with you."
        >
          <ul className="space-y-4">
            {documents.map((doc) => {
              const canDownload = useRealPortalAuth && doc.downloadable;
              return (
                <li
                  key={doc.id}
                  className="flex items-start justify-between gap-4 rounded-2xl border border-border bg-soft-white p-5"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <FileText
                        aria-hidden="true"
                        className="size-4 shrink-0 text-curry-orange"
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
                  {canDownload ? (
                    <a
                      href={`/portal/${role}/documents/${doc.id}/download`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-curry-orange px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-deep-orange"
                    >
                      <Download aria-hidden="true" className="size-3.5" />
                      Download
                    </a>
                  ) : (
                    <StatusBadge variant="neutral">View</StatusBadge>
                  )}
                </li>
              );
            })}
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

export default async function DocumentsPage({ params }: DocumentsPageProps) {
  const { role } = await params;
  if (!isPortalRole(role)) {
    notFound();
  }
  if (role === "admin") {
    return <AdminDocumentsView role={role} />;
  }
  if (role === "parent" || role === "staff") {
    return <MemberDocumentsView role={role} />;
  }
  notFound();
}
