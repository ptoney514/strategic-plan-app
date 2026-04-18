import Link from "next/link";

const productLinks = [
  { label: "Features", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "Request a Demo", href: "/demo" },
  { label: "Sign in", href: "/login" },
] as const;

const companyLinks = [
  { label: "About", href: "/about" },
  { label: "District example", href: "/district/westside" },
  {
    label: "Contact sales",
    href: "mailto:sales@stratadash.org?subject=StrataDash%20inquiry",
  },
] as const;

const legalLinks = [
  { label: "Privacy", href: "/privacy" },
  { label: "Terms", href: "/terms" },
] as const;

function FooterLink({ href, label }: { href: string; label: string }) {
  const isExternal = href.startsWith("mailto:") || href.startsWith("http");
  const className =
    "text-sm text-on-surface-variant hover:text-primary transition-colors";
  if (isExternal) {
    return (
      <a href={href} className={className}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

export function MarketingFooter() {
  return (
    <footer className="mt-auto border-t border-outline-variant/30 bg-surface-container-low">
      <div className="mx-auto grid max-w-7xl gap-10 px-8 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <span className="font-headline text-xl font-extrabold tracking-tighter text-[#1e1b4b]">
            StrataDASH
          </span>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-on-surface-variant">
            Empowering school districts with transparency and data-driven
            strategic planning.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="font-headline text-sm font-bold text-on-surface">
            Product
          </h4>
          {productLinks.map((item) => (
            <FooterLink key={item.label} {...item} />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="font-headline text-sm font-bold text-on-surface">
            Company
          </h4>
          {companyLinks.map((item) => (
            <FooterLink key={item.label} {...item} />
          ))}
        </div>

        <div className="flex flex-col gap-3">
          <h4 className="font-headline text-sm font-bold text-on-surface">
            Legal
          </h4>
          {legalLinks.map((item) => (
            <FooterLink key={item.label} {...item} />
          ))}
        </div>
      </div>

      <div className="border-t border-outline-variant/30 px-8 py-6">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 text-sm text-on-surface-variant md:flex-row md:items-center md:justify-between">
          <span>&copy; {new Date().getFullYear()} StrataDASH Inc. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
