import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "SocioConnect - Multi-Platform Social Media Scheduler",
  description:
    "Schedule, automate, and publish content across X, LinkedIn, Instagram, TikTok, and YouTube in one unified command center.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${jakartaSans.variable} ${spaceGrotesk.variable} ${instrumentSerif.variable} ${caveat.variable} dark h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-[#050508] text-neutral-100 font-sans"
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
