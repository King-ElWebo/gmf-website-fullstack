# Deployment & Environment Settings

This document defines the deployment model, database environments, migration processes, and required environment configurations.

---

## 1. Environments

The system operates across three environments:
1. **Local Development**: Runs the Next.js server locally (`npm run dev`) with a local database or a staging database branch.
2. **Neon Production Database**: Serves as the centralized production PostgreSQL database. Neon's serverless architecture supports connection pooling and branching.
3. **Vercel Production Hosting**: Renders and hosts the application, routing traffic through edge configurations and serverless functions.

---

## 2. Environment Variables Configuration

The following keys are required in all deployment environments:
- `DATABASE_URL`: Connection string for the Neon database.
- `APP_URL`: The production domain URL (e.g. `https://www.gmf-eventmodule.at`). Crucial for generating absolute HMAC action links in admin email alerts.
- `ADMIN_PASSWORD`: The login password for the admin dashboard (`/admin`).
- `ADMIN_SESSION_SECRET`: The encryption key used to sign session cookies and action HMAC tokens.
- `RESEND_API_KEY`: Authentication credentials for the Resend API.
- `EMAIL_ENABLED`: Set to `"true"` to enable Resend email dispatch.
- `EMAIL_FROM`: The verified sender address (must match a domain verified in Resend).
- `EMAIL_ADMIN`: The operator's email address receiving booking alerts.

---

## 3. Database Safety & Migrations

- **Safe Production Migrations**: Production database updates must use `prisma migrate deploy` (or `npm run db:migrate:deploy`).
- **No Production Resets**: Commands that wipe the database (like `prisma migrate dev` resets) are strictly prohibited on the production database.
- **Idempotent Seeds**: The seed script (`prisma/seed.ts`) must be written idempotently. It should update or insert records (`upsert`) rather than executing raw inserts, ensuring it can be rerun on existing databases without duplicating entries or clashing with primary keys.
