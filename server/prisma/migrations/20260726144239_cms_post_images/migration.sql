-- AlterTable
ALTER TABLE "event_posts" ADD COLUMN     "imageAlt" TEXT,
ADD COLUMN     "imageId" TEXT,
ADD COLUMN     "imageObjectKey" TEXT;

-- AlterTable
ALTER TABLE "news_posts" ADD COLUMN     "imageAlt" TEXT,
ADD COLUMN     "imageId" TEXT,
ADD COLUMN     "imageObjectKey" TEXT;
