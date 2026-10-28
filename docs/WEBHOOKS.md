# Outbound Webhooks

Workspace webhooks deliver signed JSON events to your endpoint.

## Endpoints

```text
GET    /v1/webhooks
POST   /v1/webhooks
DELETE /v1/webhooks/{id}
POST   /v1/webhooks/{id}/test
```

Create body:

```json
{
  "url": "https://example.com/socioconnect/hook",
  "description": "Production automation",
  "events": ["post.published", "post.failed"]
}
```

The response includes the signing secret **once**:

```json
{
  "payload": {
    "webhook": { "id": "...", "events": ["post.published"], "status": "active" },
    "secret": "whsec_..."
  }
}
```

Use `["*"]` or omit `events` to subscribe to everything.

## Events

- `post.created`
- `post.updated`
- `post.cancelled`
- `post.published`
- `post.failed`
- `publish_intent.created`
- `publish_intent.confirmed`
- `dispatch.retried`
- `dispatch.succeeded`
- `dispatch.failed`
- `webhook.test`

## Delivery headers

```text
X-SocioConnect-Id: <delivery-id>
X-SocioConnect-Event: post.published
X-SocioConnect-Timestamp: 1793160000
X-SocioConnect-Signature: v1,<hex-hmac-sha256>
```

Signature input:

```text
HMAC_SHA256(secret, `${timestamp}.${rawBody}`)
```

Compare with a constant-time function and reject timestamps older than five
minutes.

## Payload

```json
{
  "id": "delivery-uuid",
  "type": "post.published",
  "createdAt": "2026-10-28T07:00:00.000Z",
  "workspaceId": "workspace-uuid",
  "data": {
    "postId": "post-uuid",
    "publishedAt": "2026-10-28T06:59:58.000Z"
  }
}
```

## Reliability

Every delivery is persisted in `webhooks.webhook_deliveries`. Successful
responses are marked `success`; failures are marked `failed` with
`nextRetryAt = now + 5 minutes`. A worker can retry pending deliveries.

Current limitation: delivery is attempted in-process after the event. Run the
API as a long-lived process, or add a worker for guaranteed retries.

## URL rules

- HTTPS in production
- HTTP allowed only for localhost in development
- No credentials or fragments in the URL
- Private-network SSRF protection should be added before exposing webhooks to
  untrusted users

## CLI

```bash
socioconnect webhooks list
socioconnect webhooks create --url https://example.com/hook --events post.published,post.failed
socioconnect webhooks test <webhookId>
socioconnect webhooks delete <webhookId>
```
