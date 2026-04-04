import Link from "next/link";
import {
  ArrowRight,
  Buildings,
  CheckCircle,
  GlobeHemisphereWest,
  PresentationChart,
  ShieldCheck,
} from "@phosphor-icons/react/dist/ssr";
import {
  ProductCanvas,
  ProductVideoFrame,
} from "@/components/public-site/ProductCanvas";
import { PublicSectionHeading } from "@/components/public-site/PublicSectionHeading";

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
    name: "Pilot",
    price: "$4,500",
    description:
      "A contained launch for a single site or a small leadership team proving out one live plan.",
    features: [
      "1 active strategic plan",
      "5 admin seats",
      "District branding",
      "Email support",
    ],
    cta: "Start pilot",
    ctaHref: "mailto:sales@stratadash.org?subject=StrataDash%20pilot",
  },
  {
    name: "District",
    price: "$12,000",
    description:
      "The standard operating setup for central office teams publishing public progress across the district.",
    features: [
      "Unlimited strategic plans",
      "25 admin seats",
      "Advanced district branding",
      "Priority onboarding success",
      "Board presentation mode",
    ],
    cta: "Select district plan",
    ctaHref: "mailto:sales@stratadash.org?subject=StrataDash%20district%20plan",
    featured: true,
    badge: "Most requested",
  },
  {
    name: "Enterprise",
    price: "Custom",
    description:
      "A regional or multi-district configuration for agencies, county offices, and complex governance models.",
    features: [
      "Regional aggregation dashboards",
      "SSO and API integrations",
      "Unlimited admin seats",
      "Dedicated strategic advisor",
    ],
    cta: "Inquire today",
    ctaHref:
      "mailto:sales@stratadash.org?subject=StrataDash%20enterprise%20pricing",
  },
];

const includedCapabilities = [
  {
    icon: GlobeHemisphereWest,
    title: "Hosted public dashboard",
    description:
      "Publish a branded district plan to a single link instead of distributing static files.",
  },
  {
    icon: PresentationChart,
    title: "Board briefing workflow",
    description:
      "Keep narratives and status visible between meetings without rebuilding the same report.",
  },
  {
    icon: Buildings,
    title: "District ownership model",
    description:
      "Separate editing permissions, publishing control, and public viewing roles.",
  },
  {
    icon: ShieldCheck,
    title: "Institutional guardrails",
    description:
      "Pricing and access stay aligned to procurement, governance, and budget reality.",
  },
] as const;

const faqItems = [
  {
    question: "How does annual billing work for districts?",
    answer:
      "Most customers run on an annual cadence aligned to district budgeting. We can pro-rate the first year when timing demands it.",
  },
  {
    question: "Can we import the existing five-year plan?",
    answer:
      "Yes. The onboarding workflow starts from the documents and spreadsheets the team already maintains.",
  },
  {
    question: "Is public traffic limited?",
    answer:
      "No. The public-facing plan is part of the core product experience, not a metered add-on.",
  },
  {
    question: "Do we need to upload student-level records?",
    answer:
      "No. StrataDash is built for strategic and aggregate reporting rather than student-level PII.",
  },
] as const;

export function V2Pricing() {
  const featuredTier = tiers.find((tier) => tier.featured)!;
  const compactTiers = tiers.filter((tier) => !tier.featured);

  return (
    <div className="overflow-hidden">
      <section className="mx-auto max-w-[1400px] px-6 pb-18 pt-14 md:px-10 md:pb-24 md:pt-18">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,0.86fr)_minmax(480px,1.14fr)] lg:items-center">
          <div className="max-w-2xl">
            <p className="public-kicker text-primary">Pricing</p>
            <h1 className="mt-5 font-headline text-5xl font-semibold tracking-[-0.06em] text-on-surface md:text-7xl">
              Strategy is the work. The software should just work.
            </h1>
            <p className="mt-6 max-w-[63ch] text-lg leading-8 text-on-surface-variant md:text-xl">
              Transparent annual pricing for public-sector teams that need a
              better publishing surface, a cleaner governance model, and a
              lighter operational burden than custom consulting.
            </p>
            <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-outline-variant/70 bg-white/84 px-4 py-3 backdrop-blur-sm">
              <CheckCircle size={18} className="text-primary" weight="fill" />
              <span className="public-kicker text-on-surface-variant">
                Procurement friendly, district-ready, public-facing
              </span>
            </div>
          </div>

          <ProductCanvas mode="governance" />
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-24 md:px-10">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.12fr)_minmax(320px,0.88fr)]">
          <article className="public-gradient public-shadow-strong relative overflow-hidden rounded-[34px] p-8 text-white md:p-10">
            {featuredTier.badge ? (
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-label uppercase tracking-[0.24em] text-white">
                {featuredTier.badge}
              </span>
            ) : null}
            <div className="mt-8 grid gap-8 lg:grid-cols-[0.78fr_1.22fr] lg:items-end">
              <div>
                <p className="text-sm font-semibold text-white/75">
                  {featuredTier.name}
                </p>
                <p className="mt-3 text-6xl font-semibold tracking-[-0.06em]">
                  {featuredTier.price}
                </p>
                <p className="mt-2 text-sm font-medium text-white/72">/ year</p>
              </div>
              <div>
                <h2 className="text-2xl font-semibold tracking-[-0.04em] text-white">
                  The standard district operating model.
                </h2>
                <p className="mt-4 max-w-[58ch] text-sm leading-7 text-white/78">
                  {featuredTier.description}
                </p>
              </div>
            </div>
            <div className="mt-10 grid gap-3 md:grid-cols-2">
              {featuredTier.features.map((feature) => (
                <div
                  key={feature}
                  className="flex items-start gap-3 rounded-[24px] border border-white/12 bg-white/8 px-4 py-4"
                >
                  <CheckCircle
                    size={16}
                    weight="fill"
                    className="mt-1 text-white"
                  />
                  <span className="text-sm leading-7 text-white">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
            <a
              href={featuredTier.ctaHref}
              className="mt-10 inline-flex items-center gap-2 rounded-full bg-white px-6 py-4 text-sm font-semibold text-primary transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
            >
              {featuredTier.cta}
              <ArrowRight size={16} weight="bold" />
            </a>
          </article>

          <div className="grid gap-6">
            {compactTiers.map((tier) => (
              <article
                key={tier.name}
                className="public-shadow rounded-[34px] border border-outline-variant/70 bg-white/86 p-7 backdrop-blur-sm"
              >
                <div className="flex items-start justify-between gap-6">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">
                      {tier.name}
                    </p>
                    <p className="mt-3 text-5xl font-semibold tracking-[-0.06em] text-on-surface">
                      {tier.price}
                    </p>
                    <p className="mt-2 text-sm font-medium text-on-surface-variant">
                      / year
                    </p>
                  </div>
                </div>
                <p className="mt-5 text-sm leading-7 text-on-surface-variant">
                  {tier.description}
                </p>
                <div className="mt-6 space-y-3">
                  {tier.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-3">
                      <CheckCircle
                        size={15}
                        weight="fill"
                        className="mt-1 text-primary"
                      />
                      <span className="text-sm leading-7 text-on-surface">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
                <a
                  href={tier.ctaHref}
                  className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-on-surface"
                >
                  {tier.cta}
                  <ArrowRight size={16} weight="bold" />
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-low py-24">
        <div className="mx-auto grid max-w-[1400px] gap-14 px-6 md:px-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-center">
          <PublicSectionHeading
            eyebrow="Included in every plan"
            title="Foundationally integrated."
            description="Every license includes the hosted public surface, the editing workflow, and the governance model required to keep strategy current."
          />
          <div className="grid gap-4 md:grid-cols-[1.15fr_0.85fr]">
            {includedCapabilities.slice(0, 2).map((item) => (
              <article
                key={item.title}
                className="public-shadow rounded-[28px] border border-outline-variant/70 bg-white/88 p-6 backdrop-blur-sm"
              >
                <item.icon size={24} className="text-primary" weight="bold" />
                <h3 className="mt-6 text-xl font-semibold tracking-[-0.03em] text-on-surface">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                  {item.description}
                </p>
              </article>
            ))}
            <article className="public-gradient public-shadow-strong row-span-2 rounded-[30px] p-7 text-white">
              <p className="public-kicker text-white/70">Budget position</p>
              <p className="mt-5 text-6xl font-semibold tracking-[-0.06em]">
                1/10th
              </p>
              <p className="mt-4 text-sm leading-7 text-white/76">
                The rough cost profile compared with traditional strategic
                planning consulting. You pay for a product workflow, not
                recurring slide-deck labor.
              </p>
            </article>
            {includedCapabilities.slice(2).map((item) => (
              <article
                key={item.title}
                className="public-shadow rounded-[28px] border border-outline-variant/70 bg-white/88 p-6 backdrop-blur-sm"
              >
                <item.icon size={24} className="text-primary" weight="bold" />
                <h3 className="mt-6 text-xl font-semibold tracking-[-0.03em] text-on-surface">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-24 md:px-10">
        <ProductVideoFrame
          label="What the board sees"
          title="A product-led briefing surface, not a static attachment"
          description="Live product reel"
        />
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-24 md:px-10">
        <div className="grid gap-16 lg:grid-cols-[0.72fr_1.28fr]">
          <PublicSectionHeading
            eyebrow="Procurement questions"
            title="Common procurement inquiries"
            description="These are the practical questions that usually surface during approval, budgeting, and technology review."
          />
          <div className="space-y-4">
            {faqItems.map((item) => (
              <article
                key={item.question}
                className="rounded-[28px] border border-outline-variant/70 bg-white/84 px-6 py-6 backdrop-blur-sm"
              >
                <h3 className="text-lg font-semibold tracking-[-0.03em] text-on-surface">
                  {item.question}
                </h3>
                <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                  {item.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-24 md:px-10">
        <div className="public-gradient public-shadow-strong overflow-hidden rounded-[36px] px-8 py-10 text-white md:px-12 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[0.88fr_0.72fr] lg:items-end">
            <div>
              <p className="public-kicker text-white/70">Ready to move</p>
              <h2 className="mt-4 max-w-3xl font-headline text-4xl font-semibold tracking-[-0.05em] md:text-6xl">
                Buy the operating system for public planning, not another
                consulting cycle.
              </h2>
            </div>
            <div className="lg:justify-self-end">
              <p className="max-w-xl text-base leading-8 text-white/78">
                StrataDash gives district teams one current source of truth for
                strategy, public communication, and board reporting.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <a
                  href="mailto:sales@stratadash.org?subject=StrataDash%20demo"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-base font-semibold text-primary transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  Book a live demo
                  <ArrowRight size={18} weight="bold" />
                </a>
                <Link
                  href="/district/westside"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
                >
                  View district example
                  <ArrowRight size={18} weight="bold" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
