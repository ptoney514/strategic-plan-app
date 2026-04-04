"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, List } from "@phosphor-icons/react";

type Variant = "marketing" | "document";

interface MarketingNavProps {
  variant?: Variant;
  onDemoClick?: () => void;
}

const NAV_ITEMS = [
  { label: "Product", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Sign in", href: "/login" },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") {
    return pathname === "/";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MarketingNav({
  variant = "marketing",
  onDemoClick,
}: MarketingNavProps) {
  const pathname = usePathname();
  const isDocument = variant === "document";
  const demoHref = "mailto:sales@stratadash.org?subject=StrataDash%20demo";

  return (
    <header
      className={`sticky top-0 z-50 border-b border-outline-variant/70 bg-background/84 backdrop-blur-xl ${
        isDocument ? "py-3" : "py-4"
      }`}
    >
      <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-6 md:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-outline-variant bg-white/80 text-base font-headline font-semibold text-on-surface">
            S
          </span>
          <span className="font-headline text-[1.05rem] font-semibold tracking-[-0.04em] text-on-surface md:text-[1.15rem]">
            StrataDash
          </span>
        </Link>

        <nav className="hidden items-center gap-1 rounded-full border border-outline-variant/80 bg-white/70 p-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.label}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  active
                    ? "bg-surface text-on-surface public-shadow"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={onDemoClick ? "#" : demoHref}
            onClick={
              onDemoClick
                ? (event) => {
                    event.preventDefault();
                    onDemoClick();
                  }
                : undefined
            }
            className={`hidden items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 active:scale-[0.98] sm:inline-flex ${
              isDocument
                ? "public-button-secondary text-on-surface hover:border-outline-variant"
                : "public-button-primary text-white hover:-translate-y-0.5"
            }`}
          >
            Book a demo
            <ArrowRight size={16} weight="bold" />
          </a>

          <details className="relative md:hidden">
            <summary className="list-none cursor-pointer rounded-full border border-outline-variant/80 bg-white/80 p-2 text-on-surface public-shadow [&::-webkit-details-marker]:hidden">
              <List size={22} />
            </summary>
            <div className="public-shadow absolute right-0 top-full mt-3 w-64 rounded-[24px] border border-outline-variant/80 bg-white/95 p-3 backdrop-blur-sm">
              <div className="flex flex-col gap-1">
                {NAV_ITEMS.map((item) => {
                  const active = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
                <a
                  href={onDemoClick ? "#" : demoHref}
                  onClick={
                    onDemoClick
                      ? (event) => {
                          event.preventDefault();
                          onDemoClick();
                        }
                      : undefined
                  }
                  className="public-button-primary mt-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-white"
                >
                  Book a demo
                  <ArrowRight size={16} weight="bold" />
                </a>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
