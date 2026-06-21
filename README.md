# Divine International School Website

Public website frontend for Divine International School, built from the approved
Figma direction and the architecture in `IMPLEMENTATION_PLAN.md`.

Current delivery progress is recorded in [`PROJECT_STATUS.md`](PROJECT_STATUS.md).

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Lucide React

## Development

PowerShell script execution is restricted in the current Windows environment,
so use the `.cmd` npm shim:

```powershell
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:3000`.

## Configuration

Copy `.env.example` to `.env.local`.

- Set `NEXT_PUBLIC_SITE_URL` to the final production origin.
- Set `RESEND_API_KEY`, `FORMS_FROM_EMAIL` and `FORMS_TO_EMAIL` to deliver
  contact and admissions enquiries.
- Set `RESEND_NEWSLETTER_SEGMENT_ID` when newsletter subscribers should be
  added to a specific Resend segment.
- Set the `NEXT_PUBLIC_*_URL` social variables only to verified official school
  accounts.

The domain used by `FORMS_FROM_EMAIL` must be verified in Resend. Without the
server-side Resend settings, forms show a configuration error and do not claim
that a submission was delivered.

## Vercel Deployment

The repository includes `vercel.json`, `.nvmrc` and a locked npm dependency
tree. Import the repository into Vercel and deploy it as a Next.js project.
Add `NEXT_PUBLIC_SITE_URL` in the Vercel project settings when the final custom
domain is ready, then redeploy so canonical metadata and the sitemap use it.

## Public Routes

- `/`
- `/about`
- `/about/history`
- `/about/principal-message`
- `/about/leadership`
- `/academics`
- `/academics/early-years`
- `/academics/primary`
- `/academics/junior-high`
- `/academics/co-curricular`
- `/academics/teachers`
- `/calendar`
- `/admissions`
- `/student-life`
- `/news`
- `/news/[slug]`
- `/portal`
- `/contact`
- `/location`

Invalid academic levels and news slugs intentionally return the shared 404
page.

## Content And Images

Current school copy, statistics, staff roles, news, events and map location are
static local data. The image manifest covers the approved archive, and generated
WebP assets and registry data live under `src/assets/images/approved` and
`src/lib/images.generated.ts`.

The `pics/` directory is the source archive and is not served by the website.
To regenerate the approved, metadata-stripped image set:

```powershell
npm.cmd run prepare:images
```

The pipeline auto-rotates, converts to sRGB WebP, strips metadata, validates
dimensions and hashes, and replaces generated assets only after verification.

Contact and admissions forms submit to server routes that deliver email through
Resend. The footer newsletter form creates a Resend contact. All three include
server-side validation, a honeypot and basic rate limiting.

## Verification

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
```
