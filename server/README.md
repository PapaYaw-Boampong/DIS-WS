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
- Account lifecycle endpoints and the audit log are built. Account issuance is
  gated on the `accounts.manage` capability (shipped to `developer` only), not
  on a hardcoded role — see `src/lib/capabilities.ts`.
- Role permissions live in `role_capabilities` and are enforced by
  `requireCapability()`. The capability list there is the authority; the copy in
  the web app (`src/lib/portal/capabilities.ts`) is for rendering only.
- Login throttling is built (`src/lib/rate-limit.ts`): 5 failures per account
  and 20 per IP in a 15-minute window, each giving a 15-minute lockout, checked
  before the DB lookup and password hash. **State is per-process** — move it to
  Postgres/Redis before running more than one API instance, or it can be
  bypassed by spreading attempts across instances.
- Two-step sign-in (TOTP) is built and opt-in per user. `src/lib/totp.ts` is an
  RFC 6238 implementation with no dependency; validate it with
  `npx tsx scripts/totp-check.ts` (RFC test vectors) and exercise the whole
  flow with `npx tsx scripts/mfa-e2e.ts` against a running server.
  `/auth/mfa/verify` must accept BOTH a 6-digit TOTP code and an 11-character
  backup code — do not narrow that schema.
- GPS trackers post to `POST /transport/position` with a per-device bearer
  token issued by `POST /transport/devices` (shown once). Position writes are
  intentionally not audit-logged; `TransportDevice.lastSeenAt` is the trail.
- `prisma/seed.ts` must reset every table it writes to. A table that is seeded
  but not reset makes the second run fail on a unique constraint, after the
  accounts are already written.
- Paystack is optional and off unless `PAYSTACK_ENABLED=true` with a secret key;
  see `../PAYSTACK_INTEGRATION_PLAN.md`. The webhook needs the raw request
  bytes, which the global JSON parser in `src/index.ts` stashes on
  `request.rawBody` — do not remove that.
