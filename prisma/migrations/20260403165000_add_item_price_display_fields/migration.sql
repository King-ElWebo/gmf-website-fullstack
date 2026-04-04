-- CreateEnum
CREATE TYPE "ItemPriceType" AS ENUM ('FIXED', 'ON_REQUEST', 'FROM_PRICE');

-- AlterTable
ALTER TABLE "Item"
ADD COLUMN "priceType" "ItemPriceType" NOT NULL DEFAULT 'FIXED',
ADD COLUMN "basePriceCents" INTEGER,
ADD COLUMN "priceLabel" TEXT;

-- Backfill legacy prices into the new base-price field
UPDATE "Item"
SET "basePriceCents" = "priceCents"
WHERE "priceCents" IS NOT NULL AND "basePriceCents" IS NULL;
