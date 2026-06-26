import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email/email-service";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, phone, subject, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "Name, E-Mail und Nachricht sind Pflichtfelder." },
        { status: 400 }
      );
    }

    const adminEmail = process.env.EMAIL_ADMIN;
    if (!adminEmail) {
      console.warn("EMAIL_ADMIN is not set. Cannot send contact form email.");
      return NextResponse.json(
        { error: "Server error: Admin email not configured." },
        { status: 500 }
      );
    }

    // Build the email content
    const htmlContent = `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Neue Kontaktanfrage über die Website</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Name:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>E-Mail:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><a href="mailto:${email}">${email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Telefon:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${phone || "-"}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;"><strong>Betreff:</strong></td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee;">${subject || "-"}</td>
          </tr>
        </table>
        <h3 style="margin-bottom: 10px;">Nachricht:</h3>
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; white-space: pre-wrap;">${message}</div>
      </div>
    `;

    const textContent = `
Neue Kontaktanfrage über die Website

Name: ${name}
E-Mail: ${email}
Telefon: ${phone || "-"}
Betreff: ${subject || "-"}

Nachricht:
${message}
    `;

    const result = await sendEmail({
      to: adminEmail,
      subject: `[Kontaktanfrage] ${subject || name}`,
      text: textContent,
      html: htmlContent,
      replyTo: email,
    });

    if (!result.success) {
      console.error("Failed to send contact email:", result.error);
      return NextResponse.json(
        { error: "Fehler beim Senden der E-Mail." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Interner Serverfehler." },
      { status: 500 }
    );
  }
}
