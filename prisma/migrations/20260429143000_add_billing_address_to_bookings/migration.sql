-- Ensure the booking tables used by the request flow exist in fresh databases.
-- Existing installations keep their current data; missing columns for billing are added below.
CREATE TABLE IF NOT EXISTS "Booking" (
    "id" TEXT NOT NULL,
    "referenceCode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'requested',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "deliveryType" TEXT NOT NULL,
    "customerMessage" TEXT,
    "billingAddressSameAsDelivery" BOOLEAN NOT NULL DEFAULT true,
    "billingAddress" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BookingCustomer" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "addressLine1" TEXT,
    "zip" TEXT,
    "city" TEXT,

    CONSTRAINT "BookingCustomer_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BookingItem" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "resourceTitle" TEXT,
    "priceType" TEXT,
    "basePriceCents" INTEGER,
    "priceLabel" TEXT,
    "displayPrice" TEXT,
    "pricingMode" TEXT,
    "pricingReason" TEXT,
    "bookingDays" INTEGER,
    "calculatedUnitPriceCents" INTEGER,
    "calculatedTotalPriceCents" INTEGER,

    CONSTRAINT "BookingItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "InternalNote" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InternalNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CalendarSyncRecord" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "externalEventId" TEXT,
    "syncStatus" TEXT NOT NULL DEFAULT 'pending',
    "lastSyncedAt" TIMESTAMP(3),
    "syncError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CalendarSyncRecord_pkey" PRIMARY KEY ("id")
);

ALTER TABLE IF EXISTS "Booking"
ADD COLUMN IF NOT EXISTS "billingAddressSameAsDelivery" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "billingAddress" JSONB;

CREATE UNIQUE INDEX IF NOT EXISTS "Booking_referenceCode_key" ON "Booking"("referenceCode");
CREATE INDEX IF NOT EXISTS "Booking_status_idx" ON "Booking"("status");
CREATE INDEX IF NOT EXISTS "Booking_startDate_endDate_idx" ON "Booking"("startDate", "endDate");
CREATE UNIQUE INDEX IF NOT EXISTS "BookingCustomer_bookingId_key" ON "BookingCustomer"("bookingId");
CREATE INDEX IF NOT EXISTS "BookingCustomer_email_idx" ON "BookingCustomer"("email");
CREATE INDEX IF NOT EXISTS "BookingItem_bookingId_idx" ON "BookingItem"("bookingId");
CREATE INDEX IF NOT EXISTS "BookingItem_itemId_idx" ON "BookingItem"("itemId");
CREATE INDEX IF NOT EXISTS "InternalNote_bookingId_idx" ON "InternalNote"("bookingId");
CREATE UNIQUE INDEX IF NOT EXISTS "CalendarSyncRecord_bookingId_key" ON "CalendarSyncRecord"("bookingId");
CREATE INDEX IF NOT EXISTS "CalendarSyncRecord_syncStatus_idx" ON "CalendarSyncRecord"("syncStatus");

DO $$
BEGIN
    ALTER TABLE "BookingCustomer"
    ADD CONSTRAINT "BookingCustomer_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "BookingItem"
    ADD CONSTRAINT "BookingItem_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "BookingItem"
    ADD CONSTRAINT "BookingItem_itemId_fkey"
    FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "InternalNote"
    ADD CONSTRAINT "InternalNote_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    ALTER TABLE "CalendarSyncRecord"
    ADD CONSTRAINT "CalendarSyncRecord_bookingId_fkey"
    FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;
