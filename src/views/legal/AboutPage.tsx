import Link from 'next/link';
import { MaterialIcon } from '@/components/v2/public/MaterialIcon';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';
import { MarketingNav } from '../../components/marketing/MarketingNav';

const beliefCards = [
  {
    title: 'Clarity over complexity',
    description:
      'We design for busy district leaders, not data engineers. Information should be easy to scan and easy to explain.',
  },
  {
    title: 'Usefulness over flash',
    description:
      'Every element should help a parent, board member, or cabinet leader understand what is happening.',
  },
  {
    title: 'Trust over hype',
    description:
      'We speak plainly and build with the restraint that public-sector work deserves.',
  },
  {
    title: 'Accessibility over cleverness',
    description:
      'If a parent cannot read it on their phone, the page is not doing its job.',
  },
] as const;

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav />

      <main>
        <section className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-12 px-6 pb-20 pt-24 md:grid-cols-12 md:px-12 md:pb-28">
          <div className="md:col-span-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-surface-container-low px-4 py-2 font-label text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
              Our story
            </div>
            <h1 className="mt-8 max-w-3xl font-headline text-5xl font-black leading-[1.06] tracking-tighter text-primary md:text-[3.5rem]">
              Modernizing how districts communicate strategic progress.
            </h1>
            <p className="mt-8 max-w-2xl text-xl leading-relaxed text-on-surface-variant">
              Public education thrives on trust, transparency, and a shared community understanding
              of where the district is headed.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="mailto:sales@stratadash.org?subject=StrataDash%20demo"
                className="tactile-button inline-flex items-center justify-center rounded-full px-10 py-4 font-headline text-lg font-bold text-white transition-transform hover:-translate-y-0.5"
              >
                Book a demo
              </a>
              <Link
                href="/district/westside"
                className="inline-flex items-center justify-center rounded-full border-2 border-primary/20 px-10 py-4 font-headline text-lg font-bold text-primary transition-colors hover:bg-primary/5"
              >
                View a live district example
              </Link>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-surface-container-high editorial-shadow">
              <img
                src="/stitch/about-hero.png"
                alt="Strategy meeting"
                className="h-full w-full object-cover"
              />
            </div>
          </div>
        </section>

        <section className="bg-surface-container-low py-24 md:py-32">
          <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-16 px-6 md:grid-cols-2 md:px-12">
            <div className="lg:sticky lg:top-32">
              <p className="mb-6 font-label text-sm font-bold uppercase tracking-[0.24em] text-secondary">
                The catalyst
              </p>
              <h2 className="max-w-xl font-headline text-5xl font-extrabold leading-tight tracking-tighter text-primary">
                Strategic plans deserve better than a binder.
              </h2>
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-on-surface-variant">
                For decades, the most ambitious goals for students have been buried in PDFs or
                binders on a shelf. We saw a gap between the district vision and the community
                understanding of that work.
                <br />
                <br />
                StrataDash was built to bridge that gap with a public-facing dashboard that makes
                progress visible, actionable, and modern.
              </p>
            </div>

            <div className="space-y-6">
              <article className="rounded-2xl border border-outline-variant/10 bg-surface p-8 editorial-shadow">
                <MaterialIcon icon="description" size={36} className="mb-6 text-primary" />
                <h3 className="font-headline text-2xl font-bold text-on-surface">The PDF problem</h3>
                <p className="mt-4 text-on-surface-variant">
                  Static documents are hard to update, hard to search, and rarely read by the
                  public.
                </p>
              </article>
              <article className="rounded-2xl border border-outline-variant/10 bg-surface p-8 editorial-shadow">
                <MaterialIcon icon="history_edu" size={36} className="mb-6 text-primary" />
                <h3 className="font-headline text-2xl font-bold text-on-surface">The trust gap</h3>
                <p className="mt-4 text-on-surface-variant">
                  When progress is hidden, skepticism grows. Visibility makes it easier to build
                  confidence.
                </p>
              </article>
              <article className="rounded-2xl border border-outline-variant/10 bg-surface p-8 editorial-shadow">
                <MaterialIcon icon="payments" size={36} className="mb-6 text-primary" />
                <h3 className="font-headline text-2xl font-bold text-on-surface">The budget reality</h3>
                <p className="mt-4 text-on-surface-variant">
                  Public funds should go to classrooms, not custom consulting software.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-background py-24 md:py-32">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="mb-16 text-center">
              <h2 className="font-headline text-5xl font-black tracking-tighter text-on-surface">
                Built for the institutional architect.
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-on-surface-variant">
                We serve the people managing the public systems that matter most.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-12">
              <article className="relative overflow-hidden rounded-2xl bg-primary p-10 text-on-primary md:col-span-8">
                <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(to_right,rgba(255,255,255,0.18)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.18)_1px,transparent_1px)] [background-size:24px_24px]" />
                <div className="relative z-10 flex h-full flex-col justify-end">
                  <h3 className="max-w-md font-headline text-4xl font-bold">K-12 school districts</h3>
                  <p className="mt-4 max-w-lg text-lg leading-relaxed text-white/80">
                    From small rural districts to large urban systems, the platform aligns cabinet
                    teams and school boards under one source of truth.
                  </p>
                </div>
              </article>

              <article className="rounded-2xl bg-surface-container-highest p-10 md:col-span-4">
                <MaterialIcon icon="hub" size={40} className="text-primary" />
                <h3 className="mt-10 font-headline text-2xl font-bold text-on-surface">Charter networks</h3>
                <p className="mt-4 text-on-surface-variant">
                  Scale excellence by keeping strategic focus across multiple campuses and regions.
                </p>
              </article>

              <article className="rounded-2xl bg-tertiary-fixed p-10 md:col-span-4">
                <MaterialIcon icon="account_balance" size={40} className="text-tertiary" />
                <h3 className="mt-10 font-headline text-2xl font-bold text-on-tertiary-fixed-variant">
                  Education agencies
                </h3>
                <p className="mt-4 text-on-tertiary-fixed-variant/80">
                  Visualize policy impact and resource allocation across regions without extra
                  overhead.
                </p>
              </article>

              <article className="flex items-center justify-between gap-12 rounded-2xl bg-surface-container-low p-10 md:col-span-8">
                <div className="max-w-md">
                  <h3 className="font-headline text-2xl font-bold text-on-surface">
                    Public transparency
                  </h3>
                  <p className="mt-4 text-on-surface-variant">
                    Built-in public dashboards make it easy for parents and taxpayers to understand
                    district performance without a data degree.
                  </p>
                </div>
                <div className="hidden h-32 w-48 items-center justify-center rounded-2xl bg-surface editorial-shadow lg:flex">
                  <span className="font-label text-sm font-bold uppercase tracking-[0.24em] text-primary">
                    98% on track
                  </span>
                </div>
              </article>
            </div>
          </div>
        </section>

        <section className="bg-surface-container-high py-24 md:py-32">
          <div className="mx-auto max-w-[1440px] px-6 md:px-12">
            <div className="grid grid-cols-1 gap-16 lg:grid-cols-3">
              <div>
                <h2 className="font-headline text-4xl font-extrabold tracking-tighter text-primary">
                  Our core beliefs
                </h2>
                <ul className="mt-10 space-y-8">
                  <li className="flex gap-4">
                    <MaterialIcon icon="check_circle" fill weight={700} className="text-secondary" />
                    <span className="font-body font-bold text-on-surface">Usable transparency is a human right.</span>
                  </li>
                  <li className="flex gap-4">
                    <MaterialIcon icon="check_circle" fill weight={700} className="text-secondary" />
                    <span className="font-body font-bold text-on-surface">Visible progress accelerates growth.</span>
                  </li>
                  <li className="flex gap-4">
                    <MaterialIcon icon="check_circle" fill weight={700} className="text-secondary" />
                    <span className="font-body font-bold text-on-surface">Respect for public budgets is paramount.</span>
                  </li>
                  <li className="flex gap-4">
                    <MaterialIcon icon="check_circle" fill weight={700} className="text-secondary" />
                    <span className="font-body font-bold text-on-surface">No custom consulting should be needed.</span>
                  </li>
                </ul>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:col-span-2 md:grid-cols-2">
                {beliefCards.map((card, index) => (
                  <article key={card.title} className="border-l-4 border-primary bg-surface/60 p-8">
                    <p className="mb-4 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary/60">
                      Principle 0{index + 1}
                    </p>
                    <h3 className="font-headline text-2xl font-bold text-on-surface">{card.title}</h3>
                    <p className="mt-4 text-sm leading-relaxed text-on-surface-variant">
                      {card.description}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-primary py-24 text-center text-on-primary md:py-32">
          <div className="mx-auto max-w-4xl px-6 md:px-12">
            <h2 className="font-headline text-5xl font-black tracking-tighter text-white">
              Ready to bring your strategic plan to life?
            </h2>
            <p className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-on-primary-container">
              Transparency, trust, and clarity should be the default.
            </p>
            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <a
                href="mailto:sales@stratadash.org?subject=StrataDash%20demo"
                className="inline-flex items-center justify-center rounded-full bg-surface px-12 py-5 font-headline text-xl font-black text-primary transition-transform hover:-translate-y-0.5"
              >
                Book a demo
              </a>
              <Link
                href="/district/westside"
                className="inline-flex items-center justify-center rounded-full border-2 border-white/30 px-12 py-5 font-headline text-xl font-black text-white transition-colors hover:bg-white/10"
              >
                View live example
              </Link>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
