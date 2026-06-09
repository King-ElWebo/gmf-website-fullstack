# Transactional Mail & Email Security

This document outlines the target email notification flow and the cryptographic security constraints of the direct administrative action links.

---

## 1. Target Notification Flow

The email system supports four core transactional events:

1. **Inquiry Received (Admin Alert)**
   - **Sender**: `noreply@gmf-eventmodule.at`
   - **Recipient**: Operator (`EMAIL_ADMIN`)
   - **Content**: Details of the new request (customer info, timeframe, products list, address). Contains direct HMAC-signed action buttons (Approve/Reject).
2. **Inquiry Confirmation (Customer Copy)**
   - **Sender**: `noreply@gmf-eventmodule.at`
   - **Recipient**: Customer (`customerEmail`)
   - **Content**: Summary of the inquiry and information about the review process.
3. **Inquiry Approved (Customer Confirmation)**
   - **Sender**: `noreply@gmf-eventmodule.at`
   - **Recipient**: Customer (`customerEmail`)
   - **Content**: Confirmation that the event modules are reserved, along with next steps.
4. **Inquiry Rejected (Customer Notification)**
   - **Sender**: `noreply@gmf-eventmodule.at`
   - **Recipient**: Customer (`customerEmail`)
   - **Content**: Notification that the request was declined, including the operator's reason.

---

## 2. Secure Direct-Action Links (HMAC Protection)

To allow the operator to manage bookings quickly from their email inbox, links are generated with cryptographic signatures.

### A. Core Constraints
- **No Unsafe State Links**: Status change links must never contain raw, unverified parameters.
- **HMAC Signature**: Links must append a SHA-256 HMAC signature token generated using the server's private `ADMIN_SESSION_SECRET` key.
- **Expiration**: The link parameters must contain an expiration timestamp (`expiresAt`), set to **7 days** from generation. The server must reject any request that is expired.
- **Double Processing Prevention**: The route handler `/bookings/action` must check the current database status of the booking first. If it is already approved, rejected, or cancelled, it must display an informative notice page and ignore the request.

---

## 3. Resilience & Failure Handling
- **Non-Blocking Dispatch**: The backend must execute email sends asynchronously. 
- **Graceful Failures**: If Resend is down, experiencing rate limits, or configured incorrectly, the error must be logged or saved, but the core booking process must not fail. The user's checkout submission or the admin's status changes must complete successfully in the database.
