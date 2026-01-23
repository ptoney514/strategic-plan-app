import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';
import { useAuth } from '../../contexts/AuthContext';
import { UserAvatarMenu } from '../../components/common/UserAvatarMenu';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';

/**
 * About page for stratadash.org
 * Explains what StrataDash is and who it serves
 */
export function AboutPage() {
  const { isAuthenticated, loading } = useAuth();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - matches MarketingNav style */}
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-indigo-100">
        <div className="flex h-20 max-w-7xl mx-auto px-6 items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group cursor-pointer">
            <img
              src="/assets/stratadash-logo.png"
              alt="StrataDash"
              className="w-9 h-9 rounded-lg shadow-lg shadow-blue-900/20"
            />
            <span className="text-lg font-bold tracking-tight text-indigo-900">StrataDash</span>
          </Link>

          {/* Nav Links - Hidden on mobile */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className="text-sm font-medium text-indigo-600 hover:text-indigo-900 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/about"
              className="text-sm font-medium text-indigo-900 transition-colors"
            >
              About
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {loading ? (
              <div className="w-8 h-8 rounded-full bg-indigo-100 animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="hidden sm:block text-sm font-medium text-indigo-600 hover:text-indigo-900 transition-colors"
                >
                  Dashboard
                </Link>
                <UserAvatarMenu />
              </>
            ) : (
              <Link
                to="/login"
                className="text-sm font-medium text-indigo-600 hover:text-indigo-900 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-16 relative">
        {/* Background Decoration */}
        <div className="absolute inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute left-1/2 -translate-x-1/2 top-0 h-[40vh] w-[50vw] rounded-full bg-indigo-500/10 blur-[120px]" />
        </div>

        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-100 bg-indigo-50/80 text-indigo-700 text-xs font-semibold tracking-wide uppercase shadow-sm mb-6">
            Our Story
          </div>

          <h1 className="text-4xl md:text-5xl font-bold text-indigo-900 mb-6 leading-tight tracking-tight">
            About{' '}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
              StrataDash
            </span>
          </h1>
          <p className="text-lg text-indigo-500 max-w-2xl mx-auto leading-relaxed">
            Transforming how K-12 districts communicate strategic progress to their communities.
          </p>
        </div>
      </section>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 pb-20">
        <div className="space-y-16">
          {/* Section 1 */}
          <section className="bg-white rounded-2xl border border-indigo-100 p-8 md:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Icon icon="solar:document-text-linear" className="w-5 h-5 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-bold text-indigo-900">
                Strategic Plans Shouldn't Live in Spreadsheets
              </h2>
            </div>
            <div className="space-y-4 text-indigo-600 leading-relaxed">
              <p>
                Every school district has a strategic plan. Most of them sit in a shared drive somewhere, updated once a year for board presentations, disconnected from the daily work that's supposed to bring them to life.
              </p>
              <p className="font-semibold text-indigo-900">
                StrataDash changes that.
              </p>
              <p>
                We built StrataDash because we saw the same problem over and over: districts investing months in strategic planning, only to struggle communicating progress to the people who matter most—parents, community members, and board leadership. Complex goals written in administrative language. Progress buried in spreadsheets. Stakeholders left wondering what any of it means for their kids.
              </p>
            </div>
          </section>

          {/* Section 2 */}
          <section className="bg-white rounded-2xl border border-indigo-100 p-8 md:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Icon icon="solar:chart-2-linear" className="w-5 h-5 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-indigo-900">
                What StrataDash Does
              </h2>
            </div>
            <div className="space-y-6 text-indigo-600 leading-relaxed">
              <p>
                StrataDash is a strategic plan dashboard built specifically for K-12 schools and educational nonprofits. It transforms your strategic plan from a static document into a living, community-facing transparency tool.
              </p>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100">
                  <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                    <Icon icon="solar:users-group-rounded-linear" className="w-4 h-4" />
                    Role-based Views
                  </h3>
                  <p className="text-sm">
                    Show the right information to the right audience. Administrators see detailed analytics, parents see simple progress updates, board members get high-level overviews.
                  </p>
                </div>
                <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100">
                  <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                    <Icon icon="solar:graph-up-linear" className="w-4 h-4" />
                    Real-time Tracking
                  </h3>
                  <p className="text-sm">
                    Replace manual spreadsheet updates. Your team updates progress as work happens, and stakeholders see it immediately.
                  </p>
                </div>
                <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100">
                  <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                    <Icon icon="solar:chat-round-dots-linear" className="w-4 h-4" />
                    Community Engagement
                  </h3>
                  <p className="text-sm">
                    Tell the story behind the numbers. Success stories, plain-language explanations, and two-way communication.
                  </p>
                </div>
                <div className="bg-indigo-50/50 rounded-xl p-5 border border-indigo-100">
                  <h3 className="font-semibold text-indigo-900 mb-2 flex items-center gap-2">
                    <Icon icon="solar:smartphone-linear" className="w-4 h-4" />
                    Mobile-first Design
                  </h3>
                  <p className="text-sm">
                    Every parent can engage, regardless of how they access the internet.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section className="bg-white rounded-2xl border border-indigo-100 p-8 md:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Icon icon="solar:graduation-cap-linear" className="w-5 h-5 text-emerald-600" />
              </div>
              <h2 className="text-2xl font-bold text-indigo-900">
                Who We Serve
              </h2>
            </div>
            <div className="space-y-4 text-indigo-600 leading-relaxed">
              <p>
                StrataDash is purpose-built for education. We serve K-12 school districts, charter schools, educational nonprofits, and universities who want to communicate strategic progress transparently and build genuine community engagement around their goals.
              </p>
              <p>
                We're not a corporate strategy tool repurposed for schools. Every feature exists because educators told us they needed it.
              </p>
            </div>
          </section>

          {/* Section 4 */}
          <section className="bg-white rounded-2xl border border-indigo-100 p-8 md:p-10 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <Icon icon="solar:wallet-linear" className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold text-indigo-900">
                Pricing That Respects Public Budgets
              </h2>
            </div>
            <div className="space-y-4 text-indigo-600 leading-relaxed">
              <p>
                We believe every school should be able to communicate their strategic plan effectively, regardless of budget. That's why StrataDash offers a free tier for small organizations piloting the platform, with paid tiers that scale based on your needs—topping out at $200/month for unlimited use.
              </p>
              <p>
                No lengthy procurement cycles. No enterprise-only pricing. Just straightforward plans that let you start small and grow as needed.
              </p>
            </div>
          </section>

          {/* CTA Section */}
          <section className="bg-gradient-to-br from-indigo-900 to-indigo-800 rounded-2xl p-8 md:p-10 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Get Started
            </h2>
            <p className="text-indigo-200 mb-8 max-w-xl mx-auto">
              Ready to transform how your community engages with your strategic plan? Contact us to learn more or start your free account today.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/login"
                className="group flex items-center gap-2 bg-white hover:bg-indigo-50 text-indigo-900 h-12 px-6 rounded-full shadow-lg transition-all hover:scale-[1.02]"
              >
                <span className="font-medium">Get Started Free</span>
                <Icon
                  icon="solar:arrow-right-linear"
                  className="w-5 h-5 group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
            </div>
            <p className="text-indigo-300 text-sm mt-8 italic">
              StrataDash is built and operated in the United States.
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <MarketingFooter />
    </div>
  );
}
