import { AdminCalendarClient } from "./_components/AdminCalendarClient";
import { getRangeForView, toDateKey } from "@/lib/calendar/date-utils";
import {
  getAdminCalendarFeed,
  getCalendarCategoryOptions,
  getCalendarResourceOptions,
} from "@/lib/calendar/service";

export const dynamic = "force-dynamic";

export default async function AdminCalendarPage() {
  const initialAnchorDate = toDateKey(new Date());
  const initialRange = getRangeForView("month", initialAnchorDate);

  const [initialFeed, items, categories] = await Promise.all([
    getAdminCalendarFeed({
      from: initialRange.from,
      to: initialRange.to,
    }),
    getCalendarResourceOptions(),
    getCalendarCategoryOptions(),
  ]);

  return (
    <AdminCalendarClient
      initialFeed={initialFeed}
      items={items}
      categories={categories}
      initialAnchorDate={initialAnchorDate}
    />
  );
}
