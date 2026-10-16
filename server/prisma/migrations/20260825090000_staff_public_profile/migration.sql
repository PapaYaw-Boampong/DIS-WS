-- AlterTable
ALTER TABLE "staff" ADD COLUMN     "showOnWebsite" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "websitePosition" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "publicTitle" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "publicRole" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "publicBio" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "publicIcon" TEXT NOT NULL DEFAULT 'user-round',
ADD COLUMN     "imageId" TEXT,
ADD COLUMN     "imageObjectKey" TEXT,
ADD COLUMN     "imageAlt" TEXT;

-- CreateIndex
CREATE INDEX "staff_showOnWebsite_idx" ON "staff"("showOnWebsite");
