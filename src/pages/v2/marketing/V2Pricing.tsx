import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';

interface Tier {
  name: string;
  price: string;
  period?: string;
  badge?: string;
  features: string[];
  cta: string;
  ctaLink: string;
  highlighted?: boolean;
}

const tiers: Tier[] = [
  {
    name: 'Free',
    price: '$0',
    period: '/month',
    features: [
      'Up to 1 plan',
      'Basic dashboard',
      'Public sharing',
      'Community support',
    ],
    cta: 'Get Started',
    ctaLink: '/signup?redirect=/v2/onboard',
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    badge: 'POPULAR',
    features: [
      'Unlimited plans',
      'All templates',
      'Custom branding',
      'Priority support',
      'Excel import',
    ],
    cta: 'Start Free Trial',
    ctaLink: '/signup?redirect=/v2/onboard',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    features: [
      'Everything in Pro',
      'SSO & SAML',
      'Dedicated support',
      'Custom integrations',
      'SLA',
    ],
    cta: 'Contact Sales',
    ctaLink: 'mailto:sales@stratadash.org',
  },
];

export function V2Pricing() {
  return (
    <section className="px-6 py-20">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 text-center mb-4">
          Simple, transparent pricing
        </h1>
        <p className="text-lg text-gray-600 text-center mb-14 max-w-2xl mx-auto">
          Start for free and upgrade as you grow. No hidden fees.
        </p>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`rounded-xl border p-8 flex flex-col ${
                tier.highlighted
                  ? 'border-blue-500 border-2 shadow-lg md:scale-105 relative'
                  : 'border-gray-200'
              }`}
            >
              {tier.badge && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {tier.badge}
                </span>
              )}

              <h2 className="text-xl font-semibold text-gray-900 mb-2">{tier.name}</h2>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">{tier.price}</span>
                {tier.period && (
                  <span className="text-gray-500 ml-1">{tier.period}</span>
                )}
              </div>

              <ul className="flex-1 space-y-3 mb-8">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3 text-gray-700">
                    <Check className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {tier.ctaLink.startsWith('mailto:') ? (
                <a
                  href={tier.ctaLink}
                  className={`block text-center font-medium rounded-lg px-6 py-3 transition-colors ${
                    tier.highlighted
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tier.cta}
                </a>
              ) : (
                <Link
                  to={tier.ctaLink}
                  className={`block text-center font-medium rounded-lg px-6 py-3 transition-colors ${
                    tier.highlighted
                      ? 'bg-blue-500 text-white hover:bg-blue-600'
                      : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {tier.cta}
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
