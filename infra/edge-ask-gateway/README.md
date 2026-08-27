# edge-ask-gateway

A tiny sidecar that exists only because zetsite and zetsales share one VPS
and one port 80/443 — only zetsite's own Caddy instance actually runs
(zetsales' Caddy service is disabled via a Compose `profiles` override on
the server). That means Caddy's `on_demand_tls` "ask" check
(`Caddyfile`'s `on_demand_tls { ask ... }` directive) needs to approve
certificates for *both* products' hostnames, not just zetsite's own — this
gateway is that shared "ask" target, routing each incoming hostname to
whichever product's auth-service actually owns it.

**This directory is not deployed automatically.** It isn't part of
`docker-compose.yml`'s own services, isn't touched by the GitHub Actions
deploy workflow, and isn't referenced by zetsales' repo either — it's
tracked here purely so the code has a real home and history instead of
existing only as a hand-edited file on the server. The live copy is at
`~/edge-ask-gateway/` on the production VPS, started via its own
`docker compose up -d` in that directory (see `Caddyfile`'s
`ask http://edge-ask-gateway:9999/ask` for how Caddy reaches it, over the
shared external `edge` Docker network).

**If the VPS is ever rebuilt, or this container is ever lost:** copy this
directory to `~/edge-ask-gateway/` on the server and run
`docker compose up -d` in it — that recreates the container from scratch.
There's no other persistence for it.

## Why the fallback branch matters

Any hostname that isn't `*.zetsite.com` or `*.zetsales.com` falls through
to zetsite's `/api/v1/auth/subdomains/allow` endpoint, because that's also
where merchant custom-domain connections live (`isDomainConnected` in
`services/auth-service/src/controllers/domainController.ts`) — zetsales has
no equivalent custom-domain feature. Losing that fallback (e.g. rebuilding
this file from an older copy without it) silently breaks every merchant's
custom domain: Caddy's ask check 404s, so it refuses to issue a
certificate, and visitors get `ERR_SSL_PROTOCOL_ERROR`. This exact
regression happened once already after zetsales was added to the shared
server — keep the fallback branch when touching this file.
