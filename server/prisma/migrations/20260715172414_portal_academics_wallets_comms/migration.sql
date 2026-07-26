-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "teacher" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course_modules" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'published',
    "position" INTEGER NOT NULL DEFAULT 0,
    "items" JSONB NOT NULL,

    CONSTRAINT "course_modules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignments" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "courseId" TEXT,
    "subject" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instructions" TEXT,
    "dueDate" TEXT NOT NULL,
    "totalStudents" INTEGER,
    "submittedCount" INTEGER,
    "status" TEXT NOT NULL,

    CONSTRAINT "assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "timetable_entries" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "className" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "teacher" TEXT NOT NULL,
    "room" TEXT NOT NULL,
    "day" TEXT NOT NULL,
    "startTime" TEXT NOT NULL,
    "endTime" TEXT NOT NULL,

    CONSTRAINT "timetable_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "results" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "assessment" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "gradedAt" TEXT NOT NULL,

    CONSTRAINT "results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendance_summaries" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "present" INTEGER NOT NULL,
    "absent" INTEGER NOT NULL,
    "late" INTEGER NOT NULL,
    "percentage" INTEGER NOT NULL,

    CONSTRAINT "attendance_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_attendance" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "mark" TEXT NOT NULL,
    "note" TEXT,

    CONSTRAINT "daily_attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gradebook_entries" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "assessment" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "total" INTEGER NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "gradebook_entries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learning_resources" (
    "id" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "courseId" TEXT,
    "subject" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "sharedAt" TEXT NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "learning_resources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "feeding_balances" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL,
    "lastTopUpAt" TEXT,
    "status" TEXT NOT NULL,

    CONSTRAINT "feeding_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_wallet_balances" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "balance" INTEGER NOT NULL,
    "lastTopUpAt" TEXT,
    "status" TEXT NOT NULL,

    CONSTRAINT "transport_wallet_balances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "wallet" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "occurredAt" TEXT NOT NULL,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "announcements" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "publishedAt" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "priority" TEXT NOT NULL,

    CONSTRAINT "announcements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT,
    "audience" TEXT NOT NULL,

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transport_notices" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "publishedAt" TEXT NOT NULL,
    "routeId" TEXT,

    CONSTRAINT "transport_notices_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "course_modules_courseId_idx" ON "course_modules"("courseId");

-- CreateIndex
CREATE INDEX "results_studentId_idx" ON "results"("studentId");

-- CreateIndex
CREATE INDEX "attendance_summaries_studentId_idx" ON "attendance_summaries"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "feeding_balances_studentId_key" ON "feeding_balances"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "transport_wallet_balances_studentId_key" ON "transport_wallet_balances"("studentId");

-- CreateIndex
CREATE INDEX "wallet_transactions_studentId_idx" ON "wallet_transactions"("studentId");
