-- CreateEnum
CREATE TYPE "AvailabilityMode" AS ENUM ('STOCK_ONLY', 'STOCK_AND_RESOURCE', 'EXCLUSIVE_RESOURCE');

-- CreateEnum
CREATE TYPE "ResourceAppliesTo" AS ENUM ('DELIVERY_ONLY', 'PICKUP_ONLY', 'BOTH');

-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "availabilityMode" "AvailabilityMode" NOT NULL DEFAULT 'STOCK_ONLY',
ADD COLUMN     "resourceAppliesTo" "ResourceAppliesTo" NOT NULL DEFAULT 'BOTH',
ADD COLUMN     "resourceId" TEXT,
ADD COLUMN     "resourceUnits" INTEGER NOT NULL DEFAULT 1;

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "capacityPerDay" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Resource_slug_key" ON "Resource"("slug");

-- AddForeignKey
ALTER TABLE "Item" ADD CONSTRAINT "Item_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;
