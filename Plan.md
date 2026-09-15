# Socioconnect SaaS Plan

## Product Definition

Socioconnect lets a subscriber compose once, select connected social accounts, and publish immediately or schedule an independent delivery to every selected destination. A failure, retry, revoked token, or rate limit at one platform must never block the others.

The first release should support text and link posts. Images and video are a separate delivery slice: they need upload, inspection, derivatives, provider-specific encoding, and often asynchronous provider processing.

### Core journey

1. Sign in to Socioconnect.
2. Connect one or more publishing destinations.
3. Compose content, select destinations, and review per-platform validation.
4. Publish immediately or, on an eligible plan, schedule a UTC time from an IANA timezone.
5. See each destination's status, failure reason, and permalink.
6. Reconnect or retry only the affected destination.

### First-release non-goals

- Social inbox, analytics, collaboration, approvals, recurring schedules, AI writing, or native per-platform variants.
- Personal Facebook profile and consumer Instagram publishing.
- Promising a platform before developer access, commercial terms, and app review are confirmed.

## Current Repository Assessment

The repository is a Bun/Turborepo backend template:

- \`apps/api\`: Hono API with OpenAPI.
- \`packages/db\`: PostgreSQL/Drizzle schema and services.
- \`packages/shared\`: AES-GCM encryption, JWT, logging, metrics, rate limiting, OAuth types.
- \`packages/config\`: common configuration.
- PostgreSQL, Prometheus, Grafana, and Loki are already available through \`docker-compose.dev.yml\`.

Google and Apple OAuth currently authenticate a Socioconnect user. They must remain distinct from social publishing connections: \`users.sessions\` assumes a login session with required refresh-token fields and cannot safely represent multiple social accounts, scopes, page tokens, or provider-specific metadata.

## Architecture

### Deployables

\`\`\`text
apps/
  web/       Next.js App Router dashboard
  api/       existing Hono REST/OpenAPI API and OAuth callbacks
  worker/    background publisher, scheduler, and maintenance processes
packages/
  db/        schemas, migrations, repositories/services
  shared/    crypto, logging, metrics, queue contracts, platform types
  config/    environment schemas and shared constants
\`\`\`

- **Next.js web app**: dashboard and composer. It calls the API; it never calls platform APIs or writes the database directly.
- **Hono API**: source of truth for identity, entitlements, connections, posts, scheduling commands, and OAuth callbacks.
- **Worker**: a separate process/deployment for token refresh, provider calls, retries, and status writes. It never serves browser requests.
- **PostgreSQL**: durable business data, audit history, schedule source of truth, and transactional outbox.
- **Redis + BullMQ**: delayed jobs, locks, retry/backoff, concurrency controls, and queue visibility. Add Redis to local Compose. PostgreSQL remains authoritative.
- **S3-compatible object storage**: private originals and signed uploads. Generate provider-fetchable URLs only when required.
- **Stripe**: Checkout, Customer Portal, and signed webhooks. Webhooks, not browser redirects, update subscription state.

### Independent fan-out

\`\`\`text
create/schedule command
  -> transaction: post + one destination per account + outbox events
  -> dispatcher: enqueue one job per destination
  -> workers: publish independently
  -> write per-destination status, attempt, error, and permalink
\`\`\`

A post is a bundle, but every \`post_destination\` is an independent state machine.

| Entity | States |
| --- | --- |
| Post | \`draft\`, \`scheduled\`, \`queued\`, \`publishing\`, \`partially_published\`, \`published\`, \`failed\`, \`cancelled\` |
| Destination | \`pending\`, \`queued\`, \`publishing\`, \`published\`, \`retrying\`, \`failed\`, \`cancelled\`, \`needs_reconnect\` |
| Connection | \`active\`, \`expired\`, \`revoked\`, \`disconnected\`, \`error\` |

Use compare-and-set status transitions, persist an attempt before an external request, and attach an idempotency key to every destination. This is **at-least-once** delivery: an API timeout can leave an ambiguous publish. Pass idempotency keys where a provider supports them; otherwise reconcile by remote ID/content/time before automatic retry. Never blindly retry an ambiguous, non-idempotent publish.

### Queue and failure policy

- One job per destination, keyed by immutable destination ID.
- Per-platform and per-connection concurrency/rate limits prevent one account from exhausting a provider quota.
- Classify errors as terminal validation, authorization/revoked token, rate limit, transient network/5xx, asynchronous provider processing, or permanent provider rejection.
- Retry transient work with exponential backoff plus jitter, bounded to five attempts over about 24 hours unless a provider's \`Retry-After\` requires a later time.
- A rate limit uses the provider reset time; a bad token marks only that connection \`needs_reconnect\`; a terminal rejection records remediation text.
- A manual retry appends an attempt and preserves history.
- Delayed jobs are queue hints, not the only schedule record. A scheduler scans due destinations with \`FOR UPDATE SKIP LOCKED\`; an outbox reconciler restores missing jobs after Redis/worker failure.
- Cancellation atomically cancels unclaimed destinations. A worker checks cancellation immediately before publishing. A platform-accepted publish cannot necessarily be recalled.

## Social Platform Strategy

Build integrations through a common adapter, never platform conditionals spread across API handlers and workers.

\`\`\`ts
interface SocialPlatformAdapter {
  platform: SocialPlatform;
  getAuthorizationUrl(input: OAuthStart): Promise<string>;
  completeConnection(input: OAuthCallback): Promise<ConnectedAccount[]>;
  refreshCredentials(connection: SocialConnection): Promise<RefreshedCredentials>;
  getCapabilities(account: ConnectedAccount): Promise<PlatformCapabilities>;
  validate(post: NormalizedPost, caps: PlatformCapabilities): ValidationIssue[];
  publish(input: PublishInput): Promise<PublishResult | AsyncPublishResult>;
  poll?(result: AsyncPublishResult): Promise<PublishResult>;
  disconnect?(connection: SocialConnection): Promise<void>;
}
\`\`\`

The adapter owns OAuth, account discovery, token refresh, media upload, provider normalization, limits, and error mapping.

| Phase | Platforms/scope | Reason |
| --- | --- | --- |
| Pilot | LinkedIn member and X text/link posts | Smallest useful cross-posting slice. |
| 1.0 | Facebook Pages text/link/image, LinkedIn/X image | Adds account discovery and common image pipeline. |
| 1.1 | Instagram Professional feed/carousel/reel | Requires professional account, Meta review, public media URLs, and async containers. |
| Later | TikTok, Threads, YouTube, Pinterest, Bluesky | Add only after capability, approval, and pricing review. |

Maintain a versioned capability profile per platform/account type: required scopes, supported media, caption-count algorithm, media size/dimensions/duration, rate limits, API version/sunset, app-review status, and sync vs async publish.

Current constraints to validate before onboarding:

- LinkedIn's current Posts API requires \`w_member_social\` for member publishing; organization publishing uses separate restricted permissions. [Official docs](https://learn.microsoft.com/en-us/linkedin/marketing/community-management/shares/posts-api?view=li-lms-2026-01)
- X publishing uses user-context OAuth and \`POST /2/tweets\`; refresh tokens require \`offline.access\`, and plan restrictions apply. [OAuth guide](https://docs.x.com/fundamentals/authentication/oauth-2-0/user-access-token), [Posts API](https://docs.x.com/x-api/posts/create-post)
- Facebook publishing is for Pages. Instagram publishing is for Professional accounts; the Facebook Login path requires a linked Page and Meta permissions/app review. [Instagram documentation](https://www.postman.com/meta/instagram/documentation/6yqw8pt/instagram-api?entity=request-23987686-66f145c2-29b1-4d97-afbd-5710369027c0)
- TikTok Direct Post requires \`video.publish\` approval and an audit for public visibility, and has creator-level post caps. [Official guide](https://developers.tiktok.com/docs/en/content-posting-api-get-started)

Do not hard-code character limits from memory. The adapter exposes a versioned validator and the API returns a per-destination validation matrix.

## Data Model

Add a \`social\` schema and a \`billing\` schema. Store timestamps as UTC \`timestamptz\`; retain the selected IANA timezone for display and schedule interpretation.

| Social table | Purpose |
| --- | --- |
| \`oauth_states\` | One-time state, PKCE verifier, platform, redirect path, expiry and consumed timestamp. |
| \`connections\` | User/platform credential container, encrypted access/refresh token triples, expiry, granted scopes, metadata, status, refresh/error timestamps. |
| \`social_accounts\` | Selectable identity: connection, platform account ID/type, display name, handle, avatar, capabilities snapshot, status. Unique platform/account ID. |
| \`media_assets\` | Owner, object key, MIME, byte size, checksum, dimensions/duration, inspection state, deletion timestamp. |
| \`posts\` | User composition: body, canonical link, structured metadata, lifecycle, requested schedule/timezone, timestamps. |
| \`post_media\` | Ordered post/media relation and alt text. |
| \`post_destinations\` | Independent payload and validation snapshots, status, timings, remote ID/permalink, idempotency key, current sanitized error. Unique post/account pair. |
| \`publish_attempts\` | Immutable provider-call audit: destination, attempt number, correlation ID, outcome classification, sanitized provider response, retry time. |
| \`outbox_events\` | Events written transactionally: type, aggregate, payload, availability/processed time, attempt count. |
| \`platform_capabilities\` | Versioned limits/features by platform and account type, API version and review date. |

| Billing table | Purpose |
| --- | --- |
| \`plans\` | Internal plan key and entitlements; no Stripe prices hard-coded through the product. |
| \`subscriptions\` | User/customer/Stripe IDs, plan key, status, period and cancellation state. |
| \`usage_counters\` | Period-scoped publish-operation usage. |
| \`billing_events\` | Idempotently handled Stripe event ID and audit payload hash. |

Add foreign keys, user ownership checks, soft deletes where recoverability is useful, and indexes for due destinations, active connections, post lists, and outbox backlog. Generate and review Drizzle migrations before applying.

## Subscriptions and Entitlements

Start with configurable Free and Pro plans, then a workspace-ready Team plan.

| Entitlement | Free | Pro | Team later |
| --- | ---: | ---: | ---: |
| Connected accounts | small fixed cap | larger cap | per workspace |
| Publish operations per period | small cap | plan cap | pooled cap |
| Immediate publishing | yes | yes | yes |
| Scheduling | no | yes | yes |
| Platforms/media | limited | plan-defined | plan-defined |

One operation is one attempted destination publish, not one composer click. A three-platform post uses three operations. Reserve eligible quota in the creation transaction; never double-charge platform/network retries. Product policy must explicitly define whether user-initiated retry or terminal local validation consumes quota.

The API authorizes all writes from database entitlements. The worker rechecks entitlement before a scheduled publish. Frontend plan gating is helpful but never authoritative. On downgrade/cancellation, retain history but cancel/hold future destinations no longer entitled rather than silently delete them.

Stripe requirements:

- Map Stripe price IDs to internal plan keys in configuration.
- Verify webhook signatures from the raw request body.
- Idempotently process events by Stripe event ID and tolerate out-of-order delivery.
- Reconcile subscription state daily during early production.
- Keep secret keys server-side; expose only Checkout/Portal session URLs.

## API Contract

Keep the existing Hono/OpenAPI \`/v1\` pattern. Writes need user authorization, ownership checks, API idempotency keys, body-size limits, and rate limits.

### Connections

- \`GET /v1/social/platforms\`: enabled platforms and public capability hints.
- \`POST /v1/social/connections/:platform/start\`: state creation and authorization start.
- \`GET|POST /v1/social/connections/:platform/callback\`: state/PKCE validation, server-side token exchange, account discovery, dashboard redirect.
- \`GET /v1/social/accounts\`: connected publishable accounts and statuses.
- \`DELETE /v1/social/accounts/:id\`: revoke/disconnect if supported and erase credentials.
- \`POST /v1/social/accounts/:id/refresh\`: explicit re-authentication/reconnect flow.

### Posts and media

- \`POST /v1/posts/validate\`: no side effects; returns a validation/warning matrix by selected destination.
- \`POST /v1/posts\`: creates draft, immediate, or scheduled bundle and returns immediately; it never waits for external publishing.
- \`GET /v1/posts\`: cursor-paginated history with filters.
- \`GET /v1/posts/:id\`: composition, destinations, sanitized attempts, links.
- \`PATCH /v1/posts/:id\`: draft-only changes. Updating a schedule cancels unclaimed jobs, revalidates, then requeues atomically.
- \`POST /v1/posts/:id/destinations/:destinationId/retry\`: retry one terminal, retry-safe failure.
- \`POST /v1/posts/:id/cancel\`: cancel unclaimed scheduled destinations.
- \`POST /v1/media/upload-intents\` and \`POST /v1/media/:id/complete\`: signed upload with checksum, type, and size enforcement.

### Billing

- \`GET /v1/billing/entitlements\`
- \`POST /v1/billing/checkout-session\`
- \`POST /v1/billing/customer-portal-session\`
- \`POST /v1/webhooks/stripe\` with a raw-body signature-verification route.

## Validation and Media

The client validates early; the API is authoritative; the worker performs final checks before every provider request.

1. **Client**: counters, selected-account status, plan affordances, debounced validation matrix.
2. **API**: Zod input, ownership, entitlement, current connection/account state, normalized validation.
3. **Worker**: current provider capability plus snapshotted payload. It can fail only the affected destination.

Snapshot normalized payload, validation result, and capabilities on each destination at queue time. Preserve Unicode and use each provider's documented measurement algorithm; graphemes, shortened URLs, hashtags, and UTF-16 units vary.

For media validate MIME and magic bytes, size, checksum, dimensions, codec/duration, ownership, inspection state, and platform requirements. Strip EXIF by default or get explicit consent. Create derivatives asynchronously and require them before queueing a compatible destination.

## Next.js Dashboard

Create \`apps/web\` with Next.js App Router, TypeScript, and an API client based on the Hono OpenAPI contract. Never put social credentials or long-lived API tokens in local storage.

| Route | Purpose |
| --- | --- |
| \`/login\` | Existing Socioconnect sign-in handoff. |
| \`/onboarding\` | First account connection and plan selection. |
| \`/compose\` | Main composer, target selector, validation matrix, immediate/scheduled submit. |
| \`/posts\` | Post history and filters. |
| \`/posts/[id]\` | Per-destination timeline, permalink, reconnect/retry actions. |
| \`/accounts\` | Connect, reconnect, disconnect publishing accounts. |
| \`/billing\` | Plan, usage, Checkout, Customer Portal. |
| \`/settings\` | Profile, timezone, security, deletion controls. |

Design direction, for the later UI phase: a compact operational tool with sharp edges, restrained surfaces, thin visible borders, 8px-or-less radii, high legibility, and sparing status color. The composer is the first screen, not a marketing landing page. Implement keyboard, focus, loading, empty, error, disabled, and mobile states together with the core screens.

The composer must show selected accounts and a platform-specific validation panel; it must not silently omit incompatible targets. Scheduling uses explicit date/time plus IANA timezone, shows resolved UTC time, and handles daylight-saving ambiguity. After submit, lead to post detail and short-poll status initially; evaluate SSE once the worker model is stable.

## Security, Privacy, and Reliability

- Use separate social OAuth state with short TTL, single use, CSRF state, PKCE where supported, redirect allowlisting, and safe browser-facing errors.
- Encrypt social credentials using the existing AES-256-GCM utility, adding key versioning and a documented rotation process. Only API callbacks and workers may decrypt.
- Redact tokens, auth headers, codes, webhook signatures, upload URLs, and raw provider responses from logs, traces, metrics, OpenAPI, and support exports.
- Request minimal scopes, store granted scopes, and detect scope loss.
- Verify Stripe and provider webhooks. Isolate callback/webhook routes from ordinary auth, with their own verification.
- Enforce tenant ownership for every ID, opaque UUIDs, cursor pagination, and referential integrity. Audit connection, disconnect, publish, retry, cancellation, and entitlement changes.
- Define deletion/retention: revoke tokens where possible, delete media on request, retain only essential financial/audit facts, and document subprocessors.
- Use separate API/worker identities, least-privileged DB roles, managed production secrets, and private object storage.

## Observability and Operations

Extend the current Prometheus/Grafana/Loki setup with:

- Counters for publish commands, destination outcomes, retries, reconnects, OAuth results, quota rejections, and Stripe webhook results.
- Histograms for queue latency, provider call duration, publish duration, token refresh, and media processing.
- Gauges for active/delayed/failed jobs, due schedules, outbox backlog, expiring connections, and usage.
- Only bounded labels such as platform, outcome, error class, and plan; never user/post IDs.
- A correlation ID from API command to destination, outbox event, job, and provider attempt.
- Alerts for queue backlog, platform failure spikes, old outbox events, refresh failures, missed schedules, and webhook failures.
- Admin-only audited reconciliation/replay tooling for orphaned outbox events, stale publishing states, and provider async polling.

## Test Strategy

### Unit

- Adapter normalizers/validators, provider error classification, backoff, entitlement resolution, timezone calculations.
- Encryption/key-version behaviour and redaction.

### Integration

- Migrations, transactional post/outbox fan-out, ownership/entitlement enforcement, OAuth state single use, Stripe webhook idempotency.
- PostgreSQL/Redis/BullMQ worker flows: crash after provider response, duplicate jobs, stale lock, delayed job, cancellation race.

### Adapter contract tests

Run a shared fixture suite for OAuth setup, account discovery, refresh, validation, success, rate limit, unauthorized, provider rejection, timeout, ambiguous duplicate, and async completion. Use provider sandboxes/test accounts, never production credentials in CI.

### End-to-end

- Sign in -> connect -> compose -> partial failure -> retry only failed target.
- Pro payment webhook -> schedule -> due transition -> delivery.
- Free scheduling/quota rejected in UI and API.
- Keyboard, screen-reader, desktop/mobile visual tests for composer, post detail, accounts, billing.

## Delivery Phases

### Phase 0: provider and commercial readiness

1. Select launch platforms/content formats.
2. Create provider apps, callbacks, scopes, approval/app-review evidence, and test accounts.
3. Configure Stripe, plans, tax/support policy, terms/privacy, retention.
4. Write capability catalog and error taxonomy.

**Exit:** each pilot platform has an accepted approval path and test credential; do not promise unsupported platforms.

### Phase 1: durable foundation

1. Scaffold \`apps/web\` and \`apps/worker\`; add Redis/BullMQ, health checks, environment templates.
2. Add social/billing schemas, Drizzle migrations, services, outbox, queues, metrics.
3. Implement entitlement service and Stripe webhook persistence.
4. Implement social OAuth state and adapter interface.

**Exit:** a fixture adapter can connect, create fan-out jobs, survive Redis/worker restart, and produce an auditable state.

### Phase 2: text-post MVP

1. Implement LinkedIn and X OAuth, discovery, refresh, validation, text/link publishing, and error mapping.
2. Implement connections, composer validation/create, history, post detail, retry/cancel APIs and dashboard.
3. Add upload architecture but hold media UI until end-to-end verified.
4. Enable immediate plan checks; enable scheduling only after scheduler/reconciliation tests pass.

**Exit:** injected failure on one real/test platform yields \`partially_published\`; another selected platform succeeds; only failed target is retryable.

### Phase 3: paid scheduling and operations

1. Enable production-like Stripe Checkout/Portal and webhooks.
2. Add scheduler, cancellation/reschedule, quota reservation, usage UI, downgrade behavior, reconciliation.
3. Build dashboards, alerts, runbooks, and replay tooling.

**Exit:** schedules survive Redis/worker restart, publish within the agreed SLA window, and every outcome is explainable.

### Phase 4: media and Meta

1. Add storage, inspection, derivatives, and images to first platforms.
2. Complete Meta review, Page discovery, Facebook Pages, and Instagram Professional publishing with async polling.
3. Expand capability UI and test matrix for media/account types.

**Exit:** no selected target is falsely advertised as compatible; media failure affects only relevant destinations.

### Phase 5: launch hardening

1. Run load, chaos, security, retention/deletion, accessibility, and recovery tests.
2. Re-verify provider production callbacks, review conditions, branding/UX rules, and rate limits.
3. Finalize runbooks for revocation, outage, duplicate ambiguity, missed schedule, webhook outage, and deletion.

**Exit:** production readiness approves provider compliance, security, observability, backup/restore, support, and rollback.

## Recommended Build Order

1. Scaffold Next.js dashboard and worker; add Redis/BullMQ.
2. Add social schema, migrations, adapter contracts, outbox, and a fixture adapter.
3. Prove independent fan-out/recovery with API and worker tests.
4. Build the functional Accounts, Composer, Posts, and Post Detail dashboard.
5. Add the first real platform once its provider app/scopes are available.
6. Add Stripe entitlements and paid scheduling after immediate delivery is reliable.
7. Add media, Meta, and other platforms as independent capability slices.

This ordering establishes the product's hardest promise—durable, independently observable delivery—before platform breadth or visual polish.

