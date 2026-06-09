# Design System & UI Aesthetics

This document defines the visual guidelines, component designs, imagery rules, responsive constraints, and design philosophies of GMF Eventmodule. Coding agents and developers must adhere to these specifications to preserve design coherence.

---

## 1. Designziel

The visual identity is designed to project a welcoming, community-oriented feeling:
* **The Target Impression**:
  - friendly, colorful, and inviting
  - child-friendly & suitable for children's festivals
  - modern, clean, and professional
  - neighborly/regional (trustworthy local service)
* **What to Avoid**:
  - sterile corporate SaaS tools
  - bank/insurance websites
  - dark tech-heavy backgrounds
  - cheap or chaotic event flyers
  - overcluttered amusement park designs
  - generic, characterless templates

The system balances playfulness (for kids' parties and rentals) with modern clean layouts and professional trustworthiness (for corporate events and weddings).

---

## 2. Markenwirkung (Brand Impact)

- **Branding**: The interface displays `"GMF Eventmodule"` as the public brand name. All legal requirements, disclosures, and billing documents reference the legal operator `"Georg Friedrich"`.
- **Value Offering**: We do **not** sell "events" (Events vermieten). We rent event modules, bouncy castles, lighting systems, and sound equipment.
- **Trust & Emotion**: The design must build immediate trust with parents renting high-safety bouncy castles, while appearing sufficiently professional to attract corporate planners, wedding coordinators, and club organizers. It should convey safety, joy, and structural reliability.

---

## 3. Farbwelt (Color System)

The colors are selected to combine childhood cheerfulness with high-contrast accessibility:

### A. Primary Base
- **Warm Yellow/Creme Base**: Used for background areas and body sections to create a friendly, inviting surface.

### B. Accent Highlights
- **Yellow**: Warm base accent.
- **Red**: Applied sparingly to call out critical CTA buttons, highlight labels, or direct attention to key indicators.
- **Blue**: Represents trust and structure. Used for secondary navigation, technical product categories, or informational notice blocks.
- **Green**: Conveys positive indicators, outdoor/garden contexts, and active product availability checks.

### C. Contrast Priority
- Color application must be systemic. Do not cycle background colors randomly across consecutive page sections.
- **Accessibility**: High contrast and text readability must always take precedence over maximum colorfulness.

### D. Color No-Gos
- No neon colors for main content backgrounds.
- No fullscreen dark mode designs.
- No plain slate-gray SaaS components.
- No low-contrast text-on-color combinations.

---

## 4. Hintergrund & Flächen (Backgrounds & Panels)

- **Do's**:
  - Helle, cremige oder leicht gelbliche Verläufe (soft gradients).
  - Off-white card components placed on warm, soft backgrounds.
  - Subtle drop shadows (`shadow-sm` or `shadow-md`) to elevate active cards.
  - Large rounded corners (`rounded-2xl` or `rounded-3xl`) to support the soft, kid-friendly look.
- **Don'ts**:
  - Harsh, flat, dark-gray enterprise surfaces.
  - Plain white void layouts lacking warm visual accents.
  - Full-width dark sections.
  - Visual backgrounds or textures under long body paragraphs.

---

## 5. Typografie (Typography)

Typography balances warmth with clarity:

- **Fredoka (`--font-fredoka`)**: Large, bold headings and hero text. Fredoka's rounded corners project a friendly and bouncy feel.
- **Nunito (`--font-nunito`)**: Body text, table data, forms, and secondary labels. Nunito provides high legibility.
- **CTA Phrasing**: Buttons must display active, direct, and welcoming text:
  - *„Jetzt unverbindlich anfragen“* (Inquire without obligation now)
  - *„Produkte entdecken“* (Discover products)
  - *„Verfügbarkeit prüfen“* (Check availability)
  - *„In den Anfragekorb“* (Add to cart)
  - *„Details ansehen“* (View details)
- **Typography No-Gos**:
  - Very small fonts (< 14px) on mobile viewports.
  - Overly decorative or script-style script fonts.
  - Large blocks of text without paragraphs, lists, or bold highlights.
  - Mixing more than two font families.

---

## 6. Layout-Prinzipien (Layout Rules)

- **Mobile-First**: Component grids, navigation, and inputs must scale seamlessly to mobile screens.
- **Clear Sektionen**: Generous vertical margins (`py-12` or `py-16`) separate layout blocks.
- **Visual Hierarchy**: Headlines guide the eye to prominent product imagery, followed by clear CTA buttons.

### A. Landing Page Layout
- The hero section must clearly state:
  1. What is offered (Hüpfburgen & Eventmodule).
  2. For whom it is intended (Familienfeste, Firmenfeiern, Hochzeiten).
  3. What action to take next (Inquiry cart button).
- Features quick category links (e.g., Hüpfburgen, Tontechnik) and sections illustrating logistics, safety compliance, and the manual approval flow.

### B. Product Detail Page
- Large product image display, accompanied by a short summary, VAT inclusive pricing tags, and shipping constraints.
- Direct checkout CTA ("In den Anfragekorb").
- No empty metadata tables; only display details that are populated in the database.

### C. Cart Checkout
- A quiet, clean layout. Minimal visual clutter, straightforward steps, and friendly validation alerts.

### D. Administrative Dashboard
- The admin dashboard (`/admin`) is designed for operational efficiency. It uses a structured, clean, and neutral layout (less colorful, no playful fonts, high density) to support fast administrative tasks.

---

## 7. Komponenten-Stil (UI Components)

- **Buttons**: Large click targets (minimum 44x44px for touch compliance). Primary buttons use a warm, high-contrast style with active scale transitions. Secondary buttons are muted.
- **Cards**: Large rounded corners, light shadows, high-resolution covers, brief description, and a clear button.
- **Badges**: Rounded tags for categories, availability, and pricing. Muted colors that map logically to status values.
- **Navbar**: Features the logo, clean navigation links, and a prominent link to the inquiry cart. The active link is clearly distinguished.
- **Footer**: A clean, serious section containing contact numbers, legal links (Impressum, AGB, Datenschutz), and bank details.
- **Formulare (Forms)**: Large input fields, clear labels, and friendly error alerts.

---

## 8. Bildsprache (Imagery)

- **Real Products**: Favor real product photographs rather than generic stock vectors.
- **Inflatables**: Bouncy castles and slides must be shown inflated, bright, and in clean outdoor settings.
- **Audio & Visuals**: Tech items (lighting, speakers) may use darker, modern backgrounds, but should avoid look-and-feel associations with clubs or dark environments.
- **Layout**: Every product has one clean, high-resolution cover photo, with optional gallery views showing angles and transit dimensions.

---

## 9. Icons & Illustrationen (Icons System)

- **Purpose**: Icons provide quick context (e.g., delivery truck, warning, plug, clock) rather than acting as decorative illustrations.
- **Consistency**: Use a unified, clean vector set (e.g., Lucide React). Avoid mixing hand-drawn icons with flat web icons.

---

## 10. Sprache & Tonalität (Copywriting Tone)

- **Tone**: Friendly, clear, simple, and direct. Keep text free of bureaucratic German jargon or empty hype.
- **Wording Policies**:
  - *Forbidden*: "Events mieten", "Eventvermietung" (as a primary slogan).
  - *Approved*: "Eventmodule mieten", "Hüpfburgen mieten", "Licht- & Tontechnik mieten", "Ausstattung für Ihre Feier", "Unverbindlich anfragen".

---

## 11. SEO & Conversion Design
- **Keywords**: Natural placement of phrases (e.g., *Hüpfburg mieten*, *Eventmodule leihen*, *Licht- und Tontechnik*) in page headings.
- **Goal**: The sole conversion goal is to drive cart inquiries, not instant checkouts. All CTAs must focus on "Anfragen" (Inquiry).

---

## 12. Responsive Regelungen (Responsive Breakpoints)

- **Mobile (< 640px)**: Single-column layouts, sticky cart indicators, large touch fields, and clean drop-downs.
- **Tablet (640px - 1024px)**: Dual-column grid cards, persistent sidebars (when appropriate), and stable navigation bars.
- **Desktop (> 1024px)**: Multi-column product layouts, prominent hero panels, and short body widths for comfortable text reading.

---

## 13. Accessibility / Lesbarkeit (Accessibility)
- Maintain a minimum contrast ratio of 4.5:1 for text against backgrounds.
- Provide descriptive `alt` tags for all catalog images.
- Associate all inputs with standard HTML `<label>` tags.
- Display form error notifications via text, not just border color modifications.

---

## 14. No-Gos für Coding Agents
- **No Gray Cleanups**: Do not refactor styling to make pages look like cold, gray, corporate dashboard templates.
- **No Dark Mode Main**: Do not introduce fullscreen dark layouts in the frontend.
- **No Logo Hiding**: Never minimize or obscure the main logo.
- **No Animation Bloat**: Do not add multiple scroll animations, parallax elements, or decorative visuals that slow page rendering.
- **No Placeholder Data**: Never invent dummy product specs or customer profiles.

---

## 15. Entscheidungsregel (Decision Priority)

When resolving design conflicts, apply this priority sequence:
1. **Verständlichkeit** (Clarity of information)
2. **Vertrauen** (Safety, security, legal clarity)
3. **Mobile Nutzbarkeit** (Mobile usability and touch targets)
4. **Markenwirkung** (Warm, child-friendly theme)
5. **Conversion** (Inquiry checkout rates)
6. **Dekoration** (Extra visuals, visual accents)

*Operational Rule: Playfulness must never compromise readability, accessibility, or brand trust.*
