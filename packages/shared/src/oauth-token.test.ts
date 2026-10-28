import { describe, expect, it } from "bun:test";
import { signOAuthAccessToken, verifyOAuthAccessToken } from "./oauth-token";

const secret = "a".repeat(32);
const options = {
  secret,
  issuer: "https://api.example.com",
  audience: "https://mcp.example.com/mcp",
};

function sign(overrides: Partial<Parameters<typeof signOAuthAccessToken>[0]> = {}) {
  return signOAuthAccessToken(
    {
      userId: "user_1",
      workspaceId: "ws_1",
      scopes: ["posts:read", "posts:publish"],
      clientId: "client_1",
      issuer: options.issuer,
      audience: options.audience,
      ttlSeconds: 60,
      ...overrides,
    },
    secret,
  );
}

describe("oauth access tokens", () => {
  it("signs and verifies audience-bound tokens", () => {
    const claims = verifyOAuthAccessToken(sign(), options);

    expect(claims?.sub).toBe("user_1");
    expect(claims?.workspace_id).toBe("ws_1");
    expect(claims?.client_id).toBe("client_1");
    expect(claims?.scope).toBe("posts:read posts:publish");
    expect(claims?.token_use).toBe("oauth");
  });

  it("rejects tokens for another audience", () => {
    const token = sign({ audience: "https://other.example.com/mcp" });
    expect(verifyOAuthAccessToken(token, options)).toBeNull();
  });

  it("rejects tokens from another issuer", () => {
    const token = sign({ issuer: "https://other.example.com" });
    expect(verifyOAuthAccessToken(token, options)).toBeNull();
  });

  it("rejects tokens signed with another secret", () => {
    const token = sign();
    expect(verifyOAuthAccessToken(token, { ...options, secret: "b".repeat(32) })).toBeNull();
  });

  it("rejects expired tokens", () => {
    const token = sign({ ttlSeconds: -10 });
    expect(verifyOAuthAccessToken(token, options)).toBeNull();
  });
});
