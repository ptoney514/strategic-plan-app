import Link from "next/link";
import { ArrowUpRight, ArrowRight } from "@phosphor-icons/react/dist/ssr";

type Variant = "marketing" | "document";

interface MarketingFooterProps {
  variant?: Variant;
}

const productLinks = [
  { label: "Home", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Sign in", href: "/login" },
] as const;

const companyLinks = [
  { label: "District example", href: "/district/westside" },
  {
    label: "Contact sales",
    href: "mailto:sales@stratadash.org?subject=StrataDash%20demo",
  },
  {
    label: "Support",
    href: "mailto:support@stratadash.org?subject=StrataDash%20support",
  },
] as const;

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
  {
    label: "Accessibility",
    href: "mailto:support@stratadash.org?subject=Accessibility%20support",
  },
] as const;

export function MarketingFooter({
  variant = "marketing",
}: MarketingFooterProps) {
  const isDocument = variant === "document";

  return (
    <footer className="mt-auto border-t border-outline-variant/70 bg-surface">
      <div className="mx-auto grid max-w-[1400px] gap-14 px-6 py-16 md:px-10 lg:grid-cols-[1.1fr_0.7fr_0.7fr_0.7fr]">
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-outline-variant bg-white text-lg font-headline font-semibold text-on-surface">
              S
            </span>
            <span className="font-headline text-xl font-semibold tracking-[-0.04em] text-on-surface">
              StrataDash
            </span>
          </div>
          <p className="max-w-sm text-sm leading-7 text-on-surface-variant">
            {isDocument
              ? "Strategic planning software that turns institutional documents into something people can actually read."
              : "A public planning surface for district leaders who are done exporting PDFs every time progress changes."}
          </p>
          <a
            href="mailto:sales@stratadash.org?subject=StrataDash%20demo"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-on-surface"
          >
            Book a demo
            <ArrowRight size={16} weight="bold" />
          </a>
        </div>

        <div className="space-y-4">
          <p className="public-kicker text-on-surface-variant">Product</p>
          <ul className="space-y-3 text-sm">
            {productLinks.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="inline-flex items-center gap-2 text-on-surface-variant transition-colors hover:text-on-surface"
                >
                  {item.label}
                  <ArrowUpRight size={14} />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <p className="public-kicker text-on-surface-variant">Company</p>
          <ul className="space-y-3 text-sm">
            {companyLinks.map((item) =>
              item.href.startsWith("mailto:") ? (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="inline-flex items-center gap-2 text-on-surface-variant transition-colors hover:text-on-surface"
                  >
                    {item.label}
                    <ArrowUpRight size={14} />
                  </a>
                </li>
              ) : (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-2 text-on-surface-variant transition-colors hover:text-on-surface"
                  >
                    {item.label}
                    <ArrowUpRight size={14} />
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="space-y-4">
          <p className="public-kicker text-on-surface-variant">Legal</p>
          <ul className="space-y-3 text-sm">
            {legalLinks.map((item) =>
              item.href.startsWith("mailto:") ? (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="inline-flex items-center gap-2 text-on-surface-variant transition-colors hover:text-on-surface"
                  >
                    {item.label}
                    <ArrowUpRight size={14} />
                  </a>
                </li>
              ) : (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-2 text-on-surface-variant transition-colors hover:text-on-surface"
                  >
                    {item.label}
                    <ArrowUpRight size={14} />
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-outline-variant/70 px-6 py-5 text-center text-xs text-on-surface-variant md:px-10 md:text-left">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} StrataDash.{" "}
            {isDocument
              ? "Structured for clarity."
              : "Strategy updates should feel current, not archived."}
          </p>
          <p className="font-label uppercase tracking-[0.22em] text-on-surface-variant/80">
            Public planning for K-12 leadership
          </p>
        </div>
      </div>
    </footer>
  );
}
