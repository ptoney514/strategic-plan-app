import { Link } from 'react-router-dom';
import { ListTree, Palette, Upload } from 'lucide-react';

const features = [
  {
    icon: ListTree,
    title: 'Hierarchical Goals',
    description:
      'Organize your strategic goals in an intuitive tree structure. Nest objectives under pillars and track progress at every level.',
  },
  {
    icon: Palette,
    title: 'Your Brand',
    description:
      'Customize your dashboard with your own colors, logo, and branding. Make it feel like part of your organization.',
  },
  {
    icon: Upload,
    title: 'Import from Excel',
    description:
      'Already have a strategic plan? Upload your Excel spreadsheet and we will map it into a beautiful, shareable dashboard.',
  },
];

export function V2Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="px-6 py-24 md:py-32 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-6">
            Share your strategic plan with the world
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
            Beautiful, interactive dashboards for school districts, nonprofits, and
            organizations. Turn your strategic plan into something people actually want to
            read.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup?redirect=/onboard"
              className="w-full sm:w-auto text-center font-medium text-white bg-blue-500 rounded-lg px-8 py-3 hover:bg-blue-600 transition-colors"
            >
              Get Started Free
            </Link>
            <Link
              to="/pricing"
              className="w-full sm:w-auto text-center font-medium text-gray-700 border border-gray-300 rounded-lg px-8 py-3 hover:bg-gray-50 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="px-6 py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-14">
            Everything you need to share your strategy
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-white rounded-xl p-8 shadow-xs border border-gray-100"
              >
                <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-5">
                  <feature.icon className="w-6 h-6 text-blue-500" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
