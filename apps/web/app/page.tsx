import Navbar from "@/component/landing/navbar";
import Hero from "@/component/landing/hero";
import Features from "@/component/landing/features";
import Platforms from "@/component/landing/platforms";
import UseCases from "@/component/landing/use-cases";
import Footer from "@/component/landing/footer";
import Cta from "@/component/landing/cta";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-neutral-950 text-neutral-100 flex flex-col selection:bg-rose-500 selection:text-neutral-100">
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
