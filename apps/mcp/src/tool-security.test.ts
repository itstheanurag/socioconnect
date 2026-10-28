import { describe, expect, it } from "bun:test";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMcpServer } from "./server";
import { TOOL_SECURITY_SCHEMES } from "./tool-security";

interface ToolMeta {
  securitySchemes?: Array<{ name: string; scopes?: string[] }>;
}

describe("MCP tool security metadata", () => {
  it("advertises a security scheme for every tool", async () => {
    const server = createMcpServer({ type: "oauth", apiToken: "test", scopes: [] });
    const client = new Client({ name: "test-client", version: "1.0.0" });
    const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

    await Promise.all([client.connect(clientTransport), server.connect(serverTransport)]);

    try {
      const result = await client.listTools();
      expect(result.tools.length).toBeGreaterThan(0);

      for (const tool of result.tools) {
        const meta = (tool._meta ?? {}) as ToolMeta;
        expect(meta.securitySchemes).toEqual(TOOL_SECURITY_SCHEMES[tool.name]);
      }

      const confirm = result.tools.find((tool) => tool.name === "confirm_publish_intent");
      const scopes = (confirm?._meta as ToolMeta | undefined)?.securitySchemes?.[0]?.scopes;
      expect(scopes).toContain("posts:publish");
    } finally {
      await client.close();
    }
  });
});
