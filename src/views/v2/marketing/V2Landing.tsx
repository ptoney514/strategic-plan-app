import Link from 'next/link';
import { MaterialIcon } from '@/components/v2/public/MaterialIcon';

const trustItems = [
  {
    icon: 'account_balance',
    label: 'Built for district leadership teams',
  },
  {
    icon: 'present_to_all',
    label: 'Made for board presentations',
  },
  {
    icon: 'devices',
    label: 'Readable on any device',
  },
] as const;

const contrastItems = {
  old: [
    {
      icon: 'description',
      title: 'Static attachments',
      description: 'Hard to find on the website and even harder to read on mobile.',
    },
    {
      icon: 'update_disabled',
      title: 'Instantly outdated',
      description: 'The moment a PDF is printed, the numbers are already stale.',
    },
    {
      icon: 'event_busy',
      title: 'Board deck churn',
      description: 'Every update becomes another file to revise, export, and resend.',
    },
  ],
  new: [
    {
      icon: 'dashboard',
      title: 'Live public dashboard',
      description: 'A centralized URL that stays current without another export cycle.',
    },
    {
      icon: 'monitoring',
      title: 'Dynamic KPI tracking',
      description: 'Connect data directly to strategic goals and update progress in place.',
    },
    {
      icon: 'account_tree',
      title: 'Clear hierarchy',
      description: 'Plan, objective, and goal levels stay readable from the first scroll.',
    },
  ],
} as const;

const previewCards = [
  {
    title: '1. Central plan hub',
    description:
      'A high-level view of district health with visual status bars and strategic pillars clearly defined for the public.',
    accent: 'primary',
    offset: '',
  },
  {
    title: '2. Strategic alignment',
    description:
      "Map every objective to a status. Whether it's on target or needs support, the story stays simple.",
    accent: 'secondary',
    offset: 'lg:mt-12',
  },
  {
    title: '3. Deep-dive metrics',
    description:
      'Drill down into KPIs, charts, and detailed status updates without losing the context of the plan.',
    accent: 'tertiary',
    offset: 'lg:mt-24',
  },
] as const;

const steps = [
  {
    step: '1',
    title: 'Import your plan',
    description: 'Upload your spreadsheet or PDF and map the hierarchy into a live dashboard.',
  },
  {
    step: '2',
    title: 'Brand your hub',
    description: 'Add your district logo, colors, and mission statement to make it feel native.',
  },
  {
    step: '3',
    title: 'Share & sync',
    description: 'Launch your subdomain and keep public progress up to date over time.',
  },
] as const;

const publicFeatures = [
  {
    icon: 'public',
    title: 'District branding',
    description: 'A custom interface that matches the district identity instead of our software.',
  },
  {
    icon: 'layers',
    title: 'Clear hierarchy',
    description: 'Logic flows from plan to objective to measurable KPI without extra explanation.',
  },
] as const;

const adminFeatures = [
  {
    icon: 'edit_note',
    title: 'Intuitive editor',
    description: 'Update goal progress and narratives in seconds instead of hours.',
  },
  {
    icon: 'group',
    title: 'Team access',
    description: 'Assign department heads to specific goals and keep accountability visible.',
  },
] as const;

const faqItems = [
  {
    question: 'Can we import from our existing Excel sheet?',
    answer:
      'Yes. Most districts start with Excel or Google Sheets, then map the rows into the dashboard hierarchy.',
  },
  {
    question: 'How much does branding cost?',
    answer:
      'Custom district branding is included in all tiers. Your strategic plan should look like your district, not ours.',
  },
  {
    question: 'Can we keep some goals internal only?',
    answer:
      'Absolutely. You can hide individual goals or KPIs while still keeping the public-facing plan useful.',
  },
] as const;

function HeroMockup() {
  return (
    <div className="relative h-[500px] lg:h-[600px]">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative h-full w-full max-w-lg">
          <div className="absolute right-0 top-0 z-10 aspect-[4/3] w-[85%] overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface editorial-shadow">
            <div className="flex items-center gap-2 bg-surface-container-high px-4 py-3">
              <div className="flex gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full bg-error/30" />
                <div className="h-2.5 w-2.5 rounded-full bg-tertiary/30" />
                <div className="h-2.5 w-2.5 rounded-full bg-primary/30" />
              </div>
              <div className="ml-2 w-40 rounded bg-surface px-3 py-1 font-mono text-[10px] text-outline-variant">
                westside.stratadash.com
              </div>
            </div>

            <div className="space-y-4 p-6">
              <div className="h-6 w-32 rounded bg-surface-container-highest" />
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-surface-container-low p-3">
                  <div className="mb-2 h-2 w-12 rounded bg-primary/20" />
                  <div className="h-8 w-16 rounded bg-primary/10" />
                </div>
                <div className="rounded-xl bg-surface-container-low p-3">
                  <div className="mb-2 h-2 w-12 rounded bg-tertiary/20" />
                  <div className="h-8 w-16 rounded bg-tertiary/10" />
                </div>
              </div>
              <div className="h-32 rounded-xl bg-surface-container" />
            </div>
          </div>

          <div className="absolute -bottom-4 -left-4 z-20 w-64 rounded-2xl border border-outline-variant/20 bg-surface p-6 editorial-shadow">
            <div className="mb-4 flex items-center gap-3">
              <MaterialIcon icon="check_circle" fill weight={700} className="text-tertiary" />
              <span className="font-label text-xs uppercase tracking-[0.24em] text-on-tertiary-fixed-variant">
                On target
              </span>
            </div>
            <h4 className="mb-2 font-headline text-sm font-bold">Early literacy initiative</h4>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container-high">
              <div className="h-full w-4/5 rounded-full bg-tertiary" />
            </div>
            <div className="mt-3 flex justify-between font-mono text-[10px] text-on-surface-variant">
              <span>Progress</span>
              <span>82%</span>
            </div>
          </div>

          <div className="absolute -top-10 -right-10 -z-10 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-10 left-10 -z-10 h-48 w-48 rounded-full bg-tertiary/5 blur-2xl" />
        </div>
      </div>
    </div>
  );
}

export function V2Landing() {
  return (
    <div>
      <section className="relative mx-auto max-w-[1440px] overflow-hidden px-6 pb-24 pt-12 md:px-12">
        <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-4 py-2 font-label text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
              Public strategic planning
            </div>
            <h1 className="max-w-xl font-headline text-5xl font-black leading-[1.05] tracking-tighter text-on-surface lg:text-7xl">
              Your strategic plan deserves better than a{' '}
              <span className="italic text-primary">PDF.</span>
            </h1>
            <p className="max-w-xl text-xl leading-relaxed text-on-surface-variant">
              StrataDash helps school districts transform static documents into interactive,
              branded dashboards that build public trust and board alignment.
            </p>
            <div className="flex flex-col gap-4 pt-4 sm:flex-row">
              <a
                href="mailto:sales@stratadash.org?subject=StrataDash%20demo"
                className="tactile-button inline-flex items-center justify-center rounded-full px-8 py-4 font-headline text-lg font-bold text-white transition-transform duration-200 hover:-translate-y-0.5"
              >
                Book a demo
              </a>
              <Link
                href="/district/westside"
                className="inline-flex items-center justify-center rounded-full border border-outline-variant bg-surface px-8 py-4 font-headline text-lg font-bold text-on-surface transition-colors hover:bg-surface-container-low"
              >
                View a live district example
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6">
            <HeroMockup />
          </div>
        </div>
      </section>

      <section className="border-y border-outline-variant/20 bg-surface py-12">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-8 px-6 md:px-12">
          {trustItems.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 opacity-60 grayscale transition-all duration-500 hover:grayscale-0"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-highest">
                <MaterialIcon icon={item.icon} size={24} weight={500} />
              </div>
              <span className="font-label text-xs font-bold uppercase tracking-[0.24em]">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 py-24 md:px-12">
        <div className="mb-16 text-center">
          <h2 className="font-headline text-3xl font-black tracking-tighter md:text-5xl">
            Why upgrade from a PDF?
          </h2>
          <div className="mx-auto mt-4 h-1 w-24 rounded-full bg-primary" />
        </div>

        <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-outline-variant/20 bg-outline-variant/20 shadow-sm md:grid-cols-2">
          <div className="space-y-8 bg-surface-container-low p-8 md:p-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-error-container px-3 py-1 font-label text-xs uppercase tracking-[0.22em] text-on-error-container">
              <MaterialIcon icon="block" size={18} />
              The old way
            </div>
            <div className="space-y-4">
              {contrastItems.old.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-xl border border-error/10 bg-surface p-5 opacity-80"
                >
                  <div className="mt-0.5 text-error">
                    <MaterialIcon icon={item.icon} size={24} />
                  </div>
                  <div>
                    <h3 className="mb-1 font-headline text-lg font-bold">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-on-surface-variant">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-8 border-l border-outline-variant/10 bg-surface p-8 md:p-12">
            <div className="inline-flex items-center gap-2 rounded-full bg-tertiary-fixed px-3 py-1 font-label text-xs uppercase tracking-[0.22em] text-on-tertiary-fixed-variant">
              <MaterialIcon icon="check_circle" fill weight={700} size={18} />
              The StrataDash way
            </div>
            <div className="space-y-4">
              {contrastItems.new.map((item) => (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-xl border border-tertiary/10 bg-surface-container-low p-5"
                >
                  <div className="mt-0.5 text-tertiary">
                    <MaterialIcon icon={item.icon} size={24} />
                  </div>
                  <div>
                    <h3 className="mb-1 font-headline text-lg font-bold">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-on-surface-variant">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low py-24">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {previewCards.map((card, index) => (
              <article key={card.title} className={`space-y-6 ${card.offset}`}>
                <div className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface p-6 editorial-shadow">
                  <div className="mb-4 flex items-center justify-between">
                    <div className="h-4 w-24 rounded bg-surface-container-high" />
                    <div className="h-4 w-4 rounded-full bg-surface-container-high" />
                  </div>

                  {index === 0 ? (
                    <div className="space-y-3">
                      <div className="h-8 w-48 rounded bg-primary/10" />
                      <div className="h-2 w-full rounded-full bg-tertiary/20">
                        <div className="h-full w-2/3 rounded-full bg-tertiary" />
                      </div>
                      <div className="mt-6 grid grid-cols-2 gap-4">
                        <div className="h-16 rounded bg-surface-container-low" />
                        <div className="h-16 rounded bg-surface-container-low" />
                      </div>
                    </div>
                  ) : index === 1 ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-tertiary" />
                        <div className="h-3 w-32 rounded bg-surface-container-highest" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-secondary-container" />
                        <div className="h-3 w-40 rounded bg-surface-container-highest" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-tertiary" />
                        <div className="h-3 w-24 rounded bg-surface-container-highest" />
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-tertiary" />
                        <div className="h-3 w-48 rounded bg-surface-container-highest" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-4">
                      <div className="flex w-1/3 items-center justify-center rounded-xl bg-surface-container-low">
                        <MaterialIcon icon="bar_chart" size={36} className="text-outline-variant" />
                      </div>
                      <div className="w-2/3 space-y-2">
                        <div className="h-4 w-full rounded bg-surface-container-highest" />
                        <div className="h-2 w-1/2 rounded bg-surface-container-high" />
                        <div className="mt-4 h-10 w-full rounded bg-surface-container-low" />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-headline text-xl font-bold">{card.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-on-surface-variant">
                    {card.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1200px] px-6 py-24 md:px-12">
        <div className="mb-20 text-center">
          <h2 className="font-headline text-4xl font-black tracking-tighter md:text-5xl">
            Go live in three steps
          </h2>
          <p className="mt-4 text-on-surface-variant">
            Simple enough for a small team, powerful enough for the whole district.
          </p>
        </div>

        <div className="relative">
          <div className="absolute left-0 top-12 hidden h-0.5 w-full bg-outline-variant/30 md:block" />
          <div className="relative z-10 grid grid-cols-1 gap-12 md:grid-cols-3 md:gap-16">
            {steps.map((step) => (
              <div key={step.step} className="flex flex-col items-center text-center">
                <div className="mb-8 flex h-24 w-24 items-center justify-center rounded-full border-4 border-primary bg-surface text-3xl font-black text-primary shadow-xl">
                  {step.step}
                </div>
                <h3 className="mb-3 font-headline text-xl font-bold">{step.title}</h3>
                <p className="max-w-sm text-sm leading-relaxed text-on-surface-variant">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-outline-variant/20 bg-surface py-24">
        <div className="mx-auto max-w-[1440px] px-6 md:px-12">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <MaterialIcon icon="public" size={32} className="text-primary" />
                <h3 className="font-headline text-2xl font-black">For the public</h3>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {publicFeatures.map((feature) => (
                  <article
                    key={feature.title}
                    className="space-y-4 rounded-2xl bg-surface-container-low p-8 transition-colors hover:bg-surface-container"
                  >
                    <MaterialIcon icon={feature.icon} className="text-primary" />
                    <h4 className="font-headline text-lg font-bold">{feature.title}</h4>
                    <p className="text-xs leading-relaxed text-on-surface-variant">
                      {feature.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-3">
                <MaterialIcon icon="admin_panel_settings" size={32} className="text-tertiary" />
                <h3 className="font-headline text-2xl font-black">For admins</h3>
              </div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {adminFeatures.map((feature) => (
                  <article
                    key={feature.title}
                    className="space-y-4 rounded-2xl bg-surface-container-low p-8 transition-colors hover:bg-surface-container"
                  >
                    <MaterialIcon icon={feature.icon} className="text-tertiary" />
                    <h4 className="font-headline text-lg font-bold">{feature.title}</h4>
                    <p className="text-xs leading-relaxed text-on-surface-variant">
                      {feature.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[900px] px-6 py-24 md:px-12">
        <h2 className="mb-12 text-center font-headline text-3xl font-black">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {faqItems.map((item) => (
            <details
              key={item.question}
              className="group rounded-2xl border border-outline-variant/20 bg-surface p-6 editorial-shadow"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-headline text-lg font-bold [&::-webkit-details-marker]:hidden">
                <span>{item.question}</span>
                <MaterialIcon
                  icon="add"
                  size={22}
                  className="shrink-0 text-primary transition-transform group-open:rotate-45"
                />
              </summary>
              <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-6 pb-24 md:px-12">
        <div className="relative overflow-hidden rounded-2xl editorial-gradient p-10 text-white md:p-16">
          <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
          <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-tertiary/10 blur-3xl" />
          <div className="relative z-10 mx-auto max-w-2xl text-center">
            <h2 className="font-headline text-4xl font-black tracking-tighter md:text-6xl">
              Ready to make your strategy visible to the community?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-on-primary-container">
              Join forward-thinking school districts that are moving away from dusty PDF binders
              toward live, transparent leadership.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="mailto:sales@stratadash.org?subject=StrataDash%20demo"
                className="inline-flex items-center justify-center rounded-full bg-surface px-10 py-4 font-headline text-lg font-black text-primary transition-transform hover:-translate-y-0.5"
              >
                Book a demo
              </a>
              <Link
                href="/pricing"
                className="inline-flex items-center justify-center rounded-full border border-white/30 px-10 py-4 font-headline text-lg font-black text-white transition-colors hover:bg-white/10"
              >
                Explore pricing
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
