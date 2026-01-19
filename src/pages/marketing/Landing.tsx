import { useEffect, useRef, useState } from 'react';
import { ContactModal } from '../../components/ContactModal';
import {
  MarketingNav,
  MarketingFooter,
  HeroSection,
  GoalsOverviewSection,
  FeatureSection,
  FeatureVisualHierarchy,
  FeatureVisualProgress,
  FeatureVisualChart,
  TransparencyGrid,
  SocialProofSection,
  FinalCTASection,
} from '../../components/marketing';

/**
 * Marketing landing page for stratadash.org
 * Modern design with indigo/purple color scheme
 */
export function MarketingLanding() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  // Setup intersection observer for reveal-on-scroll animations
  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
      observerRef.current?.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, []);

  const handleDemoClick = () => setIsContactModalOpen(true);

  return (
    <div className="min-h-screen bg-white text-slate-900 antialiased overflow-x-hidden">
      {/* Animation Styles */}
      <style>{`
        /* Smooth fade in */
        .fade-in-up {
          animation: fadeInUp 0.8s ease-out forwards;
          opacity: 0;
          transform: translateY(20px);
        }
        .fade-in-delay-1 { animation-delay: 0.1s; }
        .fade-in-delay-2 { animation-delay: 0.2s; }
        @keyframes fadeInUp {
          to { opacity: 1; transform: translateY(0); }
        }

        .reveal-on-scroll {
          opacity: 0;
          transform: translateY(30px) scale(0.96);
          filter: blur(8px);
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .reveal-on-scroll.is-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          filter: blur(0);
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background-color: #e2e8f0; border-radius: 20px; }
      `}</style>

      {/* Navigation */}
      <MarketingNav onDemoClick={handleDemoClick} />

      {/* Hero Section */}
      <HeroSection onDemoClick={handleDemoClick} />

      {/* Goals Overview */}
      <GoalsOverviewSection />

      {/* Feature 1: Build Your District Strategy */}
      <FeatureSection
        title="Build Your District Strategy — The Right Way"
        description="Use StrataDash's flexible planning model to support state accountability frameworks, district scorecards, or custom board priorities — without forcing you into rigid templates."
        features={[
          {
            title: 'District-Wide Goal Hierarchy',
            description:
              'Organize strategic priorities across district goals, initiatives, schools, and departments with full visibility and alignment.',
            highlighted: true,
          },
          {
            title: 'Custom Metrics & Accountability Fields',
            description:
              'Track what matters most — academic performance, attendance, graduation rates, engagement, or operational KPIs.',
          },
        ]}
        visual={<FeatureVisualHierarchy />}
      />

      {/* Feature 2: Accelerate Planning */}
      <FeatureSection
        title="Accelerate Planning And Execution Cycles"
        description="Import existing strategic plans or build new ones in minutes. Keep leadership, principals, and department heads aligned — without endless meetings and spreadsheets."
        features={[
          {
            title: 'District → School Alignment',
            description:
              'Ensure every school and department understands how their work connects to district priorities.',
            icon: 'solar:sitemap-linear',
          },
          {
            title: 'Initiative Ownership & Timelines',
            description: 'Assign accountability, track milestones, and prevent strategic drift.',
            icon: 'solar:user-check-linear',
            highlighted: true,
          },
        ]}
        visual={<FeatureVisualProgress />}
        reversed
        variant="alternate"
      />

      {/* Feature 3: Monitor Progress */}
      <FeatureSection
        title="Monitor Progress And Course-Correct Early"
        description="See what's on track, what needs attention, and where leadership should intervene — before small issues become major setbacks."
        features={[
          {
            title: 'Real-Time Status Indicators',
            description:
              'Instantly visualize progress across goals, initiatives, and performance measures.',
            highlighted: true,
          },
          {
            title: 'Executive-Ready Performance Views',
            description:
              'Give superintendents and cabinet leaders fast insight without manual reporting.',
          },
        ]}
        visual={<FeatureVisualChart />}
      />

      {/* Transparency Grid */}
      <TransparencyGrid />

      {/* Social Proof */}
      <SocialProofSection />

      {/* Final CTA */}
      <FinalCTASection onDemoClick={handleDemoClick} />

      {/* Footer */}
      <MarketingFooter />

      {/* Contact Modal */}
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </div>
  );
}
