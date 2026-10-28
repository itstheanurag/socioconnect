import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/component/legal/legal-page";

export const metadata: Metadata = {
  title: "MCP and Agent Setup",
  description: "Connect ChatGPT, Claude, Codex, or Cursor to SocioConnect with OAuth.",
};

const MCP_URL = process.env.NEXT_PUBLIC_MCP_URL || "https://mcp.socioconnect.app/mcp";

export default function McpDocsPage() {
  return (
    <LegalPage
      eyebrow="Developers"
      title="MCP and Agent Setup"
      intro="SocioConnect exposes one remote MCP server for ChatGPT, Claude, Codex, Cursor, Claude Code, and custom agents."
    >
      <LegalSection title="Endpoint">
        <p>
          Add this URL as a remote MCP server or connector:
        </p>
        <pre className="overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-900 p-3 font-mono text-[11px] text-neutral-300">
          {MCP_URL}
        </pre>
        <p>
          The server publishes OAuth protected-resource metadata and registers clients dynamically.
          API keys are supported for CLI and private agents.
        </p>
      </LegalSection>

      <LegalSection title="OAuth">
        <p>
          Marketplace clients use OAuth 2.1 with PKCE. The consent page shows the requested scopes.
          Access tokens are audience-bound to the MCP server and expire quickly; refresh tokens rotate
          on use.
        </p>
        <p>
          The OAuth token is never forwarded to the REST API. The MCP gateway exchanges it for a
          short-lived internal service token scoped to the same user, workspace, and permissions.
        </p>
      </LegalSection>

      <LegalSection title="Tools">
        <p>
          Read: profile, accounts, destinations, platform capabilities, posts, usage, and account
          connection links. Write: create/update drafts, create/confirm publish intents, cancel
          scheduled posts, and retry failed dispatches.
        </p>
        <p>
          Every public post goes through draft → publish intent → preview → confirmation. Agents
          cannot connect accounts; the user completes connection in the browser.
        </p>
      </LegalSection>

      <LegalSection title="Scopes">
        <p>
          Scopes include <code>profile:read</code>, <code>accounts:read</code>,{" "}
          <code>posts:read</code>, <code>posts:write</code>, <code>posts:publish</code>,{" "}
          <code>media:write</code>, <code>analytics:read</code>, and <code>usage:read</code>.
          Publishing is separate from drafting so content-generation agents can be restricted.
        </p>
      </LegalSection>

      <LegalSection title="More">
        <p>
          Full setup, security notes, and local testing:{" "}
          <a
            className="text-rose-300 hover:text-rose-200"
            href="https://github.com/itstheanurag/socioconnect/blob/main/docs/MCP.md"
          >
            docs/MCP.md
          </a>
          . Need help? Visit <a className="text-rose-300 hover:text-rose-200" href="/support">Support</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
