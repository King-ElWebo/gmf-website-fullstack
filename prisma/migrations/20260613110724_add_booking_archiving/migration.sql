-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "archiveReason" TEXT,
ADD COLUMN     "archivedAt" TIMESTAMP(3),
ADD COLUMN     "archivedBy" TEXT;

-- CreateIndex
CREATE INDEX "Booking_archivedAt_idx" ON "Booking"("archivedAt");
