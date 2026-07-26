import { hash } from "@node-rs/argon2";
import { PrismaClient, type Role } from "@prisma/client";

import { uploadObject } from "../src/lib/storage";

const prisma = new PrismaClient();

// Accounts are admin-issued (no public sign-up). These demo accounts mirror the
// six portal roles so the real login can be exercised in development.
const accounts: ReadonlyArray<{ name: string; email: string; role: Role }> = [
  { name: "Divine Admin", email: "admin@dis.local", role: "ADMIN" },
  { name: "Divine Accounts", email: "accounts@dis.local", role: "ACCOUNTS" },
  { name: "Divine Staff", email: "staff@dis.local", role: "STAFF" },
  { name: "Divine Parent", email: "parent@dis.local", role: "PARENT" },
  { name: "Divine Student", email: "student@dis.local", role: "STUDENT" },
  { name: "Divine Transport", email: "transport@dis.local", role: "TRANSPORT" },
];

async function main() {
  const devPassword = process.env.SEED_PASSWORD ?? "PortalDev123!";
  const passwordHash = await hash(devPassword);

  for (const account of accounts) {
    await prisma.user.upsert({
      where: { email: account.email },
      update: { name: account.name, role: account.role, status: "ACTIVE" },
      create: { ...account, status: "ACTIVE", passwordHash },
    });
  }

  // Remove any non-demo accounts created during testing so lookups are stable.
  await prisma.user.deleteMany({
    where: { email: { notIn: accounts.map((account) => account.email) } },
  });

  const users = await prisma.user.findMany();
  const byEmail = (email: string) =>
    users.find((user) => user.email === email);
  const parentUser = byEmail("parent@dis.local");
  const staffUser = byEmail("staff@dis.local");
  const studentUser = byEmail("student@dis.local");
  const adminUser = byEmail("admin@dis.local");
  const accountsUser = byEmail("accounts@dis.local");
  const transportUser = byEmail("transport@dis.local");

  // Reset domain tables for an idempotent seed.
  await prisma.$transaction([
    prisma.statementTransaction.deleteMany(),
    prisma.statementImport.deleteMany(),
    prisma.message.deleteMany(),
    prisma.conversationParticipant.deleteMany(),
    prisma.conversation.deleteMany(),
    prisma.transportNoticeRecord.deleteMany(),
    prisma.portalEventRecord.deleteMany(),
    prisma.announcement.deleteMany(),
    prisma.walletTransaction.deleteMany(),
    prisma.transportWalletBalance.deleteMany(),
    prisma.feedingBalance.deleteMany(),
    prisma.learningResource.deleteMany(),
    prisma.gradebookEntry.deleteMany(),
    prisma.dailyAttendanceRecord.deleteMany(),
    prisma.attendanceSummary.deleteMany(),
    prisma.resultRecord.deleteMany(),
    prisma.timetableEntry.deleteMany(),
    prisma.assignmentRecord.deleteMany(),
    prisma.courseModule.deleteMany(),
    prisma.course.deleteMany(),
    prisma.notification.deleteMany(),
    prisma.documentAsset.deleteMany(),
    prisma.transportAssignment.deleteMany(),
    prisma.transportTrip.deleteMany(),
    prisma.transportRoute.deleteMany(),
    prisma.payment.deleteMany(),
    prisma.invoice.deleteMany(),
    prisma.feeItem.deleteMany(),
    prisma.staff.deleteMany(),
    prisma.parent.deleteMany(),
    prisma.student.deleteMany(),
    prisma.schoolClass.deleteMany(),
  ]);

  const basic5 = await prisma.schoolClass.create({
    data: { name: "Basic 5", level: "basic", studentCount: 2, classTeacher: "Ms. Adjoa Nyarko" },
  });
  const jhs2 = await prisma.schoolClass.create({
    data: { name: "JHS 2", level: "junior-high", studentCount: 1, classTeacher: "Mr. Kwabena Osei" },
  });

  const route = await prisma.transportRoute.create({
    data: {
      routeName: "East Legon Loop",
      busName: "Bus A",
      vehicleRegistration: "GR-1234-24",
      capacity: 18,
      driverName: "Mr. Yaw Danso",
      driverPhone: "+233 24 000 0000",
      stops: ["East Legon", "Adjiringanor", "American House", "School"],
    },
  });

  const ama = await prisma.student.create({
    data: {
      userId: studentUser?.id ?? null,
      fullName: "Ama Mensah",
      studentId: "DIS/2024/012",
      classId: basic5.id,
      className: basic5.name,
      level: "basic",
      status: "active",
      feedingPlan: "termly",
      transportRouteId: route.id,
    },
  });
  const kofi = await prisma.student.create({
    data: {
      fullName: "Kofi Mensah",
      studentId: "DIS/2024/031",
      classId: jhs2.id,
      className: jhs2.name,
      level: "junior-high",
      status: "active",
      feedingPlan: "daily",
    },
  });

  const parent = await prisma.parent.create({
    data: {
      userId: parentUser?.id ?? null,
      fullName: "Adwoa Mensah",
      phone: "+233 20 111 2222",
      email: parentUser?.email ?? "parent@dis.local",
      childIds: [ama.id, kofi.id],
      status: "active",
    },
  });
  await prisma.student.update({ where: { id: ama.id }, data: { parentIds: [parent.id] } });
  await prisma.student.update({ where: { id: kofi.id }, data: { parentIds: [parent.id] } });

  await prisma.staff.createMany({
    data: [
      {
        userId: staffUser?.id ?? null,
        fullName: "Kwame Boateng",
        staffId: "STF-014",
        title: "Class Teacher",
        classIds: [basic5.id],
        subjectIds: ["mathematics", "science"],
        status: "active",
      },
      {
        userId: null,
        fullName: "Esi Owusu",
        staffId: "STF-021",
        title: "Subject Teacher",
        classIds: [jhs2.id],
        subjectIds: ["english"],
        status: "active",
      },
    ],
  });

  const feeSchool = await prisma.feeItem.create({
    data: { title: "School Fees — Term 1", category: "school_fees", amount: 1500, term: "Term 1", academicYear: "2024/25", dueDate: "2024-09-30" },
  });
  const feeFeeding = await prisma.feeItem.create({
    data: { title: "Feeding — Term 1", category: "feeding", amount: 600, term: "Term 1", academicYear: "2024/25" },
  });
  const feeTransport = await prisma.feeItem.create({
    data: { title: "Transport — Term 1", category: "transport", amount: 400, term: "Term 1", academicYear: "2024/25" },
  });
  await prisma.feeItem.create({
    data: { title: "One-time Admission", category: "admission", amount: 800, term: "Term 1", academicYear: "2024/25" },
  });
  await prisma.feeItem.create({
    data: { title: "Uniform & Badges", category: "miscellaneous", amount: 250, term: "Term 1", academicYear: "2024/25" },
  });

  const amaInvoice = await prisma.invoice.create({
    data: {
      studentId: ama.id,
      feeItemIds: [feeSchool.id, feeFeeding.id, feeTransport.id],
      totalAmount: 2500,
      amountPaid: 1500,
      balance: 1000,
      status: "partially_paid",
      dueDate: "2024-09-30",
    },
  });
  const kofiInvoice = await prisma.invoice.create({
    data: {
      studentId: kofi.id,
      feeItemIds: [feeSchool.id, feeFeeding.id],
      totalAmount: 2100,
      amountPaid: 2100,
      balance: 0,
      status: "paid",
      dueDate: "2024-09-30",
    },
  });

  // Three already-verified payments (one per method) plus two still-pending
  // submissions — the accounts console and statement reconciliation pages have
  // real data to work with as soon as the app starts.
  await prisma.payment.createMany({
    data: [
      { parentId: parent.id, studentId: ama.id, invoiceId: amaInvoice.id, category: "school_fees", amount: 1500, method: "momo", status: "verified", reference: "MOMO-9001", verifiedById: accountsUser?.id ?? null, verifiedAt: new Date("2024-09-05") },
      { parentId: parent.id, studentId: kofi.id, invoiceId: kofiInvoice.id, category: "school_fees", amount: 1500, method: "bank", status: "verified", reference: "BANK-7742", bankName: "Ecobank", depositorName: "Adwoa Mensah", depositDate: "2024-09-04", verifiedById: accountsUser?.id ?? null, verifiedAt: new Date("2024-09-05") },
      { parentId: parent.id, studentId: kofi.id, invoiceId: kofiInvoice.id, category: "feeding", amount: 600, method: "cash", status: "verified", reference: "CASH-3310", verifiedById: accountsUser?.id ?? null, verifiedAt: new Date("2024-09-06") },
      { parentId: parent.id, studentId: ama.id, category: "school_fees", amount: 500, method: "momo", status: "pending", reference: "MOMO-PENDING-77", note: "Paid via MTN MoMo, awaiting statement verification." },
    ],
  });
  const pendingBankDeposit = await prisma.payment.create({
    data: {
      parentId: parent.id,
      studentId: kofi.id,
      category: "feeding",
      amount: 200,
      method: "bank",
      status: "pending",
      reference: "BANK-PENDING-14",
      bankName: "Ecobank",
      depositorName: "Adwoa Mensah",
      depositDate: "2024-09-28",
    },
  });
  // A 1x1 transparent PNG stands in for a photographed deposit slip.
  const placeholderReceiptImage = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CII=",
    "base64",
  );
  const placeholderObjectKey = `payment-attachments/${pendingBankDeposit.id}`;
  await uploadObject(placeholderObjectKey, placeholderReceiptImage, "image/png");
  await prisma.paymentAttachment.create({
    data: {
      paymentId: pendingBankDeposit.id,
      fileName: "deposit-slip.png",
      mimeType: "image/png",
      objectKey: placeholderObjectKey,
    },
  });

  await prisma.transportTrip.create({
    data: {
      routeId: route.id,
      date: new Date().toISOString().slice(0, 10),
      direction: "morning",
      status: "on_route",
      lastUpdated: new Date().toISOString(),
      nextStop: "Adjiringanor",
    },
  });
  await prisma.transportAssignment.create({
    data: {
      studentId: ama.id,
      routeId: route.id,
      pickupPoint: "East Legon",
      dropOffPoint: "School",
      estimatedPickupTime: "06:45",
      estimatedDropOffTime: "07:20",
      feeStatus: "partially_paid",
    },
  });

  await prisma.documentAsset.createMany({
    data: [
      { title: "Admission Bill Breakdown", description: "Itemized bill for the new academic year.", category: "bill", audience: "parent", studentId: ama.id, downloadable: true, publishedAt: "2024-08-20" },
      { title: "Payment Receipt — MOMO-9001", description: "Receipt for school fees payment.", category: "receipt", audience: "parent", studentId: ama.id, downloadable: true, publishedAt: "2024-09-05" },
      { title: "Term 1 Feeding Menu", description: "Weekly breakfast and lunch menu.", category: "menu", audience: "all", downloadable: false, publishedAt: "2024-09-01" },
      { title: "School Calendar 2024/25", description: "Term dates and community events.", category: "calendar", audience: "all", downloadable: false, publishedAt: "2024-08-15" },
    ],
  });

  await prisma.notification.createMany({
    data: [
      { title: "Fees reminder", body: "Ama's Term 1 balance is GHS 1,000. Please complete payment by 30 September.", audience: "parent", userId: parentUser?.id ?? null, priority: "important" },
      { title: "PTA meeting", body: "End-of-term PTA meeting this Friday at 10:00am in the school hall.", audience: "all", priority: "normal" },
    ],
  });

  // --- Academics ---
  const course = await prisma.course.create({
    data: {
      classId: basic5.id,
      subjectId: "mathematics",
      subject: "Mathematics",
      title: "Basic 5 Mathematics",
      courseCode: "MATH-B5",
      teacher: "Ms. Adjoa Nyarko",
      term: "Term 1",
      description: "Number, operations, fractions and problem solving.",
      progress: 62,
    },
  });
  await prisma.courseModule.createMany({
    data: [
      {
        courseId: course.id,
        title: "Fractions",
        description: "Understanding and comparing fractions.",
        status: "published",
        position: 1,
        items: [
          { id: "m1i1", title: "Intro to fractions", type: "page", status: "completed" },
          { id: "m1i2", title: "Fractions worksheet", type: "assignment", status: "available", dueDate: "2024-10-10" },
        ],
      },
      {
        courseId: course.id,
        title: "Measurement",
        description: "Length, mass and capacity.",
        status: "published",
        position: 2,
        items: [{ id: "m2i1", title: "Measuring length", type: "page", status: "available" }],
      },
    ],
  });
  await prisma.assignmentRecord.createMany({
    data: [
      { classId: basic5.id, courseId: course.id, subject: "Mathematics", title: "Fractions worksheet", instructions: "Complete questions 1-10.", dueDate: "2024-10-10", totalStudents: 2, submittedCount: 1, status: "in_progress" },
      { classId: jhs2.id, subject: "English", title: "Composition: My community", dueDate: "2024-10-12", totalStudents: 1, submittedCount: 0, status: "not_started" },
    ],
  });
  await prisma.timetableEntry.createMany({
    data: [
      { classId: basic5.id, className: "Basic 5", subject: "Mathematics", teacher: "Ms. Adjoa Nyarko", room: "Room 5", day: "Monday", startTime: "08:00", endTime: "09:00" },
      { classId: basic5.id, className: "Basic 5", subject: "English", teacher: "Kwame Boateng", room: "Room 5", day: "Monday", startTime: "09:00", endTime: "10:00" },
      { classId: jhs2.id, className: "JHS 2", subject: "Integrated Science", teacher: "Esi Owusu", room: "Lab 1", day: "Tuesday", startTime: "10:00", endTime: "11:00" },
    ],
  });
  await prisma.resultRecord.createMany({
    data: [
      { studentId: ama.id, subject: "Mathematics", assessment: "Mid-term", score: 82, total: 100, gradedAt: "2024-09-25" },
      { studentId: ama.id, subject: "English", assessment: "Mid-term", score: 76, total: 100, gradedAt: "2024-09-26" },
      { studentId: kofi.id, subject: "Integrated Science", assessment: "Mid-term", score: 88, total: 100, gradedAt: "2024-09-25" },
    ],
  });
  await prisma.attendanceSummary.createMany({
    data: [
      { studentId: ama.id, term: "Term 1", present: 38, absent: 2, late: 1, percentage: 93 },
      { studentId: kofi.id, term: "Term 1", present: 40, absent: 0, late: 1, percentage: 98 },
    ],
  });
  await prisma.dailyAttendanceRecord.createMany({
    data: [
      { classId: basic5.id, studentId: ama.id, date: "2024-09-30", mark: "present" },
      { classId: jhs2.id, studentId: kofi.id, date: "2024-09-30", mark: "present" },
    ],
  });
  await prisma.gradebookEntry.createMany({
    data: [
      { classId: basic5.id, studentId: ama.id, subject: "Mathematics", assessment: "Quiz 1", score: 18, total: 20, status: "published" },
      { classId: basic5.id, studentId: ama.id, subject: "Mathematics", assessment: "Quiz 2", score: 16, total: 20, status: "draft" },
    ],
  });
  await prisma.learningResource.createMany({
    data: [
      { classId: basic5.id, courseId: course.id, subject: "Mathematics", title: "Fractions notes", fileName: "fractions.pdf", fileType: "pdf", sharedAt: "2024-09-20", status: "published" },
    ],
  });

  // --- Wallets ---
  await prisma.feedingBalance.createMany({
    data: [
      { studentId: ama.id, balance: 45, lastTopUpAt: "2024-09-28", status: "active" },
      { studentId: kofi.id, balance: 8, lastTopUpAt: "2024-09-20", status: "low_balance" },
    ],
  });
  await prisma.transportWalletBalance.createMany({
    data: [{ studentId: ama.id, balance: 120, lastTopUpAt: "2024-09-15", status: "active" }],
  });
  await prisma.walletTransaction.createMany({
    data: [
      { studentId: ama.id, wallet: "feeding", type: "credit", amount: 100, description: "Feeding top-up", reference: "WALLET-F-1001", occurredAt: "2024-09-28" },
      { studentId: ama.id, wallet: "feeding", type: "debit", amount: 15, description: "Lunch", reference: "WALLET-F-1002", occurredAt: "2024-09-29" },
      { studentId: ama.id, wallet: "transport", type: "credit", amount: 150, description: "Transport top-up", reference: "WALLET-T-2001", occurredAt: "2024-09-15" },
    ],
  });

  // --- Communication ---
  await prisma.announcement.createMany({
    data: [
      { title: "Reopening date", summary: "School reopens for Term 1 on 9 September.", publishedAt: "2024-08-20", audience: "all", priority: "important" },
      { title: "Sports day", summary: "Inter-house sports day scheduled for late October.", publishedAt: "2024-09-10", audience: "all", priority: "normal" },
    ],
  });
  await prisma.portalEventRecord.createMany({
    data: [
      { title: "PTA Meeting", date: "2024-10-04", time: "10:00", audience: "parent" },
      { title: "Mid-term break", date: "2024-10-21", audience: "all" },
      { title: "End of term exams", date: "2024-12-02", audience: "student" },
    ],
  });
  await prisma.transportNoticeRecord.createMany({
    data: [
      { title: "Route timing update", description: "East Legon Loop pickup moves 5 minutes earlier from Monday.", publishedAt: "2024-09-22", routeId: route.id },
      { title: "Holiday schedule", description: "No transport service during the mid-term break.", publishedAt: "2024-09-25" },
    ],
  });

  // --- Messages ---
  const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);

  async function seedConversation(
    subject: string,
    a: { id: string } | undefined,
    b: { id: string } | undefined,
    entries: ReadonlyArray<{
      from: { id: string } | undefined;
      body: string;
      day: number;
    }>,
  ): Promise<void> {
    if (!a || !b) return;
    const convo = await prisma.conversation.create({
      data: {
        subject,
        participants: { create: [{ userId: a.id }, { userId: b.id }] },
      },
    });
    for (const entry of entries) {
      if (!entry.from) continue;
      await prisma.message.create({
        data: {
          conversationId: convo.id,
          authorId: entry.from.id,
          body: entry.body,
          sentAt: daysAgo(entry.day),
        },
      });
    }
  }

  await seedConversation("Mathematics assignment feedback", staffUser, studentUser, [
    { from: staffUser, body: "Good progress on the fractions revision. Review my comment on question 4 and resubmit if you can.", day: 3 },
    { from: studentUser, body: "Thank you sir, I will look at question 4 again tonight.", day: 3 },
  ]);
  await seedConversation("Science club meeting", staffUser, studentUser, [
    { from: staffUser, body: "The next science club meeting moves to Thursday after school. Bring your project notes.", day: 6 },
  ]);
  await seedConversation("Ama's attendance this week", staffUser, parentUser, [
    { from: staffUser, body: "Good morning. Ama has been present every day this week and is settling in well after the break.", day: 2 },
    { from: parentUser, body: "Thank you for the update, that is reassuring to hear.", day: 2 },
  ]);
  await seedConversation("Term fees reminder", accountsUser, parentUser, [
    { from: accountsUser, body: "A gentle reminder that second-term fees are due by the end of the month. You can review balances under Fees.", day: 5 },
  ]);
  await seedConversation("Primary 6 lesson observation", adminUser, staffUser, [
    { from: adminUser, body: "Your lesson observation is scheduled for Wednesday morning. Please share your lesson plan beforehand.", day: 1 },
  ]);
  await seedConversation("Staff meeting agenda", accountsUser, adminUser, [
    { from: accountsUser, body: "Please add the term fee-collection review to Friday's staff meeting agenda.", day: 1 },
  ]);
  await seedConversation("Invoice query from a parent", parentUser, accountsUser, [
    { from: parentUser, body: "Can you confirm the feeding charge on this term's invoice? It looks higher than last term.", day: 2 },
  ]);
  await seedConversation("Route 2 morning delay", adminUser, transportUser, [
    { from: adminUser, body: "Please note the Route 2 bus is running about 10 minutes late this morning. Update families if needed.", day: 1 },
  ]);

  // --- Public website CMS (mirrors the web app's static seed content) ------
  await prisma.newsArticlePost.createMany({
    data: [
      {
        slug: "school-reopens",
        title: "School Reopens",
        excerpt:
          "A new term begins with renewed focus, warm welcomes and important information for every family.",
        category: "Updates",
        icon: "newspaper",
        publishedLabel: "School Notice",
        imageDescription:
          "Placeholder for an approved photograph of pupils returning to school at the start of a term.",
        body: [
          {
            paragraphs: [
              "Divine International School welcomes families and learners into a new term with renewed focus on academic excellence, discipline and character development.",
              "Families should continue to follow official school communication for confirmed reopening details, class expectations and any required preparation.",
            ],
          },
          {
            heading: "What families can expect",
            paragraphs: [
              "The opening period helps pupils settle into routines, reconnect with teachers and understand expectations for learning and participation.",
              "Admissions and administration updates will be shared through the school's approved communication channels.",
            ],
          },
        ],
        status: "published",
        publishedAt: new Date(),
      },
      {
        slug: "family-progress-meetings",
        title: "Family Progress Meetings",
        excerpt:
          "Progress conversations help families and teachers discuss learner strengths, support needs and next steps.",
        category: "Families",
        icon: "users",
        publishedLabel: "Calendar Update",
        imageDescription:
          "Placeholder for an approved photograph representing a family progress conversation with a teacher.",
        body: [
          {
            paragraphs: [
              "Family progress meetings are part of the school's commitment to clear communication between home and school.",
              "These conversations give families an opportunity to understand learner progress, celebrate effort and discuss areas where support may be helpful.",
            ],
          },
        ],
        status: "published",
        publishedAt: new Date(),
      },
      {
        slug: "co-curricular-showcase",
        title: "Co-curricular Showcase",
        excerpt:
          "A school community showcase highlights pupil participation in sport, clubs, creativity and service.",
        category: "Student Life",
        icon: "trophy",
        publishedLabel: "Event Highlight",
        imageDescription:
          "Placeholder for an approved photograph of pupils participating in co-curricular activities.",
        body: [
          {
            paragraphs: [
              "Co-curricular learning gives pupils space to explore interests, practise teamwork and build confidence beyond classroom lessons.",
              "The showcase celebrates participation across sport, clubs, creative expression and age-appropriate leadership opportunities.",
            ],
          },
        ],
        status: "published",
        publishedAt: new Date(),
      },
    ],
  });

  await prisma.eventPost.createMany({
    data: [
      { title: "Career Day", dateLabel: "School activity programme", description: "A practical opportunity for pupils to learn about professions and imagine future pathways.", icon: "briefcase", featured: true, status: "published", position: 0 },
      { title: "Colour Day", dateLabel: "School celebration", description: "A colourful community activity that encourages participation, creativity and shared enjoyment.", icon: "palette", status: "published", position: 1 },
      { title: "School Competitions", dateLabel: "Activity programme", description: "Team activities give pupils opportunities to participate, cooperate and practise healthy competition.", icon: "trophy", status: "published", position: 2 },
      { title: "Educational Excursions", dateLabel: "Learning beyond the classroom", description: "Supervised visits connect classroom learning with community spaces and practical experience.", icon: "compass", status: "published", position: 3 },
      { title: "Graduation Celebration", dateLabel: "School milestone", description: "The school community recognises learner progress and celebrates an important transition.", icon: "graduation-cap", status: "published", position: 4 },
    ],
  });

  await prisma.calendarTermPost.createMany({
    data: [
      { name: "Term One", period: "Opening term", description: "Learners settle into routines, establish goals and begin the year's core programme.", highlights: ["Orientation and learning routines", "Baseline and continuous assessment", "Family progress communication"], status: "published", position: 0 },
      { name: "Term Two", period: "Development term", description: "Teaching builds on established foundations through deeper practice, projects and school activities.", highlights: ["Curriculum development and projects", "Co-curricular participation", "Mid-year progress review"], status: "published", position: 1 },
      { name: "Term Three", period: "Completion term", description: "Learners consolidate key outcomes, demonstrate progress and prepare for transition.", highlights: ["Consolidation and revision", "End-of-year assessment", "Transition and celebration"], status: "published", position: 2 },
    ],
  });

  console.log(
    `Seeded ${accounts.length} accounts + full domain data (people, finance, transport, documents, academics, wallets, communication, messages, public CMS). Dev password: ${devPassword}`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
