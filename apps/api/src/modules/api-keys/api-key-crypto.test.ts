import { describe, expect, it } from "bun:test";
import {
  generateApiKey,
  hashApiKey,
  hashMatches,
  isValidScope,
  parseApiKey,
} from "./api-key-crypto";

describe("api key crypto", () => {
  it("generates parseable test and live keys", () => {
    const testKey = generateApiKey("test");
    const liveKey = generateApiKey("live");

    expect(testKey.token.startsWith("sck_test_")).toBe(true);
    expect(liveKey.token.startsWith("sck_live_")).toBe(true);

    const parsed = parseApiKey(testKey.token);
    expect(parsed?.prefix).toBe(testKey.prefix);
    expect(parsed?.secret.length).toBeGreaterThan(32);
  });

  it("generates unique keys", () => {
    const first = generateApiKey("test");
    const second = generateApiKey("test");
    expect(first.token).not.toBe(second.token);
    expect(first.prefix).not.toBe(second.prefix);
  });

  it("rejects malformed keys", () => {
    expect(parseApiKey("not-a-key")).toBeNull();
    expect(parseApiKey("sck_test_1234.secret")).toBeNull();
    expect(parseApiKey("sck_prod_12345678.secret")).toBeNull();
    expect(parseApiKey("sck_test_12345678")).toBeNull();
    expect(parseApiKey("sck_test_12345678.")).toBeNull();
  });

  it("hashes deterministically and detects mismatches", () => {
    const key = generateApiKey("test");
    const hash = hashApiKey(key.token);

    expect(hash).toBe(hashApiKey(key.token));
    expect(hashMatches(hash, key.keyHash)).toBe(true);
    expect(hashMatches(hashApiKey(`${key.token}x`), key.keyHash)).toBe(false);
    expect(hashMatches("00", key.keyHash)).toBe(false);
  });

  it("validates scopes", () => {
    expect(isValidScope("posts:publish")).toBe(true);
    expect(isValidScope("posts:read")).toBe(true);
    expect(isValidScope("admin:everything")).toBe(false);
  });
});
