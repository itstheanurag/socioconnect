import Navbar from "@/component/landing/navbar";
import Hero from "@/component/landing/hero";
import Features from "@/component/landing/features";
import Platforms from "@/component/landing/platforms";
import UseCases from "@/component/landing/use-cases";
import Footer from "@/component/landing/footer";
import Cta from "@/component/landing/cta";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://socioconnect.app";

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "SoftwareApplication",
      "@id": `${APP_URL}/#software`,
      name: "SocioConnect",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web Browser",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      description:
        "Omnichannel social media publishing and orchestration engine connecting 40+ networks including X, LinkedIn, YouTube, Reddit, TikTok, Substack, Medium, Discord, and Telegram.",
      featureList: [
        "Simultaneous multi-network dispatch",
        "Per-platform formatting & dialect customization",
        "Direct-to-Cloudflare R2 media uploads",
        "Automated RSS and webhook scheduling",
        "AI-assisted caption rewriting",
      ],
      screenshot: `${APP_URL}/og-image.png`,
      url: APP_URL,
    },
    {
      "@type": "Organization",
      "@id": `${APP_URL}/#organization`,
      name: "SocioConnect",
      url: APP_URL,
      logo: `${APP_URL}/icon-512.png`,
      sameAs: [
        "https://twitter.com/socioconnect",
        "https://github.com/socioconnect",
        "https://linkedin.com/company/socioconnect",
      ],
    },
    {
      "@type": "WebSite",
      "@id": `${APP_URL}/#website`,
      url: APP_URL,
      name: "SocioConnect",
      description: "One Post. Every Platform. Scheduled in Seconds.",
      publisher: {
        "@id": `${APP_URL}/#organization`,
      },
    },
  ],
};

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col selection:bg-rose-500 selection:text-neutral-100">
      {/* Search Engine Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Navbar />
      <main className="flex-1 w-full">
        <Hero />
        <Features />
        <Platforms />
        <UseCases />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
