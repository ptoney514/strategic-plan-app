import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { BarChart3, Target, TrendingUp, Users, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserMenu } from '../../components/common/UserMenu';
import { ContactModal } from '../../components/ContactModal';

/**
 * Marketing landing page for stratadash.org
 * Light mode design with modern animations
 */
export function MarketingLanding() {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const { isAuthenticated } = useAuth();
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
      {/* Animation Styles */}
      <style>{`
        @keyframes clipReveal {
          0% { clip-path: inset(50% 0 50% 0); transform: scale(0.95); filter: blur(10px); }
          100% { clip-path: inset(0 0 0 0); transform: scale(1); filter: blur(0); }
        }

        @keyframes floatCard {
          0%, 100% { transform: translateY(0) rotate(-2deg); }
          50% { transform: translateY(-12px) rotate(-2deg); }
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        .clip-intro {
          animation: clipReveal 1.2s cubic-bezier(0.2, 0.8, 0.2, 1) both;
        }

        .float-card {
          animation: floatCard 6s ease-in-out infinite;
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

        .hover-3d {
          transform-style: preserve-3d;
          transition: transform 0.35s ease, box-shadow 0.35s ease;
        }

        .hover-3d:hover {
          transform: perspective(900px) rotateX(4deg) rotateY(-4deg) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }

        .animated-border-btn {
          position: relative;
          overflow: hidden;
        }

        .animated-border-btn::before {
          content: "";
          position: absolute;
          inset: -100%;
          background: conic-gradient(from 90deg at 50% 50%, transparent 0%, transparent 70%, #C03537 100%);
          animation: spin 3s linear infinite;
          opacity: 0;
          transition: opacity 0.3s;
        }

        .animated-border-btn:hover::before {
          opacity: 1;
        }

        .animated-border-btn-inner {
          position: relative;
          z-index: 1;
          background: white;
          border-radius: inherit;
        }
      `}</style>

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">StrataDash</span>
            </div>
            <div className="flex items-center gap-4">
              {isAuthenticated ? (
                <UserMenu />
              ) : (
                <Link
                  to="/login"
                  className="px-5 py-2.5 text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  Sign In
                </Link>
              )}
              <button
                onClick={() => setIsContactModalOpen(true)}
                className="animated-border-btn px-5 py-2.5 rounded-full"
              >
                <span className="animated-border-btn-inner px-5 py-2.5 rounded-full bg-primary text-white hover:bg-primary/90 transition-colors font-medium inline-block -m-[10px]">
                  Get Started
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative container mx-auto px-6 pt-32 pb-20 overflow-visible">
        {/* Background Gradient Orb */}
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 text-center clip-intro">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/5 border border-primary/10 rounded-full text-primary mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">Built for Educational Districts</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight tracking-tight">
            Strategic Planning
            <br />
            <span className="text-primary">Made Simple</span>
          </h1>

          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Empower your educational district with powerful goal tracking,
            metrics visualization, and progress monitoring. Transform your
            strategic vision into measurable outcomes.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all text-lg font-medium shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5"
            >
              Schedule a Demo
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 border-2 border-gray-200 text-gray-700 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all text-lg font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Floating Stats Card */}
        <div className="float-card absolute -right-4 md:right-10 top-40 md:top-48 bg-white rounded-2xl shadow-2xl shadow-gray-200/50 p-6 border border-gray-100 w-64 hidden lg:block">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">District Goals</span>
            <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Live</span>
          </div>
          <div className="text-3xl font-bold text-gray-900 mb-2">127</div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
              <TrendingUp className="w-4 h-4" />
              +18%
            </div>
            <span className="text-xs text-gray-400">this quarter</span>
          </div>
          {/* Mini bar chart */}
          <div className="flex items-end gap-1.5 mt-4 h-10">
            <div className="w-3 bg-primary/30 rounded-sm h-[30%]" />
            <div className="w-3 bg-primary/50 rounded-sm h-[50%]" />
            <div className="w-3 bg-primary/70 rounded-sm h-[70%]" />
            <div className="w-3 bg-primary rounded-sm h-[90%]" />
            <div className="w-3 bg-primary/80 rounded-sm h-[60%]" />
          </div>
        </div>
      </header>


      {/* Features Section */}
      <section className="container mx-auto px-6 py-24">
        <div className="text-center mb-16 reveal-on-scroll">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            A complete platform for managing strategic goals, tracking progress,
            and communicating results to stakeholders.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FeatureCard
            icon={<Target className="w-7 h-7" />}
            title="Goal Hierarchy"
            description="Organize objectives, goals, and strategies in a clear hierarchical structure that aligns with your district's vision."
            delay={0}
          />
          <FeatureCard
            icon={<BarChart3 className="w-7 h-7" />}
            title="Metrics Dashboard"
            description="Track key performance indicators with beautiful visualizations that make data easy to understand."
            delay={100}
          />
          <FeatureCard
            icon={<TrendingUp className="w-7 h-7" />}
            title="Progress Tracking"
            description="Monitor progress toward goals with real-time updates and status indicators."
            delay={200}
          />
          <FeatureCard
            icon={<Users className="w-7 h-7" />}
            title="Stakeholder Views"
            description="Share progress with board members, staff, and community with public-facing dashboards."
            delay={300}
          />
          <FeatureCard
            icon={<CheckCircle2 className="w-7 h-7" />}
            title="Excel Import"
            description="Easily import your existing strategic plan data from Excel spreadsheets."
            delay={400}
          />
          <FeatureCard
            icon={<Target className="w-7 h-7" />}
            title="Multi-District"
            description="Manage multiple districts or schools from a single platform with role-based access."
            delay={500}
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="reveal-on-scroll bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl p-12 md:p-16 text-center relative overflow-hidden">
          {/* Subtle grid pattern */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Transform Your Strategic Planning?
            </h2>
            <p className="text-lg text-gray-300 mb-8 max-w-xl mx-auto">
              Join educational districts already using StrataDash to achieve their
              strategic goals.
            </p>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-all text-lg font-medium shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              Contact Us
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-gray-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">StrataDash</span>
          </div>
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} StrataDash. All rights reserved.
          </p>
        </div>
      </footer>

      {/* Contact Modal */}
      <ContactModal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} />
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay?: number;
}

function FeatureCard({ icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <div
      className="reveal-on-scroll hover-3d p-8 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
