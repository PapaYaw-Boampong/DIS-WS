# DIS Deployment Runbook

How to stand up the Divine International School stack. Strategy: **staging
first** — validate the full stack on a staging backend + a Vercel preview, keep
the production public site in safe static/mock mode until you're satisfied, then
promote.

## Architecture

```
Browser
  -> Vercel (Next.js: public website + portal)          [frontend, no secrets]
      -> Render Web Service (Fastify + Prisma)            [backend, owns secrets]
          -> Render PostgreSQL                            [data]
          -> Cloudflare R2                                [private files]
```

The frontend holds **no secrets**. All credentials (DB URL, R2 keys) live on the
Render backend. The frontend talks to the backend server-to-server via
`PORTAL_API_URL`.

## Repository model: one monorepo, two platforms

Keep this **single repo**. Frontend is at the root (deployed by **Vercel**);
backend is in `server/` (deployed by **Render**). Both platforms connect to the
*same* GitHub repo and each builds only its own part:

- **Render** builds from `rootDir: server`, and `render.yaml`'s `buildFilter`
  makes it redeploy only when `server/**` changes.
- **Vercel** builds the Next.js app from the repo root. To skip a frontend
  rebuild on server-only pushes, set an **Ignored Build Step** in the Vercel
  project (optional; a wasted build is harmless, just uses minutes):
  `bash -c "git diff --quiet HEAD^ HEAD -- . ':(exclude)server'"`

Why not split into two repos? The frontend and backend share domain concepts
(icon allowlist, user/role shapes, the API contract), so a monorepo keeps
cross-cutting changes atomic and the docs/plans in one place — the right call for
a small team.

---

## 1. Backend on Render (`server/`)

The repo ships a root **`render.yaml`** Blueprint (Render only auto-detects a
Blueprint at the repo root) that provisions the web service + a free Postgres and
runs `prisma migrate deploy` on build.

**Steps**
1. Render → **New → Blueprint** → connect the GitHub repo → it reads
   `server/render.yaml`. (Or: New → Web Service, root dir `server`, and add a
   PostgreSQL instance.)
2. Set the **secret** env vars (marked `sync:false`, so entered by hand):

   | Var | Value |
   |---|---|
   | `R2_ACCOUNT_ID` | Cloudflare R2 account id |
   | `R2_ACCESS_KEY_ID` | R2 API token id |
   | `R2_SECRET_ACCESS_KEY` | R2 API token secret |
   | `R2_BUCKET_NAME` | your bucket, e.g. `dis-file-space` |
   | `ALLOWED_ORIGIN` | the Vercel origin(s), comma-separated (see step 3) |

   `DATABASE_URL` is wired automatically from the Render DB; `NODE_ENV=production`
   and `PORT` are set for you. **No session secret is needed** (sessions store a
   SHA-256 hash of a random token). Set `SEED_PASSWORD` only if you seed.
3. Deploy. Confirm health: `https://<service>.onrender.com/health` → `{ ok: true }`
   and `/health/db` → `{ ok: true }`.
4. **Create the first admin** (clean production — no fictional data). In the
   Render shell (or locally with the prod `DATABASE_URL`):
   ```bash
   ADMIN_EMAIL=head@yourschool.edu ADMIN_NAME="Head Teacher" ADMIN_PASSWORD='a-strong-password' \
     npm run create:admin
   ```
   That admin signs in and creates every other account from the portal
   (Admin → **User Accounts** / Students / Parents / Staff). Forgotten passwords
   are handled by Admin → User Accounts → **Reset password** (issues a one-time
   temp password; the user is forced to set a new one on next sign-in).

   > For a **staging/demo** environment instead, run `npm run db:seed` for the 6
   > demo accounts + fictional data. **Never seed a real production DB.**

---

## 2. Frontend on Vercel

Import the repo as a Next.js project (`vercel.json` + `.nvmrc` are included).

**Environment variables**

| Var | Value | Notes |
|---|---|---|
| `PORTAL_API_URL` | `https://<service>.onrender.com` | the Render backend |
| `USE_REAL_PUBLIC_CONTENT` | `true` | public site reads CMS content |
| `USE_REAL_PORTAL_AUTH` | `true` | portal login + CMS writes (go-live decision) |
| `NEXT_PUBLIC_SITE_URL` | your final domain | canonical metadata + sitemap |

Then set the backend's `ALLOWED_ORIGIN` to this Vercel origin and redeploy the
backend.

**Modes**: with `USE_REAL_*` unset/false the site runs in **static/mock mode**
(no backend needed) — safe for a production site that isn't live yet. Set them to
`true` on the environment where you want the real portal + CMS.

---

## 3. Staging-first flow (recommended)

1. Deploy the backend (staging DB) per §1; create an admin (or seed for demo).
2. Push `portal-foundation`; Vercel builds a **preview** for it. In the preview's
   env, set the four vars above (real mode) pointing at the staging backend.
3. Validate end-to-end on the preview URL: login, password reset/change, a CMS
   edit appearing on the public pages, a payment verification, a file upload.
4. When satisfied, **merge `portal-foundation` → `main`** (or point Vercel's
   production branch at it) and set the production env vars.

---

## 4. Go-live checklist

- [ ] Backend `/health` + `/health/db` green on Render
- [ ] R2 env vars set (backend crashes without them)
- [ ] `ALLOWED_ORIGIN` = the exact Vercel origin(s)
- [ ] First real admin created; **no demo/seed data** in production
- [ ] Vercel env vars set; `NEXT_PUBLIC_SITE_URL` = final domain
- [ ] Password reset + forced change verified on the deployed stack
- [ ] Free-tier note: Render free services **sleep** when idle (first request is
      slow) and the free Postgres has a retention limit — upgrade before real use.
- [ ] Decide before enabling real auth in prod: this is a go-live step (real
      accounts, real records), not just a redeploy.

## Deferred (documented, not yet built)

Card payment provider (Paystack/Hubtel/Flutterwave), MTN MoMo API auto-verify,
OCR receipt scan, bank-email ingestion, real GPS transport tracking, SMS/WhatsApp
notifications, and email-based self-service password reset. In-app equivalents
(manual/cash/MoMo-submission payments, in-app notifications, manual transport
status, admin-initiated password reset) are live.
