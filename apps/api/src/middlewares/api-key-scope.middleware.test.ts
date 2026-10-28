import { describe, expect, it } from "bun:test";
import { Hono } from "hono";
import type { AppBindings } from "../types";
import { apiKeyScopeMiddleware } from "./api-key-scope.middleware";

function createApp() {
  const app = new Hono<AppBindings>();

  app.use("*", async (c, next) => {
    const authType = c.req.header("x-auth");
    const scopes = c.req.header("x-scopes")?.split(",").filter(Boolean);

    c.set(
      "auth",
      authType === "session"
        ? { type: "session", scopes: null }
        : { type: "api_key", scopes: scopes ?? ["posts:read"], apiKeyId: "key_1" },
    );

    await next();
  });

  app.use("*", apiKeyScopeMiddleware);

  app.get("/v1/posts", (c) => c.json({ ok: true }));
  app.post("/v1/posts", (c) => c.json({ ok: true }));
  app.get("/v1/accounts", (c) => c.json({ ok: true }));
  app.get("/v1/auth/me", (c) => c.json({ ok: true }));
  app.post("/v1/subscriptions/checkout", (c) => c.json({ ok: true }));

  return app;
}

describe("api key scope middleware", () => {
  it("allows a matching scope", async () => {
    const response = await createApp().request("/v1/posts");
    expect(response.status).toBe(200);
  });

  it("rejects a missing scope", async () => {
    const response = await createApp().request("/v1/posts", { method: "POST" });
    const body = (await response.json()) as {
      code: string;
      requiredScope: string;
    };

    expect(response.status).toBe(403);
    expect(body.code).toBe("INSUFFICIENT_SCOPE");
    expect(body.requiredScope).toBe("posts:write");
  });

  it("rejects unrelated routes", async () => {
    const response = await createApp().request("/v1/accounts");
    expect(response.status).toBe(403);
  });

  it("denies billing changes to API keys", async () => {
    const response = await createApp().request("/v1/subscriptions/checkout", {
      method: "POST",
    });
    const body = (await response.json()) as { code: string };

    expect(response.status).toBe(403);
    expect(body.code).toBe("API_KEY_ENDPOINT_FORBIDDEN");
  });

  it("honours a profile scope", async () => {
    const response = await createApp().request("/v1/auth/me", {
      headers: { "x-scopes": "profile:read" },
    });
    expect(response.status).toBe(200);
  });

  it("does not apply to browser sessions", async () => {
    const response = await createApp().request("/v1/subscriptions/checkout", {
      method: "POST",
      headers: { "x-auth": "session" },
    });
    expect(response.status).toBe(200);
  });
});
