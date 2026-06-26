# GMF Eventmodule – Live-Testplan

Nach dem ersten Deployment auf die finale Domain bei Vercel sollten folgende Punkte zwingend durchgespielt werden, um die gesamte technische Kette (Datenbank, E-Mail, Storage, Kalender) zu verifizieren.

## 1. Frontend Basis-Check
- [ ] **Startseite ladbar:** Die Startseite zeigt keine Fehler an.
- [ ] **Bilder sichtbar:** Hero-Bilder und Kategorie-Bilder sind (sofern hochgeladen) sichtbar.
- [ ] **Produkte sichtbar:** Der Katalog lädt und die Test- bzw. echten Produkte sind erreichbar.
- [ ] **Rechtliches erreichbar:** `/impressum` und `/datenschutz` laden fehlerfrei und zeigen die echten GMF-Daten.
- [ ] **SEO Check:** `/sitemap.xml` und `/robots.txt` sind aufrufbar.

## 2. Admin & Storage Check
- [ ] **Admin Login:** Der Login unter `/admin/login` mit dem korrekten `ADMIN_PASSWORD` funktioniert.
- [ ] **Bild Upload:** Lade unter Bilder ein beliebiges Bild hoch. Wenn es erfolgreich hochgeladen und angezeigt wird, funktioniert Vercel Blob einwandfrei.

## 3. Buchungs- & E-Mail-Flow
- [ ] **Anfrage erstellen:** Lege ein Produkt in den Anfragekorb und schließe den Prozess mit echten (Test-)Daten ab.
- [ ] **Verfügbarkeit geprüft:** Wurde das Produkt für die angefragten Daten temporär markiert?
- [ ] **Kunden-Mail kommt an:** Du solltest auf die eingegebene E-Mail-Adresse eine Bestätigungs-Mail erhalten (prüft Resend-Empfang).
- [ ] **Admin-Mail kommt an:** Auf die `EMAIL_ADMIN` Adresse (z.B. gmail) sollte eine Benachrichtigung über die neue Buchung eingehen.

## 4. Kalender & Freigabe-Flow
- [ ] **Anfrage approved:** Gehe in den Admin-Bereich und setze die Testbuchung auf "Annehmen".
- [ ] **Kunden-Mail (Status):** Eine Bestätigungsmail über die Annahme geht an den Kunden raus.
- [ ] **Google Kalendertermin entsteht:** Prüfe deinen Google Kalender. Es sollte ein Termin für den Buchungszeitraum eingetragen worden sein.
- [ ] **Verfügbarkeit blockiert korrekt:** Im Frontend darf das Produkt für diesen Zeitraum nicht mehr gebucht werden können.
- [ ] **Ablehnen / Stornieren:** Lehne die Buchung probeweise ab. Die Verfügbarkeit muss wieder freigegeben sein und der Kalendertermin aktualisiert werden.
