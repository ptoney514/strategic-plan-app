import { MaterialIcon } from '@/components/v2/public/MaterialIcon';
import { MarketingFooter } from '../../components/marketing/MarketingFooter';
import { MarketingNav } from '../../components/marketing/MarketingNav';

const tocItems = [
  { label: 'Introduction', href: '#introduction' },
  { label: 'Information collected', href: '#information-collected' },
  { label: 'How we use info', href: '#usage' },
  { label: 'Cookies', href: '#cookies' },
  { label: 'Data sharing and vendors', href: '#sharing' },
  { label: 'Data retention', href: '#retention' },
  { label: 'Security', href: '#security' },
  { label: 'Your choices and rights', href: '#choices' },
  { label: 'Student and district data', href: '#student-data' },
  { label: 'Contact', href: '#contact' },
] as const;

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav variant="document" />

      <header className="mx-auto max-w-[1440px] px-6 pt-24 pb-16 text-center md:px-12">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full bg-surface-container-high px-4 py-1.5">
          <span className="font-label text-[10px] font-bold uppercase tracking-[0.24em] text-primary">
            Last updated April 3, 2026
          </span>
        </div>
        <h1 className="mt-6 font-headline text-5xl font-black tracking-tighter text-on-surface md:text-6xl">
          Privacy Policy
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-xl leading-relaxed text-on-surface-variant">
          StrataDash is committed to protecting your privacy and explaining how information is
          handled within our strategic planning ecosystem.
        </p>
      </header>

      <main className="mx-auto flex max-w-[1440px] flex-col gap-16 px-6 pb-32 md:flex-row md:px-12">
        <aside className="hidden w-64 shrink-0 lg:block">
          <nav className="sticky top-32 space-y-3">
            <p className="mb-6 font-label text-xs font-bold uppercase tracking-[0.24em] text-primary/50">
              Contents
            </p>
            {tocItems.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                className={`block border-l-2 pl-4 text-sm font-medium transition-colors ${
                  index === 0
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:border-primary/30 hover:text-primary'
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </aside>

        <article className="max-w-4xl space-y-16">
          <section id="introduction" className="scroll-mt-32">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
              Introduction
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-on-surface-variant">
              This Privacy Policy describes how StrataDash collects, uses, and shares information
              when you use our website, platform, and services.
            </p>
            <p className="mt-4 text-lg leading-relaxed text-on-surface-variant">
              By using the service, you agree to this policy. It is starter copy intended for legal
              review, not a final legal opinion.
            </p>
          </section>

          <section id="information-collected" className="scroll-mt-32">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
              Information collected
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-on-surface-variant">
              We collect information to operate the platform and support strategic planning
              workflows.
            </p>
            <div className="mt-6 grid gap-6">
              <article className="rounded-2xl border border-outline-variant/20 bg-surface p-8 editorial-shadow">
                <h3 className="font-headline text-xl font-bold text-on-surface">Institutional data</h3>
                <p className="mt-3 leading-relaxed text-on-surface-variant">
                  District names, school identifiers, goals, progress notes, and other planning
                  records entered by authorized users.
                </p>
              </article>
              <article className="rounded-2xl border border-outline-variant/20 bg-surface p-8 editorial-shadow">
                <h3 className="font-headline text-xl font-bold text-on-surface">Account information</h3>
                <p className="mt-3 leading-relaxed text-on-surface-variant">
                  Professional contact details such as names, email addresses, titles, and access
                  settings used to manage collaboration.
                </p>
              </article>
            </div>
          </section>

          <section id="usage" className="scroll-mt-32">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
              How we use info
            </h2>
            <ul className="mt-6 space-y-5">
              {[
                'To provide, maintain, and improve the platform.',
                'To support strategic visualization and reporting.',
                'To communicate with users about service updates and support.',
              ].map((item) => (
                <li key={item} className="flex items-start gap-4">
                  <MaterialIcon icon="check_circle" fill weight={700} className="mt-1 text-primary" />
                  <span className="text-lg leading-relaxed text-on-surface-variant">{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section id="cookies" className="scroll-mt-32">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
              Cookies
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-on-surface-variant">
              We use essential cookies to maintain secure sessions. Marketing pages may use standard
              analytics cookies to help us understand site performance. We do not use advertising
              cookies inside the authenticated product experience.
            </p>
          </section>

          <section id="sharing" className="scroll-mt-32">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
              Data sharing and vendors
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-on-surface-variant">
              We may share information with service providers that help us host the platform,
              process communications, or support customer operations. We do not sell personal data.
            </p>
          </section>

          <section id="retention" className="scroll-mt-32">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
              Data retention
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-on-surface-variant">
              We retain information only as long as needed to provide the service, comply with legal
              obligations, or resolve disputes. Retention periods can vary by customer agreement.
            </p>
          </section>

          <section id="security" className="scroll-mt-32">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
              Security
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-on-surface-variant">
              We use administrative, technical, and organizational safeguards designed to protect
              district data. No method of transmission or storage is fully secure, so we continue to
              review and improve our controls.
            </p>
          </section>

          <section id="choices" className="scroll-mt-32">
            <h2 className="font-headline text-3xl font-bold tracking-tight text-on-surface">
              Your choices and rights
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-on-surface-variant">
              Depending on your location and role, you may have rights to access, correct, export,
              or delete certain personal information. Contact us if you need assistance with any of
              those requests.
            </p>
          </section>

          <section id="student-data" className="scroll-mt-32">
            <div className="rounded-2xl border border-primary/10 bg-primary/5 p-8 md:p-12">
              <h2 className="font-headline text-3xl font-bold tracking-tight text-primary">
                Student and district data
              </h2>
              <p className="mt-6 text-lg leading-relaxed text-on-surface-variant">
                StrataDash is designed for aggregate strategic data, not student-level records. When
                possible, districts should avoid uploading personally identifiable information.
              </p>
              <ul className="mt-6 space-y-4">
                {[
                  'Aggregate metrics are preferred over student-level records.',
                  'Access should be limited to authorized district personnel.',
                  'Sensitive data should be reviewed before upload.',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <MaterialIcon icon="verified_user" size={20} className="mt-0.5 text-primary" />
                    <span className="text-sm font-bold uppercase tracking-[0.22em] text-primary">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section id="contact" className="scroll-mt-32">
            <div className="rounded-2xl bg-surface-container-highest/30 p-8 text-center md:p-12">
              <h2 className="font-headline text-2xl font-bold text-on-surface">
                Questions about your data?
              </h2>
              <p className="mt-4 text-on-surface-variant">
                Our team can help with privacy questions or district review workflows.
              </p>
              <a
                href="mailto:privacy@stratadash.org"
                className="mt-8 inline-flex items-center gap-2 font-label text-sm font-bold uppercase tracking-[0.24em] text-primary transition-colors hover:underline"
              >
                <MaterialIcon icon="mail" size={18} />
                privacy@stratadash.org
              </a>
            </div>
          </section>
        </article>
      </main>

      <MarketingFooter variant="document" />
    </div>
  );
}
