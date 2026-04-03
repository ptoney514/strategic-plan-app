import Link from 'next/link';
import { MaterialIcon } from '@/components/v2/public/MaterialIcon';

type Variant = 'marketing' | 'document';

interface MarketingFooterProps {
  variant?: Variant;
}

const productLinks = [
  { label: 'Home', href: '/' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Sign in', href: '/login' },
] as const;

const companyLinks = [
  { label: 'District example', href: '/district/westside' },
  { label: 'Contact sales', href: 'mailto:sales@stratadash.org?subject=StrataDash%20demo' },
  { label: 'Support', href: 'mailto:support@stratadash.org?subject=StrataDash%20support' },
] as const;

const legalLinks = [
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Accessibility', href: 'mailto:support@stratadash.org?subject=Accessibility%20support' },
] as const;

export function MarketingFooter({ variant = 'marketing' }: MarketingFooterProps) {
  const isDocument = variant === 'document';

  return (
    <footer className="mt-auto border-t border-black/5 bg-surface">
      <div className="mx-auto grid max-w-[1440px] grid-cols-1 gap-12 px-6 py-14 md:grid-cols-4 md:px-12 md:py-16">
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="font-headline text-xl font-black tracking-tighter text-on-surface">
              StrataDash
            </span>
            <span className="rounded-full bg-primary/10 p-1 text-primary">
              <MaterialIcon icon="bolt" size={16} weight={700} />
            </span>
          </div>
          <p className="max-w-xs text-sm leading-relaxed text-on-surface-variant">
            {isDocument
              ? 'Strategic planning software that turns district plans into something people can actually read.'
              : 'Transforming strategic planning for K-12 leadership teams.'}
          </p>
        </div>

        <div className="space-y-4">
          <p className="font-label text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
            Product
          </p>
          <ul className="space-y-3 text-sm">
            {productLinks.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="text-on-surface-variant transition-colors hover:text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          <p className="font-label text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
            Company
          </p>
          <ul className="space-y-3 text-sm">
            {companyLinks.map((item) =>
              item.href.startsWith('mailto:') ? (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-on-surface-variant transition-colors hover:text-primary"
                  >
                    {item.label}
                  </a>
                </li>
              ) : (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-on-surface-variant transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="space-y-4">
          <p className="font-label text-[10px] font-bold uppercase tracking-[0.24em] text-on-surface-variant">
            Legal
          </p>
          <ul className="space-y-3 text-sm">
            {legalLinks.map((item) =>
              item.href.startsWith('mailto:') ? (
                <li key={item.label}>
                  <a
                    href={item.href}
                    className="text-on-surface-variant transition-colors hover:text-primary"
                  >
                    {item.label}
                  </a>
                </li>
              ) : (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-on-surface-variant transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </div>
      </div>

      <div className="border-t border-black/5 px-6 py-4 text-center text-xs text-on-surface-variant md:px-12 md:text-left">
        <div className="mx-auto flex max-w-[1440px] flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <p>
            © {new Date().getFullYear()} StrataDash.{' '}
            {isDocument
              ? 'Strategic planning deserves better than a PDF.'
              : 'Your strategic plan deserves better than a PDF.'}
          </p>
          <p className="font-label uppercase tracking-[0.22em] text-on-surface-variant/80">
            Powered by StrataDash
          </p>
        </div>
      </div>
    </footer>
  );
}
