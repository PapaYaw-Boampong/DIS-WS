# DIS Design System — Master

Source of truth for the Divine International School website + portal UI. Reflects
the **actual** implemented system (tokens live in `src/app/globals.css`), refined
with a UI/UX Pro Max design-intelligence pass. This is documentation, not a
generator output — keep it in sync when tokens change.

## Brand & Mood

Warm, grounded, trustworthy — a Ghanaian school that is welcoming to families and
credible to staff. "Deepened amber" earth tones on warm off-whites, editorial
display type. Light mode only (`color-scheme: light`) by deliberate choice.

## Color Tokens (semantic — never hardcode hex in components)

| Token | Value | Use |
|---|---|---|
| `background` | `#ffffff` | Page base |
| `foreground` / `charcoal` | `#1b222b` | Primary text |
| `soft-white` | `#fbf8f2` | Section / app background |
| `soft-cream` | `#f7f1e6` | Cards, chips, icon wells |
| `curry-orange` | `#c2751c` | Primary brand / CTA |
| `deep-orange` | `#8f4a16` | Hover / emphasis |
| `curry` | `#b4841c` | Accent |
| `muted-grey` | `#5c6470` | Secondary text (≥4.5:1 on white) |
| `border` | `#e7decf` | Dividers, card borders |
| `dark-footer` | `#111827` | Footer, portal sidebar |

Functional color always pairs with an icon or text (status badges use
success/warning/neutral/danger + a word, never color alone).

## Typography

- **Display**: Fraunces (`--font-display`) — page/section titles.
- **Body/UI**: Inter (`--font-sans`) — everything else. Base 16px, line-height 1.5–1.75.
- Weights: 700/800 headings, 500 labels, 400 body.
- **Tabular numerals** (`tabular-nums`) on all data: metrics, tables, amounts —
  prevents column jitter.

## Spacing, Radius, Elevation

- Spacing rhythm: 4/8px scale; section vertical rhythm `py-20 sm:py-24 lg:py-28`.
- Container: centered, `Container` component (consistent max-width + adaptive gutters).
- Radius: `--radius-card` = 1.5rem (cards), full-round for buttons/chips.
- Shadow scale: `shadow-card` / `shadow-card-strong` / `shadow-header` — do not
  invent ad-hoc shadow values.

## Interaction Standards (applied app-wide)

- **Cursor**: `button`, `[role=button]`, `label[for]`, `summary` → `cursor: pointer`;
  disabled → `not-allowed` (set once in `globals.css`).
- **Tap**: `touch-action: manipulation` on interactive elements (no 300ms delay);
  `-webkit-tap-highlight-color: transparent`.
- **Focus**: global `:focus-visible` 3px curry-orange ring — never remove.
- **Press feedback**: shared `Button` scales to `0.98` on `:active` (transform only,
  no layout shift), disabled under `prefers-reduced-motion`.
- **Motion**: 150–300ms for micro-interactions; route/title/carousel animations all
  gated behind `prefers-reduced-motion: reduce`.

## Components

- `Button` (public): primary / secondary / text; sm/md/lg with ≥40/48/56px height.
- Portal primitives: `DashboardHeader`, `DashboardCard`, `MetricCard`, `DataTable`
  (semantic `<table>` + `sr-only` caption + empty state), `StatusBadge`.
- Portal sidebar: active route highlighted (color + weight); primary nav in the
  sidebar, destructive actions (logout) spatially separated.
- Forms: visible labels, helper text, error/success messaging, loading state on
  submit, destructive actions in danger red.

## Accessibility Baseline (met)

Skip links, `lang`, sequential headings, alt text / `role="img"` + `aria-label` on
decorative-placeholder media, keyboard-navigable controls, WebP responsive images,
reduced-motion support. Target: WCAG AA (4.5:1 text).

## Pre-Delivery Checklist

- [ ] Interactive elements: pointer cursor, visible focus, pressed feedback
- [ ] Text contrast ≥4.5:1 (no gray-on-gray); functional color + icon/text
- [ ] Tabular numerals on data; no raw hex in components (use tokens)
- [ ] Images: WebP, width/height or aspect-ratio (no CLS), lazy below the fold
- [ ] Responsive at 375 / 768 / 1024 / 1440; no horizontal scroll
- [ ] `prefers-reduced-motion` respected; animations 150–300ms
- [ ] Forms: labels, helper/error text, loading + success states, confirm destructive
