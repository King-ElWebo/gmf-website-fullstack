# Coding Agent & Developer Guidelines

This document outlines the strict guidelines and coding boundaries for AI development agents and engineers modifying the GMF Eventmodule codebase.

---

## 1. Codebase Verification First
- **Check Existing Files**: Before adding new dependencies, database models, utilities, or helpers, search the directory structures (`src/lib`, `src/components`) to see if equivalent configurations or helper functions already exist.
- **Verify Architectural Patterns**: Read [ARCHITECTURE.md](file:///c:/Users/wilkb/Desktop/Projekte/GMF%20Eventmodule%20Jörgi/GMF%20Website%20fullstack/docs/agent-context/ARCHITECTURE.md) and [BACKEND_RULES.md](file:///c:/Users/wilkb/Desktop/Projekte/GMF%20Eventmodule%20Jörgi/GMF%20Website%20fullstack/docs/agent-context/BACKEND_RULES.md) to align with the Clean Architecture patterns.

---

## 2. No New Architecture Patterns
- **Stick to Current Setup**: Do not introduce alternative framework paradigms, folder layouts, or state managers (e.g., swapping standard React state with external state libraries, or adding custom database clients) unless explicitly requested.
- **Service Reuse**: Reuse established backend use-cases and service managers (like `AvailabilityService`, `BookingCommands`, and `PublicBookingUseCases`). Do not bypass them by writing inline database queries for state updates or availability checks in route handlers.

---

## 3. Business Logic Preservation
- **No Duplications**: Business policies, pricing multipliers, and cancellation limits are managed centrally. Do not hardcode calculations in components.
- **Precise Calculations**: All financial calculations must happen on the backend in cents (`Int` values).

---

## 4. Legal & Customer Information
- **No Guessed Information**: Do not write placeholder company names, placeholder VAT numbers, or address details. Verify legal info in [BUSINESS_RULES.md](file:///c:/Users/wilkb/Desktop/Projekte/GMF%20Eventmodule%20Jörgi/GMF%20Website%20fullstack/docs/agent-context/BUSINESS_RULES.md) or query `COMPANY_CONFIG`.
- **No Fictional Customer Data**: Do not hardcode dummy client profiles or credentials in production seeds or APIs.

---

## 5. Scope of Changes
- **Small & Targeted Modifications**: Prefer making small, clean changes rather than rewriting entire files or refactoring working components.
- **Explanatory Commits / Summaries**: Always write a detailed explanation of changes made, noting any non-obvious rationale, design decisions, and how verification was performed.

---

## 6. Project Goal Alignment
- Keep all files aligned with the core project target: **a highly maintainable, reusable, and reliable inquiry and booking management system for event modules.**
