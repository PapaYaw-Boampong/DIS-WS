-- CreateTable
CREATE TABLE "notification_reads" (
    "id" TEXT NOT NULL,
    "notificationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_reads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_reads_userId_idx" ON "notification_reads"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "notification_reads_notificationId_userId_key" ON "notification_reads"("notificationId", "userId");
