import { Link } from 'react-router-dom';
import { Target, ArrowLeft } from 'lucide-react';
import { useState } from 'react';
import { ContactModal } from '../../components/ContactModal';

/**
 * About Us page for stratadash.org
 */
export function AboutPage() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-neutral-50 to-white">
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
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="container mx-auto px-6 pt-32 pb-20 max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">About StrataDash</h1>

        <div className="prose prose-lg prose-gray max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Strategic Plans Shouldn't Live in Spreadsheets</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Every school district has a strategic plan. Most of them sit in a shared drive somewhere, updated once a year for board presentations, disconnected from the daily work that's supposed to bring them to life.
            </p>
            <p className="text-gray-600 leading-relaxed">
              StrataDash changes that.
            </p>
          </section>

          <section className="mb-12">
            <p className="text-gray-600 leading-relaxed">
              We built StrataDash because we saw the same problem over and over: districts investing months in strategic planning, only to struggle communicating progress to the people who matter most—parents, community members, and board leadership. Complex goals written in administrative language. Progress buried in spreadsheets. Stakeholders left wondering what any of it means for their kids.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What StrataDash Does</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              StrataDash is a strategic plan dashboard built specifically for K-12 schools and educational nonprofits. It transforms your strategic plan from a static document into a living, community-facing transparency tool.
            </p>

            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Role-based views</h3>
                <p className="text-gray-600 leading-relaxed">
                  Show the right information to the right audience. Administrators see detailed analytics and cross-departmental performance. Parents see simple progress updates that explain how goals impact their children. Board members get high-level overviews with key performance indicators. Everyone sees what matters to them.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Real-time progress tracking</h3>
                <p className="text-gray-600 leading-relaxed">
                  Replace manual spreadsheet updates. Your team updates progress as work happens, and stakeholders see it immediately—no waiting for quarterly reports.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Community engagement</h3>
                <p className="text-gray-600 leading-relaxed">
                  Tell the story behind the numbers. Success stories, plain-language explanations, and two-way communication turn your strategic plan into a conversation with your community.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Mobile-first design</h3>
                <p className="text-gray-600 leading-relaxed">
                  Every parent can engage, regardless of how they access the internet.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Who We Serve</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              StrataDash is purpose-built for education. We serve K-12 school districts, charter schools, educational nonprofits, and universities who want to communicate strategic progress transparently and build genuine community engagement around their goals.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We're not a corporate strategy tool repurposed for schools. Every feature exists because educators told us they needed it.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Pricing That Respects Public Budgets</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We believe every school should be able to communicate their strategic plan effectively, regardless of budget. That's why StrataDash offers a free tier for small organizations piloting the platform, with paid tiers that scale based on your needs—topping out at $200/month for unlimited use.
            </p>
            <p className="text-gray-600 leading-relaxed">
              No lengthy procurement cycles. No enterprise-only pricing. Just straightforward plans that let you start small and grow as needed.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Get Started</h2>
            <p className="text-gray-600 leading-relaxed mb-6">
              Ready to transform how your community engages with your strategic plan?
            </p>
            <button
              onClick={() => setIsContactModalOpen(true)}
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-all font-medium shadow-lg shadow-primary/25"
            >
              Contact Us
            </button>
          </section>

          <section className="pt-8 border-t border-gray-200">
            <p className="text-gray-500 text-sm italic">
              StrataDash is built and operated in the United States.
            </p>
          </section>
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
          <div className="flex items-center gap-6 text-sm">
            <Link to="/about" className="text-primary font-medium">
              About
            </Link>
            <Link to="/privacy" className="text-gray-500 hover:text-gray-700 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-gray-500 hover:text-gray-700 transition-colors">
              Terms of Service
            </Link>
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
