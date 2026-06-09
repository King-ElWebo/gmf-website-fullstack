# Calendar & Product Availability

This document defines the availability model, status blocking rules, and interface guidelines for calendar listings.

---

## 1. Internal Validation Authority
All product availability and stock allocation checks are processed on the backend. The frontend is not responsible for validating inventory or determining scheduling overlaps.

---

## 2. Frontend Interface Guidelines
- **Simple Date Selection**: The public frontend features simple date selectors in the booking checkout process, rather than a large public calendar as a main feature.
- **Availability Feedback**: The date inputs trigger background checks and return simple indicator alerts (such as `"Nicht verfügbar im gewählten Zeitraum"` or disabling/enabling the inquiry button) based on backend feedback.

---

## 3. Status Blocking Rules

Only bookings with an official reservation lock deduct from the available stock:

* **`approved` (Bestätigt)**: **Blocks Stock**. These bookings officially lock the requested product quantities for the selected date range.
* **`requested` (Angefragt)**: **Does NOT Block Stock**. Pending customer requests are ignored during availability calculation. Other users can still submit requests for overlapping dates.
* **`rejected` (Abgelehnt)**: **Does NOT Block Stock**.
* **`cancelled` (Storniert)**: **Does NOT Block Stock**.

---

## 4. External Calendar Integration
- **Google Calendar Sync**: Syncing with Google Calendar (via `CalendarSyncRecord`) acts as a background helper for the operator's convenience.
- **No Primary Truth**: The database remains the primary source of truth for stock allocation. External calendars must never be queried directly to determine slot availability during checkout or approval checks.
