import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle,
  Eye,
  FileText,
  PresentationChart,
  TrendUp,
} from "@phosphor-icons/react/dist/ssr";

/* ─── Data ─── */

const bentoFeatures = [
  {
    title: "Public dashboards",
    description:
      "Publish a living plan instead of sending families to a buried PDF. One URL for the whole district.",
    icon: PresentationChart,
    span: "md:col-span-2",
    bg: "bg-surface-container-low",
  },
  {
    title: "Transparent visualization",
    description:
      "Turn complex academic data into easy-to-read visuals for every stakeholder.",
    icon: Eye,
    span: "",
    bg: "bg-surface-container-highest",
  },
  {
    title: "Board-ready reports",
    description:
      "Status changes visible before board meetings. No more deck rebuilds.",
    icon: FileText,
    span: "",
    bg: "bg-surface-container-highest",
  },
] as const;

const reportingFeatures = [
  {
    title: "Multi-year timelines",
    description:
      "Track goals across election cycles and academic years with seamless data continuity.",
  },
  {
    title: "District-wide KPIs",
    description:
      "Centralize attendance, graduation rates, and budget performance in a single authoritative source.",
  },
] as const;

const districtNames = [
  "WESTSIDE USD",
  "EASTSIDE ISD",
  "LAKESIDE K-12",
  "METRO SCHOOLS",
] as const;

/* ─── Component ─── */

export function V2Landing() {
  return (
    <div className="overflow-hidden">
      {/* ── Section 1: Hero ── */}
      <section className="relative px-8 pt-20 pb-32 overflow-hidden">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-12">
          <div className="z-10 lg:col-span-6">
            <h1 className="font-headline text-6xl font-extrabold leading-[1.1] tracking-tight text-on-surface lg:text-7xl">
              Make your strategic plan{" "}
              <span className="text-primary">visible</span> to your community
            </h1>
            <p className="mt-8 max-w-xl text-xl leading-relaxed text-on-surface-variant">
              StrataDash turns static strategic plans into a hosted district
              surface that stays readable, current, and board-ready as
              leadership updates the work.
            </p>
            <div className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/demo"
                className="hero-gradient inline-flex items-center gap-2 rounded-full px-8 py-4 text-lg font-bold text-white shadow-xl shadow-primary/25 transition-transform hover:scale-[0.98]"
              >
                Request a demo
                <ArrowRight size={18} weight="bold" />
              </Link>
              <Link
                href="/district/westside"
                className="inline-flex items-center gap-2 rounded-full bg-surface-container-highest px-8 py-4 text-lg font-bold text-on-surface transition-colors hover:bg-surface-container-high"
              >
                View example dashboard
              </Link>
            </div>
          </div>

          <div className="relative lg:col-span-6">
            <div className="relative z-10 translate-x-4 rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-4 shadow-2xl lg:translate-x-12 lg:translate-y-8">
              <Image
                src="/images/marketing/hero-dashboard.jpg"
                alt="StrataDash district dashboard showing goals, metrics, and progress charts"
                width={1280}
                height={720}
                className="rounded-lg"
                priority
              />
            </div>
            <div className="absolute -right-12 -top-12 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          </div>
        </div>
      </section>

      {/* ── Section 2: Social Proof Strip ── */}
      <section className="bg-surface-container-low py-12">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-8 px-8 opacity-60 grayscale transition-all duration-700 hover:grayscale-0 md:flex-row">
          <p className="text-sm font-bold uppercase tracking-widest text-outline">
            Trusted by forward-thinking districts
          </p>
          <div className="flex flex-wrap justify-center gap-12 font-headline text-2xl font-extrabold text-on-surface-variant">
            {districtNames.map((name) => (
              <span key={name}>{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Section 3: Bento Feature Grid ── */}
      <section className="py-32 px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-20">
            <h2 className="font-headline text-4xl font-extrabold">
              Built for clarity. Designed for results.
            </h2>
            <p className="mt-4 text-lg text-on-surface-variant">
              Four reasons why StrataDASH is the gold standard for educational
              transparency.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            {bentoFeatures.map((feature) => (
              <div
                key={feature.title}
                className={`${feature.span} ${feature.bg} group rounded-xl p-8 transition-colors hover:bg-surface-container`}
              >
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-white">
                  <feature.icon size={24} weight="bold" />
                </div>
                <h3 className="mb-4 font-headline text-xl font-bold">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-on-surface-variant">
                  {feature.description}
                </p>
              </div>
            ))}

            {/* Full-width admin card */}
            <div className="hero-gradient relative flex flex-col items-center gap-12 overflow-hidden rounded-xl p-12 text-white md:col-span-4 md:flex-row">
              <div className="flex-1">
                <h3 className="mb-6 font-headline text-3xl font-extrabold">
                  Simple for admins
                </h3>
                <p className="mb-8 text-lg leading-relaxed text-primary-fixed/80">
                  Department leads update notes directly in the product, giving
                  cabinet teams a clean weekly summary without chasing
                  spreadsheet edits across multiple owners.
                </p>
                <Link
                  href="/demo"
                  className="inline-flex rounded-full bg-white px-6 py-3 font-bold text-primary"
                >
                  Explore Admin Tools
                </Link>
              </div>
              <div className="-mb-20 -mr-20 hidden flex-1 md:block">
                <Image
                  src="/images/marketing/admin-ui.jpg"
                  alt="Administrative dashboard interface"
                  width={600}
                  height={400}
                  className="rotate-3 rounded-xl shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 4: Reporting Showcase ── */}
      <section className="border-y border-outline-variant/10 bg-surface-container-lowest py-32">
        <div className="mx-auto max-w-7xl px-8">
          <div className="grid grid-cols-1 items-center gap-24 lg:grid-cols-2">
            <div>
              <span className="mb-4 block text-sm font-bold uppercase tracking-widest text-primary">
                Unmatched Reporting
              </span>
              <h2 className="mb-8 font-headline text-5xl font-extrabold leading-tight">
                High-fidelity metrics for every KPI
              </h2>
              <div className="space-y-8">
                {reportingFeatures.map((feature) => (
                  <div key={feature.title} className="flex gap-6">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary/10 text-secondary">
                      <TrendUp size={20} weight="bold" />
                    </div>
                    <div>
                      <h4 className="mb-2 font-headline text-xl font-bold">
                        {feature.title}
                      </h4>
                      <p className="text-on-surface-variant">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-2xl bg-surface-container-low p-6 shadow-xl">
                <Image
                  src="/images/marketing/analytics-charts.jpg"
                  alt="District analytics showing performance trends and resource allocation"
                  width={800}
                  height={500}
                  className="rounded-lg"
                />
              </div>
              <div className="absolute -bottom-10 -left-10 max-w-xs rounded-xl border border-outline-variant/20 bg-white p-6 shadow-2xl">
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20 text-green-600">
                    <CheckCircle size={16} weight="fill" />
                  </div>
                  <span className="text-sm font-bold">Goal Achieved</span>
                </div>
                <p className="text-xs text-on-surface-variant">
                  &ldquo;Graduation rates increased by 4.2% since implementing
                  the 2024 vision plan.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 5: Leadership vs Community ── */}
      <section className="px-8 py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 md:grid-cols-2">
          {/* Leadership card */}
          <div className="flex min-h-[400px] flex-col justify-between rounded-3xl bg-[#1e1b4b] p-12 text-white">
            <div>
              <h3 className="mb-6 font-headline text-3xl font-extrabold">
                For Leadership
              </h3>
              <p className="mb-8 text-lg leading-relaxed text-indigo-100">
                Drive accountability across your departments. Use real-time data
                to make informed staffing and budget decisions that impact
                student learning.
              </p>
            </div>
            <div>
              <ul className="mb-8 space-y-4">
                <li className="flex items-center gap-3">
                  <CheckCircle
                    size={18}
                    weight="fill"
                    className="text-indigo-400"
                  />
                  Internal Performance Monitoring
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle
                    size={18}
                    weight="fill"
                    className="text-indigo-400"
                  />
                  Automated Board Reports
                </li>
              </ul>
              <Link
                href="/demo"
                className="inline-flex rounded-full bg-white px-8 py-3 font-bold text-[#1e1b4b]"
              >
                Solutions for Superintendents
              </Link>
            </div>
          </div>

          {/* Community card */}
          <div className="flex min-h-[400px] flex-col justify-between rounded-3xl bg-surface-container-highest p-12">
            <div>
              <h3 className="mb-6 font-headline text-3xl font-extrabold text-on-surface">
                For Community
              </h3>
              <p className="mb-8 text-lg leading-relaxed text-on-surface-variant">
                Build trust with parents and taxpayers. Show exactly where
                funding is going and how your schools are performing against
                their goals.
              </p>
            </div>
            <div>
              <ul className="mb-8 space-y-4 text-on-surface">
                <li className="flex items-center gap-3">
                  <CheckCircle
                    size={18}
                    weight="fill"
                    className="text-primary"
                  />
                  Public Progress Portals
                </li>
                <li className="flex items-center gap-3">
                  <CheckCircle
                    size={18}
                    weight="fill"
                    className="text-primary"
                  />
                  Mobile-Optimized Viewing
                </li>
              </ul>
              <Link
                href="/demo"
                className="inline-flex rounded-full bg-primary px-8 py-3 font-bold text-white"
              >
                Solutions for Public Relations
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 6: Final CTA Strip ── */}
      <section className="px-8 py-24">
        <div className="hero-gradient relative mx-auto max-w-7xl overflow-hidden rounded-[2.5rem] p-16 text-center text-white">
          <div className="absolute right-0 top-0 h-full w-1/3 translate-x-20 skew-x-12 bg-white/5" />
          <h2 className="relative z-10 mx-auto max-w-3xl font-headline text-4xl font-extrabold lg:text-5xl">
            Ready to visualize your district&apos;s future?
          </h2>
          <div className="relative z-10 mt-8 flex flex-wrap justify-center gap-6">
            <Link
              href="/demo"
              className="inline-flex rounded-full bg-white px-10 py-4 text-lg font-bold text-primary transition-all hover:shadow-2xl"
            >
              Request a demo
            </Link>
            <Link
              href="/demo"
              className="inline-flex rounded-full border-2 border-white/30 px-10 py-4 text-lg font-bold text-white transition-all hover:bg-white/10"
            >
              Chat with an expert
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
