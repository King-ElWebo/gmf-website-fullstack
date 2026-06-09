# Project Status & Open Points

This document contains temporary items, open points, and roadmap topics. It must be updated as tasks are completed. Permanent architectural or business rules must **not** be documented here (refer to the other `.md` files in this directory).

---

## 1. Project Launch Checklist

The following items are open before the system goes live in production:

### A. Catalog & Media Alignment
- [ ] **Finalize Product Data**: Review and adjust descriptions, weights, setup requirements, and dimensions for all event modules.
- [ ] **Product Image Mapping**: Upload final high-resolution images for each bouncy castle and accessory, replacing seed placeholders.
- [ ] **Global Imprints / Links**: Verify that social media links and imprints map to the client's official accounts.

### B. Deployment & Integrations
- [ ] **Production Domain Setup**: Configure DNS settings to point the custom domain (e.g., `gmf-eventmodule.at`) to Vercel.
- [ ] **Resend Domain Verification**: Complete DNS validation (DKIM, SPF records) in the Resend dashboard to authorize sending from the client's official domain.
- [ ] **Email Testing**: Verify that emails are delivered to `EMAIL_ADMIN` and client addresses in production mode (`EMAIL_ENABLED=true`).

### C. Quality Assurance & Validation
- [ ] **End-to-End Booking Tests**: Execute manual test cycles from catalog selection, checkout, and admin approval links to confirm that status blocks and emails function correctly.
- [ ] **Database Migration Verification**: Ensure Neon PostgreSQL production migrations run smoothly without data loss.
