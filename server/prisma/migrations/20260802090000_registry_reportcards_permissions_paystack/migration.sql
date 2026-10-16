-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Role" ADD VALUE 'REGISTRY';
ALTER TYPE "Role" ADD VALUE 'DEVELOPER';

-- AlterTable
ALTER TABLE "parents" ADD COLUMN     "address" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "alternatePhone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "idNumber" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "idType" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "occupation" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "relationship" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "provider" TEXT,
ADD COLUMN     "providerChannel" TEXT,
ADD COLUMN     "providerFee" INTEGER,
ADD COLUMN     "providerMessage" TEXT,
ADD COLUMN     "providerPaidAt" TIMESTAMP(3),
ADD COLUMN     "providerReference" TEXT;

-- AlterTable
ALTER TABLE "staff" ADD COLUMN     "address" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "department" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "email" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "employmentType" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "phone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "qualification" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "startDate" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "students" ADD COLUMN     "address" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "admissionDate" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "dateOfBirth" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "emergencyContactName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "emergencyContactPhone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "gender" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "guardianEmail" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "guardianName" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "guardianPhone" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "guardianRelationship" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "medicalNotes" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "previousSchool" TEXT NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "student_promotions" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "fromClassId" TEXT,
    "toClassId" TEXT,
    "outcome" TEXT NOT NULL,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "student_promotions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "report_cards" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "classId" TEXT,
    "className" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "publishedAt" TEXT,
    "overallTotal" INTEGER NOT NULL DEFAULT 0,
    "overallPercentage" INTEGER NOT NULL DEFAULT 0,
    "positionInClass" INTEGER,
    "classSize" INTEGER,
    "attendancePresent" INTEGER NOT NULL DEFAULT 0,
    "attendanceTotal" INTEGER NOT NULL DEFAULT 0,
    "subjects" JSONB NOT NULL,
    "classTeacher" TEXT NOT NULL DEFAULT '',
    "classTeacherRemark" TEXT NOT NULL DEFAULT '',
    "headTeacherRemark" TEXT NOT NULL DEFAULT '',
    "nextTermBegins" TEXT,
    "publishedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "report_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "role_capabilities" (
    "role" TEXT NOT NULL,
    "capabilities" TEXT[],
    "updatedById" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "role_capabilities_pkey" PRIMARY KEY ("role")
);

-- CreateIndex
CREATE INDEX "student_promotions_academicYear_idx" ON "student_promotions"("academicYear");

-- CreateIndex
CREATE UNIQUE INDEX "student_promotions_studentId_academicYear_key" ON "student_promotions"("studentId", "academicYear");

-- CreateIndex
CREATE INDEX "report_cards_classId_academicYear_term_idx" ON "report_cards"("classId", "academicYear", "term");

-- CreateIndex
CREATE INDEX "report_cards_status_idx" ON "report_cards"("status");

-- CreateIndex
CREATE UNIQUE INDEX "report_cards_studentId_academicYear_term_key" ON "report_cards"("studentId", "academicYear", "term");

-- CreateIndex
CREATE UNIQUE INDEX "payments_providerReference_key" ON "payments"("providerReference");

-- CreateIndex
CREATE INDEX "payments_provider_providerReference_idx" ON "payments"("provider", "providerReference");

-- CreateIndex
CREATE INDEX "students_classId_idx" ON "students"("classId");

