-- AlterTable
ALTER TABLE "Category" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Item" ADD COLUMN "sortOrder" INTEGER NOT NULL DEFAULT 0;

-- Backfill deterministic order for existing records
WITH ordered_categories AS (
    SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC) - 1 AS position
    FROM "Category"
)
UPDATE "Category"
SET "sortOrder" = ordered_categories.position
FROM ordered_categories
WHERE "Category"."id" = ordered_categories."id";

WITH ordered_items AS (
    SELECT "id", ROW_NUMBER() OVER (ORDER BY "createdAt" ASC, "id" ASC) - 1 AS position
    FROM "Item"
)
UPDATE "Item"
SET "sortOrder" = ordered_items.position
FROM ordered_items
WHERE "Item"."id" = ordered_items."id";

-- CreateIndex
CREATE INDEX "Category_sortOrder_idx" ON "Category"("sortOrder");

-- CreateIndex
CREATE INDEX "Item_sortOrder_idx" ON "Item"("sortOrder");
