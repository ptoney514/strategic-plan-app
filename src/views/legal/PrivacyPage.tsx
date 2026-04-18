import {
  CheckCircle,
  LockKey,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";
import {
  PublicDocumentShell,
  type PublicDocumentTocItem,
} from "@/components/public-site/PublicDocumentShell";
import { MarketingFooter } from "../../components/marketing/MarketingFooter";
import { MarketingNav } from "../../components/marketing/MarketingNav";

const tocItems: PublicDocumentTocItem[] = [
  { label: "Introduction", href: "#introduction" },
  { label: "Information collected", href: "#information-collected" },
  { label: "How we use info", href: "#usage" },
  { label: "Cookies", href: "#cookies" },
  { label: "Data sharing and vendors", href: "#sharing" },
  { label: "Data retention", href: "#retention" },
  { label: "Security", href: "#security" },
  { label: "Your choices and rights", href: "#choices" },
  { label: "Student and district data", href: "#student-data" },
  { label: "Contact", href: "#contact" },
];

function PrivacySection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-[30px] border border-outline-variant/70 bg-white/84 px-6 py-7 backdrop-blur-sm md:px-8"
    >
      <h2 className="text-2xl font-semibold tracking-[-0.04em] text-on-surface md:text-3xl">
        {title}
      </h2>
      <div className="mt-5 space-y-4 text-sm leading-7 text-on-surface-variant md:text-base">
        {children}
      </div>
    </section>
  );
}

export function PrivacyPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav />

      <PublicDocumentShell
        eyebrow="Privacy policy"
        title="Privacy Policy"
        description="This policy explains how StrataDash collects, uses, and protects information across the website, the hosted product, and the district planning workflow."
        updatedAt="April 3, 2026"
        toc={tocItems}
        heroAside={
          <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <ShieldCheck size={22} weight="bold" />
            </span>
            <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-on-surface">
              Privacy posture
            </h2>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              StrataDash is designed around aggregate strategic reporting, not
              student-level data collection.
            </p>
          </div>
        }
      >
        <PrivacySection id="introduction" title="Introduction">
          <p>
            This Privacy Policy describes how StrataDash collects, uses, and
            shares information when you use our website, platform, and services.
          </p>
          <p>
            By using the service, you agree to this policy. It is starter copy
            intended for legal review, not a final legal opinion.
          </p>
        </PrivacySection>

        <PrivacySection
          id="information-collected"
          title="Information collected"
        >
          <p>
            We collect information to operate the platform and support strategic
            planning workflows.
          </p>
          <div className="grid gap-4">
            <article className="rounded-[24px] bg-surface-container-low px-5 py-5">
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-on-surface">
                Institutional data
              </h3>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                District names, school identifiers, goals, progress notes, and
                other planning records entered by authorized users.
              </p>
            </article>
            <article className="rounded-[24px] bg-surface-container-low px-5 py-5">
              <h3 className="text-lg font-semibold tracking-[-0.03em] text-on-surface">
                Account information
              </h3>
              <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                Professional contact details such as names, email addresses,
                titles, and access settings used to manage collaboration.
              </p>
            </article>
          </div>
        </PrivacySection>

        <PrivacySection id="usage" title="How we use info">
          <div className="space-y-3">
            {[
              "To provide, maintain, and improve the platform.",
              "To support strategic visualization and reporting.",
              "To communicate with users about service updates and support.",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-[22px] bg-surface-container-low px-4 py-4"
              >
                <CheckCircle
                  size={16}
                  className="mt-1 text-primary"
                  weight="fill"
                />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </PrivacySection>

        <PrivacySection id="cookies" title="Cookies">
          <p>
            We use essential cookies to maintain secure sessions. Marketing
            pages may use standard analytics cookies to help us understand site
            performance. We do not use advertising cookies inside the
            authenticated product experience.
          </p>
        </PrivacySection>

        <PrivacySection id="sharing" title="Data sharing and vendors">
          <p>
            We may share information with service providers that help us host
            the platform, process communications, or support customer
            operations. We do not sell personal data.
          </p>
        </PrivacySection>

        <PrivacySection id="retention" title="Data retention">
          <p>
            We retain information only as long as needed to provide the service,
            comply with legal obligations, or resolve disputes. Retention
            periods can vary by customer agreement.
          </p>
        </PrivacySection>

        <PrivacySection id="security" title="Security">
          <p>
            We use administrative, technical, and organizational safeguards
            designed to protect district data. No method of transmission or
            storage is fully secure, so we continue to review and improve our
            controls.
          </p>
        </PrivacySection>

        <PrivacySection id="choices" title="Your choices and rights">
          <p>
            Depending on your location and role, you may have rights to access,
            correct, export, or delete certain personal information. Contact us
            if you need assistance with any of those requests.
          </p>
        </PrivacySection>

        <section
          id="student-data"
          className="scroll-mt-28 rounded-[32px] border border-primary/10 bg-primary/6 px-6 py-7 md:px-8"
        >
          <div className="flex items-center gap-3 text-primary">
            <LockKey size={22} weight="bold" />
            <p className="public-kicker">Student and district data</p>
          </div>
          <h2 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-primary md:text-3xl">
            Aggregate reporting is preferred.
          </h2>
          <p className="mt-5 max-w-[64ch] text-sm leading-7 text-on-surface-variant md:text-base">
            StrataDash is designed for aggregate strategic data, not
            student-level records. When possible, districts should avoid
            uploading personally identifiable information.
          </p>
          <div className="mt-6 space-y-3">
            {[
              "Aggregate metrics are preferred over student-level records.",
              "Access should be limited to authorized district personnel.",
              "Sensitive data should be reviewed before upload.",
            ].map((item) => (
              <div
                key={item}
                className="flex items-start gap-3 rounded-[22px] bg-white/82 px-4 py-4"
              >
                <CheckCircle
                  size={16}
                  className="mt-1 text-primary"
                  weight="fill"
                />
                <span className="text-sm leading-7 text-on-surface">
                  {item}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section
          id="contact"
          className="scroll-mt-28 rounded-[32px] border border-outline-variant/70 bg-white/86 px-6 py-7 backdrop-blur-sm md:px-8"
        >
          <p className="public-kicker text-primary">Contact</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-on-surface">
            Questions about your data?
          </h2>
          <p className="mt-4 max-w-[62ch] text-sm leading-7 text-on-surface-variant md:text-base">
            Our team can help with privacy questions or district review
            workflows.
          </p>
          <a
            href="mailto:privacy@stratadash.org"
            className="mt-6 inline-flex rounded-full bg-surface-container-low px-5 py-3 text-sm font-semibold text-primary transition-colors hover:text-on-surface"
          >
            privacy@stratadash.org
          </a>
        </section>
      </PublicDocumentShell>

      <MarketingFooter />
    </div>
  );
}
