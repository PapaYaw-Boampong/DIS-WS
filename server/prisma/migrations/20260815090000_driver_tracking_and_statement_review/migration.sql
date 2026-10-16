-- AlterTable
ALTER TABLE "statement_imports" ADD COLUMN     "reviewCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "source" TEXT NOT NULL DEFAULT 'csv';

-- AlterTable
ALTER TABLE "statement_transactions" ADD COLUMN     "createdPaymentId" TEXT,
ADD COLUMN     "matchedStudentId" TEXT,
ADD COLUMN     "reviewedAt" TIMESTAMP(3),
ADD COLUMN     "reviewedById" TEXT,
ADD COLUMN     "sourceText" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'unmatched';

-- AlterTable
ALTER TABLE "transport_routes" ADD COLUMN     "driverUserId" TEXT;

-- AlterTable
ALTER TABLE "transport_trips" ADD COLUMN     "accuracyM" DOUBLE PRECISION,
ADD COLUMN     "positionById" TEXT;

-- DropTable
DROP TABLE "transport_devices";

-- CreateIndex
CREATE INDEX "statement_transactions_status_idx" ON "statement_transactions"("status");

-- CreateIndex
CREATE INDEX "statement_transactions_matchedStudentId_idx" ON "statement_transactions"("matchedStudentId");

