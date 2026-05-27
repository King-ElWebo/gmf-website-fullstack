import "dotenv/config";
import { db } from "../src/lib/db";
import { COMPANY_CONFIG } from "../src/lib/company-config";

async function main() {
  console.log("Updating active database SiteSettings with final operator details...");

  const existing = await db.siteSettings.findUnique({
    where: { key: "default" }
  });

  if (existing) {
    const updated = await db.siteSettings.update({
      where: { key: "default" },
      data: {
        phone: COMPANY_CONFIG.phone,
        email: COMPANY_CONFIG.emailPrimary,
        address: COMPANY_CONFIG.address,
        noticeText: "Bis 2 Tage vorher kostenlos stornieren | Schlechtwetter-Option nach Absprache",
        additionalInfo: "Selbstabholung ist nach Vereinbarung an unserem Standort in Bisamberg möglich. Bitte beachten Sie, dass die gemieteten Produkte selbstständig und termingerecht retourniert werden müssen. Die Lieferung erfolgt je nach Entfernung – Liefer- und Anfahrtskosten werden individuell berechnet.",
      }
    });
    console.log("Successfully updated existing SiteSettings:", {
      id: updated.id,
      phone: updated.phone,
      email: updated.email,
      address: updated.address,
      noticeText: updated.noticeText,
      additionalInfo: updated.additionalInfo
    });
  } else {
    const created = await db.siteSettings.create({
      data: {
        key: "default",
        phone: COMPANY_CONFIG.phone,
        email: COMPANY_CONFIG.emailPrimary,
        address: COMPANY_CONFIG.address,
        openingHours: "Nach telefonischer Vereinbarung",
        noticeText: "Bis 2 Tage vorher kostenlos stornieren | Schlechtwetter-Option nach Absprache",
        additionalInfo: "Selbstabholung ist nach Vereinbarung an unserem Standort in Bisamberg möglich. Bitte beachten Sie, dass die gemieteten Produkte selbstständig und termingerecht retourniert werden müssen. Die Lieferung erfolgt je nach Entfernung – Liefer- und Anfahrtskosten werden individuell berechnet.",
      }
    });
    console.log("Created default SiteSettings record in database:", {
      id: created.id,
      phone: created.phone,
      email: created.email,
      address: created.address
    });
  }

  // Also update any FAQs mentioning Stranzendorf to Bisamberg
  console.log("Checking if any FAQs need updates...");
  const faqs = await db.faq.findMany();
  for (const faq of faqs) {
    if (faq.answer.includes("Stranzendorf")) {
      const newAnswer = faq.answer.replace(/3702 Stranzendorf/g, "A-2102 Bisamberg");
      await db.faq.update({
        where: { id: faq.id },
        data: { answer: newAnswer }
      });
      console.log(`Updated FAQ #${faq.sortOrder} answer to:`, newAnswer);
    }
  }

  // Upsert updated final conditions FAQs
  console.log("Upserting final conditions FAQs...");
  const faqsToSeed = [
    {
      id: "faq-4",
      question: "Wann fallen Reinigungskosten an?",
      answer: "Eine Reinigungspauschale von 120 € exkl. MwSt. (144 € inkl. MwSt.) fällt nur bei grober, fahrlässiger oder mutwilliger Verschmutzung an. Bei normaler, pfleglicher Nutzung entstehen Ihnen keine zusätzlichen Reinigungskosten.",
      sortOrder: 4,
    },
    {
      id: "faq-5",
      question: "Was passiert bei Schlechtwetter?",
      answer: "Bei Regen oder Sturm dürfen Hüpfburgen aus Sicherheitsgründen nicht betrieben werden. Bei Rückgabe einer komplett nassen Hüpfburg durch Regen/Nässe müssen wir eine Trocknungspauschale von 165 € netto (198 € inkl. MwSt.) pro Hüpfburg verrechnen.",
      sortOrder: 5,
    },
    {
      id: "faq-6",
      question: "Wie funktionieren Stornierungen?",
      answer: "Stornierungen sind bis 2 Tage vor dem Veranstaltungstag kostenlos möglich. Bei einer späteren Stornierung verrechnen wir die tatsächlich angefallenen Kosten bis zu einem Maximum von 350 € netto.",
      sortOrder: 6,
    },
    {
      id: "faq-10",
      question: "Was muss ich für den Aufbau und Betrieb (Strom, Helfer) beachten?",
      answer: "Zubehör wie Fallschutzmatten, Gebläse, Erdnägel und Transportwagen sind in der Miete bereits inkludiert. Für den Auf- und Abbau der Module werden vor Ort 1–2 kräftige Helfer benötigt. Der Betrieb erfordert eine normale 230V Stromversorgung durch den Veranstalter (ca. 3 kW pro Hüpfburg/Gebläse).",
      sortOrder: 10,
    }
  ];

  for (const faq of faqsToSeed) {
    await db.faq.upsert({
      where: { id: faq.id },
      update: {
        question: faq.question,
        answer: faq.answer,
        sortOrder: faq.sortOrder,
      },
      create: {
        id: faq.id,
        question: faq.question,
        answer: faq.answer,
        sortOrder: faq.sortOrder,
        published: true,
      }
    });
    console.log(`Upserted FAQ #${faq.sortOrder}`);
  }

  console.log("Database update completed!");
}

main()
  .then(() => db.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await db.$disconnect();
    process.exit(1);
  });
