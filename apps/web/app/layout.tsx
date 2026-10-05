import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans, Space_Grotesk, Instrument_Serif, Caveat } from "next/font/google";
import { NotificationProvider } from "@/context/notification-context";
import { NotificationToasts } from "@/component/ui/notification-toast";
import { AuthProvider } from "@/context/auth-context";
import AuthModal from "@/component/auth/auth-modal";
import "./globals.css";

const jakartaSans = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const caveat = Caveat({
  variable: "--font-cursive",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://socioconnect.app";

export const viewport: Viewport = {
  themeColor: "#0a0a0a",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "SocioConnect - Multi-Platform Omnichannel Content Orchestration",
    template: "%s | SocioConnect",
  },
  description:
    "Broadcast, schedule, and automate content across 40+ destinations including X, LinkedIn, YouTube, TikTok, Reddit, Substack, Medium, Discord, and Telegram from one obsidian command center.",
  keywords: [
    "social media scheduler",
    "omnichannel publishing",
    "cross posting tool",
    "multi-platform content orchestration",
    "developer social scheduler",
    "Reddit scheduler",
    "Substack automation",
    "YouTube short publisher",
    "Discord broadcast bot",
    "Telegram channel publisher",
    "Mastodon Bluesky cross-poster",
    "content marketing automation",
  ],
  authors: [{ name: "SocioConnect Team" }],
  creator: "SocioConnect",
  publisher: "SocioConnect",
  applicationName: "SocioConnect",
  category: "Social Media & Productivity",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: APP_URL,
    title: "SocioConnect - One Post. Every Platform. Scheduled in Seconds.",
    description:
      "Broadcast, schedule, and automate content across 40+ social, publishing, video, and developer community networks simultaneously.",
    siteName: "SocioConnect",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SocioConnect - Universal Omnichannel Publishing Command Center",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SocioConnect - One Post. Every Platform. Scheduled in Seconds.",
    description:
      "Broadcast, schedule, and automate content across 40+ social, publishing, video, and developer community networks simultaneously.",
    images: ["/og-image.png"],
    creator: "@socioconnect",
    site: "@socioconnect",
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
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${jakartaSans.variable} ${spaceGrotesk.variable} ${instrumentSerif.variable} ${caveat.variable} dark h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-neutral-950 text-neutral-200 font-sans"
      >
        <NotificationProvider>
          <AuthProvider>
            {children}
            <AuthModal />
            <NotificationToasts />
          </AuthProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
