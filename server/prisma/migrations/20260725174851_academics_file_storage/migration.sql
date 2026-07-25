-- AlterTable
ALTER TABLE "learning_resources" ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "objectKey" TEXT;

-- CreateTable
CREATE TABLE "assignment_submissions" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL DEFAULT 'submitted',

    CONSTRAINT "assignment_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "assignment_submissions_assignmentId_idx" ON "assignment_submissions"("assignmentId");

-- CreateIndex
CREATE UNIQUE INDEX "assignment_submissions_assignmentId_studentId_key" ON "assignment_submissions"("assignmentId", "studentId");
