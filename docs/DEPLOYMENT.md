# Production Deployment

The production stack runs the web app, API, MCP server, PostgreSQL, and Caddy
(automatic HTTPS) from a single host. All state except PostgreSQL and Caddy
certificates is stateless, so the API, MCP, and web containers can be scaled
horizontally behind a load balancer later.

## 1. Prerequisites

- A Linux host with Docker Engine 24+ and Docker Compose v2
- Three DNS records pointing at the host:
  - `socioconnect.app` → web
  - `api.socioconnect.app` → API and OAuth authorization server
  - `mcp.socioconnect.app` → MCP server
- Ports 80 and 443 open inbound
- Accounts and credentials for:
  - Dodo Payments (products + webhook signing key)
  - Google OAuth
  - Cloudflare R2
  - Each social platform you enable

## 2. Configure the environment

```bash
cp .env.production.example .env
chmod 600 .env
```

Fill every mandatory value:

- `POSTGRES_PASSWORD`
- `ENCRYPTION_KEY` (`openssl rand -hex 32`)
- `JWT_SECRET` (`openssl rand -base64 48`)
- `SERVICE_TOKEN_SECRET` (`openssl rand -base64 48`)
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`
- `DODO_PAYMENTS_API_KEY` / `DODO_PAYMENTS_WEBHOOK_KEY`
- one `DODO_PRODUCT_*` ID for every plan/interval you sell
- `CLOUDFLARE_R2_*`
- `OPENAI_APPS_CHALLENGE_TOKEN` for marketplace review
- `DEMO_ACCOUNT_PASSWORD` if the review account should be enabled

`NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_MCP_URL` are build arguments. They are
baked into the web bundle, so changing them requires rebuilding the web image.

## 3. Deploy

```bash
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs -f api
```

The API container runs `bun run db:migrate` before starting. Migrations are
idempotent and recorded in `drizzle.__drizzle_migrations`.

Caddy obtains and renews certificates automatically. The first request may take
a few seconds while ACME completes.

## 4. Seed the review workspace (optional)

Only when `DEMO_LOGIN_ENABLED=true`:

```bash
docker compose -f docker-compose.prod.yml exec api bun run seed:demo
```

The seed creates the review user, a Creator Pro personal workspace, demo social
accounts, posts, and audit/usage events. Use a unique strong password and rotate
it after review.

## 5. Configure the billing webhook

In Dodo Payments, point the webhook at:

```text
https://api.socioconnect.app/v1/subscriptions/webhook
```

Subscribe to:

- `subscription.active`
- `subscription.updated`
- `subscription.renewed`
- `subscription.plan_changed`
- `subscription.on_hold`
- `subscription.past_due`
- `subscription.paused`
- `subscription.unpaused`
- `subscription.cancelled`
- `subscription.expired`
- `subscription.failed`
- `payment.succeeded`

Entitlements are only granted by a verified webhook. Checkout metadata includes
`workspace_id`, so a plan purchased for a team workspace is applied to that
workspace rather than the buyer's personal workspace.

If a webhook is missed, the delivery log is at `webhooks.webhook_deliveries`;
`bun run scripts/process-webhooks.ts` retries pending deliveries.

## 6. Configure MCP OAuth

The MCP server advertises:

```text
https://mcp.socioconnect.app/.well-known/oauth-protected-resource
```

The authorization server metadata is served by the API:

```text
https://api.socioconnect.app/.well-known/oauth-authorization-server
```

`MCP_RESOURCE_URL` must exactly match the client-facing MCP URL, including
`/mcp`. `OAUTH_ISSUER` must exactly match the API origin. A mismatch causes
`invalid_token` errors in ChatGPT, Claude, Codex, and Cursor.

## 7. Smoke tests

```bash
curl -fsS https://api.socioconnect.app/health
curl -fsS https://mcp.socioconnect.app/health
curl -fsS https://mcp.socioconnect.app/.well-known/oauth-protected-resource
curl -fsS https://api.socioconnect.app/.well-known/oauth-authorization-server
curl -fsS https://mcp.socioconnect.app/.well-known/openai-apps-challenge
curl -I https://socioconnect.app
```

Then:

1. Sign in with Google and open `/dashboard`.
2. Connect a social account.
3. Create, schedule, and cancel a post.
4. Create a workspace, switch to it, and confirm the plan is the workspace
   plan (not the personal plan).
5. Start a test-mode checkout and confirm the webhook upgrades the workspace.
6. Create an API key, list tools through MCP, and confirm scoped tools reject
   missing scopes.

## 8. Backups

Back up PostgreSQL and the Caddy data volume:

```bash
docker compose -f docker-compose.prod.yml exec -T postgres \
  pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB" | gzip > backup-$(date +%F).sql.gz

docker run --rm -v socioconnect_caddy_data:/data -v "$PWD":/backup alpine \
  tar czf /backup/caddy-$(date +%F).tar.gz -C /data .
```

Store backups off-host and test restores quarterly.

## 9. Updating

```bash
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml logs -f api
```

The API runs migrations on boot. Keep at least one database backup before a
deploy that includes a migration.

## 10. Operations

- API logs: `docker compose -f docker-compose.prod.yml logs -f api`
- MCP logs: `docker compose -f docker-compose.prod.yml logs -f mcp`
- Postgres shell: `docker compose -f docker-compose.prod.yml exec postgres psql -U postgres -d socioconnect`
- Restart one service: `docker compose -f docker-compose.prod.yml restart api`
- Metrics are exposed by the API at `/metrics`; see `docs/MONITORING.md`.

## Security notes

- Do not expose PostgreSQL, the API, MCP, or web ports directly. Caddy is the
  only public entry point.
- Billing routes are session-only and restricted to workspace owners/admins.
- API keys are hashed at rest and scoped per workspace.
- MCP never forwards OAuth tokens to the API; it exchanges them for short-lived
  internal service tokens.
- Rotate `JWT_SECRET`, `SERVICE_TOKEN_SECRET`, and provider secrets after any
  suspected leak. Rotating `JWT_SECRET` invalidates all sessions.
