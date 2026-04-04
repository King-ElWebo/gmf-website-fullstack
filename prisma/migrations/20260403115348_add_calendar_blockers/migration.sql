-- CreateTable
CREATE TABLE "CalendarBlocker" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'blocked',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "appliesToAllItems" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "contactName" TEXT,
    "source" TEXT NOT NULL DEFAULT 'manual',
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarBlocker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CalendarBlockerItem" (
    "id" TEXT NOT NULL,
    "blockerId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,

    CONSTRAINT "CalendarBlockerItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CalendarBlocker_startDate_endDate_idx" ON "CalendarBlocker"("startDate", "endDate");

-- CreateIndex
CREATE INDEX "CalendarBlocker_status_idx" ON "CalendarBlocker"("status");

-- CreateIndex
CREATE INDEX "CalendarBlockerItem_itemId_idx" ON "CalendarBlockerItem"("itemId");

-- CreateIndex
CREATE UNIQUE INDEX "CalendarBlockerItem_blockerId_itemId_key" ON "CalendarBlockerItem"("blockerId", "itemId");

-- AddForeignKey
ALTER TABLE "CalendarBlockerItem" ADD CONSTRAINT "CalendarBlockerItem_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "CalendarBlocker"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarBlockerItem" ADD CONSTRAINT "CalendarBlockerItem_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;
