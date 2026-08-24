# Image storage: current state and the CDN migration path

This documents a deliberate, deferred decision — not a TODO that was
forgotten. Read this before touching `services/api-service/src/routes/uploadRoutes.ts`
or anything that stores/reads media URLs.

## Current state (local disk)

`services/api-service`'s upload pipeline (`uploadRoutes.ts`) already does
the hard part right:

- Every image is re-encoded server-side with `sharp` into WebP + AVIF at
  three widths (thumbnail/medium/large), plus a full "original" and a
  base64 blur placeholder (LQIP).
- Files are named by the SHA-256 hash of their content
  (`<hash>-md.webp`, `<hash>-md.avif`, ...) — identical uploads dedupe,
  and URLs are safe to cache forever since the content can't change
  under a given hash.
- Served via `express.static` with `Cache-Control: public, max-age=31536000, immutable`.
- Real MIME sniffing (`file-type`) plus `sharp`'s decode step as the
  actual validation gate, rate-limited via `express-rate-limit`.

All of this lives on a single Docker volume (see `docker-compose.yml`'s
`uploads_data`), attached to one `api-service` container.

## Why this will eventually need to move

Local disk storage has two structural limits that don't show up until you
scale past a single instance:

1. **No horizontal scaling.** If `api-service` ever runs as more than one
   replica (needed for real production traffic), each replica has its own
   disk — an upload landing on replica A isn't visible from replica B.
   Local disk only works as long as there's exactly one instance.
2. **No edge caching / geographic latency.** Every image request round-trips
   to wherever `api-service` is deployed. Fine for one region and modest
   traffic; not fine once customers are spread out or traffic is high
   enough that origin bandwidth becomes a real cost.

Neither applies yet. Don't migrate preemptively — do it when either of
these becomes true, or when going to production for real (not local dev)
traffic.

## The migration target: R2 + ImageKit (or equivalent)

Recommended shape, mirroring a working reference architecture already
used successfully elsewhere (the `qravy` project):

- **Origin storage: Cloudflare R2** — S3-compatible, no egress fees
  (unlike S3), accessed via `@aws-sdk/client-s3`.
- **CDN / transform layer: ImageKit.io** in front of the R2 bucket —
  handles edge caching and can do on-the-fly transforms via URL params.
- Equivalent alternatives if preferred: **S3 + CloudFront**, or an
  all-in-one service like **Cloudinary** (simpler, more expensive, does
  both storage and CDN itself).

This requires creating accounts and getting API credentials — that step
is on whoever's doing the migration, not something to automate.

## Why the current code makes this an easy swap later

The upload pipeline was deliberately structured so the CDN migration is a
localized change, not a rewrite:

- `writeIfMissing(filename, buffer)` in `uploadRoutes.ts` is the *only*
  function that touches storage. Swapping it for an R2 `PutObjectCommand`
  (with a `HeadObjectCommand` check first, same dedup logic) is the whole
  backend change — the `sharp` variant-generation code above it doesn't
  change at all.
- The returned `variants` shape (`thumbnail`/`medium`/`large`/`original`/
  `placeholder`/`avif.*`) is already just URLs. Nothing downstream cares
  whether those URLs point at `/api/uploads/...` or
  `https://ik.imagekit.io/...` — `ResponsiveImage.tsx`, the product schema,
  `MediaDropzone`, `VariantsEditor` all just consume whatever URL strings
  they're given.
- Content-hash filenames carry over directly as the R2 object key
  (`images/<hash>-md.webp`), preserving the same dedup behavior.

## What the swap looks like, concretely

1. Add `@aws-sdk/client-s3` to `services/api-service`.
2. Add env vars: `R2_ENDPOINT`, `R2_BUCKET`, `R2_ACCESS_KEY_ID`,
   `R2_SECRET_ACCESS_KEY`, `R2_PREFIX`, `IMAGEKIT_URL_ENDPOINT`.
3. Replace `writeIfMissing`'s local `fs.writeFile` with an R2 upload
   (`HeadObjectCommand` to check existence, `PutObjectCommand` if missing).
4. Return ImageKit-fronted URLs (`${IMAGEKIT_URL_ENDPOINT}/${key}`)
   instead of `/api/uploads/${filename}`.
5. Decide whether to keep generating WebP/AVIF server-side (current
   behavior) or drop that and let ImageKit's `f-auto` transform do format
   negotiation at the edge instead — either works; the former gives you
   deterministic control, the latter is less code to maintain.
6. Leave `express.static('/api/uploads', ...)` in place for any
   already-stored local URLs, or run a one-time backfill script that
   re-uploads existing local files to R2 and updates stored product
   `media`/`variants` URLs.

No frontend changes are required beyond step 6's backfill for existing data.
