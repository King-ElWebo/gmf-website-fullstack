# Product Vision & Overview

This document defines the core product vision, purpose, and operating model of the GMF Eventmodule website and booking inquiry system.

---

## 1. Product Vision & Target Audience
**GMF Eventmodule** is a modern website combined with a backend booking inquiry system for renting event equipment (Eventmodule) and bouncy castles (Hüpfburgen) to private hosts, clubs, and corporate clients. 
The system aims to present products clearly, automate availability checking during the booking process, and manage booking inquiries through a structured administration dashboard.

---

## 2. Rental Inventory
The catalog is composed of:
* **Inflatable Event Modules**: Bouncy castles (Hüpfburgen), slides (Rutschen), and inflatable obstacle courses.
* **Event Technology**: Lighting systems (Lichttechnik) and sound equipment (Tontechnik).
* **Accessories**: Power distribution, safety equipment, and auxiliary items.

---

## 3. Inquiry-Based Booking Model (No Direct Payment)
Unlike a fully automated e-commerce webshop, GMF Eventmodule operates as an **Inquiry and Confirmation System**:
* **No Direct Checkouts**: Customers cannot buy or execute instant digital payments (like Stripe or PayPal) directly.
* **Manual Review**: The operator manually reviews all booking requests.
* **Approval/Rejection**: The operator accepts (approves) or declines (rejects) the request.
* **Block & Confirmation**: Once approved, the reservation period is officially blocked in the inventory, and the customer receives an automated confirmation email containing details of the rental agreement.

---

## 4. Engineering Objectives
The system is built to be:
* **Reusable & Maintainable**: Standard Next.js patterns with separated layers so that items, categories, settings, and scheduling can be updated without structural rewrites.
* **Self-Contained Admin Dashboard**: An interactive admin panel secured by credentials where the operator manages booking records, calendar events, and product details.
* **Robust Core Logic**: Strict validation bounds for dates, availability, and pricing math to ensure consistency.
