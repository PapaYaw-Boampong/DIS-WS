import type { PortalAnnouncement, PortalEvent } from "@/types/portal";

export const mockAnnouncements = [
  {
    id: "announcement-001",
    title: "End-of-term assessment timetable",
    summary:
      "The assessment timetable is available for review. Students should confirm their subject dates with class teachers.",
    publishedAt: "2026-06-23",
    audience: "all",
    priority: "important",
  },
  {
    id: "announcement-002",
    title: "PTA meeting reminder",
    summary:
      "Parents and guardians are invited to the term review meeting in the school hall.",
    publishedAt: "2026-06-22",
    audience: "parent",
    priority: "normal",
  },
  {
    id: "announcement-003",
    title: "Learning resource update",
    summary:
      "New revision worksheets have been added to the mock learning resource catalogue.",
    publishedAt: "2026-06-21",
    audience: "student",
    priority: "normal",
  },
  {
    id: "announcement-004",
    title: "Continuous assessment deadline",
    summary:
      "Teachers should complete outstanding mock assessment entries before Friday.",
    publishedAt: "2026-06-20",
    audience: "staff",
    priority: "important",
  },
] satisfies readonly PortalAnnouncement[];

export const mockPortalEvents = [
  {
    id: "event-001",
    title: "PTA term review meeting",
    date: "2026-06-27",
    time: "10:00",
    audience: "parent",
  },
  {
    id: "event-002",
    title: "End-of-term assessments begin",
    date: "2026-07-01",
    time: "08:00",
    audience: "all",
  },
  {
    id: "event-003",
    title: "Staff records review",
    date: "2026-06-26",
    time: "14:30",
    audience: "staff",
  },
] satisfies readonly PortalEvent[];
