import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export async function listResources() {
  return await db.resource.findMany({
    orderBy: {
      name: "asc",
    },
  });
}

export async function getResourceById(id: string) {
  return await db.resource.findUnique({
    where: { id },
  });
}
