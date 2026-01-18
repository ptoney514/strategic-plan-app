import { Link } from 'react-router-dom';
import { Target, ArrowLeft } from 'lucide-react';

/**
 * Privacy Policy page for stratadash.org
 */
export function PrivacyPage() {
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
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-gray-500 mb-12">Last updated: January 2026</p>

        <div className="prose prose-lg prose-gray max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              StrataDash ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our strategic planning platform.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Please read this privacy policy carefully. If you do not agree with the terms of this privacy policy, please do not access the platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
            <h3 className="text-xl font-medium text-gray-800 mb-3">Personal Information</h3>
            <p className="text-gray-600 leading-relaxed mb-4">
              We may collect personal information that you voluntarily provide to us when you register on the platform, including:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2 mb-6">
              <li>Name and email address</li>
              <li>Organization/district name</li>
              <li>Job title and role</li>
              <li>Contact information</li>
            </ul>

            <h3 className="text-xl font-medium text-gray-800 mb-3">Usage Data</h3>
            <p className="text-gray-600 leading-relaxed">
              We automatically collect certain information when you visit, use, or navigate the platform. This information may include device and usage information, such as your IP address, browser type, operating system, and pages visited.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Provide, operate, and maintain the platform</li>
              <li>Improve, personalize, and expand our services</li>
              <li>Understand and analyze how you use our platform</li>
              <li>Communicate with you about updates and support</li>
              <li>Process transactions and send related information</li>
              <li>Protect against fraudulent or unauthorized activity</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-600 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your personal information. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
            <p className="text-gray-600 leading-relaxed">
              We will retain your personal information only for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required by law.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li>Right to access your personal data</li>
              <li>Right to correct inaccurate data</li>
              <li>Right to request deletion of your data</li>
              <li>Right to restrict or object to processing</li>
              <li>Right to data portability</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-600 leading-relaxed">
              If you have questions or concerns about this Privacy Policy, please contact us at{' '}
              <a href="mailto:privacy@stratadash.org" className="text-primary hover:underline">
                privacy@stratadash.org
              </a>
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
            <Link to="/privacy" className="text-primary font-medium">
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
    </div>
  );
}
