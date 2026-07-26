-- CreateTable
CREATE TABLE "statement_imports" (
    "id" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "importedById" TEXT NOT NULL,
    "importedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rowCount" INTEGER NOT NULL,
    "matchedCount" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "statement_imports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statement_transactions" (
    "id" TEXT NOT NULL,
    "importId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "date" TEXT NOT NULL,
    "reference" TEXT,
    "counterpartyName" TEXT,
    "raw" JSONB NOT NULL,
    "matchedPaymentId" TEXT,
    "matchType" TEXT,
    "matchConfidence" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "statement_transactions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "statement_transactions_importId_idx" ON "statement_transactions"("importId");

-- AddForeignKey
ALTER TABLE "statement_transactions" ADD CONSTRAINT "statement_transactions_importId_fkey" FOREIGN KEY ("importId") REFERENCES "statement_imports"("id") ON DELETE CASCADE ON UPDATE CASCADE;
