# Billing (Dodo Payments)

Subscriptions are sold through [Dodo Payments](https://dodopayments.com). Dodo is
the merchant of record; this API owns entitlements.

The rule is simple: **checkout never grants a plan.** A plan is granted only when
a verified `subscription.*` webhook says the subscription is active.

## Environment

Add these to `.env` (see `.env.example`):

```bash
DODO_PAYMENTS_API_KEY=
DODO_PAYMENTS_WEBHOOK_KEY=
DODO_PAYMENTS_ENVIRONMENT=test_mode   # test_mode | live_mode
DODO_PAYMENTS_RETURN_URL=http://localhost:3000/app/billing?checkout=success
DODO_PAYMENTS_CANCEL_URL=http://localhost:3000/app/billing?checkout=cancelled

DODO_PRODUCT_SOLO_MONTHLY=
DODO_PRODUCT_SOLO_YEARLY=
DODO_PRODUCT_CREATOR_PRO_MONTHLY=
DODO_PRODUCT_CREATOR_PRO_YEARLY=
DODO_PRODUCT_STUDIO_MONTHLY=
DODO_PRODUCT_STUDIO_YEARLY=
DODO_PRODUCT_AGENCY_MONTHLY=
DODO_PRODUCT_AGENCY_YEARLY=
```

`DODO_PAYMENTS_API_KEY` is the bearer token from **Developer → API Keys**.
`DODO_PAYMENTS_WEBHOOK_KEY` is the signing secret from **Developer → Webhooks**.

Test and live keys are environment-specific. A test key only works against
`https://test.dodopayments.com`; a live key only works against
`https://live.dodopayments.com`.

## Dodo setup

1. Create one Dodo **subscription product** per paid tier and interval. Do not
   create a product for the Free tier.
2. Copy each product ID into the matching `DODO_PRODUCT_*` variable.
3. Make sure each product's period is longer than the payment frequency. For a
   recurring monthly plan, use a long subscription period (for example 20 years)
   with a monthly payment frequency. If the period equals the frequency, Dodo
   expires the subscription after one charge.
4. Add a webhook endpoint pointing at:

   ```text
   https://<api-host>/v1/subscriptions/webhook
   ```

5. Subscribe it to at least:
   - `subscription.active`
   - `subscription.updated`
   - `subscription.renewed`
   - `subscription.plan_changed`
   - `subscription.cancelled`
   - `subscription.expired`
   - `subscription.failed`
   - `subscription.on_hold`
   - `subscription.past_due`
   - `subscription.paused`
   - `subscription.unpaused`
   - `payment.succeeded`

6. Optional: put the paid products in a Dodo **Product Collection** and enable
   **Allow Subscription Updates** so customers can change plans in the customer
   portal.

## API

| Method | Path                         | Purpose                                  |
| ------ | ---------------------------- | ---------------------------------------- |
| `GET`  | `/v1/subscriptions/current`  | Current tier, limits, usage, period      |
| `GET`  | `/v1/subscriptions/plans`    | Public plan catalog                      |
| `POST` | `/v1/subscriptions/checkout` | Create a hosted Dodo checkout session    |
| `POST` | `/v1/subscriptions/portal`   | Create a Dodo customer portal session    |
| `POST` | `/v1/subscriptions/cancel`   | Cancel at period end                     |
| `POST` | `/v1/subscriptions/resume`   | Clear a scheduled cancellation / unpause |
| `GET`  | `/v1/subscriptions/invoices` | Local invoice history                    |
| `POST` | `/v1/subscriptions/webhook`  | Dodo webhook receiver                    |

Checkout body:

```json
{
  "tier": "creator_pro",
  "interval": "monthly",
  "successUrl": "https://app.example.com/app/billing?checkout=success",
  "cancelUrl": "https://app.example.com/app/billing?checkout=cancelled"
}
```

The response contains a `checkoutUrl`. Redirect the browser there. The local
subscription is unchanged until the webhook arrives.

## Webhook security and idempotency

- Signatures use the [Standard Webhooks](https://standardwebhooks.com/) scheme:
  `HMAC-SHA256("{webhook-id}.{webhook-timestamp}.{rawBody}")`, base64 encoded,
  with the `whsec_` prefix removed from the secret before base64 decoding.
- Timestamps older or newer than five minutes are rejected.
- The raw request body is verified before JSON parsing. Do not add a JSON body
  validator to this route.
- Every `webhook-id` is claimed in `subscriptions.billing_webhook_events`.
  Already-processed events return `200` with `{ "received": true, "duplicate": true }`.
  Failed events are marked failed and retried on the next delivery.
- The handler returns a non-2xx status when processing fails, so Dodo retries.

## Entitlement sync

`SubscriptionsRepository.syncFromProvider` is the only write path used by
webhooks. It:

- maps the Dodo product ID back to an internal tier and interval;
- resolves the user from the checkout metadata (`user_id`) or an existing
  customer/subscription ID;
- updates status, period dates, cancellation state, limits, and provider IDs;
- resets monthly drops and AI credits when the billing period advances.

Status mapping:

| Dodo status                    | Local status | Entitlement                     |
| ------------------------------ | ------------ | ------------------------------- |
| `active`                       | `active`     | plan tier                       |
| `past_due`                     | `past_due`   | plan tier during grace period   |
| `paused`, `on_hold`, `pending` | `paused`     | Free                            |
| `cancelled` (at period end)    | `canceled`   | plan tier until the period ends |
| `cancelled` (immediate)        | `canceled`   | Free                            |
| `expired`, `failed`            | `canceled`   | Free                            |

`payment.succeeded` records/updates an invoice in `subscriptions.invoices`
using the payment or invoice ID as the idempotency key.

## Local development

Dodo's CLI mock events (`dodo wh trigger`) are not signed. To replay them
locally, set:

```bash
DODO_PAYMENTS_SKIP_WEBHOOK_VERIFICATION=true
```

This flag is ignored when `NODE_ENV=production`. Prefer `dodo wh listen`, which
forwards real signed events to your local endpoint.

## Not implemented yet

- Quota enforcement in post creation (`QuotasRepository.incrementDrops` runs
  without checking the limit).
- Blocking API writes when a subscription is `past_due`, `paused`, or `canceled`.
- Fetching Dodo invoices directly; the local invoice table is populated by
  webhooks only.
- Proration UI. Plan changes are handled by Dodo's portal/product collection.
- Reconciliation job for missed webhooks.

## Migration note

`apps/api/drizzle/0003_dodo_billing.sql` was generated from the full current
schema because migrations `0000`-`0002` only cover `users.users` and
`users.sessions`; the rest of the schema was previously applied outside the
migration history. It creates the missing schemas/tables and adds:

- `subscriptions.billing_webhook_events`
- `invoices_external_invoice_id_idx`
