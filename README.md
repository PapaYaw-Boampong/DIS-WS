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

Set `NEXT_PUBLIC_SITE_URL` to the final production origin before deployment.
If it is not set, SEO metadata, `robots.txt` and `sitemap.xml` fall back to
`https://www.divineschool.edu.gh`.

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
static local data. Placeholder media areas are accessible styled placeholders
until approved school photography is supplied.

Forms are presentational only. Valid submissions display an inline notice and do
not send data to a backend.

## Verification

```powershell
npm.cmd run lint
npx.cmd tsc --noEmit
npm.cmd run build
```
