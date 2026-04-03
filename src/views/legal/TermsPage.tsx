import Link from 'next/link';
import { MaterialIcon } from '@/components/v2/public/MaterialIcon';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';
import { MarketingNav } from '../../components/marketing/MarketingNav';

const tocItems = [
  { label: 'Acceptance of terms', href: '#acceptance' },
  { label: 'Description of service', href: '#description' },
  { label: 'Accounts and security', href: '#accounts' },
  { label: 'Acceptable use', href: '#usage' },
  { label: 'Customer data and ownership', href: '#data' },
  { label: 'Fees and billing', href: '#billing' },
  { label: 'Service availability', href: '#availability' },
  { label: 'Intellectual property', href: '#ip' },
  { label: 'Termination', href: '#termination' },
  { label: 'Contact', href: '#contact' },
] as const;

export function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav variant="document" />

      <header className="mx-auto max-w-[1440px] px-6 pt-24 pb-16 md:px-12">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-1.5">
            <span className="font-label text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
              Legal document
            </span>
          </div>
          <h1 className="mt-6 max-w-3xl font-headline text-6xl font-black leading-none tracking-tighter text-on-surface md:text-8xl">
            Terms of <span className="text-primary">Service</span>
          </h1>
          <div className="mt-8 flex flex-col gap-4 text-on-surface-variant md:flex-row md:items-center">
            <div className="flex items-center gap-2 font-label text-sm font-medium">
              <MaterialIcon icon="event" size={18} />
              <span>Last updated April 3, 2026</span>
            </div>
            <div className="hidden h-2 w-2 rounded-full bg-outline-variant md:block" />
            <p className="max-w-2xl text-lg leading-relaxed">
              These terms define the institutional framework for our strategic planning
              partnership.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-[1440px] flex-col gap-16 px-6 pb-32 md:flex-row md:px-12">
        <aside className="hidden w-72 shrink-0 md:block">
          <nav className="sticky top-32 space-y-1">
            <p className="mb-6 font-label text-xs font-bold uppercase tracking-[0.24em] text-on-surface-variant">
              Navigation
            </p>
            {tocItems.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                className={`block border-l-2 py-2 pl-4 text-sm transition-colors ${
                  index === 0
                    ? 'border-primary font-bold text-primary'
                    : 'border-transparent text-on-surface-variant hover:border-primary/30 hover:text-primary'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <article className="flex-1">
          <div className="space-y-20">
            <section id="acceptance" className="scroll-mt-32">
              <h2 className="mb-6 flex items-center gap-4 font-headline text-3xl font-bold text-on-surface">
                <span className="font-label text-sm font-bold uppercase tracking-[0.24em] text-primary/40">
                  01
                </span>
                Acceptance of terms
              </h2>
              <div className="space-y-4 leading-relaxed text-on-surface-variant">
                <p>
                  By accessing or using the StrataDash platform, you agree to be bound by these
                  Terms of Service.
                </p>
                <p>
                  If you are acting on behalf of a district or other organization, you represent
                  that you have authority to accept these terms on that entity&apos;s behalf.
                </p>
              </div>
            </section>

            <section id="description" className="scroll-mt-32">
              <h2 className="mb-6 flex items-center gap-4 font-headline text-3xl font-bold text-on-surface">
                <span className="font-label text-sm font-bold uppercase tracking-[0.24em] text-primary/40">
                  02
                </span>
                Description of service
              </h2>
              <p className="leading-relaxed text-on-surface-variant">
                StrataDash is a cloud-based strategic planning platform designed for public-sector
                organizations. Features include dashboard publishing, KPI tracking, and
                stakeholder reporting.
              </p>
            </section>

            <section id="accounts" className="scroll-mt-32">
              <h2 className="mb-6 flex items-center gap-4 font-headline text-3xl font-bold text-on-surface">
                <span className="font-label text-sm font-bold uppercase tracking-[0.24em] text-primary/40">
                  03
                </span>
                Accounts and security
              </h2>
              <div className="space-y-4 leading-relaxed text-on-surface-variant">
                <p>
                  To access the full suite of tools, you may need to register for an account and
                  keep your credentials secure.
                </p>
                <ul className="space-y-3 border-l-2 border-outline-variant/30 pl-4">
                  <li className="flex gap-3">
                    <MaterialIcon icon="check_circle" fill weight={700} className="text-primary" />
                    <span>Provide accurate and current information during registration.</span>
                  </li>
                  <li className="flex gap-3">
                    <MaterialIcon icon="check_circle" fill weight={700} className="text-primary" />
                    <span>Notify us promptly if your account is accessed without permission.</span>
                  </li>
                </ul>
              </div>
            </section>

            <section id="usage" className="scroll-mt-32">
              <h2 className="mb-6 flex items-center gap-4 font-headline text-3xl font-bold text-on-surface">
                <span className="font-label text-sm font-bold uppercase tracking-[0.24em] text-primary/40">
                  04
                </span>
                Acceptable use
              </h2>
              <p className="leading-relaxed text-on-surface-variant">
                You agree not to use the platform to violate laws, upload malicious code, attempt
                unauthorized access, or interfere with service operation.
              </p>
            </section>

            <section id="data" className="scroll-mt-32">
              <h2 className="mb-6 flex items-center gap-4 font-headline text-3xl font-bold text-on-surface">
                <span className="font-label text-sm font-bold uppercase tracking-[0.24em] text-primary/40">
                  05
                </span>
                Customer data and ownership
              </h2>
              <div className="rounded-2xl border border-outline-variant/10 bg-surface p-8">
                <h3 className="font-headline text-lg font-bold text-on-surface">Data sovereignty</h3>
                <p className="mt-3 leading-relaxed text-on-surface-variant">
                  You retain rights to the data you upload to the platform. StrataDash processes
                  that data only to provide the services requested.
                </p>
              </div>
            </section>

            <section id="billing" className="scroll-mt-32">
              <h2 className="mb-6 flex items-center gap-4 font-headline text-3xl font-bold text-on-surface">
                <span className="font-label text-sm font-bold uppercase tracking-[0.24em] text-primary/40">
                  06
                </span>
                Fees and billing
              </h2>
              <p className="leading-relaxed text-on-surface-variant">
                Institutional subscriptions are billed on the cadence selected in your agreement.
                Fees are non-refundable except where required by law.
              </p>
            </section>

            <section id="availability" className="scroll-mt-32">
              <h2 className="mb-6 flex items-center gap-4 font-headline text-3xl font-bold text-on-surface">
                <span className="font-label text-sm font-bold uppercase tracking-[0.24em] text-primary/40">
                  07
                </span>
                Service availability
              </h2>
              <p className="leading-relaxed text-on-surface-variant">
                We aim to keep the service available and useful, but scheduled maintenance and
                unexpected technical issues may occasionally interrupt access.
              </p>
            </section>

            <section id="ip" className="scroll-mt-32">
              <h2 className="mb-6 flex items-center gap-4 font-headline text-3xl font-bold text-on-surface">
                <span className="font-label text-sm font-bold uppercase tracking-[0.24em] text-primary/40">
                  08
                </span>
                Intellectual property
              </h2>
              <p className="leading-relaxed text-on-surface-variant">
                The platform, its original design, and related trademarks remain the property of
                StrataDash or its licensors. You may not copy or redistribute the software without
                written permission.
              </p>
            </section>

            <section id="termination" className="scroll-mt-32">
              <h2 className="mb-6 flex items-center gap-4 font-headline text-3xl font-bold text-on-surface">
                <span className="font-label text-sm font-bold uppercase tracking-[0.24em] text-primary/40">
                  09
                </span>
                Termination
              </h2>
              <p className="leading-relaxed text-on-surface-variant">
                We may suspend or terminate access if these terms are violated, if payment is not
                maintained, or if continued use would create risk to the service or other users.
              </p>
            </section>

            <section id="contact" className="scroll-mt-32">
              <div className="rounded-2xl bg-surface p-8 editorial-shadow">
                <div className="flex items-start gap-5">
                  <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/5">
                    <MaterialIcon icon="gavel" size={32} className="text-primary" />
                  </div>
                  <div>
                    <h2 className="font-headline text-2xl font-bold text-on-surface">
                      Legal support
                    </h2>
                    <p className="mt-3 max-w-2xl leading-relaxed text-on-surface-variant">
                      Have questions about these terms or need a custom agreement for your
                      district?
                    </p>
                    <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
                      <div>
                        <p className="mb-1 font-label text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/50">
                          Email
                        </p>
                        <a
                          href="mailto:legal@stratadash.org"
                          className="font-bold text-primary transition-colors hover:underline"
                        >
                          legal@stratadash.org
                        </a>
                      </div>
                      <div>
                        <p className="mb-1 font-label text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant/50">
                          Support
                        </p>
                        <Link
                          href="/privacy"
                          className="font-bold text-primary transition-colors hover:underline"
                        >
                          Privacy Policy
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </article>
      </main>

      <MarketingFooter variant="document" />
    </div>
  );
}
