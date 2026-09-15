import LandingNavbar from './components/LandingNavbar';
import HeroSection from './components/HeroSection';
import BenefitsSection from './components/BenefitsSection';
import AIRecommendationSection from './components/AIRecommendationSection';
import CTASection from './components/CTASection';
import LandingFooter from './components/LandingFooter';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col font-sans">
      <LandingNavbar />
      <main className="flex-1">
        <HeroSection />
        <BenefitsSection />
        <AIRecommendationSection />
        <CTASection />
      </main>
      <LandingFooter />
    </div>
  );
}
