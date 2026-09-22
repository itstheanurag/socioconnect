import type { Metadata, Viewport } from "next";
import "./styles.css";
import { AuthProvider } from "../lib/auth-context";
import { AuthModal } from "../components/auth-modal";
import { StructuredData } from "../components/seo/structured-data";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL || "https://socioconnect.app";

export const viewport: Viewport = {
  themeColor: "#1C1917",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "SocioConnect | The Multi-Channel Publishing & Orchestration Studio",
    template: "%s | SocioConnect",
  },
  description:
    "Write once, publish natively everywhere. Preview, adapt copy, schedule peak times, and distribute across YouTube, X, LinkedIn, Reddit, Discord, and Instagram with zero copy-paste fatigue.",
  keywords: [
    "social media scheduler",
    "multi-channel social publishing",
    "cross-platform social posting",
    "social media automation",
    "content distribution platform",
    "schedule youtube posts",
    "schedule linkedin posts",
    "reddit post scheduler",
    "discord announcement bot",
    "AI social media adapter",
    "social media buffer alternative",
    "creator workflow studio",
  ],
  authors: [{ name: "SocioConnect Team", url: siteUrl }],
  creator: "SocioConnect",
  publisher: "SocioConnect",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SocioConnect | The Multi-Channel Publishing & Orchestration Studio",
    description:
      "Write once, publish natively everywhere. Preview, adapt copy, schedule peak times, and distribute across YouTube, X, LinkedIn, Reddit, Discord, and Instagram.",
    url: siteUrl,
    siteName: "SocioConnect",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SocioConnect | The Multi-Channel Social Studio",
    description:
      "Write once, publish natively everywhere. Preview, adapt copy, schedule peak times, and distribute across YouTube, X, LinkedIn, Reddit, Discord, and Instagram.",
    creator: "@socioconnect",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <StructuredData />
      </head>
      <body className="bg-white text-stone-900 antialiased selection:bg-[#F4DCB4] selection:text-stone-900">
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
