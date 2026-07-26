# DIS Portal Backend (`dis-portal-api`)

Standalone backend service for the Divine International School portal, deployed as
a separate **Render** service. Stack: **Fastify + Prisma + PostgreSQL**
(TypeScript).

This is **Portal Phase 15, increment 1 — authentication**. It provides real
admin-issued accounts, hashed passwords (argon2), and server-owned sessions. The
Next.js portal is wired to it behind a `USE_REAL_PORTAL_AUTH` flag (mock session
remains the fallback). Later increments add identity/admin management, finance/
payments, and secure files per `../PORTAL_BACKEND_API_CONTRACT.md`.

## Endpoints

| Method | Path           | Purpose                                            |
| ------ | -------------- | -------------------------------------------------- |
| GET    | `/health`      | Liveness                                           |
| GET    | `/health/db`   | Readiness (DB reachable)                           |
| POST   | `/auth/login`  | `{ email, password }` → `{ token, expiresAt, user }` |
| GET    | `/auth/me`     | `Authorization: Bearer <token>` → `{ user }`       |
| POST   | `/auth/logout` | `Authorization: Bearer <token>` → `204`            |

The API is **token-based**. The Next.js app (BFF) stores the token in a
first-party httpOnly cookie and calls the API server-to-server, so there are no
cross-domain cookie concerns.

## Local development

Requires Node 20+ and Docker (for Postgres).

```bash
cd server
cp .env.example .env
docker compose up -d           # starts Postgres on :5432
npm install
npm run prisma:generate
npm run migrate:dev            # creates tables (first run: name it "init")
npm run db:seed                # seeds 6 demo accounts (one per role)
npm run dev                    # API on http://localhost:4000
```

Seeded demo accounts (dev password `PortalDev123!`, override with `SEED_PASSWORD`):
`admin@dis.local`, `accounts@dis.local`, `staff@dis.local`, `parent@dis.local`,
`student@dis.local`, `transport@dis.local`.

Smoke test:

```bash
curl -s localhost:4000/health
curl -s -X POST localhost:4000/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"admin@dis.local","password":"PortalDev123!"}'
```

## Wiring the Next.js portal

In the **web app** `.env.local`:

```bash
USE_REAL_PORTAL_AUTH=true
PORTAL_API_URL=http://localhost:4000
```

With the flag off (default), the portal keeps using the mock cookie session, so
the app runs with no backend.

## Deploy (Render)

`render.yaml` is a blueprint that provisions a free Postgres (`dis-portal-db`) and
the web service (`dis-portal-api`, root dir `server`). Set `ALLOWED_ORIGIN` to the
deployed web origin. Build runs `prisma generate` + `prisma migrate deploy`.

## Notes / next

- Login returns a generic error for missing/inactive user or bad password.
- Sessions expire after 8h; only the SHA-256 hash of the token is stored.
- TODO (later increments): admin account lifecycle endpoints, login rate limiting,
  optional MFA for admin/accounts, audit log — see `../PORTAL_AUTHORIZATION_PLAN.md`.
