/*
  Warnings:

  - You are about to drop the column `data` on the `payment_attachments` table. All the data in the column will be lost.
  - Added the required column `objectKey` to the `payment_attachments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payment_attachments" DROP COLUMN "data",
ADD COLUMN     "objectKey" TEXT NOT NULL;
