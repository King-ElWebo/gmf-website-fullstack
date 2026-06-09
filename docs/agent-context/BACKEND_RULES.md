# Backend Development Rules

This document defines the responsibilities, capabilities, and validation constraints of the backend API and domain service layers.

---

## 1. Domain Responsibilities
The backend must handle all authoritative data manipulation and calculations:

- **Master Data (Stammdaten)**: Stores and serves centralized settings like company profiles, bank data, and contacts.
- **Catalog & Categories Management**: Manages catalog structures (`CatalogType`), category groupings (`Category`), and detailed product records (`Item`) including descriptions and media attachments.
- **Inquiry Processing**: Saves incoming booking records with default statuses, checks date overlaps, and verifies stock.
- **Authoritative Pricing Math**: Calculates multipliers based on duration and computes unit and total values in cents.
- **Booking Transitions**: Processes administrative booking approvals, rejections, and cancellations.
- **Mail Triggering**: Dispatches emails on booking creation and status updates.
- **Contract Generation**: Programmatically constructs rental contracts (Mietvertrag) and delivery notes (Lieferschein) based on verified booking data.
- **Access Control**: Authenticates and secures administrative dashboard API endpoints.

---

## 2. Validation & Security Boundaries

### A. Central Database Truth
- **Single Source of Truth**: The database is the final validator. Every parameter sent by the client must be verified against database records.
- **No Client Manipulation**: If a client attempts to inject booking items with custom pricing or dates, the backend must discard client-side values and recompute everything using base rates stored in the database.

### B. Availability Locks
- **Approval Check**: Before updating a booking's status to `approved`, the system must run an overlap check to ensure the items are not oversold. If another request was approved first, the transition must fail.

### C. Non-Blocking Email Dispatch
- **Async Execution**: Transactional emails must be fired in the background (using fire-and-forget Promises with proper error catching). A failure in Resend or a mail service timeout must never roll back a successful database transaction.

### D. Secure Admin Commands
- **Action Links Verification**: URL actions (like email-based approve/reject links) must be verified cryptographically using HMAC signatures against `ADMIN_SESSION_SECRET` and expire after 7 days.
- **Double Processing Protection**: Status updates must check the current DB record state first. If the state is not `requested`, the command must be rejected to prevent duplicate execution.
