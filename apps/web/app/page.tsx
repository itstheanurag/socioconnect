import { LandingHeader } from "../components/landing/header";
import { LandingHero } from "../components/landing/hero";
import { InteractiveDispatcher } from "../components/landing/interactive-dispatcher";
import { LiveNotificationsStream } from "../components/landing/live-notifications-stream";
import { Features } from "../components/landing/features/features";
import { InteractiveCalendar } from "../components/landing/interactive-calendar";
import { ScrollWorkflow } from "../components/landing/scroll-workflow";
import { BlastRadiusComparison } from "../components/landing/blast-radius-comparison";
import { LandingCTA } from "../components/landing/cta";
import { LandingPricing } from "../components/landing/pricing";
import { LandingFAQ } from "../components/landing/faq";
import { LandingFooter } from "../components/landing/footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-stone-900 selection:bg-secondary selection:text-stone-900">
      <LandingHeader />
      <main>
        <LandingHero />
        <InteractiveDispatcher />
        <Features />
        <LiveNotificationsStream />
        <InteractiveCalendar />
        <ScrollWorkflow />
        <BlastRadiusComparison />
        <LandingCTA />
        <LandingPricing />
        <LandingFAQ />
      </main>
      <LandingFooter />
    </div>
  );
}
