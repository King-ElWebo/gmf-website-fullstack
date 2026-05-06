-- AlterTable
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "hasIndividualPricing" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Booking" ADD COLUMN IF NOT EXISTS "totalPriceCents" INTEGER;
ALTER TABLE "Booking" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "CalendarSyncRecord" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- AlterTable
ALTER TABLE "CatalogType" ADD COLUMN IF NOT EXISTS "isDefault" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "CatalogType" ADD COLUMN IF NOT EXISTS "navLabel" TEXT;
ALTER TABLE "CatalogType" ADD COLUMN IF NOT EXISTS "showInNav" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "description" TEXT;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "imageKey" TEXT;
ALTER TABLE "Category" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN IF NOT EXISTS "totalStock" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "Item" ADD COLUMN IF NOT EXISTS "trackInventory" BOOLEAN NOT NULL DEFAULT true;

-- CreateTable
CREATE TABLE IF NOT EXISTS "GlobalImage" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "alt" TEXT,
    "area" TEXT NOT NULL DEFAULT 'OTHER',
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GlobalImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "Faq" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Faq_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "GlobalImage_sortOrder_idx" ON "GlobalImage"("sortOrder");
CREATE INDEX IF NOT EXISTS "GlobalImage_area_published_idx" ON "GlobalImage"("area", "published");
CREATE INDEX IF NOT EXISTS "Faq_sortOrder_idx" ON "Faq"("sortOrder");
