import { LandingHeader } from "../components/landing/header";
import { LandingHero } from "../components/landing/hero";
import { InteractiveDispatcher } from "../components/landing/interactive-dispatcher";
import { PreviewShowcase } from "../components/landing/preview-showcase";
import { TrappedBento } from "../components/landing/trapped-bento";
import { BlastRadiusComparison } from "../components/landing/blast-radius-comparison";
import { LandingPricing } from "../components/landing/pricing";
import { LandingFAQ } from "../components/landing/faq";
import { LandingFooter } from "../components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-stone-900 selection:bg-[#F4DCB4] selection:text-stone-900">
      <LandingHeader />
      <main>
        <LandingHero />
        <InteractiveDispatcher />
        <PreviewShowcase />
        <TrappedBento />
        <BlastRadiusComparison />
        <LandingPricing />
        <LandingFAQ />
      </main>
      <LandingFooter />
    </div>
  );
}
