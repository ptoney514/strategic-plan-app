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
                <Link to="#" className="hover:text-blue-600 transition-colors">
                  Plan Overview
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-blue-600 transition-colors">
                  Our Initiatives
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-blue-600 transition-colors">
                  Strategic Goals
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-blue-600 transition-colors">
                  Metrics
                </Link>
              </li>
            </ul>
          </div>

          {/* Stakeholders */}
          <div>
            <h4 className="font-semibold text-indigo-900 mb-4 text-sm">Stakeholders</h4>
            <ul className="space-y-2 text-sm text-indigo-500">
              <li>
                <Link to="#" className="hover:text-blue-600 transition-colors">
                  Enterprise
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-blue-600 transition-colors">
                  Educators
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-blue-600 transition-colors">
                  Community
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-blue-600 transition-colors">
                  Parents
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="font-semibold text-indigo-900 mb-4 text-sm">Resources</h4>
            <ul className="space-y-2 text-sm text-indigo-500">
              <li>
                <Link to="#" className="hover:text-blue-600 transition-colors">
                  Strategy Factory
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-blue-600 transition-colors">
                  Templates
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-blue-600 transition-colors">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-blue-600 transition-colors">
                  Events
                </Link>
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
                <Link to="#" className="hover:text-blue-600 transition-colors">
                  Careers
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-blue-600 transition-colors">
                  Legal
                </Link>
              </li>
              <li>
                <Link to="#" className="hover:text-blue-600 transition-colors">
                  Contact
                </Link>
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
            <a href="#" className="hover:text-indigo-900 transition-colors">
              <Icon icon="solar:camera-linear" width="18" />
            </a>
            <a href="#" className="hover:text-indigo-900 transition-colors">
              <Icon icon="solar:plain-linear" width="18" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
