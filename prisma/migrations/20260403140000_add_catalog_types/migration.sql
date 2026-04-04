-- CreateTable
CREATE TABLE "CatalogType" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CatalogType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CatalogType_slug_key" ON "CatalogType"("slug");

-- CreateIndex
CREATE INDEX "CatalogType_isActive_sortOrder_idx" ON "CatalogType"("isActive", "sortOrder");

-- AlterTable
ALTER TABLE "Category" ADD COLUMN "catalogTypeId" TEXT;

-- Backfill
INSERT INTO "CatalogType" ("id", "name", "slug", "description", "sortOrder", "isActive", "createdAt", "updatedAt")
VALUES (
    'default_catalog_type',
    'Standard',
    'standard',
    'Automatisch angelegt, um bestehende Kategorien einem generischen Typ zuzuordnen.',
    0,
    true,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;

UPDATE "Category"
SET "catalogTypeId" = (
    SELECT "id"
    FROM "CatalogType"
    WHERE "slug" = 'standard'
    LIMIT 1
)
WHERE "catalogTypeId" IS NULL;

-- AlterTable
ALTER TABLE "Category" ALTER COLUMN "catalogTypeId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Category_catalogTypeId_idx" ON "Category"("catalogTypeId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_catalogTypeId_fkey" FOREIGN KEY ("catalogTypeId") REFERENCES "CatalogType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
