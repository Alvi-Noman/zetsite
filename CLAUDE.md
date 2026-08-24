# zetsite

A monorepo (pnpm + turbo) building toward a Shopify-style multi-tenant
e-commerce platform. Structure: `services/*` (Express + MongoDB backends:
`auth-service`, `api-service`), `apps/*` (frontends: `builder`, the admin
app), `packages/*` (shared code/config).

## Design system — required for all UI work

Every page or component added to `apps/builder` (or any future frontend
app in this repo) **must** follow the design system defined in
[`packages/design-system/DESIGN_SYSTEM.md`](packages/design-system/DESIGN_SYSTEM.md).
This applies regardless of which conversation or session is doing the
work — read that file before building or restyling any UI.

In short:

- Use the Tailwind tokens (`bg-surface`, `text-ink`, `border-border`,
  `bg-accent`, etc.) from `@zetsite/design-system` — never hardcode a
  Tailwind palette color (`slate-500`, `gray-200`, ...) or a raw hex value.
- Reuse the shared primitives in `apps/builder/src/components/ui`
  (`Button`, `Input`, `Textarea`, `Select`, `Card`, `Badge`, `IconButton`)
  instead of writing new `<button>`/`<input>` markup from scratch.
- Follow the visual language described there: neutral-first with one
  accent color, dense spacing, subtle borders over shadows, Inter
  typeface, 120ms transitions. It's modeled on Linear — minimal, not
  decorative.
- If a new app is added to `apps/*`, wire it to the same preset
  (`presets: [require('@zetsite/design-system/tailwind-preset')]` in its
  `tailwind.config.js`, `@import '@zetsite/design-system/tokens.css'` in
  its root CSS) rather than reinventing tokens.
- If a second frontend app needs the same primitives, promote
  `apps/builder/src/components/ui` into a `packages/ui` workspace package
  so both apps share it — don't fork the components.

## Architecture notes

- Multi-tenancy: a `store` is created at signup (see `auth-service`'s
  signup flow) and every JWT carries `storeId`. All tenant-scoped data
  (products, collections, etc. in `api-service`) is filtered by
  `storeId` from the authenticated request — never trust a client-supplied
  tenant id.
- Local dev: `docker compose up -d --build` runs the full stack (mongo,
  auth-service, api-service, builder, caddy). `apps/builder`'s nginx
  proxies `/api/v1/auth/*` to `auth-service` and `/api/*` to
  `api-service`.
- Image storage: currently local disk in `api-service`, with a full
  sharp-based pipeline (WebP+AVIF variants, content-hash filenames,
  immutable caching). Migrating to R2 + ImageKit (or equivalent CDN) is a
  deliberately deferred decision, not a gap — see
  [`docs/image-storage-cdn.md`](docs/image-storage-cdn.md) before doing
  that migration or touching `services/api-service/src/routes/uploadRoutes.ts`'s
  storage layer.
