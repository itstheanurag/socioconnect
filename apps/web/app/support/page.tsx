import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/component/legal/legal-page";

export const metadata: Metadata = {
  title: "Support",
  description: "Get help with SocioConnect accounts, publishing, agents, and billing.",
};

export default function SupportPage() {
  return (
    <LegalPage
      eyebrow="Help"
      title="Support"
      intro="Find setup guides, troubleshoot publishing failures, or contact the team."
    >
      <LegalSection title="Agent and MCP setup">
        <p>
          MCP setup, OAuth scopes, tools, and local testing are documented in the{" "}
          <a
            className="text-rose-300 hover:text-rose-200"
            href="https://github.com/itstheanurag/socioconnect/blob/main/docs/MCP.md"
          >
            MCP guide
          </a>
          . API-key scopes and rate limits are in the{" "}
          <a
            className="text-rose-300 hover:text-rose-200"
            href="https://github.com/itstheanurag/socioconnect/blob/main/docs/API_KEYS.md"
          >
            API key guide
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection title="Connect or reconnect an account">
        <p>
          Open the dashboard, go to Connectors, and reconnect the platform. Tokens expire or are
          revoked by the platform; reconnecting only affects that account.
        </p>
      </LegalSection>

      <LegalSection title="Publishing failed">
        <p>
          Check the post detail page for the per-destination error. Reconnect revoked accounts, fix
          validation errors, and retry only transient failures. Ambiguous timeouts should be verified
          on the platform before retrying.
        </p>
      </LegalSection>

      <LegalSection title="Billing and plans">
        <p>
          Manage payment methods and invoices from the billing portal. Plan usage and reset dates are
          available on the usage page. Contact billing support for refunds or tax questions.
        </p>
      </LegalSection>

      <LegalSection title="Contact us">
        <p>
          Product support: <a className="text-rose-300 hover:text-rose-200" href="mailto:support@socioconnect.app">support@socioconnect.app</a>
          <br />
          Security: <a className="text-rose-300 hover:text-rose-200" href="mailto:security@socioconnect.app">security@socioconnect.app</a>
          <br />
          Privacy: <a className="text-rose-300 hover:text-rose-200" href="mailto:privacy@socioconnect.app">privacy@socioconnect.app</a>
        </p>
        <p>
          Include your workspace ID, the affected post or account, and the approximate time of the
          failure. Do not send access tokens or API keys.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
