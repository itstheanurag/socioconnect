import Navbar from "@/component/landing/navbar";
import Hero from "@/component/landing/hero";

import Footer from "@/component/landing/footer";
import Features from "@/component/landing/features";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-[#050508] text-white flex flex-col selection:bg-rose-500 selection:text-white">
      <Navbar />
      <main className="flex-1 w-full">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
