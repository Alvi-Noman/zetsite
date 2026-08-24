# zetsite Design System

zetsite's UI is built on **Shopify Polaris** — Shopify's own open-source
design system (`@shopify/polaris-tokens`), the same one that ships in the
real Shopify Admin. This is a deliberate choice, not a generic pick.

## Why Polaris

zetsite is explicitly building toward being a Shopify-style commerce
platform. Three design systems were evaluated for this project:

- **Shopify Polaris** — purpose-built for exactly this product category
  (commerce admin dashboards). Open source, with its tokens published as a
  standalone, framework-agnostic npm package
  (`@shopify/polaris-tokens`) — usable outside their React component
  library, which is what makes it practical here (see below). No official
  mobile implementation.
- **Material Design 3** (Google) — the strongest official cross-platform
  story (Web, Android/Compose, Flutter), but its visual language is
  consumer/generic, not tuned for dense operator tooling.
- **Ant Design** — strong for admin/CRUD-heavy dashboards, has a
  companion Ant Design Mobile library, but is a generic enterprise system
  with no particular fit to commerce.

Polaris won on fit: this product is trying to look and feel like
authentic Shopify Admin, and Polaris's tokens are the actual values Shopify
uses. The mobile gap is real but not blocking — see below.

## The mobile story

Polaris has no official mobile component library, but that's a smaller
problem than it sounds: `@shopify/polaris-tokens` ships as plain CSS
custom properties *and* JS/JSON constants, deliberately decoupled from
`polaris-react`. Design tokens are the part that actually needs to be
shared across platforms — a future React Native app can import the same
`@shopify/polaris-tokens` package (via its JS/JSON export) and build
native components against the identical color/spacing/typography values
used here, without needing an official "Polaris Mobile" to exist. The
component implementations differ per platform either way; the tokens
don't have to.

## Where it lives

- [`tokens.css`](./tokens.css) — imports Polaris's real CSS custom
  properties (`@shopify/polaris-tokens/css/styles.css`, prefixed `--p-*`)
  and renames the ones we use into semantic aliases (`--surface`,
  `--ink`, `--accent`, ...). **This file must never contain a hardcoded
  hex value** — every color traces back to a real `--p-*` Polaris token.
  If a color is missing, pull it from Polaris's token set; don't invent one.
- [`tailwind-preset.js`](./tailwind-preset.js) — maps those aliases onto
  Tailwind utility classes (`bg-surface`, `text-ink`, `border-border`,
  etc.), and pulls typography/spacing/radius/shadow/motion scales
  directly from Polaris's own `--p-font-*`, `--p-border-radius-*`,
  `--p-shadow-*`, and `--p-motion-*` tokens.
- Any app's `tailwind.config.js` consumes this via
  `presets: [require('@zetsite/design-system/tailwind-preset')]`.
- Any app's root CSS imports `@zetsite/design-system/tokens.css` before
  the Tailwind directives.
- Shared, ready-to-use components live in
  [`apps/builder/src/components/ui`](../../apps/builder/src/components/ui)
  (`Button`, `Input`, `Textarea`, `Select`, `Card`, `Badge`, `IconButton`,
  `ResponsiveImage`). If a second frontend app is added, promote that
  folder to a `packages/ui` workspace package so both apps share it —
  don't fork it.

## The one thing to get right: brand vs. link

Polaris deliberately separates two different "colored" roles. Getting
this backwards is the most common way to make the UI look subtly wrong:

- **`accent`** (near-black, `--p-color-bg-fill-brand`) — primary
  buttons/actions only. This is what Shopify's actual "Save" button
  looks like. **Never used for links, focus rings, or selected states.**
- **`link`** (blue, `--p-color-text-link`) — text links, focus rings,
  and selected/active states (nav items, checkboxes, selected rows).
  **Never used for button fills.**

If you're about to write `bg-accent` on anything other than a primary
button, or `text-link`/`border-link` on a button fill, stop — that's the
wrong token for that role.

## Color tokens

| Token | Polaris source | Use |
|---|---|---|
| `surface` | `--p-color-bg-surface` | Page/card background |
| `surface-secondary` | `--p-color-bg-surface-secondary` | Sidebar, subtle panels |
| `surface-hover` | `--p-color-bg-surface-hover` | Hover state for rows/nav items |
| `surface-selected` | `--p-color-bg-surface-selected` | Selected nav item / row (neutral, not colored) |
| `border` | `--p-color-border` | Default 1px dividers/borders |
| `border-strong` | `--p-color-border-hover` | Emphasized borders |
| `ink` | `--p-color-text` | Primary text, headings |
| `ink-secondary` | `--p-color-text-secondary` | Secondary text, labels |
| `ink-tertiary` | `--p-color-text-disabled` | Placeholder, disabled, timestamps |
| `accent` / `accent-hover` | `--p-color-bg-fill-brand[-hover]` | Primary buttons only |
| `link` / `link-hover` | `--p-color-text-link[-hover]` | Links, focus, selection |
| `link-subtle` | `--p-color-bg-surface-emphasis` | Light blue tint (badges, focus ring bg) |
| `danger` / `danger-subtle` | `--p-color-bg-fill-critical` / `-bg-surface-critical` | Destructive actions, errors |
| `success` / `success-subtle` | `--p-color-bg-fill-success` / `-bg-surface-success` | Success states |
| `warning` / `warning-subtle` | `--p-color-bg-fill-warning` / `-bg-surface-warning` | Warning states |

Use the Tailwind classes above — never hardcode a Tailwind palette color
(`slate-500`, `gray-200`, ...) or a raw hex value in new UI.

Dark mode: Polaris ships a `.p-theme-dark-experimental` class with its
own token overrides. Not wired up yet, but since our aliases already
point at Polaris variables, enabling it later is a matter of applying
that class and confirming our alias set covers what it overrides — not a
retrofit of every component.

## Typography

- Font: Polaris's own stack — `'Inter', -apple-system, ..., sans-serif`
  (`--p-font-family-sans`), loaded via `<link>` in `index.html`.
- Scale (`text-xs` through `text-2xl`) is pulled directly from Polaris's
  `--p-font-size-*` / `--p-font-line-height-*` tokens — see
  `tailwind-preset.js` for the exact mapping.
- Font weights use Polaris's variable-font weights (450/550/650/700 —
  `font-normal`/`font-medium`/`font-semibold`/`font-bold`), tuned
  specifically for Inter, not generic 400/500/600/700.

## Spacing & layout

Tailwind's default 4px spacing scale is kept as-is — it already lines up
with Polaris's own spacing tokens (`--p-space-400` = 16px = Tailwind's
`p-4`, `--p-space-200` = 8px = `p-2`, etc.), so no remapping was needed.

- Page content max width: `max-w-3xl` for forms, full-width with padding
  for tables/lists.
- Section/card padding: `p-5` for standalone cards, `px-4 py-3` for
  table/list rows and toolbars.

## Radius & elevation

- `rounded-sm`/`md`/`lg`/`xl` map to Polaris's `--p-border-radius-100`
  through `-400` (4px/8px/12px/16px).
- `shadow-xs`/`sm`/`md`/`lg` map to Polaris's real `--p-shadow-*` values.
  Reserved for genuinely elevated elements (dropdowns, modals, popovers)
  — static page content uses borders instead of shadows.

## Component patterns

Use the primitives in `apps/builder/src/components/ui` rather than
re-styling raw elements:

- **Button** — `variant`: `primary` (`bg-accent` fill — the one primary
  action per view), `secondary` (bordered, neutral — most actions),
  `ghost` (no border/fill), `danger` (destructive actions only).
- **Input / Textarea / Select** — 1px `border-border`, focus state swaps
  to `border-link` + `shadow-focus` (a `link-subtle` ring) — not `accent`.
- **Card** — `bg-surface border border-border rounded-md`.
- **Badge** — `rounded-sm` pill; neutral by default, or a semantic tone
  (`accent` → `link-subtle`/`link`, or `success`/`warning`/`danger`).
- **IconButton** — square, `rounded-md`, transparent until hover.
- **ResponsiveImage** — variant-aware `<picture>` (AVIF → WebP), blur-up
  placeholder, lazy by default. See `docs/image-storage-cdn.md`.

## Do / Don't

- Do reuse an existing primitive before writing new markup for a button,
  input, or card.
- Do keep the `accent` (brand) vs `link` (interactive) distinction —
  see above.
- Don't introduce a new color outside Polaris's token set — if it's not
  in `@shopify/polaris-tokens`, it doesn't belong here.
- Don't use heavy shadows or gradients — Polaris relies on borders and
  restrained elevation, not decoration.
- Don't mix icon libraries — this repo standardizes on `lucide-react`
  (Polaris's own icon set is Shopify-trademarked and not meant for
  third-party reuse).

## For future AI sessions

This document (and the tokens/preset next to it) is the design system
referenced by the root `CLAUDE.md`. Any new page or UI component added
anywhere in this monorepo should be built with these tokens and the
shared primitives, regardless of which conversation or session is doing
the work. If you're about to pick a color, spacing value, or shadow that
isn't already expressed as one of these tokens, look it up in
`@shopify/polaris-tokens` first — don't invent one.
