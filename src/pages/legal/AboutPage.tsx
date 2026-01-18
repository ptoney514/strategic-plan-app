import { Link } from 'react-router-dom';
import { Target } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { UserMenu } from '../../components/common/UserMenu';

/**
 * About page for stratadash.org
 * Explains what StrataDash is and who it serves
 */
export function AboutPage() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">StrataDash</span>
            </Link>
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
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-6 pt-28 pb-16 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
          About StrataDash
        </h1>

        <div className="prose prose-lg prose-gray max-w-none">
          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Strategic Plans Shouldn't Live in Spreadsheets
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Every school district has a strategic plan. Most of them sit in a shared drive somewhere, updated once a year for board presentations, disconnected from the daily work that's supposed to bring them to life.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            StrataDash changes that.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            We built StrataDash because we saw the same problem over and over: districts investing months in strategic planning, only to struggle communicating progress to the people who matter most—parents, community members, and board leadership. Complex goals written in administrative language. Progress buried in spreadsheets. Stakeholders left wondering what any of it means for their kids.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            What StrataDash Does
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            StrataDash is a strategic plan dashboard built specifically for K-12 schools and educational nonprofits. It transforms your strategic plan from a static document into a living, community-facing transparency tool.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            <strong className="text-gray-900">Role-based views</strong> let you show the right information to the right audience. Administrators see detailed analytics and cross-departmental performance. Parents see simple progress updates that explain how goals impact their children. Board members get high-level overviews with key performance indicators. Everyone sees what matters to them.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            <strong className="text-gray-900">Real-time progress tracking</strong> replaces manual spreadsheet updates. Your team updates progress as work happens, and stakeholders see it immediately—no waiting for quarterly reports.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            <strong className="text-gray-900">Community engagement</strong> features help you tell the story behind the numbers. Success stories, plain-language explanations, and two-way communication turn your strategic plan into a conversation with your community.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            <strong className="text-gray-900">Mobile-first design</strong> ensures every parent can engage, regardless of how they access the internet.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Who We Serve
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            StrataDash is purpose-built for education. We serve K-12 school districts, charter schools, educational nonprofits, and universities who want to communicate strategic progress transparently and build genuine community engagement around their goals.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            We're not a corporate strategy tool repurposed for schools. Every feature exists because educators told us they needed it.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Pricing That Respects Public Budgets
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            We believe every school should be able to communicate their strategic plan effectively, regardless of budget. That's why StrataDash offers a free tier for small organizations piloting the platform, with paid tiers that scale based on your needs—topping out at $200/month for unlimited use.
          </p>
          <p className="text-gray-600 leading-relaxed mb-6">
            No lengthy procurement cycles. No enterprise-only pricing. Just straightforward plans that let you start small and grow as needed.
          </p>

          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
            Get Started
          </h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            Ready to transform how your community engages with your strategic plan? Contact us to learn more or start your free account today.
          </p>

          <p className="text-gray-500 text-sm italic mt-10">
            StrataDash is built and operated in the United States.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-gray-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-gray-900">StrataDash</span>
          </div>
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <Link to="/about" className="hover:text-gray-700 transition-colors">
              About
            </Link>
            <Link to="/privacy" className="hover:text-gray-700 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-gray-700 transition-colors">
              Terms of Service
            </Link>
          </div>
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} StrataDash. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
