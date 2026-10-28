import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/component/legal/legal-page";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms for using SocioConnect's publishing and agent platform.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Legal"
      title="Terms of Service"
      updated="October 2026"
      intro="These terms govern use of SocioConnect, including the web dashboard, public API, MCP server, and marketplace plugins."
    >
      <LegalSection title="Accounts and authorization">
        <p>
          You must be authorized to connect every social account you add. You are responsible for
          the content published through your accounts and for the credentials and API keys issued to
          your workspace.
        </p>
        <p>
          Agent credentials are scoped. You must not share API keys publicly or use the service to
          bypass platform rate limits, access controls, or terms of service.
        </p>
      </LegalSection>

      <LegalSection title="Acceptable use">
        <p>
          Do not use SocioConnect for spam, deceptive impersonation, unlawful content, malware,
          harassment, or automated engagement that violates a platform's rules. We may suspend
          workspaces that create security, legal, or abuse risk.
        </p>
      </LegalSection>

      <LegalSection title="Publishing and approvals">
        <p>
          The product is draft-first. Publishing requires a confirmed publish intent. You remain
          responsible for reviewing previews, platform constraints, scheduling, and final content
          before confirmation.
        </p>
      </LegalSection>

      <LegalSection title="Billing">
        <p>
          Paid plans renew through Dodo Payments unless cancelled. Plan limits, usage allowances, and
          overage behavior are shown in the product. Taxes are handled by the merchant of record.
          Refund and cancellation requests are governed by the billing terms shown at checkout.
        </p>
      </LegalSection>

      <LegalSection title="Availability and liability">
        <p>
          Social platform APIs can change, rate-limit, or fail independently of SocioConnect. We do
          not guarantee delivery on a platform when the platform rejects or delays a request. The
          service is provided on an as-is basis to the maximum extent permitted by law.
        </p>
      </LegalSection>

      <LegalSection title="Termination">
        <p>
          You can stop using the service at any time and revoke credentials from the dashboard. We
          may suspend or terminate access for violations, non-payment, or security risk. Provisions
          that by their nature should survive termination will survive.
        </p>
      </LegalSection>

      <LegalSection title="Contact">
        <p>
          Legal questions: <a className="text-rose-300 hover:text-rose-200" href="mailto:legal@socioconnect.app">legal@socioconnect.app</a>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
