# Business Rules & Wording Guidelines

This document outlines the core business rules, pricing strategies, logistical regulations, and legal boundaries of the GMF Eventmodule service.

---

## 1. Branding vs. Legal Operator Division

To ensure legal compliance, all user-facing interfaces, emails, and documents must respect this division:

* **Branding Name: GMF Eventmodule**
  - **Context**: Used for marketing, site logo, page titles, navigation labels, product descriptions, catalog filters, and overall branding.
* **Legal Operator: Georg Friedrich**
  - **Context**: Used for official contracts (Mietvertrag), invoices (Rechnung), legal disclosures (AGB, Impressum, Datenschutz, Widerruf), bank account information, data protection contact points, and official email headers regarding contractual agreements.

---

## 2. Terminology & Copywriting Guidelines
- **Forbidden Terminology**: Do not state that the company "Events vermietet" (rents events) or refer to the business as an "Eventvermietung" (event rental).
- **Approved Terminology**: Always write:
  - *Eventmodule mieten* (Rent event modules)
  - *Hüpfburgen mieten* (Rent bouncy castles)
  - *Licht- & Tontechnik mieten* (Rent lighting & audio equipment)
  - *Vermietung von Eventtechnik* (Rental of event equipment)
  - *Produkte/Module für Veranstaltungen* (Products/modules for events)

---

## 3. Logistical & Delivery Rules

- **Bouncy Castles / Large inflatables**: Due to safety, setup complexity, and heavy weight, inflatable structures require delivery and professional setup by the operator. **Self-pickup is disabled** for these products (`pickupAvailable: false`).
- **Small Equipment / Accessories**: Small cables, sound systems, and accessories may allow self-pickup by the customer (`pickupAvailable: true`).
- **Anfahrt/Delivery Pricing**: Transport costs are calculated individually based on distance and effort, and are appended to the offer manually rather than using automated frontend calculation.

---

## 4. Rental Pricing Structure

Rental pricing is computed using duration multipliers based on the number of days:
- **1 Day**: 100% of base rate
- **2 Days**: 150% of base rate
- **3 Days**: 200% of base rate
- **Over 3 Days**: Deactivates automatic pricing. The catalog displays these requests as "Preis auf Anfrage" (Price on request), requiring individual pricing by the operator.
- **On-Request Items**: Specific sound and light equipment can be configured as "Preis auf Anfrage" directly, disabling automated calculations regardless of duration.

---

## 5. Fees, Conditions, and Regulations

The following parameters must be communicated clearly to customers:

- **Cleaning Fee (Reinigungsgebühr)**:
  - **Standard Rate**: 120 € exkl. MwSt. (144 € inkl. MwSt.)
  - **Rule**: Only charged in cases of gross, negligent, or intentional soiling (grobe/mutwillige Verschmutzung).
- **Drying Fee (Trocknungsgebühr)**:
  - **Standard Rate**: 190 € exkl. MwSt. (228 € inkl. MwSt.)
  - **Rule**: Charged if inflatable items are returned wet/damp, covering the labor-intensive effort to inflate and dry the modules to prevent mold.
- **Cancellation (Storno) Terms**:
  - Cancellations up to 2 days before the event are free of charge.
  - Cancellations after that are subject to a late fee (maximum 350 € net).
- **Damage Liability**: The customer is fully liable for structural damage, theft, or loss of items during the rental period.
- **Site Prerequisites**: Inflatable rentals require a flat surface (ebener Untergrund), proximity to a 230V power connection, and sufficient gate/door widths (typically >= 1 meter) for transit.
- **Supervision (Aufsichtspflicht)**: Inflatable bouncy castles must be constantly supervised by an adult.
- **Event Registrations**: The customer is responsible for obtaining any local authority permits or event registrations.
