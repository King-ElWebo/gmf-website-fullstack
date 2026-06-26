# GMF Eventmodule – Admin-Übergabe

Dieses Dokument dient als Kurzanleitung für die Verwaltung der GMF Eventmodule Website.

## 1. Zugang
* **Admin URL:** `https://[deine-live-domain.at]/admin/login`
* **Passwort:** Dein im Vorfeld festgelegtes Passwort. (Wir vergeben keine Passwörter in der Dokumentation, bitte halte dieses sicher verwahrt).
* Solltest du dein Passwort ändern wollen, muss dies in den Vercel Environment-Variablen (`ADMIN_PASSWORD`) vorgenommen werden.

## 2. Buchungen & Anfragen
* Eingehende Kundenanfragen landen im Reiter **Buchungen**.
* Die Buchung hat zunächst den Status **angefragt (requested)**.
* **Annehmen:** Klicke in den Buchungsdetails auf "Annehmen". Der Kunde erhält eine Bestätigungs-E-Mail und – falls Google Calendar aktiv ist – wird ein Kalendertermin erstellt. Die Verfügbarkeit ist dann blockiert.
* **Ablehnen/Stornieren:** Gibt den Zeitraum wieder für andere Kunden frei. Der Termin im Kalender (falls vorhanden) wird aktualisiert.

## 3. Produkte bearbeiten
* Unter **Produkte** kannst du Preise, Beschreibungen und Bestände anpassen.
* Aktiviere/Deaktiviere die Schalter für Abholung, Lieferung oder Aufbau, damit dies im Frontend richtig angezeigt wird.
* Unter "Info & Hinweis-Box" wählst du aus, ob dem Kunden besondere Hinweise (z.B. Hüpfburg-Sicherheit) auf der Detailseite angezeigt werden sollen.

## 4. Bilder hochladen
* Bilder für Produkte und Kategorien müssen über den Reiter **Bilder** neu hochgeladen werden, wenn du diese anlegen oder tauschen willst.
* Lade ein Bild hoch und ordne es danach im jeweiligen Produkt oder der Kategorie einfach über das Dropdown-Menü zu.
* Startseiten-Bilder (Hero-Slider) verwaltest du unter **Bilder -> Startseite**.

## 5. Kategorien & Hauptbereiche
* Unter **Kategorien** kannst du die Unterkategorien pflegen.
* Diese sind in **Hauptbereiche** (z.B. Eventmodule, Licht & Tontechnik) gegliedert.
* Ändere die Sortierung, um die Reihenfolge im Shop anzupassen.

## 6. Hinweis-Vorlagen bearbeiten
* Unter **Info-Vorlagen** pflegst du die Hinweis-Boxen (z.B. "Wichtige Infos zu Hüpfburgen").
* Eine Vorlage besteht aus Blöcken (Label, Überschrift, Text).
* Du musst die Vorlage dann nur noch im jeweiligen Produkt auswählen, damit sie angezeigt wird.

## 7. Kalender-Sync prüfen
* Unter **Kalender** (bzw. in den Buchungsdetails) siehst du den Status der Google-Calendar-Übertragung.
* Bei Fehlern (z.B. falscher API-Key) wird dort eine Meldung angezeigt, und du kannst den Sync manuell erneut anstoßen.

## 8. Was tun bei Fehlern?
* **Fehlermeldungen beim Bild-Upload:** Prüfe, ob in Vercel der `BLOB_READ_WRITE_TOKEN` richtig gesetzt ist.
* **Keine E-Mails kommen an:** Prüfe, ob in Vercel der `RESEND_API_KEY` aktiv ist und die Absenderadresse (`EMAIL_FROM`) im Resend-Dashboard als "Verified" markiert wurde.
* **Termine erscheinen nicht im Google Kalender:** Prüfe den Service-Account und stelle sicher, dass dieser Lese-/Schreibrechte auf den Zielkalender hat.
