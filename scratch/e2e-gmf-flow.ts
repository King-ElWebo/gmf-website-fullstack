import "dotenv/config";

type Check = {
  name: string;
  ok: boolean;
  details?: unknown;
};

type TestProduct = {
  id: string;
  title: string;
  slug: string;
  priceType: string;
  basePriceCents: number | null;
  priceLabel: string | null;
  deliveryAvailable: boolean;
  pickupAvailable: boolean;
  category: { name: string; catalogType: { name: string; slug: string } };
  images: Array<{ url: string; alt: string | null }>;
};

const baseUrl = process.env.APP_URL || "http://localhost:3000";
const checks: Check[] = [];

function record(name: string, ok: boolean, details?: unknown) {
  checks.push({ name, ok, details });
  const marker = ok ? "PASS" : "FAIL";
  console.log(`${marker} ${name}${details == null ? "" : ` ${JSON.stringify(details)}`}`);
}

function assertCheck(name: string, condition: unknown, details?: unknown) {
  record(name, Boolean(condition), details);
  if (!condition) {
    throw new Error(`Check failed: ${name}`);
  }
}

async function getDb() {
  const mod: any = await import("../src/lib/db");
  return mod.db || mod.default?.db || mod["module.exports"]?.db;
}

async function fetchText(path: string, init?: RequestInit & { cookie?: string }) {
  const headers = new Headers(init?.headers);
  if (init?.cookie) headers.set("cookie", init.cookie);
  const res = await fetch(`${baseUrl}${path}`, { ...init, headers, redirect: "manual" });
  const text = await res.text();
  return { res, text };
}

async function fetchJson(path: string, body: unknown, cookie?: string) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (cookie) headers.cookie = cookie;
  const res = await fetch(`${baseUrl}${path}`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
    redirect: "manual",
  });
  const text = await res.text();
  let json: any = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = { raw: text.slice(0, 400) };
  }
  return { res, json, text };
}

function bookingPayload(input: {
  items: TestProduct[];
  startDate: string;
  endDate: string;
  email: string;
  lastName: string;
  message: string;
  billingDiffers?: boolean;
}) {
  const billingDiffers = input.billingDiffers ?? false;
  return {
    items: input.items.map((item) => ({
      resourceId: item.id,
      quantity: 1,
      title: item.title,
      priceType: item.priceType,
      basePriceCents: item.basePriceCents,
      priceLabel: item.priceLabel,
      displayPrice: item.priceLabel,
    })),
    startDate: input.startDate,
    endDate: input.endDate,
    deliveryType: "delivery",
    billingAddressSameAsDelivery: !billingDiffers,
    billingAddress: billingDiffers
      ? {
          nameOrCompany: "Test Rechnung GmbH",
          addressLine1: "Rechnungsgasse 2",
          zip: "2102",
          city: "Bisamberg",
          country: "AT",
        }
      : undefined,
    customerMessage: input.message,
    customer: {
      firstName: "Test",
      lastName: input.lastName,
      email: input.email,
      phone: "+43 660 1234567",
      addressLine1: "Teststrasse 1",
      zip: "2102",
      city: "Bisamberg",
    },
  };
}

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

function makeRange(offsetDays: number) {
  const runOffset = Math.floor(Date.now() / 1000) % 700;
  const start = new Date(Date.UTC(2035, 0, 1 + runOffset + offsetDays));
  const end = new Date(Date.UTC(2035, 0, 2 + runOffset + offsetDays));
  return {
    startDate: formatDateKey(start),
    endDate: formatDateKey(end),
  };
}

async function checkAvailability(items: TestProduct[], startDate: string, endDate: string) {
  const { res, json } = await fetchJson("/api/public/availability/check", {
    items: items.map((item) => ({ resourceId: item.id, quantity: 1 })),
    startDate,
    endDate,
  });
  assertCheck("availability API returns 200", res.status === 200, { status: res.status, json });
  return json;
}

async function createBooking(payload: unknown) {
  const { res, json } = await fetchJson("/api/public/bookings/request", payload);
  assertCheck("public booking request returns success", res.status === 200 && json.success === true, {
    status: res.status,
    json,
  });
  return json.bookingId as string;
}

async function main() {
  const db = await getDb();
  const email = process.env.EMAIL_ADMIN || "test@example.invalid";

  const allProducts = (await db.item.findMany({
    where: { published: true },
    select: {
      id: true,
      title: true,
      slug: true,
      priceType: true,
      basePriceCents: true,
      priceLabel: true,
      deliveryAvailable: true,
      pickupAvailable: true,
      category: { select: { name: true, catalogType: { select: { name: true, slug: true } } } },
      images: { select: { url: true, alt: true }, orderBy: { sortOrder: "asc" }, take: 1 },
    },
    orderBy: { sortOrder: "asc" },
  })) as TestProduct[];

  const bouncy = allProducts.find((item) => item.category.name.includes("Hüpfburg") && item.priceType === "FIXED");
  const bouncyOnRequest = allProducts.find((item) => item.category.name.includes("Hüpfburg") && item.priceType === "ON_REQUEST");
  const tech = allProducts.find((item) => item.category.catalogType.slug === "licht-tontechnik" && item.priceType === "ON_REQUEST");
  const techFixed = allProducts.find((item) => item.category.catalogType.slug === "licht-tontechnik" && item.priceType === "FIXED");

  assertCheck("test products available", bouncy && bouncyOnRequest && tech && techFixed, {
    bouncy: bouncy?.title,
    bouncyOnRequest: bouncyOnRequest?.title,
    tech: tech?.title,
    techFixed: techFixed?.title,
  });

  for (const [path, expected] of [
    ["/produkte", bouncy!.title],
    ["/licht-tontechnik", tech!.title],
    [`/produkt/${bouncy!.slug}`, bouncy!.title],
    [`/produkt/${tech!.slug}`, tech!.title],
  ] as Array<[string, string]>) {
    const { res, text } = await fetchText(path);
    assertCheck(`GET ${path} is 200`, res.status === 200, { status: res.status });
    assertCheck(`GET ${path} contains expected product text`, text.includes(expected), { expected });
    if (path.includes("produkt/")) {
      assertCheck(`GET ${path} contains cart CTA`, text.includes("In Anfragekorb"), { expected: "In Anfragekorb" });
    }
  }

  const onRequestPage = await fetchText(`/produkt/${bouncyOnRequest!.slug}`);
  assertCheck("ON_REQUEST product page shows Preis auf Anfrage", onRequestPage.text.includes("Preis auf Anfrage"), {
    product: bouncyOnRequest!.title,
  });

  for (const product of [bouncy!, bouncyOnRequest!, tech!, techFixed!]) {
    const imageUrl = product.images[0]?.url;
    assertCheck(`product has image mapping: ${product.title}`, Boolean(imageUrl), { imageUrl });
    if (imageUrl) {
      const resolvedImageUrl = new URL(imageUrl, baseUrl).toString();
      const imageRes = await fetch(resolvedImageUrl, { method: "GET" });
      record(`product image loads: ${product.title}`, imageRes.ok, { status: imageRes.status, url: resolvedImageUrl });
    }
  }

  const cartSyncOnlyBouncy = await fetchJson("/api/public/cart/sync", { ids: [bouncy!.id] });
  assertCheck("cart sync bouncy delivery-only flags", cartSyncOnlyBouncy.json.items[bouncy!.id].deliveryAvailable === true && cartSyncOnlyBouncy.json.items[bouncy!.id].pickupAvailable === false, cartSyncOnlyBouncy.json.items[bouncy!.id]);

  const cartSyncOnlyTech = await fetchJson("/api/public/cart/sync", { ids: [tech!.id] });
  assertCheck("cart sync tech delivery/pickup flags", cartSyncOnlyTech.json.items[tech!.id].deliveryAvailable === true && cartSyncOnlyTech.json.items[tech!.id].pickupAvailable === true, cartSyncOnlyTech.json.items[tech!.id]);

  const cartSyncMixed = await fetchJson("/api/public/cart/sync", { ids: [bouncy!.id, tech!.id] });
  assertCheck("cart sync mixed contains delivery-only bouncy", cartSyncMixed.json.items[bouncy!.id].pickupAvailable === false, cartSyncMixed.json.items);

  const approvedRange = makeRange(0);
  const rejectedRange = makeRange(14);
  const cancelledRange = makeRange(28);

  const initialAvailability = await checkAvailability([bouncy!, tech!], approvedRange.startDate, approvedRange.endDate);
  assertCheck("valid available range can proceed", initialAvailability.isAvailable === true, initialAvailability);

  const requestedId = await createBooking(
    bookingPayload({
      items: [bouncy!, tech!],
      ...approvedRange,
      email,
      lastName: "Kunde E2E Approve",
      message: "E2E Test Sonderwunsch: Aufbau bitte nach telefonischer Abstimmung.",
      billingDiffers: true,
    })
  );

  const requestedBooking = await db.booking.findUnique({
    where: { id: requestedId },
    include: { customer: true, items: true },
  });
  assertCheck("created booking is requested", requestedBooking?.status === "requested", {
    id: requestedId,
    status: requestedBooking?.status,
  });
  assertCheck("created booking stores separate billing flag", requestedBooking?.billingAddressSameAsDelivery === false);

  const requestedAvailability = await checkAvailability([bouncy!, tech!], approvedRange.startDate, approvedRange.endDate);
  assertCheck("requested does not block availability", requestedAvailability.isAvailable === true, requestedAvailability);

  const requestedContractNoCookie = await fetchText(`/admin/bookings/${requestedId}/mietvertrag`);
  assertCheck("requested contract route is protected without admin cookie", requestedContractNoCookie.res.status === 307 || requestedContractNoCookie.res.status === 308, {
    status: requestedContractNoCookie.res.status,
    location: requestedContractNoCookie.res.headers.get("location"),
  });

  const login = await fetchJson("/api/admin/login", { password: process.env.ADMIN_PASSWORD || "" });
  assertCheck("admin login succeeds", login.res.status === 200 && login.json.ok === true, { status: login.res.status });
  const cookie = login.res.headers.get("set-cookie")?.split(";")[0] || "";
  assertCheck("admin session cookie received", cookie.startsWith("admin_session="));

  const adminList = await fetchText("/admin/bookings", { cookie });
  assertCheck("admin booking list loads", adminList.res.status === 200, { status: adminList.res.status });
  assertCheck("admin booking list includes new booking reference or customer", adminList.text.includes("Kunde E2E Approve") || adminList.text.includes(requestedId), {
    id: requestedId,
  });

  const adminDetail = await fetchText(`/admin/bookings/${requestedId}`, { cookie });
  assertCheck("admin booking detail loads requested booking", adminDetail.res.status === 200, { status: adminDetail.res.status });
  assertCheck("admin detail contains customer data", adminDetail.text.includes("Kunde E2E Approve") && adminDetail.text.includes("Teststrasse 1"), {
    id: requestedId,
  });
  assertCheck("admin detail contains billing address", adminDetail.text.includes("Test Rechnung GmbH") && adminDetail.text.includes("Rechnungsgasse 2"));
  assertCheck("admin detail contains requested status action", adminDetail.text.includes("Bestaetigen") && adminDetail.text.includes("Ablehnen"));

  const requestedContract = await fetchText(`/admin/bookings/${requestedId}/mietvertrag`, { cookie });
  assertCheck("requested contract draft route loads", requestedContract.res.status === 200, { status: requestedContract.res.status });
  assertCheck("requested contract contains draft banner", requestedContract.text.includes("ENTWURF"), { id: requestedId });

  const approve = await fetchJson(`/api/admin/bookings/${requestedId}/approve`, {}, cookie);
  assertCheck("approve API succeeds", approve.res.status === 200 && approve.json.success === true, approve.json);

  const approvedBooking = await db.booking.findUnique({ where: { id: requestedId }, include: { customer: true, items: true } });
  assertCheck("booking status is approved", approvedBooking?.status === "approved", { status: approvedBooking?.status });

  const approvedAvailability = await checkAvailability([bouncy!, tech!], approvedRange.startDate, approvedRange.endDate);
  assertCheck("approved blocks availability", approvedAvailability.isAvailable === false, approvedAvailability);

  const approvedDetail = await fetchText(`/admin/bookings/${requestedId}`, { cookie });
  assertCheck("approved admin detail shows contract print link", approvedDetail.text.includes("Mietvertrag drucken"));

  const approvedContract = await fetchText(`/admin/bookings/${requestedId}/mietvertrag`, { cookie });
  assertCheck("approved contract loads", approvedContract.res.status === 200, { status: approvedContract.res.status });
  assertCheck("approved contract has no draft banner", !approvedContract.text.includes("ENTWURF"));
  assertCheck("approved contract contains core data", approvedContract.text.includes("Mietvertrag") && approvedContract.text.includes("Kunde E2E Approve") && approvedContract.text.includes("Teststrasse 1"));
  assertCheck("approved contract contains bank/legal sections", approvedContract.text.includes("IBAN") && approvedContract.text.includes("Mietbedingungen") && approvedContract.text.includes("Georg Friedrich"));

  const rejectedId = await createBooking(
    bookingPayload({
      items: [bouncyOnRequest!],
      ...rejectedRange,
      email,
      lastName: "Kunde E2E Reject",
      message: "E2E Test: diese Anfrage wird abgelehnt.",
    })
  );
  const rejectDraft = await fetchText(`/admin/bookings/${rejectedId}/mietvertrag`, { cookie });
  assertCheck("second requested contract shows draft", rejectDraft.text.includes("ENTWURF"), { id: rejectedId });

  const reject = await fetchJson(`/api/admin/bookings/${rejectedId}/reject`, { reasonDetails: "E2E Testablehnung" }, cookie);
  assertCheck("reject API succeeds", reject.res.status === 200 && reject.json.success === true, reject.json);
  const rejectedBooking = await db.booking.findUnique({ where: { id: rejectedId } });
  assertCheck("booking status is rejected", rejectedBooking?.status === "rejected", { status: rejectedBooking?.status });
  const rejectedAvailability = await checkAvailability([bouncyOnRequest!], rejectedRange.startDate, rejectedRange.endDate);
  assertCheck("rejected does not block availability", rejectedAvailability.isAvailable === true, rejectedAvailability);
  const rejectedContract = await fetchText(`/admin/bookings/${rejectedId}/mietvertrag`, { cookie });
  assertCheck("rejected contract shows no final contract", rejectedContract.text.includes("Kein finaler Vertrag"), { id: rejectedId });

  const cancelledId = await createBooking(
    bookingPayload({
      items: [techFixed!],
      ...cancelledRange,
      email,
      lastName: "Kunde E2E Cancel",
      message: "E2E Test: diese Anfrage wird bestaetigt und storniert.",
    })
  );
  const cancelApprove = await fetchJson(`/api/admin/bookings/${cancelledId}/approve`, {}, cookie);
  assertCheck("cancel test approve succeeds", cancelApprove.res.status === 200 && cancelApprove.json.success === true);
  const cancelApprovedAvailability = await checkAvailability([techFixed!], cancelledRange.startDate, cancelledRange.endDate);
  assertCheck("cancel test approved blocks first", cancelApprovedAvailability.isAvailable === false, cancelApprovedAvailability);
  const cancel = await fetchJson(`/api/admin/bookings/${cancelledId}/cancel`, { reasonDetails: "E2E Teststorno" }, cookie);
  assertCheck("cancel API succeeds", cancel.res.status === 200 && cancel.json.success === true, cancel.json);
  const cancelledBooking = await db.booking.findUnique({ where: { id: cancelledId } });
  assertCheck("booking status is cancelled", cancelledBooking?.status === "cancelled", { status: cancelledBooking?.status });
  const cancelledAvailability = await checkAvailability([techFixed!], cancelledRange.startDate, cancelledRange.endDate);
  assertCheck("cancelled does not block availability", cancelledAvailability.isAvailable === true, cancelledAvailability);
  const cancelledContract = await fetchText(`/admin/bookings/${cancelledId}/mietvertrag`, { cookie });
  assertCheck("cancelled contract shows no final contract", cancelledContract.text.includes("Kein finaler Vertrag"), { id: cancelledId });

  await new Promise((resolve) => setTimeout(resolve, 2500));

  const summary = {
    baseUrl,
    emailEnabled: process.env.EMAIL_ENABLED,
    emailFrom: process.env.EMAIL_FROM,
    emailAdminConfigured: Boolean(process.env.EMAIL_ADMIN),
    products: {
      bouncy: bouncy!.title,
      bouncyOnRequest: bouncyOnRequest!.title,
      tech: tech!.title,
      techFixed: techFixed!.title,
    },
    bookings: {
      approved: requestedId,
      rejected: rejectedId,
      cancelled: cancelledId,
    },
    checks,
    passed: checks.filter((check) => check.ok).length,
    failed: checks.filter((check) => !check.ok).length,
  };

  console.log("E2E_SUMMARY_START");
  console.log(JSON.stringify(summary, null, 2));
  console.log("E2E_SUMMARY_END");

  await db.$disconnect();

  if (summary.failed > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error("E2E_FATAL", error);
  process.exit(1);
});
