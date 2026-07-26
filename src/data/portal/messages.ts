import type { PortalConversation } from "@/types/portal";

// Fictional conversations, scoped by `audience` (the role that sees them). These
// are mock-only; a future backend messages domain will replace this via the
// same data-layer dispatch (see src/lib/portal/data/messages.ts).
export const mockConversations: readonly PortalConversation[] = [
  {
    id: "conv-student-001",
    subject: "Mathematics assignment feedback",
    counterpart: "Mr. Boateng (Mathematics)",
    audience: "student",
    preview: "Good progress on fractions — check my note on question 4.",
    unread: true,
    updatedAt: "2026-06-22T14:30:00.000Z",
    messages: [
      {
        id: "msg-student-001-1",
        author: { id: "staff-001", name: "Mr. Boateng", role: "staff" },
        body: "Good progress on the fractions revision. Review my comment on question 4 and resubmit if you can.",
        sentAt: "2026-06-22T14:30:00.000Z",
      },
      {
        id: "msg-student-001-2",
        author: { id: "student-001", name: "You", role: "student" },
        body: "Thank you sir, I will look at question 4 again tonight.",
        sentAt: "2026-06-22T16:05:00.000Z",
        fromMe: true,
      },
    ],
  },
  {
    id: "conv-student-002",
    subject: "Science club meeting",
    counterpart: "Ms. Adjei (Science)",
    audience: "student",
    preview: "The next club meeting moves to Thursday after school.",
    unread: false,
    updatedAt: "2026-06-20T09:15:00.000Z",
    messages: [
      {
        id: "msg-student-002-1",
        author: { id: "staff-002", name: "Ms. Adjei", role: "staff" },
        body: "The next science club meeting moves to Thursday after school. Bring your project notes.",
        sentAt: "2026-06-20T09:15:00.000Z",
      },
    ],
  },
  {
    id: "conv-parent-001",
    subject: "Ama's attendance this week",
    counterpart: "Mr. Boateng (Class teacher)",
    audience: "parent",
    preview: "Ama has been present all week and is settling in well.",
    unread: true,
    updatedAt: "2026-06-22T11:00:00.000Z",
    messages: [
      {
        id: "msg-parent-001-1",
        author: { id: "staff-001", name: "Mr. Boateng", role: "staff" },
        body: "Good morning. Ama has been present every day this week and is settling in well after the break.",
        sentAt: "2026-06-22T11:00:00.000Z",
      },
      {
        id: "msg-parent-001-2",
        author: { id: "parent-001", name: "You", role: "parent" },
        body: "Thank you for the update, that is reassuring to hear.",
        sentAt: "2026-06-22T12:20:00.000Z",
        fromMe: true,
      },
    ],
  },
  {
    id: "conv-parent-002",
    subject: "Term fees reminder",
    counterpart: "Accounts office",
    audience: "parent",
    preview: "A gentle reminder that second-term fees are due by month end.",
    unread: false,
    updatedAt: "2026-06-18T08:40:00.000Z",
    messages: [
      {
        id: "msg-parent-002-1",
        author: { id: "accounts-001", name: "Accounts office", role: "accounts" },
        body: "A gentle reminder that second-term fees are due by the end of the month. You can review balances under Fees.",
        sentAt: "2026-06-18T08:40:00.000Z",
      },
    ],
  },
  {
    id: "conv-staff-001",
    subject: "Primary 6 lesson observation",
    counterpart: "Head Teacher",
    audience: "staff",
    preview: "Your lesson observation is scheduled for Wednesday morning.",
    unread: true,
    updatedAt: "2026-06-21T15:10:00.000Z",
    messages: [
      {
        id: "msg-staff-001-1",
        author: { id: "admin-001", name: "Head Teacher", role: "admin" },
        body: "Your Primary 6 lesson observation is scheduled for Wednesday morning. Please share your lesson plan beforehand.",
        sentAt: "2026-06-21T15:10:00.000Z",
      },
    ],
  },
  {
    id: "conv-staff-002",
    subject: "Parent query — Kofi Mensah",
    counterpart: "Parent · Mensah family",
    audience: "staff",
    preview: "Could we arrange a short call about Kofi's reading?",
    unread: false,
    updatedAt: "2026-06-19T13:25:00.000Z",
    messages: [
      {
        id: "msg-staff-002-1",
        author: { id: "parent-002", name: "Mensah family", role: "parent" },
        body: "Could we arrange a short call this week to talk about Kofi's reading progress?",
        sentAt: "2026-06-19T13:25:00.000Z",
      },
    ],
  },
  {
    id: "conv-admin-001",
    subject: "Staff meeting agenda",
    counterpart: "Accounts office",
    audience: "admin",
    preview: "Adding the fee-collection review to Friday's agenda.",
    unread: true,
    updatedAt: "2026-06-22T10:05:00.000Z",
    messages: [
      {
        id: "msg-admin-001-1",
        author: { id: "accounts-001", name: "Accounts office", role: "accounts" },
        body: "Please add the term fee-collection review to Friday's staff meeting agenda.",
        sentAt: "2026-06-22T10:05:00.000Z",
      },
    ],
  },
  {
    id: "conv-accounts-001",
    subject: "Invoice query from a parent",
    counterpart: "Parent · Owusu family",
    audience: "accounts",
    preview: "Can you confirm the feeding charge on this term's invoice?",
    unread: true,
    updatedAt: "2026-06-21T09:50:00.000Z",
    messages: [
      {
        id: "msg-accounts-001-1",
        author: { id: "parent-001", name: "Owusu family", role: "parent" },
        body: "Can you confirm the feeding charge on this term's invoice? It looks higher than last term.",
        sentAt: "2026-06-21T09:50:00.000Z",
      },
    ],
  },
  {
    id: "conv-transport-001",
    subject: "Route 2 morning delay",
    counterpart: "Head Teacher",
    audience: "transport",
    preview: "Please note the Route 2 bus is running 10 minutes late.",
    unread: false,
    updatedAt: "2026-06-22T07:20:00.000Z",
    messages: [
      {
        id: "msg-transport-001-1",
        author: { id: "admin-001", name: "Head Teacher", role: "admin" },
        body: "Please note the Route 2 bus is running about 10 minutes late this morning. Update families if needed.",
        sentAt: "2026-06-22T07:20:00.000Z",
      },
    ],
  },
];
