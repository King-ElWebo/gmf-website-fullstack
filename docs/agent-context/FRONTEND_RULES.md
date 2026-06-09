# Frontend Development Rules

This document outlines the responsibilities, UX guidelines, and strict architectural constraints of the public user interface.

---

## 1. Core Responsibilities
The frontend is responsible for **presentation, user guidance, responsive layout, and client-side validation**. It must dynamically load catalog types, categories, and products from backend endpoints instead of using hardcoded lists.

---

## 2. Supported Features

- **Product Presentation**: Displays categorized product listings, high-resolution media galleries, and item-specific properties (setup instructions, door dimensions, weights).
- **Local Cart State**: Operates an inquiry cart locally (persisted in `localStorage` via a React context provider).
- **Date Picker & Availability Feedback**: Provides calendar inputs for rental period selection and alerts the user if selected dates are blocked.
- **Inquiry Checkout Form**: Gathers contact details, event/delivery addresses, and optional billing addresses, routing the inquiry package to the backend.

---

## 3. Disclosures & Information Display
The frontend must clearly communicate all conditions to the user during browsing and checkout:
* **Base Rates**: Displays prices clearly, stating that they are inclusive of VAT (Brutto).
* **Extra Fees**: Explicitly lists any applicable deposits (Kaution), cleaning fees (Reinigungsgebühr), and drying fees (Trocknungsgebühr) on the product detail and cart checkout pages.
* **Cancellation Policies (Stornobedingungen)**: Displays free cancellation policies and potential post-cancellation handling fees.
* **Prerequisites**: Clear visibility of power connections (e.g. 230V, 2x 230V) and site access requirements (door width >= 1m, flat ground).

---

## 4. Strict Constraints & Boundaries

### A. No Frontend Calculations as Source of Truth
- **Final Math**: The frontend must never dictate final total prices, availability status, or booking transition logic. 
- **Verifications**: The cart must sync with the backend sync APIs (`/api/public/cart/sync`) to retrieve base prices and availability states. Submitted totals are recalculated and verified on the server.

### B. No Hardcoded Legal Stammdaten
- **Central Config**: Do not duplicate legal data (company name, bank details, phone, email, address) multiple times across React component files.
- **Usage**: Always fetch and render legal details from the centralized `COMPANY_CONFIG` (or database `SiteSettings` endpoints) to ensure modifications take effect globally.
