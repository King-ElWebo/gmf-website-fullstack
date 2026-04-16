import { Prisma, PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const expectedScalarFieldsByModel: Record<string, string[]> = {
  Category: ["sortOrder", "catalogTypeId"],
  Item: [
    "sortOrder",
    "categoryId",
    "priceType",
    "basePriceCents",
    "priceLabel",
    "shortDescription",
    "longDescription",
    "videoUrl",
    "depositRequired",
    "depositLabel",
    "depositInfo",
    "cleaningFeeApplies",
    "cleaningFeeLabel",
    "cleaningFeeInfo",
    "dryingFeeApplies",
    "dryingFeeLabel",
    "dryingFeeInfo",
    "additionalCostsInfo",
    "deliveryAvailable",
    "pickupAvailable",
    "requiresDeliveryAddress",
    "deliveryInfo",
    "usageInfo",
    "rentalNotes",
    "setupRequirements",
    "accessRequirements",
  ],
  Faq: ["sortOrder"],
  ItemImage: ["sortOrder"],
  SiteSettings: ["key", "phone", "email", "address", "openingHours", "noticeText", "heroTitle", "heroText", "additionalInfo"],
  SiteSocialLink: ["settingsId", "platform", "url", "sortOrder", "isActive"],
};

function toDelegateName(modelName: string) {
  return modelName.charAt(0).toLowerCase() + modelName.slice(1);
}

function getRuntimeFieldNames(client: PrismaClient, modelName: Prisma.ModelName) {
  const runtimeClient = client as unknown as {
    _runtimeDataModel?: {
      models?: Record<string, { fields?: Array<{ name?: string }> }>;
    };
  };

  const model = runtimeClient._runtimeDataModel?.models?.[modelName];
  return new Set((model?.fields ?? []).map((field) => field.name).filter(Boolean));
}

function hasExpectedClientShape(client: PrismaClient) {
  const clientRecord = client as unknown as Record<string, unknown>;

  return Object.values(Prisma.ModelName).every((modelName) => {
    const delegateName = toDelegateName(modelName);
    if (typeof clientRecord[delegateName] === "undefined") {
      return false;
    }

    const expectedFields = expectedScalarFieldsByModel[modelName];
    if (!expectedFields || expectedFields.length === 0) {
      return true;
    }

    const runtimeFields = getRuntimeFieldNames(client, modelName);
    return expectedFields.every((fieldName) => runtimeFields.has(fieldName));
  });
}

function createPrismaClient() {
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

const existingClient = globalForPrisma.prisma;

if (existingClient && !hasExpectedClientShape(existingClient)) {
  void existingClient.$disconnect().catch(() => undefined);
  globalForPrisma.prisma = undefined;
}

export const db = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db; // Trigger refresh
