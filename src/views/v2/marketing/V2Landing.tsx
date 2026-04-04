import Link from "next/link";
import {
  ArrowRight,
  Buildings,
  CheckCircle,
  GlobeHemisphereWest,
  PresentationChart,
  TrendUp,
} from "@phosphor-icons/react/dist/ssr";
import {
  ProductCanvas,
  ProductVideoFrame,
} from "@/components/public-site/ProductCanvas";
import { PublicSectionHeading } from "@/components/public-site/PublicSectionHeading";

const proofItems = [
  {
    icon: Buildings,
    label: "District-branded publishing",
    description:
      "One hosted destination for families, staff, board members, and cabinet leaders.",
  },
  {
    icon: PresentationChart,
    label: "Board-ready status updates",
    description:
      "Keep narratives and KPI visuals current without revising another presentation deck.",
  },
  {
    icon: GlobeHemisphereWest,
    label: "Public-facing by design",
    description:
      "The work stays readable on a phone, in a board packet, and on the district website.",
  },
] as const;

type FeatureRow = {
  eyebrow: string;
  title: string;
  description: string;
  bullets: string[];
  mode: "hero" | "analytics" | "editor";
  reverse?: boolean;
};

const featureRows: FeatureRow[] = [
  {
    eyebrow: "Replace the static file",
    title: "A strategic plan people will actually read.",
    description:
      "Publish a living plan instead of sending families to a buried PDF. The public view stays current as leadership updates notes, statuses, and milestones in place.",
    bullets: [
      "One URL for the whole district plan",
      "Clear hierarchy from plan to objective to KPI",
      "Narrative updates that stay synced with the public view",
    ],
    mode: "hero" as const,
  },
  {
    eyebrow: "Brief the board faster",
    title: "Show what changed this week without rebuilding the deck.",
    description:
      "Department leads can update notes directly in the product, giving cabinet teams a clean weekly summary without chasing spreadsheet edits across multiple owners.",
    bullets: [
      "Narratives and metrics share the same source of truth",
      "Status changes are visible before board meetings",
      "Export only when you want a handout, not because the software demands it",
    ],
    mode: "analytics" as const,
    reverse: true,
  },
  {
    eyebrow: "Operate with less friction",
    title: "Keep ownership clear across central office and campuses.",
    description:
      "Assign responsibility at the right layer, preserve governance, and give each team the exact surface they need to keep progress moving.",
    bullets: [
      "Scoped editing for the people closest to the work",
      "District-level publishing control before updates go public",
      "A cleaner handoff between strategy, operations, and communications",
    ],
    mode: "editor" as const,
  },
] as const;

const workflowSteps = [
  {
    step: "01",
    title: "Bring in the plan you already have",
    description:
      "Start from the spreadsheet, board document, or strategic PDF your team is already maintaining.",
  },
  {
    step: "02",
    title: "Shape a district-ready public surface",
    description:
      "Apply district branding, organize ownership, and decide which pieces are public versus internal.",
  },
  {
    step: "03",
    title: "Update progress in the normal rhythm of the work",
    description:
      "Leadership teams refresh notes and status in product, while the public-facing page stays current automatically.",
  },
] as const;

const faqItems = [
  {
    question: "Can we import from our current spreadsheet?",
    answer:
      "Yes. Most districts begin with an existing spreadsheet or document and map it into the plan hierarchy during onboarding.",
  },
  {
    question: "Do we need a separate public website project?",
    answer:
      "No. StrataDash hosts the public planning surface so the district can link to a single destination without a custom web build.",
  },
  {
    question: "Can some updates stay internal?",
    answer:
      "Yes. Teams can keep sensitive operational notes inside the admin workflow while still publishing a useful public-facing summary.",
  },
  {
    question: "What changes for board reporting?",
    answer:
      "The board gets a cleaner current view of progress, and leadership stops duplicating the same update across PDFs, slides, and disconnected spreadsheets.",
  },
] as const;

export function V2Landing() {
  return (
    <div className="overflow-hidden">
      <section className="relative mx-auto max-w-[1400px] px-6 pb-18 pt-14 md:px-10 md:pb-24 md:pt-18">
        <div className="absolute inset-x-6 top-0 -z-10 h-[420px] rounded-[40px] bg-[radial-gradient(circle_at_top_left,rgba(15,93,134,0.12),transparent_42%),linear-gradient(to_bottom,rgba(255,255,255,0.6),rgba(255,255,255,0))] md:inset-x-10" />
        <div className="grid gap-16 lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)] lg:items-center">
          <div className="max-w-2xl">
            <p className="public-kicker text-primary">
              Public strategic planning for districts
            </p>
            <h1 className="mt-5 font-headline text-5xl font-semibold tracking-[-0.06em] text-on-surface md:text-7xl">
              Publish strategy like a current product, not an archived file.
            </h1>
            <p className="mt-6 max-w-[62ch] text-lg leading-8 text-on-surface-variant md:text-xl">
              StrataDash turns static strategic plans into a hosted district
              surface that stays readable, current, and board-ready as
              leadership updates the work.
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
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                ["Hosted public plan", "One district URL"],
                ["Board cadence", "Current every week"],
                ["Leadership workflow", "Update in place"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="rounded-[24px] border border-outline-variant/70 bg-white/72 px-5 py-4 backdrop-blur-sm"
                >
                  <p className="public-kicker text-on-surface-variant">
                    {label}
                  </p>
                  <p className="mt-2 text-sm font-semibold text-on-surface">
                    {value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <ProductCanvas mode="hero" className="lg:pl-4" />
        </div>
      </section>

      <section className="border-y border-outline-variant/70 bg-white/70">
        <div className="mx-auto grid max-w-[1400px] gap-6 px-6 py-8 md:px-10 lg:grid-cols-[1.1fr_0.95fr_0.95fr]">
          {proofItems.map((item) => (
            <article
              key={item.label}
              className="flex gap-4 rounded-[24px] border border-transparent px-2 py-2 transition-colors hover:border-outline-variant/70"
            >
              <span className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <item.icon size={20} weight="bold" />
              </span>
              <div>
                <h2 className="text-sm font-semibold tracking-[-0.02em] text-on-surface">
                  {item.label}
                </h2>
                <p className="mt-2 text-sm leading-7 text-on-surface-variant">
                  {item.description}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-30">
        <div className="space-y-24">
          {featureRows.map((row) => (
            <div
              key={row.title}
              className={`grid gap-12 lg:grid-cols-[minmax(0,0.76fr)_minmax(0,1.24fr)] lg:items-center ${
                row.reverse
                  ? "lg:[&>div:first-child]:order-2 lg:[&>div:last-child]:order-1"
                  : ""
              }`}
            >
              <div className="max-w-xl">
                <p className="public-kicker text-primary">{row.eyebrow}</p>
                <h2 className="mt-4 font-headline text-4xl font-semibold tracking-[-0.05em] text-on-surface md:text-5xl">
                  {row.title}
                </h2>
                <p className="mt-5 text-base leading-8 text-on-surface-variant md:text-lg">
                  {row.description}
                </p>
                <div className="mt-8 space-y-3">
                  {row.bullets.map((bullet) => (
                    <div
                      key={bullet}
                      className="flex items-start gap-3 rounded-[22px] bg-white/72 px-4 py-4 backdrop-blur-sm"
                    >
                      <CheckCircle
                        size={16}
                        weight="fill"
                        className="mt-1 text-primary"
                      />
                      <span className="text-sm leading-7 text-on-surface">
                        {bullet}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <ProductCanvas mode={row.mode} />
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface-container-low py-24">
        <div className="mx-auto grid max-w-[1400px] gap-14 px-6 md:px-10 lg:grid-cols-[0.72fr_1.28fr] lg:items-center">
          <PublicSectionHeading
            eyebrow="Show the product"
            title="A media system built around the interface itself."
            description="Use product-led motion to explain the workflow, then let the hosted plan do the rest. The visual story stays grounded in the actual interface rather than generic marketing art."
          />
          <ProductVideoFrame
            label="Live walkthrough"
            title="See how the public dashboard moves"
            description="Hosted product reel"
          />
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-24 md:px-10 md:py-30">
        <div className="grid gap-14 lg:grid-cols-[0.68fr_1.32fr]">
          <PublicSectionHeading
            eyebrow="How teams go live"
            title="A rollout sequence that fits district reality."
            description="The first release should feel manageable for central office teams, not like a website redesign project."
          />

          <div className="space-y-5">
            {workflowSteps.map((step) => (
              <article
                key={step.step}
                className="grid gap-4 rounded-[28px] border border-outline-variant/70 bg-white/82 p-6 backdrop-blur-sm md:grid-cols-[84px_minmax(0,1fr)] md:items-start md:p-7"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 font-label text-sm font-semibold tracking-[0.24em] text-primary">
                  {step.step}
                </div>
                <div>
                  <h3 className="text-xl font-semibold tracking-[-0.03em] text-on-surface">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-on-surface-variant">
                    {step.description}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-24 md:px-10">
        <div className="grid gap-16 lg:grid-cols-[0.8fr_1.2fr]">
          <PublicSectionHeading
            eyebrow="FAQ"
            title="Questions districts ask before switching."
            description="The operational details matter. These are the questions that usually come up before a district replaces the PDF workflow."
          />
          <div className="space-y-4">
            {faqItems.map((item) => (
              <details
                key={item.question}
                className="group rounded-[28px] border border-outline-variant/70 bg-white/84 px-6 py-6 backdrop-blur-sm"
              >
                <summary className="cursor-pointer list-none text-lg font-semibold tracking-[-0.03em] text-on-surface [&::-webkit-details-marker]:hidden">
                  {item.question}
                </summary>
                <p className="mt-4 max-w-[65ch] text-sm leading-7 text-on-surface-variant">
                  {item.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 pb-24 md:px-10">
        <div className="public-gradient public-shadow-strong overflow-hidden rounded-[36px] px-8 py-10 text-white md:px-12 md:py-14">
          <div className="grid gap-8 lg:grid-cols-[0.88fr_0.72fr] lg:items-end">
            <div>
              <p className="public-kicker text-white/70">Next step</p>
              <h2 className="mt-4 max-w-3xl font-headline text-4xl font-semibold tracking-[-0.05em] md:text-6xl">
                Make the public-facing plan the easiest place to understand
                district progress.
              </h2>
            </div>
            <div className="lg:justify-self-end">
              <p className="max-w-xl text-base leading-8 text-white/78">
                StrataDash gives leadership teams a cleaner publishing surface,
                a better weekly update rhythm, and one current link to share
                with the community.
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
                  href="/pricing"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Explore pricing
                  <TrendUp size={18} weight="bold" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
