-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "bankName" TEXT,
ADD COLUMN     "depositDate" TEXT,
ADD COLUMN     "depositorName" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "ocrData" JSONB,
ADD COLUMN     "receiptDocumentId" TEXT,
ADD COLUMN     "rejectionReason" TEXT,
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "verifiedById" TEXT,
ALTER COLUMN "status" SET DEFAULT 'pending';

-- CreateTable
CREATE TABLE "payment_attachments" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "data" BYTEA NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payment_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payment_attachments_paymentId_key" ON "payment_attachments"("paymentId");

-- CreateIndex
CREATE INDEX "payments_status_idx" ON "payments"("status");

-- AddForeignKey
ALTER TABLE "payment_attachments" ADD CONSTRAINT "payment_attachments_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
