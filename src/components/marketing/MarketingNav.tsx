"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, List } from "@phosphor-icons/react";

const NAV_ITEMS = [
  { label: "Product", href: "/" },
  { label: "Pricing", href: "/pricing" },
  { label: "About", href: "/about" },
  { label: "Sign in", href: "/login" },
] as const;

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MarketingNav() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl shadow-sm">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-8 py-4">
        <div className="flex items-center gap-12">
          <Link
            href="/"
            className="font-headline text-2xl font-extrabold tracking-tighter text-[#1e1b4b]"
          >
            StrataDASH
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            {NAV_ITEMS.map((item) => {
              const active = isActivePath(pathname, item.href);
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`font-headline text-sm font-bold tracking-tight transition-colors ${
                    active
                      ? "border-b-2 border-primary text-primary"
                      : "text-on-surface-variant hover:text-primary"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-full bg-surface-container-highest px-6 py-2.5 font-headline text-sm font-bold text-on-surface transition-all duration-200 hover:scale-95 sm:inline-flex"
          >
            Sign in
          </Link>
          <Link
            href="/demo"
            className="hidden items-center gap-2 rounded-full hero-gradient px-6 py-2.5 font-headline text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all duration-200 hover:scale-95 sm:inline-flex"
          >
            Request a demo
          </Link>

          <details className="relative md:hidden">
            <summary className="cursor-pointer list-none rounded-full bg-surface-container-highest p-2 text-on-surface [&::-webkit-details-marker]:hidden">
              <List size={22} />
            </summary>
            <div className="public-shadow absolute right-0 top-full mt-3 w-64 rounded-2xl bg-white/95 p-3 backdrop-blur-sm">
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
                <Link
                  href="/demo"
                  className="hero-gradient mt-2 inline-flex items-center justify-center gap-2 rounded-xl px-3 py-3 text-sm font-semibold text-white"
                >
                  Request a demo
                  <ArrowRight size={16} weight="bold" />
                </Link>
              </div>
            </div>
          </details>
        </div>
      </nav>
    </header>
  );
}
