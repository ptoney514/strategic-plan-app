import { Link } from 'react-router-dom';
import { BarChart3, Target, TrendingUp, Users, CheckCircle2, ArrowRight } from 'lucide-react';

/**
 * Marketing landing page for stratadash.org
 * Introduces the strategic planning platform to potential customers.
 */
export function MarketingLanding() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="container mx-auto px-6 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-white">StrataDash</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="px-5 py-2.5 text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <a
              href="mailto:hello@stratadash.org"
              className="px-5 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Get Started
            </a>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="container mx-auto px-6 pt-16 pb-24 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary mb-8">
          <span className="text-sm font-medium">Built for Educational Districts</span>
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Strategic Planning
          <br />
          <span className="text-primary">Made Simple</span>
        </h1>

        <p className="text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Empower your educational district with powerful goal tracking,
          metrics visualization, and progress monitoring. Transform your
          strategic vision into measurable outcomes.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="mailto:hello@stratadash.org"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors text-lg font-medium"
          >
            Schedule a Demo
            <ArrowRight className="w-5 h-5" />
          </a>
          <Link
            to="/login"
            className="inline-flex items-center justify-center px-8 py-4 border border-slate-600 text-white rounded-xl hover:bg-slate-800 transition-colors text-lg font-medium"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto">
            A complete platform for managing strategic goals, tracking progress,
            and communicating results to stakeholders.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Target className="w-8 h-8" />}
            title="Goal Hierarchy"
            description="Organize objectives, goals, and strategies in a clear hierarchical structure that aligns with your district's vision."
          />
          <FeatureCard
            icon={<BarChart3 className="w-8 h-8" />}
            title="Metrics Dashboard"
            description="Track key performance indicators with beautiful visualizations that make data easy to understand."
          />
          <FeatureCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="Progress Tracking"
            description="Monitor progress toward goals with real-time updates and status indicators."
          />
          <FeatureCard
            icon={<Users className="w-8 h-8" />}
            title="Stakeholder Views"
            description="Share progress with board members, staff, and community with public-facing dashboards."
          />
          <FeatureCard
            icon={<CheckCircle2 className="w-8 h-8" />}
            title="Excel Import"
            description="Easily import your existing strategic plan data from Excel spreadsheets."
          />
          <FeatureCard
            icon={<Target className="w-8 h-8" />}
            title="Multi-District"
            description="Manage multiple districts or schools from a single platform with role-based access."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-6 py-20">
        <div className="bg-gradient-to-r from-primary/20 to-primary/10 rounded-3xl p-12 text-center border border-primary/20">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to Transform Your Strategic Planning?
          </h2>
          <p className="text-lg text-slate-300 mb-8 max-w-xl mx-auto">
            Join educational districts already using StrataDash to achieve their
            strategic goals.
          </p>
          <a
            href="mailto:hello@stratadash.org"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors text-lg font-medium"
          >
            Contact Us
            <ArrowRight className="w-5 h-5" />
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-slate-800">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">StrataDash</span>
          </div>
          <p className="text-slate-400 text-sm">
            &copy; {new Date().getFullYear()} StrataDash. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="p-8 bg-slate-800/50 rounded-2xl border border-slate-700 hover:border-slate-600 transition-colors">
      <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-white mb-3">{title}</h3>
      <p className="text-slate-400 leading-relaxed">{description}</p>
    </div>
  );
}
