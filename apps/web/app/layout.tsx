import type { Metadata } from "next";
import "./styles.css";
import { AuthProvider } from "../lib/auth-context";
import { AuthModal } from "../components/auth-modal";

export const metadata: Metadata = {
  title: "SocioConnect | The Modern Multi-Channel Studio for Content Creators",
  description:
    "Write once, publish natively everywhere. Preview, schedule, and distribute your content across YouTube, Twitch, Instagram, X, LinkedIn, and Reddit with zero copy-paste fatigue.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="bg-white text-stone-900 antialiased selection:bg-[#F4DCB4] selection:text-stone-900">
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
      </body>
    </html>
  );
}
