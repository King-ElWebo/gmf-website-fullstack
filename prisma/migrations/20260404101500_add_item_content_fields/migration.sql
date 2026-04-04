-- AlterTable
ALTER TABLE "Item"
ADD COLUMN "shortDescription" TEXT,
ADD COLUMN "longDescription" TEXT,
ADD COLUMN "videoUrl" TEXT,
ADD COLUMN "depositRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "depositLabel" TEXT,
ADD COLUMN "depositInfo" TEXT,
ADD COLUMN "cleaningFeeApplies" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "cleaningFeeLabel" TEXT,
ADD COLUMN "cleaningFeeInfo" TEXT,
ADD COLUMN "dryingFeeApplies" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "dryingFeeLabel" TEXT,
ADD COLUMN "dryingFeeInfo" TEXT,
ADD COLUMN "additionalCostsInfo" TEXT,
ADD COLUMN "deliveryAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "pickupAvailable" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "requiresDeliveryAddress" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "deliveryInfo" TEXT,
ADD COLUMN "usageInfo" TEXT,
ADD COLUMN "rentalNotes" TEXT,
ADD COLUMN "setupRequirements" TEXT,
ADD COLUMN "accessRequirements" TEXT;

-- Preserve existing description content for the new detail field
UPDATE "Item"
SET "longDescription" = "description"
WHERE "description" IS NOT NULL
  AND "longDescription" IS NULL;
