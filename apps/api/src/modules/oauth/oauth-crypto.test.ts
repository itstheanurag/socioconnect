import { describe, expect, it } from "bun:test";
import { hashToken, pkceChallenge, randomToken, verifyPkce } from "./oauth-crypto";

describe("oauth crypto", () => {
  it("hashes tokens deterministically", () => {
    expect(hashToken("token")).toBe(hashToken("token"));
    expect(hashToken("token")).not.toBe(hashToken("other"));
  });

  it("creates unique opaque tokens", () => {
    const first = randomToken();
    const second = randomToken();
    expect(first.length).toBeGreaterThan(32);
    expect(first).not.toBe(second);
  });

  it("verifies S256 PKCE challenges", () => {
    const verifier = "a".repeat(64);
    const challenge = pkceChallenge(verifier);

    expect(challenge.length).toBeGreaterThan(30);
    expect(verifyPkce(verifier, challenge)).toBe(true);
    expect(verifyPkce(`${verifier}b`, challenge)).toBe(false);
    expect(verifyPkce(verifier, "short")).toBe(false);
  });
});
