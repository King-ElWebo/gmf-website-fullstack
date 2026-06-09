# Booking Inquiry Lifecycle Flow

This document describes the step-by-step process of a customer booking inquiry, from initial browsing to final administrative processing and contract generation.

---

## The Target Process Flow

```mermaid
sequenceDiagram
    autonumber
    actor Customer
    participant Frontend
    participant Backend
    actor Operator
    
    Customer->>Frontend: Browse catalog & add items to cart
    Customer->>Frontend: Select dates (Timeframe)
    Frontend->>Backend: Check availability
    Backend-->>Frontend: Stock availability status
    Customer->>Frontend: Fill in details (Contact, Delivery, Billing)
    Customer->>Frontend: Submit Inquiry
    Backend->>Backend: Save Booking (Status: requested)
    Note over Backend: Requested state does NOT block inventory
    Backend-->>Customer: Send confirmation email
    Backend-->>Operator: Send alert email with direct action links
    
    alt Approved by Operator
        Operator->>Backend: Approve Booking (Admin UI or Email Link)
        Backend->>Backend: Change status to approved
        Note over Backend: Approved state BLOCKS inventory
        Backend->>Backend: Generate Contract (Mietvertrag) / Delivery Note
        Backend-->>Customer: Send approval email
    else Rejected by Operator
        Operator->>Backend: Reject Booking (including reason)
        Backend->>Backend: Change status to rejected
        Backend-->>Customer: Send rejection email
    end
```

---

## Detailed Sequence Steps

### Step 1: Catalog Discovery & Cart Additions
- The customer browses the catalog types and categories, viewing product specifications.
- The customer adds one or more items to the inquiry cart.

### Step 2: Timeframe Selection & Availability Checks
- The customer specifies a rental start and end date in the date picker.
- The system runs a background availability check to verify that the items in the cart are in stock for the selected timeframe. If items are out of stock or clashing with manual blockers, warning banners are shown.

### Step 3: Checkout Details Submission
- The customer inputs contact details (first name, last name, email, phone).
- The customer enters a delivery/event address.
- The customer can optionally enter a different billing address (otherwise defaults to matching the delivery address).
- Customer submits the inquiry.

### Step 4: Save Inquiry (Status: `requested`)
- The backend recalculates prices, validates dates, checks stock, and commits the booking with status `requested` to the database.
- **Inventory State**: In the `requested` state, the items are **not** reserved. The dates remain open for other customers to request.

### Step 5: Email Dispatches
- **Customer Confirmation**: The customer receives an email confirming receipt of the request.
- **Admin Notification**: The operator receives an alert email containing full details, customer remarks, and cryptographically signed direct-action links (Approve/Reject).

### Step 6: Administrative Review
- **Option A: Approve (`approved`)**
  - **Stock Lock**: The timeframe is immediately blocked. Other customers checking out overlapping dates will be flagged as unavailable.
  - **Documents**: A rental contract (Mietvertrag) and delivery note (Lieferschein) are automatically generated and linked.
  - **Notification**: The customer receives an approval email.
- **Option B: Reject (`rejected`)**
  - **No Lock**: No inventory is locked.
  - **Notification**: The customer receives an email with the rejection explanation.
- **Option C: Cancel (`cancelled`)**
  - If an approved booking is cancelled, the status changes to `cancelled`, and the stock lock is immediately released.
