import Link from "next/link";
import { CheckCircle, Gavel, Lifebuoy } from "@phosphor-icons/react/dist/ssr";
import {
  PublicDocumentShell,
  type PublicDocumentTocItem,
} from "@/components/public-site/PublicDocumentShell";
import { MarketingFooter } from "../../components/marketing/MarketingFooter";
import { MarketingNav } from "../../components/marketing/MarketingNav";

const tocItems: PublicDocumentTocItem[] = [
  { label: "Acceptance of terms", href: "#acceptance" },
  { label: "Description of service", href: "#description" },
  { label: "Accounts and security", href: "#accounts" },
  { label: "Acceptable use", href: "#usage" },
  { label: "Customer data and ownership", href: "#data" },
  { label: "Fees and billing", href: "#billing" },
  { label: "Service availability", href: "#availability" },
  { label: "Intellectual property", href: "#ip" },
  { label: "Termination", href: "#termination" },
  { label: "Contact", href: "#contact" },
];

function TermsSection({
  id,
  index,
  title,
  children,
}: {
  id: string;
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-28 rounded-[30px] border border-outline-variant/70 bg-white/84 px-6 py-7 backdrop-blur-sm md:px-8"
    >
      <div className="flex items-center gap-4">
        <span className="public-kicker text-primary">{index}</span>
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-on-surface md:text-3xl">
          {title}
        </h2>
      </div>
      <div className="mt-5 space-y-4 text-sm leading-7 text-on-surface-variant md:text-base">
        {children}
      </div>
    </section>
  );
}

export function TermsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav variant="document" />

      <PublicDocumentShell
        eyebrow="Legal document"
        title={
          <>
            Terms of <span className="text-primary">Service</span>
          </>
        }
        description="These terms describe the framework for using StrataDash as a hosted strategic planning product. They are starter language for review, not a substitute for counsel."
        updatedAt="April 3, 2026"
        toc={tocItems}
        heroAside={
          <div>
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Gavel size={22} weight="bold" />
            </span>
            <h2 className="mt-5 text-xl font-semibold tracking-[-0.03em] text-on-surface">
              Institutional framing
            </h2>
            <p className="mt-3 text-sm leading-7 text-on-surface-variant">
              This document is written for districts, agencies, and
              public-sector teams using a hosted strategic planning workflow.
            </p>
          </div>
        }
      >
        <TermsSection id="acceptance" index="01" title="Acceptance of terms">
          <p>
            By accessing or using the StrataDash platform, you agree to be bound
            by these Terms of Service.
          </p>
          <p>
            If you are acting on behalf of a district or other organization, you
            represent that you have authority to accept these terms on that
            entity&apos;s behalf.
          </p>
        </TermsSection>

        <TermsSection
          id="description"
          index="02"
          title="Description of service"
        >
          <p>
            StrataDash is a cloud-based strategic planning platform designed for
            public-sector organizations. Features include dashboard publishing,
            KPI tracking, and stakeholder reporting.
          </p>
        </TermsSection>

        <TermsSection id="accounts" index="03" title="Accounts and security">
          <p>
            To access the full suite of tools, you may need to register for an
            account and keep your credentials secure.
          </p>
          <div className="space-y-3 rounded-[24px] bg-surface-container-low px-4 py-4">
            {[
              "Provide accurate and current information during registration.",
              "Notify us promptly if your account is accessed without permission.",
            ].map((item) => (
              <div key={item} className="flex items-start gap-3">
                <CheckCircle
                  size={16}
                  className="mt-1 text-primary"
                  weight="fill"
                />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </TermsSection>

        <TermsSection id="usage" index="04" title="Acceptable use">
          <p>
            You agree not to use the platform to violate laws, upload malicious
            code, attempt unauthorized access, or interfere with service
            operation.
          </p>
        </TermsSection>

        <TermsSection id="data" index="05" title="Customer data and ownership">
          <p>
            You retain rights to the data you upload to the platform. StrataDash
            processes that data only to provide the services requested.
          </p>
        </TermsSection>

        <TermsSection id="billing" index="06" title="Fees and billing">
          <p>
            Institutional subscriptions are billed on the cadence selected in
            your agreement. Fees are non-refundable except where required by
            law.
          </p>
        </TermsSection>

        <TermsSection id="availability" index="07" title="Service availability">
          <p>
            We aim to keep the service available and useful, but scheduled
            maintenance and unexpected technical issues may occasionally
            interrupt access.
          </p>
        </TermsSection>

        <TermsSection id="ip" index="08" title="Intellectual property">
          <p>
            The platform, its original design, and related trademarks remain the
            property of StrataDash or its licensors. You may not copy or
            redistribute the software without written permission.
          </p>
        </TermsSection>

        <TermsSection id="termination" index="09" title="Termination">
          <p>
            We may suspend or terminate access if these terms are violated, if
            payment is not maintained, or if continued use would create risk to
            the service or other users.
          </p>
        </TermsSection>

        <section
          id="contact"
          className="scroll-mt-28 rounded-[32px] border border-outline-variant/70 bg-white/86 px-6 py-7 backdrop-blur-sm md:px-8"
        >
          <div className="grid gap-6 md:grid-cols-[84px_minmax(0,1fr)]">
            <span className="flex h-16 w-16 items-center justify-center rounded-[24px] bg-primary/10 text-primary">
              <Lifebuoy size={28} weight="bold" />
            </span>
            <div>
              <p className="public-kicker text-primary">Contact</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-on-surface">
                Legal support
              </h2>
              <p className="mt-4 max-w-[62ch] text-sm leading-7 text-on-surface-variant md:text-base">
                Have questions about these terms or need a custom agreement for
                your district?
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <a
                  href="mailto:legal@stratadash.org"
                  className="rounded-[24px] bg-surface-container-low px-4 py-4 text-sm font-semibold text-primary transition-colors hover:text-on-surface"
                >
                  legal@stratadash.org
                </a>
                <Link
                  href="/privacy"
                  className="rounded-[24px] bg-surface-container-low px-4 py-4 text-sm font-semibold text-primary transition-colors hover:text-on-surface"
                >
                  Privacy Policy
                </Link>
              </div>
            </div>
          </div>
        </section>
      </PublicDocumentShell>

      <MarketingFooter variant="document" />
    </div>
  );
}
