import "dotenv/config";
import { POST } from "../src/app/api/public/availability/dates/route";
import { db } from "../src/lib/db";

async function run() {
  console.log("Testing Availability Dates API...");
  
  const resourceId = "cmossle59000e14ildhusuod2";
  
  // Helper to call the POST handler
  const callApi = async (resourceIds: string[], monthStart: string, monthEnd: string) => {
    const payload = { resourceIds, monthStart, monthEnd };
    const req = new Request("http://localhost/api/public/availability/dates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const res = await POST(req);
    const body = await res.json();
    return body;
  };

  try {
    // 1. Test with approved booking (May 5th to May 6th)
    console.log("\n--- Case 1: Fetching dates for approved booking ---");
    const result1 = await callApi([resourceId], "2026-05-01", "2026-05-31");
    console.log("Result:", result1);
    const expectedDates = ["2026-05-05", "2026-05-06"];
    const pass1 = expectedDates.every(d => result1.unavailableDates.includes(d));
    console.log(`Passed Case 1? ${pass1 ? "YES" : "NO"} (Expected to contain May 5 and May 6)`);

    // 2. Test with another item that has no bookings
    console.log("\n--- Case 2: Fetching dates for non-booked resource ---");
    const result2 = await callApi(["non-existent-item"], "2026-05-01", "2026-05-31");
    console.log("Result:", result2);
    const pass2 = result2.unavailableDates.length === 0;
    console.log(`Passed Case 2? ${pass2 ? "YES" : "NO"} (Expected empty)`);

    // 3. Temporarily change booking status to 'requested' and test
    console.log("\n--- Case 3: Testing that 'requested' bookings do NOT block ---");
    // Update cmoswyvbv0000f4il49oj15md to 'requested'
    await db.booking.update({
      where: { id: "cmoswyvbv0000f4il49oj15md" },
      data: { status: "requested" },
    });
    
    const result3 = await callApi([resourceId], "2026-05-01", "2026-05-31");
    console.log("Result:", result3);
    const pass3 = !result3.unavailableDates.includes("2026-05-05") && !result3.unavailableDates.includes("2026-05-06");
    console.log(`Passed Case 3? ${pass3 ? "YES" : "NO"} (Expected NOT to contain May 5 and May 6)`);

    // Restore to approved
    await db.booking.update({
      where: { id: "cmoswyvbv0000f4il49oj15md" },
      data: { status: "approved" },
    });
    console.log("Restored booking status back to 'approved'.");

  } catch (error) {
    console.error("Test failed with error:", error);
  } finally {
    await db.$disconnect();
  }
}

run();
