import { google, calendar_v3 } from "googleapis";

export function isGoogleCalendarEnabled(): boolean {
  return process.env.GOOGLE_CALENDAR_ENABLED === "true";
}

function getAuthClient() {
  if (!isGoogleCalendarEnabled()) {
    throw new Error("Google Calendar Sync ist deaktiviert.");
  }

  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY;

  if (!email || !privateKey) {
    throw new Error("Fehlende Google Service Account Credentials in Umgebungsvariablen.");
  }

  // Handle escaped newlines from .env correctly
  privateKey = privateKey.replace(/\\n/g, '\n');

  return new google.auth.JWT({
    email,
    key: privateKey,
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
  });
}

function getCalendarClient() {
  const auth = getAuthClient();
  return google.calendar({ version: "v3", auth });
}

function getCalendarId(): string {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) {
    throw new Error("GOOGLE_CALENDAR_ID ist nicht konfiguriert.");
  }
  return calendarId;
}

export async function createGoogleCalendarEvent(eventBody: calendar_v3.Schema$Event) {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();
  
  const response = await calendar.events.insert({
    calendarId,
    requestBody: eventBody,
  });

  return response.data;
}

export async function updateGoogleCalendarEvent(eventId: string, eventBody: calendar_v3.Schema$Event) {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();
  
  const response = await calendar.events.patch({
    calendarId,
    eventId,
    requestBody: eventBody,
  });

  return response.data;
}

export async function deleteGoogleCalendarEvent(eventId: string) {
  const calendar = getCalendarClient();
  const calendarId = getCalendarId();
  
  try {
    await calendar.events.delete({
      calendarId,
      eventId,
    });
  } catch (error: any) {
    // Ignore 404 Not Found or 410 Gone (idempotent delete)
    if (error?.code === 404 || error?.code === 410) {
      console.log(`[Google Calendar] Event ${eventId} bereits gelöscht oder nicht gefunden.`);
      return;
    }
    throw error;
  }
}
