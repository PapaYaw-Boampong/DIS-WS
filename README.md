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

Copy `.env.example` to `.env.local` when local URL overrides are needed.
Set `NEXT_PUBLIC_SITE_URL` to the final custom production origin in Vercel.
When it is omitted on Vercel, the generated project URL is detected
automatically. Outside Vercel, the site falls back to
`https://www.divineschool.edu.gh`.

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
static local data. Approved school photography is stored as static imports under
`src/assets/images/approved`; unavailable portraits and news images retain their
accessible styled placeholders.

The `pics/` directory is the source archive and is not served by the website.
To regenerate the approved, metadata-stripped image set:

```powershell
npm.cmd run prepare:images
```

The preparation script uses an explicit allowlist, auto-rotates photographs,
limits the longest edge to 2400 pixels, exports progressive JPEG at quality 88,
and verifies that EXIF, GPS, XMP and IPTC metadata were removed.

Forms are presentational only. Valid submissions display an inline notice and do
not send data to a backend.

## Verification

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
```
