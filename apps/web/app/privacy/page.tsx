import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/component/legal/legal-page";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How SocioConnect collects, uses, and protects account and publishing data.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Privacy Policy"
      updated="October 2026"
      intro="SocioConnect publishes content to social platforms on your behalf. This policy explains what we collect, why we collect it, and the controls available to you."
    >
      <LegalSection title="Data we collect">
        <p>
          Account data such as your name, email address, avatar, and authentication identifiers.
          Workspace data such as connected social accounts, destination metadata, drafts, scheduled
          posts, published permalinks, and agent activity.
        </p>
        <p>
          Credential data such as encrypted social-platform access and refresh tokens. Raw tokens are
          never displayed in the product or written to audit logs.
        </p>
        <p>
          Operational data such as API-key metadata, usage events, audit events, IP address, user
          agent, and request identifiers.
        </p>
      </LegalSection>

      <LegalSection title="How we use data">
        <p>
          To authenticate you, connect accounts you authorize, validate and publish content, retry
          failed deliveries, display usage, enforce plan limits, prevent abuse, and provide support.
        </p>
        <p>
          We do not sell personal data. We do not use your content to train models. Agent tool
          responses are limited to the workspace and scopes authorized by the credential.
        </p>
      </LegalSection>

      <LegalSection title="Sharing">
        <p>
          Content and required account identifiers are sent to the social platforms you select.
          Payment and subscription data is processed by Dodo Payments as merchant of record. Hosting,
          storage, and observability providers process data on our behalf under contractual
          safeguards.
        </p>
      </LegalSection>

      <LegalSection title="Retention and security">
        <p>
          Platform tokens are encrypted at rest with AES-256-GCM. API keys and refresh tokens are
          stored as hashes. Audit and usage ledgers are retained for security, billing, and product
          analytics. You can disconnect an account or revoke an API key at any time.
        </p>
      </LegalSection>

      <LegalSection title="Your controls">
        <p>
          You can disconnect social accounts, revoke agent credentials, delete drafts, cancel
          scheduled posts, export or delete workspace data, and request account deletion. Some audit
          and billing records may be retained where required by law.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Privacy questions: <a className="text-rose-300 hover:text-rose-200" href="mailto:privacy@socioconnect.app">privacy@socioconnect.app</a>.
          Support: <a className="text-rose-300 hover:text-rose-200" href="/support">socioconnect.app/support</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
