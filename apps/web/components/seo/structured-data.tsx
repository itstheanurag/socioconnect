import React from "react";

export function StructuredData() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://socioconnect.app";

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SocioConnect",
    operatingSystem: "Web-based",
    applicationCategory: "BusinessApplication",
    description:
      "Modern multi-channel social studio for content creators and marketing teams. Schedule, adapt tone, and broadcast simultaneously to YouTube, X, LinkedIn, Reddit, Discord, and Instagram.",
    url: baseUrl,
    offers: [
      {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
        name: "Starter Free Plan",
      },
      {
        "@type": "Offer",
        price: "19.00",
        priceCurrency: "USD",
        name: "Solo Creator Plan",
        billingDuration: "P1M",
      },
      {
        "@type": "Offer",
        price: "49.00",
        priceCurrency: "USD",
        name: "Creator Pro Plan",
        billingDuration: "P1M",
      },
      {
        "@type": "Offer",
        price: "129.00",
        priceCurrency: "USD",
        name: "Studio Plan",
        billingDuration: "P1M",
      },
      {
        "@type": "Offer",
        price: "299.00",
        priceCurrency: "USD",
        name: "Agency Plan",
        billingDuration: "P1M",
      },
    ],
    featureList: [
      "Simultaneous multi-channel publishing",
      "Per-platform copy and character limit adaptation",
      "Staggered peak-hours scheduler",
      "Isolated per-channel retry engine",
      "Dedicated subreddit and Discord channel routing",
      "Cross-platform performance analytics",
    ],
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SocioConnect",
    url: baseUrl,
    logo: `${baseUrl}/icon.png`,
    sameAs: [
      "https://x.com/socioconnect",
      "https://github.com/itstheanurag/socioconnect",
      "https://linkedin.com/company/socioconnect",
    ],
  };

  const faqPageSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How does SocioConnect handle different character limits and formatting across social networks?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SocioConnect provides an intelligent Composer Workbench that lets you write a master copy and instantly preview or customize tailored versions for X (280 chars), LinkedIn (rich text and professional hook), Reddit (markdown and flairs), YouTube, and Discord.",
        },
      },
      {
        "@type": "Question",
        name: "What happens if one social platform fails during a multi-channel broadcast?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SocioConnect uses an isolated outbox dispatch engine. If one platform fails (e.g. LinkedIn token expiry or rate limit), it will never abort or block dispatches to your other connected accounts. The failed channel is queued for automatic exponential retry with full transaction audit logs.",
        },
      },
      {
        "@type": "Question",
        name: "Can I post directly to specific Subreddits or Discord channels?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, SocioConnect discovers all your sub-destinations (including subreddits with required flairs, Discord guild channels, Facebook groups, and Pinterest boards) and lets you route posts directly to them.",
        },
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageSchema) }}
      />
    </>
  );
}
