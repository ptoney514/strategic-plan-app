'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MaterialIcon } from '@/components/v2/public/MaterialIcon';

type Variant = 'marketing' | 'document';

interface MarketingNavProps {
  variant?: Variant;
  onDemoClick?: () => void;
}

const NAV_ITEMS = [
  { label: 'Product', href: '/' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'About', href: '/about' },
  { label: 'Sign in', href: '/login' },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === '/') {
    return pathname === '/';
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MarketingNav({ variant = 'marketing', onDemoClick }: MarketingNavProps) {
  const pathname = usePathname();
  const isDocument = variant === 'document';
  const demoHref = 'mailto:sales@stratadash.org?subject=StrataDash%20demo';

  const navLinkClass = isDocument
    ? 'text-sm font-medium text-on-surface-variant transition-colors hover:text-primary'
    : 'text-sm font-medium text-on-surface-variant transition-colors hover:text-on-surface';

  const activeNavLinkClass = isDocument
    ? 'text-primary font-semibold'
    : 'text-on-surface font-semibold';

  const demoButtonClass = isDocument
    ? 'rounded-full border border-outline-variant bg-surface px-5 py-2.5 text-sm font-bold text-on-surface transition-all duration-200 hover:-translate-y-0.5 hover:border-outline hover:bg-surface-container-low'
    : 'rounded-full bg-primary px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_30px_rgba(15,70,113,0.18)]';

  return (
    <header
      className={`sticky top-0 z-50 border-b border-black/5 bg-background/92 backdrop-blur-xl ${
        isDocument ? 'py-3' : 'py-4'
      }`}
    >
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-6 md:px-12">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-headline text-[1.05rem] font-black tracking-tighter text-on-surface md:text-[1.15rem]">
            StrataDash
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`${navLinkClass} ${active ? activeNavLinkClass : ''}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={onDemoClick ? '#' : demoHref}
            onClick={
              onDemoClick
                ? (event) => {
                    event.preventDefault();
                    onDemoClick();
                  }
                : undefined
            }
            className={`${demoButtonClass} hidden sm:inline-flex`}
          >
            Book a demo
          </a>

          <details className="relative md:hidden">
            <summary className="list-none cursor-pointer rounded-full border border-outline-variant bg-surface p-2 text-on-surface shadow-sm transition-colors hover:bg-surface-container-low [&::-webkit-details-marker]:hidden">
                <MaterialIcon icon="menu" size={22} />
              </summary>
            <div className="absolute right-0 top-full mt-3 w-64 rounded-2xl border border-outline-variant/60 bg-surface p-3 shadow-[0_24px_48px_rgba(23,26,31,0.12)]">
              <div className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                  const active = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? 'bg-primary/10 text-primary'
                          : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <a
                  href={onDemoClick ? '#' : demoHref}
                  onClick={
                    onDemoClick
                      ? (event) => {
                          event.preventDefault();
                          onDemoClick();
                        }
                      : undefined
                  }
                  className="mt-2 inline-flex items-center justify-center rounded-xl bg-primary px-3 py-2 text-sm font-bold text-white"
                >
                  Book a demo
                </a>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
