import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

/**
 * Terms of Service page for stratadash.org
 */
export function TermsPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-white via-neutral-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2">
              <img
                src="/assets/stratadash-logo.png"
                alt="StrataDash"
                className="w-10 h-10 rounded-xl shadow-lg shadow-primary/20"
              />
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
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Terms of Service</h1>
        <p className="text-gray-500 mb-12">Last updated: January 2026</p>

        <div className="prose prose-lg prose-gray max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Agreement to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              By accessing or using StrataDash ("the Platform"), you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the Platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Description of Service</h2>
            <p className="text-gray-600 leading-relaxed">
              StrataDash is a strategic planning platform designed for educational districts. The Platform provides tools for goal management, metrics tracking, progress visualization, and stakeholder communication.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Accounts</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              When you create an account with us, you must provide accurate, complete, and current information. You are responsible for:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
              <li>Ensuring your use complies with all applicable laws</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Acceptable Use</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              You agree not to use the Platform to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Transmit harmful code, viruses, or malicious software</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the Platform's operation</li>
              <li>Collect or harvest user data without consent</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              The Platform and its original content, features, and functionality are owned by StrataDash and are protected by international copyright, trademark, and other intellectual property laws.
            </p>
            <p className="text-gray-600 leading-relaxed">
              You retain ownership of any data you input into the Platform. By using the Platform, you grant us a license to use, store, and process your data solely for the purpose of providing our services.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Availability</h2>
            <p className="text-gray-600 leading-relaxed">
              We strive to maintain high availability of the Platform but do not guarantee uninterrupted access. We may modify, suspend, or discontinue any aspect of the Platform at any time without prior notice.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-600 leading-relaxed">
              To the maximum extent permitted by law, StrataDash shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the Platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Indemnification</h2>
            <p className="text-gray-600 leading-relaxed">
              You agree to indemnify and hold harmless StrataDash, its officers, directors, employees, and agents from any claims, damages, losses, or expenses arising from your use of the Platform or violation of these Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to Terms</h2>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to modify these Terms at any time. We will notify users of any material changes by posting the new Terms on this page with an updated revision date. Your continued use of the Platform after such changes constitutes acceptance of the new Terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Governing Law</h2>
            <p className="text-gray-600 leading-relaxed">
              These Terms shall be governed by and construed in accordance with the laws of the United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions about these Terms of Service, please contact us at{' '}
              <a href="mailto:legal@stratadash.org" className="text-primary hover:underline">
                legal@stratadash.org
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="container mx-auto px-6 py-12 border-t border-gray-100">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img
              src="/assets/stratadash-logo.png"
              alt="StrataDash"
              className="w-8 h-8 rounded-lg"
            />
            <span className="text-lg font-semibold text-gray-900">StrataDash</span>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <Link to="/privacy" className="text-gray-500 hover:text-gray-700 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-primary font-medium">
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
