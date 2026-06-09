# Open Design Prompt: GMF Eventmodule Website Visual Redesign

This document contains a comprehensive, highly detailed prompt that can be provided to a UI/UX designer, an AI design tool, or an Open Design generator. It instructs them to visually recreate and modernize the existing **GMF Eventmodule** website on a premium level while preserving all functional flows, pages, content structure, and underlying business logic.

---

```markdown
# Visual Redesign Prompt: GMF Eventmodule Web Application

## 1. Project Description & Core Identity
You are tasked with redesigning the user interface of **GMF Eventmodule** (https://gmf-eventmodule.at). The platform is a website and inquiry-based booking system for renting high-quality event equipment, focusing on bouncy castles (Hüpfburgen), giant slides, obstacle courses (Parcours), as well as event technology like ambient lighting, party sound systems, and accessories.

### Branding vs. Legal Operator Division (Strict Rule)
- **Branding Name: GMF Eventmodule**
  Used exclusively for public branding, logo, marketing headers, navigation, category filter lists, and product descriptions.
- **Legal Operator: Georg Friedrich**
  Used exclusively for official contracts, invoices, legal notices (Impressum, AGB, Datenschutz, Widerruf), bank information, and official email footers.

### Critical Wording Guidelines
- **Forbidden**: Do not use the phrases "Events mieten" or "Eventvermietung" (as a primary slogan/service).
- **Approved**: Use phrasing such as:
  - "Eventmodule mieten" (Rent event modules)
  - "Hüpfburgen mieten" (Rent bouncy castles)
  - "Licht- & Tontechnik mieten" (Rent lighting & audio equipment)
  - "Ausstattung für Ihre Feier / Veranstaltungen" (Equipment for your celebrations / events)
  - "Jetzt unverbindlich anfragen" (Inquire without obligation now)

---

## 2. Design Vibe & Aesthetic Direction
Recreate the website to look and feel premium, welcoming, and high-trust. Avoid generic, boring SaaS/dashboard templates or chaotic, low-budget event flyers.

- **Look & Feel Guidelines**:
  - **Do**: Friendly, colorful, inviting, child-friendly, modern, professional, regional, active.
  - **Avoid**: Sterile corporate styling, dark tech-heavy backgrounds, cheap templates, overcluttered amusement park designs, plain slate-gray tables.
- **Target Impression**: A balance between playful childhood joy (for family parties/rentals) and professional reliability/structure (appealing to corporate event planners, wedding organizers, and local associations).

---

## 3. Design Tokens & Color Palette
Color application must be structured and clean, prioritize readability and high contrast, and avoid random color cycling.

- **Background & Body Panels**:
  - **Base color**: Warm, soft yellow/creme gradient base (`#fefce8` or HSL tailored equivalent) to convey warmth and friendless.
  - **Cards & Content Blocks**: Crisp off-white panels placed on the warm background, featuring thick rounded borders and elevated shadow properties.
- **Accent Palette**:
  - **Yellow**: Warm base accent representing light, celebration, and happiness.
  - **Red**: Applied sparingly for highlighting call-to-action buttons (CTAs), badges, or critical notes.
  - **Blue**: Represents structural safety and trust. Used for technical product listings, navigation, and informational banners.
  - **Green**: Represents active states, success notices, and calendar availability.
- **Forbidden Colors**: No neon background colors, no full-screen dark layouts (except subtle accents for lighting), and no low-contrast text-on-color combinations.

---

## 4. Typography & Copywriting
Align typography to balance playfulness with clear readability.

- **Headings (Titles)**: Use a bold, rounded, friendly font like **Fredoka** (`--font-fredoka`) for primary headlines, hero highlights, and section titles to project a bouncy, cheerful feel.
- **Body & Forms**: Use a highly legible font like **Nunito** (`--font-nunito`) for body descriptions, checkout fields, tables, and system labels.
- **CTA Vocabulary**: Action buttons should contain clear, welcoming, active phrasing:
  - "Jetzt unverbindlich anfragen" (Inquire now)
  - "Produkte entdecken" (Discover products)
  - "Verfügbarkeit prüfen" (Check availability)
  - "In den Anfragekorb" (Add to cart)
  - "Details ansehen" (View details)

---

## 5. Imagery & Media Style
- **Authenticity**: Rely on real-world product photos rather than stock vectors.
- **Inflatables**: Bouncy castles and slides must be shown fully inflated, clean, bright, and situated in open, sunny outdoor/garden environments.
- **Lighting & Sound**: Tech items should use clean, modern, slightly darker but friendly product showcase layouts, avoiding overly dark club-themed visuals.
- **Grid Layouts**: Ensure every product features a high-definition cover image. Keep visual placeholder frames consistent in aspect ratio.

---

## 6. Page-by-Page Requirements

### A. Homepage (Startseite)
- **Hero Carousel**: A rotating hero section featuring high-quality images with an overlay layout. Includes:
  - Main Headline (utilizing multi-colored, slightly tilted letters to create a playful bounce).
  - Subtitle: "Unvergessliche Momente für Ihre Feier – Hüpfburgen, Eventmodule sowie Licht- & Tontechnik einfach anfragen, sicher nutzen und jede Menge Spaß erleben."
  - Primary Action Button: "🥳 Jetzt entdecken!" linking directly to product listings.
  - Optional banner badge for urgent notices (e.g. "🎈 Jetzt Termine für den Sommer sichern! 🎈").
- **Category Carousel**: Quick, touch-friendly navigation badges with descriptive icons and colorful borders mapping to the category catalog.
- **"So funktioniert's" (How It Works)**: A 3-step grid detailing the inquiry flow:
  1. *Eventausstattung wählen* (Select items)
  2. *Unverbindliche Anfrage* (Submit inquiry list)
  3. *Lieferung & Service* (Coordination & setup)
- **Standort & Abholung (Location & Logistics)**:
  - Highlighting delivery conditions: Bouncy castles/slides are delivery-only (`pickupAvailable: false`), while light/sound accessories allow self-pickup.
  - Visual address panel, opening times, phone, email, and a modern styled Google Maps iframe embed.
- **Social Media Stream Preview**: Showcase grid for Instagram/Facebook photos with direct social CTA buttons.

### B. Catalog Listing & Filter (Produktübersicht & Kategorien)
- **Navigation Filter Tab**: Responsive, border-accented filters separating catalog categories (e.g., Hüpfburgen, Rutschen, Hindernisbahnen, Lichttechnik, Tontechnik).
- **Product Cards Grid**: Modern cards featuring:
  - High-res product cover image.
  - Badge indicator (e.g. "Neu", "Beliebt", or availability info).
  - Fredoka title & short Nunito description.
  - Price indicator: clear base price (including "inkl. MwSt.") or "Preis auf Anfrage" (Price on request).
  - Quick action buttons: "🔍 Details" and "🛒 Add to cart" icon/button.
  - Visual icons specifying logistical constraints (e.g., delivery truck icon or self-pickup box).

### C. Product Detail Page (Produktdetailseite)
- **Image Gallery**: Large primary product showcase image alongside an optional thumbnail slide array showing different angles and packing sizes.
- **Configuration & Specs Panel**:
  - Title and short metadata overview.
  - Price Display or clear "Preis auf Anfrage" notice.
  - Logistical tags (Weight, Dimensions, Power requirements like 230V, Surface requirements).
  - Delivery information: explicitly state if self-pickup is disabled (Bouncy Castles require delivery & professional setup for safety).
- **Inquiry Call to Action**: Prominent "In den Anfragekorb" (Add to cart) button, alongside an inline notice stating that availability will be confirmed manually during the review.
- **Cross-Selling Section**: A small slider carousel titled "Das könnte Ihnen auch gefallen" displaying related modules or technical packages.

### D. Licht & Tontechnik Section (Lighting & Sound Catalog)
- **Sub-Brand Identity**: This sub-area lists DJ systems, speakers, ambient uplighting, and stage effects.
- **Styling**: Can feature slightly darker, modern dark-blue elements or dark-mode card panels to reflect party/evening setups, but must stay cohesive with the main warm light-theme and avoid look-and-feel associations with sketchy nightclubs.
- **Pricing**: Frequently uses "Preis auf Anfrage" tags for bespoke packages.

### E. Inquiry Cart & Request Form (Anfragekorb & Checkout)
*Note: This is an inquiry cart, NOT an e-commerce shop. No digital payment gateway exists.*
- **Step 1: Item Summary**:
  - Simple, clean table of chosen rentals.
  - Quantity controls and item removal buttons.
- **Step 2: Event Duration & Logic**:
  - Interactive Date-Range Picker (Start date to End date).
  - Clearly display pricing logic:
    - 1 Day = 100% of base price.
    - 2 Days = 150% of base price.
    - 3 Days = 200% of base price.
    - > 3 Days = "Preis auf Anfrage" (Price on request).
- **Step 3: Checkout Form**:
  - Muted, professional, structured input fields (Name, E-Mail, Phone, Company, Event location, Shipping address, Billing address).
  - **Explicit Info Banners**: Include clean notice blocks about potential extra fees:
    - *Lieferkosten*: Calculated manually post-inquiry based on mileage.
    - *Reinigungsgebühr*: Muted alert warning that a €144 cleaning fee applies only in case of severe/intentional soiling.
    - *Trocknungsgebühr*: Notice warning that a €228 drying fee applies if inflatables are packed wet.
- **Step 4: Success State**: A friendly, cheerful confirmation page thanking the customer and explaining that the operator will review the request manually and email an offer.

### F. FAQ, Contact & Legal Documents
- **FAQ Page**: Simple, high-contrast accordion list grouping common questions about rain cancellation, power needs, logistics, safety, and payment.
- **Contact Page**: A clear card containing phone and email click-to-copy icons, physical site coordinates, and an direct inquiry contact form.
- **Legal Pages**: Impressum, AGB (rental conditions), Datenschutz (privacy policy), and Widerruf (revocation). The design here must be extremely quiet, neutral, structured, and prioritize readability without playful headings or colorful illustrations.

---

## 7. Component Styling & Interactive Details (Micro-Animations)
To make the experience feel premium, implement subtle visual states:
- **Button Feedback**: All pressable components must scale slightly downward (e.g. `transform: scale(0.97)`) on `:active` tap or click to feel physically responsive.
- **Hover Transitions**: Primary links and product cards should lift slightly on hover (e.g. `-translate-y-1` combined with a soft border shadow expansion).
- **Easing**: Utilize custom easing curves like `cubic-bezier(0.23, 1, 0.32, 1)` (ease-out-strong) for snappy, responsive drawer reveals and slide changes. Keep transition durations under 250ms.
- **Cards**: Large rounded corners (`rounded-2xl` or `rounded-3xl` equivalent) and thick dark-blue/black borders supporting a soft cartoonish yet professional appearance.

---

## 8. Mobile Responsiveness & Accessibility
- **Mobile First**: Single-column product lists on small viewports scaling smoothly into multi-column layouts on desktop.
- **Touch Targets**: Buttons and interactive controls must have a minimum height/width of 44px for easy thumb tapping.
- **Readability**: Ensure text colors maintain a contrast ratio of at least 4.5:1 against the warm background. Form errors must be communicated in text, not just colors.
```
