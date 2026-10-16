-- CreateTable
CREATE TABLE "photo_albums" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "occasionLabel" TEXT NOT NULL DEFAULT '',
    "albumUrl" TEXT NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'google_photos',
    "imageId" TEXT,
    "imageObjectKey" TEXT,
    "imageAlt" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "position" INTEGER NOT NULL DEFAULT 0,
    "authorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "photo_albums_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "photo_albums_status_idx" ON "photo_albums"("status");

