import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

/**
 * DEV-ONLY: Send a raw test email to verify Resend API integration.
 * 
 * Usage:
 *   POST /api/admin/emails/test
 *   Body: { "to": "wilkbenjamin757@gmail.com", "subject": "Hello", "bodyText": "Testing Resend!" }
 */
export async function POST(req: Request) {
  // Only allow in development
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { to, subject, bodyText, html } = body;

    if (!to) {
      return NextResponse.json({ error: "Missing required parameter 'to'" }, { status: 400 });
    }

    console.log(`[Email Dev Test Endpoint] Invoking sendEmail to recipient: ${to}`);

    const result = await sendEmail({
      to,
      subject: subject || "GMF Eventmodule Test-E-Mail",
      text: bodyText || "Dies ist eine Test-E-Mail zur Überprüfung der Resend-Integration.",
      html: html || undefined,
    });

    if (!result.success) {
      return NextResponse.json({ 
        success: false, 
        error: result.error || "Unknown delivery failure" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      messageId: result.messageId 
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
