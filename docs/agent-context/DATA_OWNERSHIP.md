# Data Ownership / Backend vs. Frontend

This document establishes the guidelines for separating backend dynamic data, central configurations, and frontend layout structures.

---

## 1. Core Rule

* **Backend / Admin**: Everything that the administrator needs to modify or customize dynamically must reside in the database (Backend/Admin) or centralized configuration files.
* **Frontend**: Elements restricted to pure presentation, interface layout, responsive behaviors, visual micro-animations, and technical scaffolding remain in the client code.
* **Centralization**: Business-critical parameters must **never** be hardcoded inside scattered frontend components.

---

## 2. Gehört ins Backend/Admin

### Produkte
- Produktname
- Slug
- Beschreibung
- Kurzbeschreibung
- Kategorie
- CatalogType/Bereich
- Bilder
- Videos
- Preis
- Preisart (Fixpreis, Ab-Preis, Preis auf Anfrage)
- Kaution
- Aktiv/Inaktiv
- Sortierung
- Lieferoptionen (Lieferung möglich, Selbstabholung möglich)
- Zusatzinfos wie Platzbedarf, Strombedarf, Aufbauhinweise, Betreuungshinweise

### Kategorien
- Name
- Slug
- Beschreibung
- Titelbild
- Sortierung
- Aktiv/Inaktiv
- Zuordnung zu CatalogTypes

### CatalogTypes / Bereiche
- Eventmodule / Standardprodukte
- Licht & Tontechnik
- Navigationslabel
- Slug
- Aktiv/Inaktiv
- Sortierung

### Buchungen / Anfragen
- Kundendaten
- Zeitraum
- Produkte
- Adressen
- Rechnungsadresse
- Status
- Berechnete Preise
- Preisstatus
- Interne Notizen
- Statushistorie (falls vorhanden)

### Availability
- Blockierende Buchungen
- Manuelle Sperren (falls vorhanden)
- Produktbestand / Menge (falls vorhanden)
- Zeitraumprüfung
- Statuslogik (approved blockiert; requested, rejected, cancelled blockieren nicht)

### Preislogik
- Mietdauer-Regeln (1 Tag = 100%, 2 Tage = 150%, 3 Tage = 200%, >3 Tage = individuell/auf Anfrage)
- Finale serverseitige Preisvalidierung
- Preis auf Anfrage
- Anfahrt/Lieferung als zusätzlicher Hinweis oder nachträglicher Kostenpunkt
- Zusatzkosten (sofern zentral gepflegt)

### E-Mail / Resend
- Mailtemplates können im Code liegen
- Empfänger/Absender über ENV oder Settings
- Booking-Daten aus dem Backend
- Action-Links müssen serverseitig signiert werden

### FAQ / Content / Settings
- FAQ-Fragen und Antworten
- Kontaktinformationen
- Öffnungszeiten / nach Absprache
- Hero-Texte (falls bereits in Settings vorgesehen)
- Startseiten-Abschnitte (falls im Backend vorgesehen)
- SEO-Texte (falls als Content gepflegt)
- Social Links
- Rechtliche Stammdaten (falls zentral gepflegt)

---

## 3. Gehört ins Frontend / Code

### UI und Layout
- Seitenstruktur
- Komponentenstruktur
- Header / Footer Layout
- Navbar-Darstellung
- Produktkarten-Komponente
- Kategorie-Karten-Komponente
- Formularlayout
- Checkout-Schritte
- Responsive Verhalten
- Animationen und visuelle Effekte

### UX-Logik
- Warenkorb lokal verwalten
- Artikel in Anfragekorb legen
- Formulareingaben clientseitig vorbereiten
- Fehlermeldungen anzeigen
- Ladezustände anzeigen
- Erfolgszustände anzeigen
- Weiter-/Zurück-Schritte im Anfrageflow

### Designsystem
- Farben
- Abstände
- Schriftgrößen
- Buttons
- Cards
- Badges
- Icons
- Mobile-First Verhalten

### Generische UI-Texte
Diese dürfen statisch bleiben:
- „Anfrage senden“
- „Zurück“
- „Weiter“
- „Zum Warenkorb“
- „Produkt ansehen“
- „Weitere Produkte“
- „Pflichtfeld“
- „Leider nicht verfügbar“
- „Ihre Anfrage wurde gesendet“

### Fallbacks
Das Frontend darf neutrale Fallbacks aufweisen, z.B.:
- „Preis auf Anfrage“
- „Weitere Informationen folgen“
- „Details werden im Zuge der Anfrage abgestimmt“

*Hinweis: Fallbacks dürfen keine fiktiven Kundendaten oder Preise erfinden.*

---

## 4. Sollte zentralisiert werden

Diese Werte dürfen **nicht** verstreut in verschiedenen Komponenten hartcodiert werden, sondern müssen in einer zentralen Config (`COMPANY_CONFIG`) oder Konstantendatei liegen:
- Betreibername (Georg Friedrich)
- Adresse (Spargelfeldgasse 22, A-2102 Bisamberg)
- Telefonnummer (+43 664 5550324)
- E-Mail (gmfeventmodule@gmail.com)
- UID (ATU56967223)
- Bankdaten (Holder: Georg Friedrich, IBAN: AT63..., BIC: RLNW...)
- Gerichtsstand (Korneuburg)
- Reinigungskosten (120 € netto)
- Trocknungskosten (190 € netto)
- Stornobedingungen
- Strombedarf
- Haftungshinweise
- Lieferbedingungen
- Preisfaktoren
- Statusnamen
- E-Mail-Adressen
- APP_URL

---

## 5. Statisch vs. Dynamisch nach SEO

### Statisch / Server-rendered (SSR) sinnvoll für:
- Startseite
- Kategorieübersichten
- Produktlisten
- Produktdetailseiten
- SEO-relevante Texte
- Rechtliche Seiten (Impressum, AGB, Datenschutz, Widerruf)

*Hinweis: Diese Seiten werden servergerendert, laden aber ihre dynamischen Daten aus dem Backend.*

### Clientseitig (CSR) sinnvoll für:
- Warenkorb
- Anfrageprozess
- Formularinteraktionen
- Datumsauswahl
- Verfügbarkeitsfeedback
- Admin-Interaktionen

---

## 6. Coding Agent & Developer Rules

Coding Agents müssen vor jeder Änderung folgende Checks durchlaufen:
1. **Kundenseitig änderbar?** -> Im Backend/Admin/Settings pflegen.
2. **Reine Darstellung?** -> Frontend-Komponente anpassen.
3. **Businesskritisch?** -> Backend oder zentrale Config verwenden.
4. **SEO-relevant?** -> Server Components / SSR bevorzugen.
5. **Logik bereits vorhanden?** -> Vorhandene Services wiederverwenden, nicht neu schreiben.
6. **Fehlende Daten?** -> Als provisorisch dokumentieren und im Admin konfigurierbar lassen.

---

## 7. Beispiele im GMF-System

### Hüpfburg Minion
* **Backend/Admin**: Produktname, Bilder, Preis, Kaution, Lieferart.
* **Frontend**: Visuelle Produktkarte und Button „In Anfragekorb“.
* **Backend/API**: Verfügbarkeitsberechnung.

### Reinigungskosten
* **Backend/Config**: Standardwert von 120 € exkl. MwSt.
* **Frontend**: Anzeige und Hinweistexte im Checkout.

### Status "approved"
* **Backend**: Logische Statusänderung, Belegungssperre.
* **Frontend**: Status-Badge im Admin-Dashboard.

### GMF Eventmodule Logo & Betreiber
* **Frontend**: Bilddatei (Asset).
* **Zentrale Config/Settings**: Markenname ("GMF Eventmodule") und rechtlicher Betreiber ("Georg Friedrich").
