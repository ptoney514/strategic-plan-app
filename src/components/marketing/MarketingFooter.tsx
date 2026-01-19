import { Link } from 'react-router-dom';
import { Icon } from '@iconify/react';

export function MarketingFooter() {
  return (
    <footer className="bg-white border-t border-indigo-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-16">
          {/* Logo & Tagline */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-indigo-900 rounded flex items-center justify-center text-white">
                <Icon icon="solar:widget-bold" width="14" />
              </div>
              <span className="font-bold text-indigo-900">StrataDash</span>
            </div>
            <p className="text-xs text-indigo-500 leading-relaxed mb-4">
              Our commitment to student success and community prosperity.
            </p>
          </div>

          {/* Our Plan */}
          <div>
            <h4 className="font-semibold text-indigo-900 mb-4 text-sm">Our Plan</h4>
            <ul className="space-y-2 text-sm text-indigo-500">
              <li>
                <a href="/#goals" className="hover:text-blue-600 transition-colors">
                  Plan Overview
                </a>
              </li>
              <li>
                <a href="/#initiatives" className="hover:text-blue-600 transition-colors">
                  Our Initiatives
                </a>
              </li>
              <li>
                <a href="/#goals" className="hover:text-blue-600 transition-colors">
                  Strategic Goals
                </a>
              </li>
              <li>
                <a href="/#progress" className="hover:text-blue-600 transition-colors">
                  Metrics
                </a>
              </li>
            </ul>
          </div>

          {/* Stakeholders */}
          <div>
            <h4 className="font-semibold text-indigo-900 mb-4 text-sm">Stakeholders</h4>
            <ul className="space-y-2 text-sm text-indigo-500">
              <li>
                <span className="cursor-default">Enterprise</span>
              </li>
              <li>
                <span className="cursor-default">Educators</span>
              </li>
              <li>
                <span className="cursor-default">Community</span>
              </li>
              <li>
                <span className="cursor-default">Parents</span>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-indigo-900 mb-4 text-sm">Resources</h4>
            <ul className="space-y-2 text-sm text-indigo-500">
              <li>
                <span className="cursor-default">Strategy Factory</span>
              </li>
              <li>
                <span className="cursor-default">Templates</span>
              </li>
              <li>
                <span className="cursor-default">Blog</span>
              </li>
              <li>
                <span className="cursor-default">Events</span>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-indigo-900 mb-4 text-sm">Company</h4>
            <ul className="space-y-2 text-sm text-indigo-500">
              <li>
                <Link to="/about" className="hover:text-blue-600 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <span className="cursor-default">Careers</span>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-blue-600 transition-colors">
                  Legal
                </Link>
              </li>
              <li>
                <span className="cursor-default">Contact</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-indigo-100 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-indigo-400">
            &copy; {new Date().getFullYear()} StrataDash. All rights reserved.
          </p>
          <div className="flex gap-4 text-indigo-400">
            <span className="cursor-default hover:text-indigo-900 transition-colors">
              <Icon icon="solar:camera-linear" width="18" />
            </span>
            <span className="cursor-default hover:text-indigo-900 transition-colors">
              <Icon icon="solar:plain-linear" width="18" />
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
