import { AlertCircle, Bell } from "lucide-react";

import { formatPortalDate } from "@/lib/portal/format";
import type { PortalAnnouncement } from "@/types/portal";

type NoticeListProps = {
  readonly announcements: readonly PortalAnnouncement[];
};

export function NoticeList({ announcements }: NoticeListProps) {
  return (
    <ul className="space-y-3">
      {announcements.map((announcement) => {
        const Icon =
          announcement.priority === "important" ? AlertCircle : Bell;

        return (
          <li
            key={announcement.id}
            className="flex gap-3 rounded-2xl border border-border bg-soft-white p-4"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white text-curry-orange shadow-sm">
              <Icon aria-hidden="true" className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <p className="font-bold text-charcoal">{announcement.title}</p>
                <time
                  dateTime={announcement.publishedAt}
                  className="text-xs font-semibold text-muted-grey"
                >
                  {formatPortalDate(announcement.publishedAt)}
                </time>
              </div>
              <p className="mt-1 text-sm leading-6 text-muted-grey">
                {announcement.summary}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
