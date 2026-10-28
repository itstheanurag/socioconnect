import { describe, expect, it } from "bun:test";
import {
  SERVICE_TOKEN_AUDIENCE,
  SERVICE_TOKEN_ISSUER,
  signServiceToken,
  verifyServiceToken,
} from "./service-token";
import { signJwt } from "./jwt";

const secret = "c".repeat(32);

describe("service tokens", () => {
  it("signs and verifies internal service tokens", () => {
    const token = signServiceToken(
      {
        userId: "user_1",
        workspaceId: "ws_1",
        scopes: ["posts:read", "posts:write"],
        clientId: "client_1",
      },
      secret,
    );

    const claims = verifyServiceToken(token, secret);
    expect(claims?.sub).toBe("user_1");
    expect(claims?.workspace_id).toBe("ws_1");
    expect(claims?.scope).toBe("posts:read posts:write");
    expect(claims?.client_id).toBe("client_1");
    expect(claims?.iss).toBe(SERVICE_TOKEN_ISSUER);
    expect(claims?.aud).toBe(SERVICE_TOKEN_AUDIENCE);
  });

  it("rejects tokens signed with another secret", () => {
    const token = signServiceToken({ userId: "user_1", workspaceId: "ws_1", scopes: [] }, secret);
    expect(verifyServiceToken(token, "d".repeat(32))).toBeNull();
  });

  it("rejects tokens with the wrong audience or token use", () => {
    const wrongAudience = signJwt(
      {
        token_use: "service",
        sub: "user_1",
        workspace_id: "ws_1",
        scope: "posts:read",
      },
      secret,
      { issuer: SERVICE_TOKEN_ISSUER, audience: "someone-else", expiresIn: 60 },
    );
    expect(verifyServiceToken(wrongAudience, secret)).toBeNull();

    const wrongUse = signJwt(
      {
        token_use: "oauth",
        sub: "user_1",
        workspace_id: "ws_1",
        scope: "posts:read",
      },
      secret,
      { issuer: SERVICE_TOKEN_ISSUER, audience: SERVICE_TOKEN_AUDIENCE, expiresIn: 60 },
    );
    expect(verifyServiceToken(wrongUse, secret)).toBeNull();
  });

  it("rejects expired service tokens", () => {
    const token = signJwt(
      {
        token_use: "service",
        sub: "user_1",
        workspace_id: "ws_1",
        scope: "posts:read",
      },
      secret,
      {
        issuer: SERVICE_TOKEN_ISSUER,
        audience: SERVICE_TOKEN_AUDIENCE,
        expiresIn: -10,
      },
    );
    expect(verifyServiceToken(token, secret)).toBeNull();
  });
});
