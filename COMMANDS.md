# Voraussetzungen (einmalig installieren)

## 1) Node.js

Empfohlen: aktuelle LTS Version.

Prüfen:
```bash
node -v
npm -v
```

## 2) Git

Prüfen:
```bash
git --version
```

## 3) Docker Desktop

Docker Desktop installieren und starten.

Prüfen:
```bash
docker --version
docker compose version
```

---

# Projekt zum ersten Mal starten (von Null)

## 1) Repository klonen
```bash
git clone <DEIN_REPO_URL>
cd option3-starter
```

## 2) Dependencies installieren
```bash
npm install
```

## 3) Environment setzen

Falls vorhanden:
```bash
copy .env.example .env
```

`.env` prüfen / anpassen:
```env
DATABASE_URL="postgresql://app:app@localhost:5432/app?schema=public"
```

## 4) Datenbank starten (Docker)
```bash
docker compose up -d
docker ps
```

## 5) Migration ausführen (DB Struktur erstellen)
```bash
npx prisma migrate dev --name init
```

## 6) Seed ausführen (Initialdaten)
```bash
npm run db:seed
```

## 7) App starten
```bash
npm run dev
```

App läuft auf: http://localhost:3000

---

## ⚡ Standard: Alles mit einem Befehl initialisieren

Falls im `package.json` vorhanden:
```bash
npm run db:setup
npm run dev
```

---

# Day-to-day Entwicklung

## DB starten
```bash
docker compose up -d
```

## App starten
```bash
npm run dev
```

## Prisma Studio (DB ansehen)
```bash
npx prisma studio
```

## DB stoppen
```bash
docker compose down
```

## DB komplett resetten (⚠️ löscht alle Daten!)
```bash
docker compose down -v
docker compose up -d
npx prisma migrate dev --name init
npm run db:seed
```

## Schema ändern (neue Tabellen/Felder)

`prisma/schema.prisma` anpassen, dann Migration ausführen:
```bash
npx prisma migrate dev --name <kurzer-name>
```

Optional Seed neu ausführen:
```bash
npm run db:seed
```

## Seed ändern

`prisma/seed.ts` anpassen, dann Seed ausführen:
```bash
npm run db:seed
```

> **Tipp:** Seed sollte `upsert` verwenden, damit er mehrfach laufen kann.

---

# Neues Projekt aus dem Starter erstellen (Template Workflow)

## Variante A – Repo klonen und umbauen

1. Repo klonen
2. `.env` anpassen
3. `schema.prisma` anpassen
4. `seed.ts` anpassen
5. Setup ausführen:
```bash
npm install
docker compose up -d
npx prisma migrate dev --name init
npm run db:seed
npm run dev
```

## Variante B – GitHub Template verwenden (empfohlen)

1. Auf GitHub → **Use this template**
2. Neues Repo erstellen
3. Setup wie oben durchführen

---

# Fehlersuche (Quick Fixes)

## DB nicht erreichbar (P1001 etc.)

Läuft Docker?
```bash
docker ps
```

Ist Port `5432` belegt?
- Falls lokaler Postgres läuft → stoppen
- Oder Docker-Port ändern

## Prisma Client neu generieren
```bash
npx prisma generate
```

## Migration Status prüfen
```bash
npx prisma migrate status
```

---

# Nützliche Commands (Kurzüberblick)
```bash
# DB starten
docker compose up -d

# DB stoppen
docker compose down

# DB + Migration + Seed
npm run db:setup

# Migration
npx prisma migrate dev --name init

# Seed
npm run db:seed

# Prisma Studio
npx prisma studio

# App starten
npm run dev
```