import Link from "next/link";
import {
  ArrowRight,
  Buildings,
  CheckCircle,
  GlobeHemisphereWest,
  TrendUp,
} from "@phosphor-icons/react/dist/ssr";
import { MarketingFooter } from "../../components/marketing/MarketingFooter";
import { MarketingNav } from "../../components/marketing/MarketingNav";
import {
  ProductCanvas,
  ProductVideoFrame,
} from "@/components/public-site/ProductCanvas";
import { PublicSectionHeading } from "@/components/public-site/PublicSectionHeading";

const operatingBeliefs = [
  {
    title: "Clarity over consulting language",
    description:
      "District leaders need to explain progress quickly. The product should reduce interpretation work, not increase it.",
  },
  {
    title: "Readable hierarchy over visual clutter",
    description:
      "Plans, objectives, owners, and KPIs should align cleanly so the public surface tells one coherent story.",
  },
  {
    title: "Update rhythm over presentation churn",
    description:
      "The weekly cadence of leadership work matters more than a quarterly deck rebuild. We optimize for the operational rhythm.",
  },
  {
    title: "Institutional trust over marketing noise",
    description:
      "A district planning surface should feel current and credible, not overloaded with startup theatrics.",
  },
] as const;

const audienceItems = [
  "K-12 school districts that need a public-facing strategic hub",
  "Leadership teams managing cabinet, campus, and board communication",
  "Organizations that want strategic reporting without custom software overhead",
] as const;

export function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <MarketingNav />

      <main className="overflow-hidden">
        <section className="mx-auto max-w-[1400px] px-6 pb-18 pt-14 md:px-10 md:pb-24 md:pt-18">
          <div className="grid gap-16 lg:grid-cols-[minmax(0,0.88fr)_minmax(520px,1.12fr)] lg:items-center">
            <div className="max-w-2xl">
              <p className="public-kicker text-primary">About StrataDash</p>
              <h1 className="mt-5 font-headline text-5xl font-semibold tracking-[-0.06em] text-on-surface md:text-7xl">
                Modernizing how districts communicate strategic progress.
              </h1>
              <p className="mt-6 max-w-[64ch] text-lg leading-8 text-on-surface-variant md:text-xl">
                We built StrataDash for leadership teams that are tired of
                treating their most important public strategy like a file
                attachment.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <a
                  href="mailto:sales@stratadash.org?subject=StrataDash%20demo"
                  className="public-button-primary inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-base font-semibold text-white transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                >
                  Book a demo
                  <ArrowRight size={18} weight="bold" />
                </a>
                <Link
                  href="/district/westside"
                  className="public-button-secondary inline-flex items-center justify-center gap-2 rounded-full px-7 py-4 text-base font-semibold text-on-surface transition-colors hover:text-primary"
                >
                  View a live district example
                  <ArrowRight size={18} weight="bold" />
                </Link>
              </div>
            </div>

            <ProductCanvas mode="analytics" />
          </div>
        </section>

        <section className="border-y border-outline-variant/70 bg-white/74">
          <div className="mx-auto grid max-w-[1400px] gap-6 px-6 py-8 md:px-10 lg:grid-cols-[1fr_1fr_1fr]">
            {[
              { label: "Built for district leadership teams", icon: Buildings },
              {
                label: "Public surfaces that stay current",
                icon: GlobeHemisphereWest,
              },
              { label: "Board updates without deck churn", icon: TrendUp },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-4 rounded-[24px] px-2 py-2"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <item.icon size={20} weight="bold" />
                </span>
                <p className="text-sm font-semibold tracking-[-0.02em] text-on-surface">
                  {item.label}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-30">
          <div className="grid gap-16 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
            <PublicSectionHeading
              eyebrow="Why it exists"
              title="District plans deserve better than a binder."
              description="The catalyst was simple: districts invest too much effort in strategy for the result to disappear into a PDF, a board packet, or a hard-to-find attachment on the website."
            />
            <ProductVideoFrame
              label="Product-led story"
              title="The interface is the explanation"
              description="Current product reel"
            />
          </div>
        </section>

        <section className="bg-surface-container-low py-24">
          <div className="mx-auto grid max-w-[1400px] gap-16 px-6 md:px-10 lg:grid-cols-[0.74fr_1.26fr]">
            <PublicSectionHeading
              eyebrow="Operating beliefs"
              title="The design principle is institutional clarity."
              description="We build around the communication burden that district leaders already carry. Every surface should make that burden lighter."
            />
            <div className="space-y-5">
              {operatingBeliefs.map((belief) => (
                <article
                  key={belief.title}
                  className="rounded-[28px] border border-outline-variant/70 bg-white/86 px-6 py-6 backdrop-blur-sm"
                >
                  <h2 className="text-xl font-semibold tracking-[-0.03em] text-on-surface">
                    {belief.title}
                  </h2>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                    {belief.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-30">
          <div className="grid gap-14 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div className="public-gradient public-shadow-strong rounded-[34px] px-8 py-10 text-white md:px-10 md:py-12">
              <p className="public-kicker text-white/70">Who it serves</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-[-0.05em] md:text-5xl">
                Built for the people managing public systems.
              </h2>
              <div className="mt-8 space-y-4">
                {audienceItems.map((item) => (
                  <div
                    key={item}
                    className="flex items-start gap-3 rounded-[24px] border border-white/14 bg-white/8 px-4 py-4"
                  >
                    <CheckCircle
                      size={16}
                      weight="fill"
                      className="mt-1 text-white"
                    />
                    <span className="text-sm leading-7 text-white">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <ProductCanvas mode="editor" />
          </div>
        </section>

        <section className="mx-auto max-w-[1400px] px-6 pb-24 md:px-10">
          <div className="public-gradient public-shadow-strong overflow-hidden rounded-[36px] px-8 py-10 text-white md:px-12 md:py-14">
            <div className="grid gap-8 lg:grid-cols-[0.88fr_0.72fr] lg:items-end">
              <div>
                <p className="public-kicker text-white/70">Next step</p>
                <h2 className="mt-4 max-w-3xl font-headline text-4xl font-semibold tracking-[-0.05em] md:text-6xl">
                  Ready to bring your strategic plan to life?
                </h2>
              </div>
              <div className="lg:justify-self-end">
                <p className="max-w-xl text-base leading-8 text-white/78">
                  Transparency, trust, and readable progress should be the
                  default surface for a district strategy.
                </p>
                <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                  <a
                    href="mailto:sales@stratadash.org?subject=StrataDash%20demo"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-7 py-4 text-base font-semibold text-primary transition-transform hover:-translate-y-0.5 active:scale-[0.98]"
                  >
                    Book a demo
                    <ArrowRight size={18} weight="bold" />
                  </a>
                  <Link
                    href="/district/westside"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
                  >
                    View live example
                    <ArrowRight size={18} weight="bold" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
