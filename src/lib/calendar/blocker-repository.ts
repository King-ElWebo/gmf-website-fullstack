import { db } from "@/lib/db";

export class PrismaCalendarBlockerRepository {
  async findOverlapping(resourceId: string, start: Date, end: Date) {
    return db.calendarBlocker.findMany({
      where: {
        startDate: { lt: end },
        endDate: { gt: start },
        OR: [
          { appliesToAllItems: true },
          {
            items: {
              some: {
                itemId: resourceId,
              },
            },
          },
        ],
      },
      include: {
        items: true,
      },
      orderBy: { startDate: "asc" },
    });
  }
}
