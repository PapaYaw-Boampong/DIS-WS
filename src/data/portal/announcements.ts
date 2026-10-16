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
    endTime: "12:30",
    audience: "parent",
    category: "meeting",
    location: "School hall",
    summary:
      "The termly meeting between the Parent-Teacher Association and school leadership, covering the term just ending and the plans for the next one.",
    details: [
      "Class teachers are available for short individual conversations after the main session.",
      "Families with more than one child are welcome to attend a single session; class reports are shared for every learner.",
      "Seating opens 20 minutes before the start time.",
    ],
    programme: [
      { time: "10:00", item: "Welcome and opening prayer" },
      { time: "10:15", item: "Head teacher's report on the term" },
      { time: "10:45", item: "Academic review by level coordinators" },
      { time: "11:30", item: "Open questions from parents" },
      { time: "12:00", item: "Class teacher conversations" },
    ],
    contact: "School office · 030 000 0000",
  },
  {
    id: "event-002",
    title: "End-of-term assessments begin",
    date: "2026-07-01",
    time: "08:00",
    audience: "all",
    category: "academic",
    location: "Classrooms and examination hall",
    summary:
      "End-of-term assessments run across all levels. Learners sit papers in their own classrooms except for the upper primary examination sessions in the hall.",
    details: [
      "The subject timetable is published on the notice board and in the Documents tab.",
      "Learners should arrive by 7:30am each assessment morning with their own pens, pencils and mathematical set.",
      "Transport runs on the normal schedule throughout the assessment period.",
    ],
    programme: [
      { time: "08:00", item: "Paper one · Mathematics" },
      { time: "10:00", item: "Break" },
      { time: "10:30", item: "Paper two · English Language" },
      { time: "12:30", item: "Close and dismissal" },
    ],
    contact: "Academic office",
  },
  {
    id: "event-003",
    title: "Staff records review",
    date: "2026-06-26",
    time: "14:30",
    audience: "staff",
    category: "meeting",
    location: "Staff room",
    summary:
      "Teaching staff confirm assessment entries, attendance registers and class records before the term closes.",
    details: [
      "Bring completed continuous assessment sheets for each subject taught.",
      "Class teachers should confirm learner attendance totals for the term.",
    ],
  },
  {
    id: "event-004",
    title: "Inter-house sports day",
    date: "2026-07-10",
    time: "08:30",
    endTime: "15:00",
    audience: "all",
    category: "sports",
    location: "School field",
    summary:
      "The four school houses compete in track and field events across the day, with a parents' race closing the programme.",
    details: [
      "Learners come in house colours instead of school uniform.",
      "Water and a light snack are provided; families may bring a picnic.",
      "Parents are welcome from 8:00am and seating is under the canopy on the north side of the field.",
    ],
    programme: [
      { time: "08:30", item: "March past and opening" },
      { time: "09:00", item: "Track heats · Lower primary" },
      { time: "11:00", item: "Field events · Upper primary" },
      { time: "12:30", item: "Lunch break" },
      { time: "13:30", item: "Relay finals" },
      { time: "14:30", item: "Parents' race and prize giving" },
    ],
    contact: "Sports department",
  },
  {
    id: "event-005",
    title: "Community reading morning",
    date: "2026-07-04",
    time: "09:00",
    endTime: "11:00",
    audience: "parent",
    category: "community",
    location: "Library and lower primary block",
    summary:
      "Parents, guardians and community volunteers read with learners in small groups to close the term's literacy drive.",
    details: [
      "No preparation is needed — books are provided and groups are arranged on arrival.",
      "Volunteers may read in English, Twi or Ga.",
      "Learners in Kindergarten to Primary 3 take part.",
    ],
    programme: [
      { time: "09:00", item: "Volunteer welcome and group allocation" },
      { time: "09:30", item: "Reading circles" },
      { time: "10:30", item: "Learner presentations and refreshments" },
    ],
    contact: "Literacy coordinator",
  },
] satisfies readonly PortalEvent[];
