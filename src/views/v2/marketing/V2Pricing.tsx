import Link from 'next/link';
import { MaterialIcon } from '@/components/v2/public/MaterialIcon';

type Tier = {
  name: string;
  price: string;
  description: string;
  features: string[];
  cta: string;
  ctaHref: string;
  featured?: boolean;
  badge?: string;
};

const tiers: Tier[] = [
  {
    name: 'Pilot',
    price: '$4,500',
    description: 'Ideal for individual school sites or small leadership teams testing a single plan.',
    features: ['1 active strategic plan', '5 admin seats', 'Standard district branding', 'Email support'],
    cta: 'Start pilot',
    ctaHref: 'mailto:sales@stratadash.org?subject=StrataDash%20pilot',
  },
  {
    name: 'District',
    price: '$12,000',
    description: 'The standard for central office leadership and board-level strategic management.',
    features: [
      'Unlimited strategic plans',
      '25 admin seats',
      'Advanced custom branding',
      'Priority onboarding success',
      'Board presentation mode',
    ],
    cta: 'Select district plan',
    ctaHref: 'mailto:sales@stratadash.org?subject=StrataDash%20district%20plan',
    featured: true,
    badge: 'Most requested',
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'Custom solutions for county offices, ESAs, and multi-district collectives.',
    features: [
      'Regional aggregation dashboards',
      'SSO and API integrations',
      'Unlimited admin seats',
      'Dedicated strategic advisor',
    ],
    cta: 'Inquire today',
    ctaHref: 'mailto:sales@stratadash.org?subject=StrataDash%20enterprise%20pricing',
  },
];

const foundationalCards = [
  {
    icon: 'public',
    title: 'Public dashboard publishing',
    description:
      'Instantly share progress with families, staff, and the board via a beautiful hosted URL.',
    span: 'md:col-span-2',
  },
  {
    icon: 'account_tree',
    title: 'Strategic hierarchy',
    description: 'Map goals to pillars to actions with a clean digital twin of your plan.',
    span: '',
  },
  {
    icon: 'query_stats',
    title: 'KPI visuals',
    description: 'Interactive progress charts that update instantly as you enter new data.',
    span: '',
  },
  {
    icon: 'palette',
    title: 'District branding',
    description: 'Upload logos and select your palette for a native-looking district experience.',
    span: '',
  },
  {
    icon: 'admin_panel_settings',
    title: 'Governance and admin access',
    description:
      'Granular permissions ensure the right leaders can edit while everyone else can read.',
    span: 'md:col-span-2',
  },
] as const;

const faqItems = [
  {
    question: 'How does the annual billing cycle work?',
    answer:
      'We operate on a July 1 to June 30 billing cycle for most districts, and we can pro-rate the first year to match your budget calendar.',
  },
  {
    question: 'Can we import our existing five-year plan?',
    answer:
      'Yes. Our onboarding team can map your existing spreadsheet or PDF into the hierarchy with a CSV import or guided setup.',
  },
  {
    question: 'Is there a limit on public page views?',
    answer:
      'No. Transparency should never be penalized. Public page traffic is included in the platform experience.',
  },
  {
    question: 'What about student data privacy?',
    answer:
      'StrataDash is designed for high-level strategic tracking. We do not require or recommend uploading PII.',
  },
] as const;

export function V2Pricing() {
  return (
    <div>
      <section className="mx-auto max-w-[1440px] px-6 pb-20 pt-24 md:px-12 md:pb-28">
        <div className="max-w-4xl">
          <h1 className="max-w-3xl font-headline text-5xl font-black leading-[1.08] tracking-tighter text-on-surface md:text-[3.5rem]">
            Strategy is the work. The software should just work.
          </h1>
          <p className="mt-8 max-w-2xl text-xl leading-relaxed text-on-surface-variant">
            Transparent, annual pricing designed for school districts. Skip the consultant fees
            and the PDF graveyard.
          </p>
          <div className="mt-10 inline-flex items-center gap-4 rounded-2xl border border-outline-variant bg-surface-container-high px-5 py-4">
            <MaterialIcon icon="verified" fill weight={700} className="text-primary" />
            <span className="font-label text-sm font-bold uppercase tracking-[0.24em] text-on-surface-variant">
              Public sector ready: annual billing and procurement friendly
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto mb-24 max-w-[1440px] px-6 md:px-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {tiers.map((tier) => (
            <article
              key={tier.name}
              className={`flex flex-col justify-between rounded-2xl border p-8 transition-transform duration-300 hover:-translate-y-1 ${
                tier.featured
                  ? 'relative z-10 scale-[1.02] border-primary/30 bg-primary text-white shadow-[0_24px_48px_rgba(15,70,113,0.18)]'
                  : 'border-outline-variant/20 bg-surface editorial-shadow'
              }`}
            >
              {tier.badge ? (
                <div className="absolute right-6 top-6 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.24em] text-white">
                  {tier.badge}
                </div>
              ) : null}

              <div>
                <h2 className={`font-headline text-2xl font-bold ${tier.featured ? 'text-white' : 'text-on-surface'}`}>
                  {tier.name}
                </h2>
                <p
                  className={`mt-2 min-h-12 text-sm leading-relaxed ${
                    tier.featured ? 'text-white/80' : 'text-on-surface-variant'
                  }`}
                >
                  {tier.description}
                </p>
                <div className="mt-10">
                  <span
                    className={`font-label text-4xl font-bold ${
                      tier.featured ? 'text-white' : 'text-primary'
                    }`}
                  >
                    {tier.price}
                  </span>
                  <span className={`ml-1 text-sm font-medium ${tier.featured ? 'text-white/65' : 'text-on-surface-variant'}`}>
                    / year
                  </span>
                </div>

                <ul className="mt-10 space-y-4">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm font-medium">
                      <MaterialIcon
                        icon="check_circle"
                        fill
                        weight={700}
                        className={tier.featured ? 'text-tertiary-fixed' : 'text-tertiary'}
                        size={18}
                      />
                      <span className={tier.featured ? 'text-white' : 'text-on-surface'}>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={tier.ctaHref}
                className={`mt-12 inline-flex items-center justify-center rounded-full px-6 py-4 font-headline text-sm font-bold transition-colors ${
                  tier.featured
                    ? 'bg-surface text-primary hover:bg-primary-fixed'
                    : 'border border-outline text-on-surface hover:bg-surface-container-low'
                }`}
              >
                {tier.cta}
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-surface-container-low py-24">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <div className="mb-16">
            <h2 className="font-headline text-4xl font-bold tracking-tighter text-on-surface">
              Foundationally integrated
            </h2>
            <p className="mt-4 text-on-surface-variant">
              Every StrataDash license includes the core engine for strategic transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {foundationalCards.map((card) => (
              <article
                key={card.title}
                className={`min-h-[260px] rounded-2xl bg-surface p-8 editorial-shadow ${card.span}`}
              >
                <MaterialIcon
                  icon={card.icon}
                  size={36}
                  fill={card.icon === 'public'}
                  className="mb-6 text-primary"
                />
                <h3 className="font-headline text-xl font-bold text-on-surface">{card.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                  {card.description}
                </p>
              </article>
            ))}

            <article className="flex min-h-[260px] items-center justify-center rounded-2xl bg-tertiary p-8 text-center text-white editorial-shadow">
              <div>
                <div className="font-label text-5xl font-bold">1/10th</div>
                <p className="mt-4 text-sm font-medium leading-relaxed">
                  The cost of traditional strategic planning consultants. We give you the tools,
                  not the billable hours.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] grid-cols-1 gap-16 px-6 py-24 md:grid-cols-3 md:px-12">
        <div>
          <h2 className="font-headline text-4xl font-bold tracking-tighter text-on-surface">
            Common procurement inquiries
          </h2>
          <p className="mt-6 max-w-sm text-on-surface-variant">
            Everything you need to know about bringing StrataDash to your district leadership
            team.
          </p>
        </div>

        <div className="space-y-8 md:col-span-2">
          {faqItems.map((item) => (
            <div key={item.question}>
              <h3 className="font-headline text-xl font-bold text-on-surface">{item.question}</h3>
              <p className="mt-3 max-w-3xl leading-relaxed text-on-surface-variant">{item.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 pb-24 md:px-12">
        <div className="relative overflow-hidden rounded-2xl bg-primary-container p-10 text-white md:p-16">
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-tertiary/10 blur-3xl" />
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h2 className="font-headline text-[2.75rem] font-black leading-tight tracking-tighter md:text-[3.5rem]">
              Ready to lead with clarity?
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-on-primary-container">
              Join forward-thinking school districts that are turning static documents into living
              roadmaps.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="mailto:sales@stratadash.org?subject=StrataDash%20demo"
                className="inline-flex items-center justify-center rounded-full bg-surface px-10 py-5 font-headline text-lg font-black text-primary transition-transform hover:-translate-y-0.5"
              >
                Book a live demo
              </a>
              <Link
                href="/district/westside"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-10 py-5 font-headline text-lg font-black text-white transition-colors hover:bg-white/10"
              >
                View district example
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
