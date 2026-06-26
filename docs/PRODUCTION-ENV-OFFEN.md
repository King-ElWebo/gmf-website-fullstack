# Offene Production ENV Werte

Um das Projekt produktiv und fehlerfrei live zu schalten, müssen noch folgende Variablen vom Kunden oder durch manuelle Einrichtung von Drittanbietern gesammelt und in Vercel eingetragen werden. 

*(Achtung: Niemals echte Secrets in dieses Dokument schreiben, sondern direkt in Vercel speichern).*

### 1. App URL
* **Wert:** `APP_URL` und `NEXT_PUBLIC_APP_URL`
* **Status:** Offen (Domain ist noch nicht fixiert/aufgeschaltet).
* **Pflicht?** Ja. Fehlt die App URL, crasht das Projekt serverseitig.

### 2. E-Mail Versand (Resend)
* **Wert:** `RESEND_API_KEY`
* **Status:** Offen.
* **Woher:** Resend.com Account erstellen, Domain validieren, API Key generieren.
* **Pflicht?** Ja (sofern `EMAIL_ENABLED=true`). Ohne Key schlägt der Versand fehl.

### 3. Datenbank (Neon)
* **Wert:** `DATABASE_URL` und `DIRECT_URL`
* **Status:** Offen.
* **Woher:** Neon.tech Account erstellen, neues Projekt generieren.
* **Pflicht?** Ja. Ohne DB kein Build und kein Livebetrieb.

### 4. Admin Auth
* **Wert:** `ADMIN_PASSWORD` und `ADMIN_SESSION_SECRET`
* **Status:** Offen (Secret-Keys müssen festgelegt werden).
* **Pflicht?** Ja. Ohne Keys kein Zugang zum Backend möglich.

### 5. Storage (Vercel Blob)
* **Wert:** `BLOB_READ_WRITE_TOKEN`
* **Status:** Wird meist von Vercel beim Klick auf "Connect Store" automatisch injiziert. 
* **Pflicht?** Ja. Sonst können keine Bilder in Produktion hochgeladen werden.

### 6. Google Calendar (Service Account)
* **Wert:** `GOOGLE_CALENDAR_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
* **Status:** Offen.
* **Woher:** Google Cloud Console. Service Account anlegen, JSON Key exportieren, Kalender freigeben.
* **Pflicht?** Nein (kann mit `GOOGLE_CALENDAR_ENABLED=false` deaktiviert werden). Wird für die finale Übergabe mit Kalendersync aber benötigt.
