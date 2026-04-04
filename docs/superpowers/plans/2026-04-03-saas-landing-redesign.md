# SaaS Landing Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the StrataDash marketing home page with Stitch-inspired visuals and add a `/demo` request form page.

**Architecture:** Rewrite V2Landing.tsx in place with 7 new sections. Add a new `/demo` route with a form that submits to the existing `POST /api/contact` endpoint and sends a Resend notification. Update the public theme colors from teal to indigo to match the Stitch design system.

**Tech Stack:** React 19, Next.js 16, Tailwind CSS 4, Phosphor Icons, Resend, existing Drizzle ORM contact schema

**Spec:** `docs/superpowers/specs/2026-04-03-saas-landing-redesign.md`

---

## File Structure

| File                                                  | Action                  | Responsibility                                                           |
| ----------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------ |
| `src/app/(root)/layout.tsx`                           | Modify                  | Update publicTheme colors + font imports to match Stitch                 |
| `src/app/globals.css`                                 | Modify                  | Update public-\* utility classes for indigo palette + add ambient-shadow |
| `public/images/marketing/`                            | Create (dir + 4 images) | Stitch placeholder screenshots                                           |
| `src/views/v2/marketing/V2Landing.tsx`                | Rewrite                 | 7 new home page sections                                                 |
| `src/views/v2/marketing/__tests__/V2Landing.test.tsx` | Rewrite                 | Tests for new section structure                                          |
| `src/components/marketing/MarketingNav.tsx`           | Modify                  | Wordmark, updated links, gradient CTA                                    |
| `src/components/marketing/MarketingFooter.tsx`        | Modify                  | Match Stitch footer structure                                            |
| `src/views/v2/marketing/DemoPage.tsx`                 | Create                  | Demo request form page component                                         |
| `src/views/v2/marketing/__tests__/DemoPage.test.tsx`  | Create                  | Tests for demo page                                                      |
| `src/app/(root)/demo/page.tsx`                        | Create                  | Next.js route for /demo                                                  |
| `_api/lib/email-templates.ts`                         | Modify                  | Add demo request notification template                                   |
| `src/app/api/contact/route.ts`                        | Modify                  | Add Resend notification for demo_request topic                           |
| `src/components/public-site/ProductCanvas.tsx`        | Delete                  | Replaced by screenshots                                                  |
| `src/components/public-site/PublicSectionHeading.tsx` | Delete                  | No longer imported                                                       |

---

### Task 1: Download Stitch placeholder images

**Files:**

- Create: `public/images/marketing/hero-dashboard.jpg`
- Create: `public/images/marketing/admin-ui.jpg`
- Create: `public/images/marketing/analytics-charts.jpg`
- Create: `public/images/marketing/dark-dashboard.jpg`

- [ ] **Step 1: Create directory and download images**

```bash
mkdir -p public/images/marketing

curl -L -o public/images/marketing/hero-dashboard.jpg \
  "https://lh3.googleusercontent.com/aida-public/AB6AXuAH-f7O09UOLxGJ26e_JsgE_k3L9bGWyMFWVIwF_r_SU4NEdj-zzpVcTLzVBj3iSQqibilG7qSirqvHoWwSFZKe-6QJ9bKKsy36ZN15AigMyaOaGAn2Sq0NrQoLrAMK54jhDAh-zMYPiuqDE7UIY0NDOOwqvzTfo8-AfS2qLBH3CKb3WduglBihcH1ItcTLE3bgkOG0O36oIpRNgepsrjrwkgPscS3pPk9BeLvZuQgvbBDLzc7jyxro_F_1wDANxCajRlzg4lKw_lZa"

curl -L -o public/images/marketing/admin-ui.jpg \
  "https://lh3.googleusercontent.com/aida-public/AB6AXuDusiXhrC8BMfMBObkAMMRa8t9u4ElNH4uCgOcBN2EzJrvFq23moVw8lUsrboSoXkHbDTAf8kG_gpYh3XTinQEnSBPWaDvJP-JD_ueIznv9U2Wr2bo6FxXFHOn-puKlXPo8dsuQUZXJz_YyfXd_Gi36tymgPxCnjidNttUFv4Pbzd2xycn7j3zZnb6B3LpZQrqzPx25n4Vo7d0puAHTsjJTs3UzctOgpVsKcQtbpRnPHtut3-ZKrbSZHHR_UITkDoBWlg2ADKYMUp68"

curl -L -o public/images/marketing/analytics-charts.jpg \
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA0z7BMMq-I4rifYfe6lyuXycQ9gE3tpJIOwnmQopk-GzSiwfo4wWFJ58dAbr--RoSHiC-xuzWUDhGqto0LKS2C7zrYmNNJEORCocq7wSopy4tv43DMIN3BQXUZkpWibQWrSQ8Wa8XOB9PKcOQ6vMloYzXlHH5Xc-8L9DgA0V_jAKWvx_Ya2JkwmtrRyqHkPjpHkbVTMa1OAXRBQfTTj2T9VjcCNc17XCfFvVUQOmq3fAiedSuNHFZJCVqUOs0hZEOr0D5o2dDW4tG4"

curl -L -o public/images/marketing/dark-dashboard.jpg \
  "https://lh3.googleusercontent.com/aida-public/AB6AXuBmCwMBQ0gi4gq59jhUT9lMkjUt0RmcfQnW09x8jPXse4f0Wssrepeg7FhKR0-_b2d8dNfLbmik2NZRIcpqDcCKpMj74UQRR3mTakefyWQ7T_ZbCoGnn05Tj8GkPj0KuLYLkJqEWd2lHXqdrqjgGbLqe39EIEJvkAI6nOaMcUKetct31VwFfIuKM2Xpp5cgbNWpAu2yHRnOH9OJWzeKinkNGHlrT9kGOBn1dqTLyPWQHE95fUX2sjGbSP5RascSun_rsSr5vRTkAg35"
```

- [ ] **Step 2: Verify all images downloaded**

Run: `ls -la public/images/marketing/`
Expected: 4 files, each > 10KB

- [ ] **Step 3: Commit**

```bash
git add public/images/marketing/
git commit -m "chore: add Stitch placeholder marketing images"
```

---

### Task 2: Update public theme to Stitch indigo palette

**Files:**

- Modify: `src/app/(root)/layout.tsx` — lines 9-80 (font imports + publicTheme object)
- Modify: `src/app/globals.css` — lines 440-486 (public-\* utility classes)

- [ ] **Step 1: Update font imports and publicTheme in layout.tsx**

In `src/app/(root)/layout.tsx`, replace the font imports and `publicTheme` object. The key changes:

- Headline font: Outfit → Manrope (with extrabold 800 weight)
- Body font: Manrope → Inter
- Label font: Space_Grotesk stays (already used for kickers)
- Primary: #0f5d86 (teal) → #1100ac (deep indigo)
- Primary container: → #2419df (cobalt)
- Surface colors: green-tinted → violet-tinted to match Stitch

Replace the entire file content with:

```tsx
import type { CSSProperties, ReactNode } from "react";
import {
  Inter,
  JetBrains_Mono,
  Manrope,
  Space_Grotesk,
} from "next/font/google";

const headline = Manrope({
  subsets: ["latin"],
  variable: "--font-public-headline",
  weight: ["600", "700", "800"],
  display: "swap",
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-public-body",
  weight: ["400", "500", "600"],
  display: "swap",
});

const label = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-public-label",
  weight: ["500", "700"],
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-public-mono",
  weight: ["500", "700"],
  display: "swap",
});

const publicTheme = {
  "--color-background": "#faf9fe",
  "--color-foreground": "#1a1b1f",
  "--color-card": "#ffffff",
  "--color-card-foreground": "#1a1b1f",
  "--color-primary": "#1100ac",
  "--color-primary-foreground": "#ffffff",
  "--color-primary-container": "#2419df",
  "--color-on-primary-container": "#adafff",
  "--color-primary-fixed": "#e1e0ff",
  "--color-primary-fixed-dim": "#c0c1ff",
  "--color-secondary": "#4d41de",
  "--color-secondary-foreground": "#ffffff",
  "--color-secondary-container": "#665ef8",
  "--color-on-secondary-container": "#fffbff",
  "--color-secondary-fixed": "#e3dfff",
  "--color-secondary-fixed-dim": "#c3c0ff",
  "--color-tertiary": "#303135",
  "--color-tertiary-foreground": "#ffffff",
  "--color-tertiary-container": "#46474b",
  "--color-on-tertiary-container": "#b6b6ba",
  "--color-tertiary-fixed": "#e3e2e7",
  "--color-tertiary-fixed-dim": "#c6c6cb",
  "--color-on-tertiary-fixed": "#1a1b1f",
  "--color-on-tertiary-fixed-variant": "#46474b",
  "--color-error": "#ba1a1a",
  "--color-on-error": "#ffffff",
  "--color-error-container": "#ffdad6",
  "--color-on-error-container": "#93000a",
  "--color-surface": "#faf9fe",
  "--color-on-surface": "#1a1b1f",
  "--color-on-surface-variant": "#454556",
  "--color-surface-container-lowest": "#ffffff",
  "--color-surface-container-low": "#f4f3f8",
  "--color-surface-container": "#eeedf2",
  "--color-surface-container-high": "#e8e7ec",
  "--color-surface-container-highest": "#e3e2e7",
  "--color-outline": "#767588",
  "--color-outline-variant": "#c6c4d9",
  "--color-inverse-surface": "#2f3034",
  "--color-inverse-on-surface": "#f1f0f5",
  "--color-inverse-primary": "#c0c1ff",
  "--color-surface-tint": "#413ff4",
  "--color-muted": "#eeedf2",
  "--color-muted-foreground": "#767588",
  "--color-border": "#c6c4d9",
  "--color-input": "#c6c4d9",
  "--color-ring": "#1100ac",
} as CSSProperties & Record<string, string>;

export default function RootGroupLayout({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${headline.variable} ${body.variable} ${label.variable} ${mono.variable} min-h-screen bg-background text-foreground antialiased`}
      style={publicTheme}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 2: Update public-\* CSS utilities in globals.css**

In `src/app/globals.css`, replace the public utility block (lines ~440-486) with Stitch-matched versions. Replace:

```css
@utility public-shadow {
  box-shadow:
    0 1px 1px rgba(15, 23, 34, 0.04),
    0 16px 40px rgba(15, 93, 134, 0.08);
}

@utility public-shadow-strong {
  box-shadow:
    0 1px 1px rgba(15, 23, 34, 0.05),
    0 24px 64px rgba(15, 93, 134, 0.12);
}

@utility public-panel {
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(213, 221, 227, 0.9);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.65),
    0 14px 36px rgba(15, 93, 134, 0.08);
  backdrop-filter: blur(16px);
}

@utility public-gradient {
  background-image: linear-gradient(135deg, #0f5d86 0%, #1775a3 100%);
}

@utility public-kicker {
  font-family: var(--font-public-label);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  line-height: 1;
  text-transform: uppercase;
}

@utility public-button-primary {
  background-image: linear-gradient(135deg, #0f5d86 0%, #1775a3 100%);
  box-shadow: 0 18px 40px rgba(15, 93, 134, 0.18);
}

@utility public-button-secondary {
  background: rgba(255, 255, 255, 0.82);
  border: 1px solid rgba(147, 161, 175, 0.22);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.72),
    0 10px 30px rgba(15, 23, 34, 0.06);
  backdrop-filter: blur(16px);
}
```

With:

```css
@utility public-shadow {
  box-shadow:
    0 4px 6px -1px rgba(17, 0, 172, 0.04),
    0 20px 40px -10px rgba(26, 27, 31, 0.08);
}

@utility public-shadow-strong {
  box-shadow:
    0 4px 6px -1px rgba(17, 0, 172, 0.06),
    0 24px 64px -12px rgba(26, 27, 31, 0.12);
}

@utility public-panel {
  background: rgba(255, 255, 255, 0.92);
  box-shadow:
    0 4px 6px -1px rgba(17, 0, 172, 0.04),
    0 20px 40px -10px rgba(26, 27, 31, 0.08);
  backdrop-filter: blur(16px);
}

@utility public-gradient {
  background-image: linear-gradient(135deg, #1100ac 0%, #2419df 100%);
}

@utility public-kicker {
  font-family: var(--font-public-label);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.24em;
  line-height: 1;
  text-transform: uppercase;
}

@utility public-button-primary {
  background-image: linear-gradient(135deg, #1100ac 0%, #2419df 100%);
  box-shadow: 0 8px 24px rgba(17, 0, 172, 0.25);
}

@utility public-button-secondary {
  background: var(--color-surface-container-highest);
}

@utility hero-gradient {
  background: linear-gradient(135deg, #1100ac 0%, #2419df 100%);
}

@utility ambient-shadow {
  box-shadow:
    0 4px 6px -1px rgba(17, 0, 172, 0.04),
    0 20px 40px -10px rgba(26, 27, 31, 0.08);
}
```

- [ ] **Step 3: Verify the build compiles**

Run: `npx next build --webpack 2>&1 | tail -20`
Expected: Build succeeds (CSS utilities resolve, fonts load)

- [ ] **Step 4: Commit**

```bash
git add src/app/\(root\)/layout.tsx src/app/globals.css
git commit -m "feat: update public theme to Stitch indigo palette"
```

---

### Task 3: Update MarketingNav

**Files:**

- Modify: `src/components/marketing/MarketingNav.tsx`

- [ ] **Step 1: Rewrite MarketingNav.tsx**

Replace the entire file content. Key changes:

- Wordmark "StrataDASH" instead of "S" icon box
- Nav items: Product (/), Solutions (#), Resources (#), Pricing (/pricing) — keep "Sign in" as before
- "Request a demo" links to `/demo` instead of mailto
- Gradient CTA with `shadow-xl shadow-primary/25`
- Font-extrabold on wordmark

```tsx
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
```

- [ ] **Step 2: Verify it renders**

Run: `npx next build --webpack 2>&1 | tail -5`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/MarketingNav.tsx
git commit -m "feat: update MarketingNav with Stitch wordmark and indigo CTAs"
```

---

### Task 4: Update MarketingFooter

**Files:**

- Modify: `src/components/marketing/MarketingFooter.tsx`

- [ ] **Step 1: Rewrite MarketingFooter.tsx**

Simplify and align with Stitch footer structure. Key changes:

- "StrataDASH" wordmark instead of "S" icon
- Updated link lists
- Remove `variant` prop (no longer needed)
- Cleaner layout

```tsx
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
          <span>
            &copy; {new Date().getFullYear()} StrataDASH Inc. All rights
            reserved.
          </span>
        </div>
      </div>
    </footer>
  );
}
```

- [ ] **Step 2: Fix any imports of MarketingFooter that use the `variant` prop**

Search for `variant` usage:

Run: `grep -rn 'MarketingFooter.*variant\|variant.*MarketingFooter' src/`

If found in files like `PublicDocumentShell.tsx` or other layouts, remove the `variant` prop from the call site.

- [ ] **Step 3: Commit**

```bash
git add src/components/marketing/MarketingFooter.tsx
git commit -m "feat: update MarketingFooter with Stitch design"
```

---

### Task 5: Rewrite V2Landing — Home Page

**Files:**

- Rewrite: `src/views/v2/marketing/V2Landing.tsx`

This is the largest task. The component has 7 sections. The full code follows.

- [ ] **Step 1: Rewrite V2Landing.tsx**

Replace the entire file content with the following. This implements all 7 sections from the spec: Hero, Social Proof, Bento Features, Reporting Showcase, Leadership vs Community, and Final CTA.

```tsx
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle,
  Eye,
  FileText,
  GearSix,
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
```

- [ ] **Step 2: Verify build succeeds**

Run: `npx next build --webpack 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add src/views/v2/marketing/V2Landing.tsx
git commit -m "feat: rewrite V2Landing with Stitch-inspired design"
```

---

### Task 6: Update V2Landing tests

**Files:**

- Rewrite: `src/views/v2/marketing/__tests__/V2Landing.test.tsx`

- [ ] **Step 1: Rewrite tests for new section structure**

Replace the test file to match the new V2Landing sections:

```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@/test/setup";
import { V2Landing } from "../V2Landing";

describe("V2Landing", () => {
  it("renders the hero heading", () => {
    render(<V2Landing />);
    expect(
      screen.getByRole("heading", {
        name: /make your strategic plan visible to your community/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders hero description", () => {
    render(<V2Landing />);
    expect(
      screen.getByText(
        /turns static strategic plans into a hosted district surface/i,
      ),
    ).toBeInTheDocument();
  });

  it("renders Request a demo CTA linking to /demo", () => {
    render(<V2Landing />);
    const demoLinks = screen
      .getAllByText("Request a demo")
      .map((node) => node.closest("a"))
      .filter((link) => link?.getAttribute("href") === "/demo");
    expect(demoLinks.length).toBeGreaterThan(0);
  });

  it("renders View example dashboard link", () => {
    render(<V2Landing />);
    const link = screen.getByText("View example dashboard");
    expect(link).toBeInTheDocument();
    expect(link.closest("a")).toHaveAttribute("href", "/district/westside");
  });

  it("renders bento feature section", () => {
    render(<V2Landing />);
    expect(
      screen.getByText("Built for clarity. Designed for results."),
    ).toBeInTheDocument();
    expect(screen.getByText("Public dashboards")).toBeInTheDocument();
    expect(screen.getByText("Simple for admins")).toBeInTheDocument();
  });

  it("renders reporting showcase section", () => {
    render(<V2Landing />);
    expect(
      screen.getByText("High-fidelity metrics for every KPI"),
    ).toBeInTheDocument();
  });

  it("renders leadership vs community cards", () => {
    render(<V2Landing />);
    expect(screen.getByText("For Leadership")).toBeInTheDocument();
    expect(screen.getByText("For Community")).toBeInTheDocument();
  });

  it("renders final CTA section", () => {
    render(<V2Landing />);
    expect(
      screen.getByRole("heading", {
        name: /ready to visualize your district's future/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders social proof strip", () => {
    render(<V2Landing />);
    expect(
      screen.getByText("Trusted by forward-thinking districts"),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/views/v2/marketing/__tests__/V2Landing.test.tsx`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add src/views/v2/marketing/__tests__/V2Landing.test.tsx
git commit -m "test: update V2Landing tests for new Stitch design"
```

---

### Task 7: Create Demo Request Page

**Files:**

- Create: `src/views/v2/marketing/DemoPage.tsx`
- Create: `src/app/(root)/demo/page.tsx`

- [ ] **Step 1: Create DemoPage.tsx**

Create the demo request form page with: value props on left, form on right, product preview, relocated how-it-works and FAQ sections.

```tsx
"use client";

import { useState, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  CheckCircle,
  Notepad,
  ShieldCheck,
  Wrench,
} from "@phosphor-icons/react";
import { apiPost } from "@/lib/api";

const valueProps = [
  {
    icon: Notepad,
    title: "Personalized walkthrough",
    description:
      "Tailored to your district size, planning structure, and board reporting cadence.",
  },
  {
    icon: Wrench,
    title: "Implementation consultation",
    description:
      "Direct access to discuss timelines, import from your current spreadsheet, and district branding setup.",
  },
  {
    icon: ShieldCheck,
    title: "Procurement readiness",
    description:
      "Review security protocols, data hosting, and pricing aligned to district budget cycles.",
  },
] as const;

const roleOptions = [
  "Superintendent",
  "Chief Academic Officer",
  "Chief Technology Officer",
  "Director",
  "Board Member",
  "Communications / PR",
  "Other",
] as const;

const workflowSteps = [
  {
    step: "1",
    title: "Bring in the plan",
    description:
      "Start from the spreadsheet or board document you already have.",
  },
  {
    step: "2",
    title: "Shape the public surface",
    description:
      "Apply branding, organize ownership, decide public vs. internal.",
  },
  {
    step: "3",
    title: "Update in your rhythm",
    description:
      "Leadership refreshes notes; the public page stays current automatically.",
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

type FormState = "idle" | "submitting" | "success" | "error";

export function DemoPage() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("submitting");
    setErrorMessage("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const fullName = (data.get("fullName") as string).trim();
    const email = (data.get("email") as string).trim();
    const organization = (data.get("organization") as string).trim();
    const role = data.get("role") as string;
    const message = (data.get("message") as string).trim();

    const spaceIdx = fullName.indexOf(" ");
    const firstName = spaceIdx > -1 ? fullName.slice(0, spaceIdx) : fullName;
    const lastName = spaceIdx > -1 ? fullName.slice(spaceIdx + 1) : "";

    try {
      await apiPost("/contact", {
        email,
        first_name: firstName,
        last_name: lastName,
        organization,
        topic: "demo_request",
        message: message
          ? `${message}\n\nRole: ${role}`
          : `Demo request\n\nRole: ${role}`,
      });
      setFormState("success");
    } catch (err) {
      setFormState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong",
      );
    }
  }

  return (
    <div className="overflow-hidden">
      {/* ── Hero + Form ── */}
      <section className="mx-auto max-w-7xl px-8 pb-20 pt-32">
        <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-12">
          {/* Left: Value props */}
          <div className="space-y-12 lg:col-span-5">
            <div className="space-y-6">
              <h1 className="font-headline text-5xl font-extrabold leading-[1.1] tracking-tight text-on-surface">
                Experience the <span className="text-primary">Future</span> of
                Data Governance.
              </h1>
              <p className="text-lg leading-relaxed text-on-surface-variant">
                See how StrataDASH transforms your strategic plan into a
                unified, public-facing surface that stays current as leadership
                updates the work.
              </p>
            </div>

            <div className="space-y-10">
              {valueProps.map((prop) => (
                <div key={prop.title} className="group flex gap-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-surface-container-high text-primary transition-colors group-hover:bg-primary-fixed">
                    <prop.icon size={28} weight="bold" />
                  </div>
                  <div>
                    <h3 className="mb-2 font-headline text-xl font-bold text-on-surface">
                      {prop.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-on-surface-variant">
                      {prop.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Form */}
          <div className="lg:col-span-7">
            <div className="ambient-shadow rounded-xl bg-surface-container-lowest p-10">
              {formState === "success" ? (
                <div className="flex flex-col items-center gap-4 py-12 text-center">
                  <CheckCircle
                    size={48}
                    weight="fill"
                    className="text-green-600"
                  />
                  <h3 className="font-headline text-2xl font-bold text-on-surface">
                    Thanks for reaching out!
                  </h3>
                  <p className="max-w-md text-on-surface-variant">
                    We&apos;ll reach out within one business day to schedule
                    your walkthrough.
                  </p>
                  <Link
                    href="/"
                    className="mt-4 text-sm font-semibold text-primary hover:underline"
                  >
                    Back to home
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="ml-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Full Name
                      </label>
                      <input
                        name="fullName"
                        type="text"
                        required
                        placeholder="Jane Smith"
                        className="w-full rounded-lg border-none bg-surface-container-low p-4 text-on-surface placeholder:text-outline transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="ml-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Work Email
                      </label>
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="jane@district.org"
                        className="w-full rounded-lg border-none bg-surface-container-low p-4 text-on-surface placeholder:text-outline transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="ml-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        District / Organization
                      </label>
                      <input
                        name="organization"
                        type="text"
                        placeholder="Metro District 12"
                        className="w-full rounded-lg border-none bg-surface-container-low p-4 text-on-surface placeholder:text-outline transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="ml-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                        Your Role
                      </label>
                      <select
                        name="role"
                        required
                        className="w-full rounded-lg border-none bg-surface-container-low p-4 text-on-surface transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40"
                      >
                        <option value="">Select your role</option>
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="ml-1 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                      What are you hoping to solve?
                    </label>
                    <textarea
                      name="message"
                      rows={4}
                      placeholder="Briefly describe your current planning challenges..."
                      className="w-full rounded-lg border-none bg-surface-container-low p-4 text-on-surface placeholder:text-outline transition-all focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/40"
                    />
                  </div>

                  {formState === "error" && (
                    <p className="text-sm text-error">{errorMessage}</p>
                  )}

                  <button
                    type="submit"
                    disabled={formState === "submitting"}
                    className="hero-gradient w-full rounded-full py-5 font-headline text-lg font-extrabold text-white shadow-xl shadow-primary/20 transition-transform hover:scale-[0.98] disabled:opacity-60"
                  >
                    {formState === "submitting"
                      ? "Submitting..."
                      : "Submit Request"}
                  </button>

                  <p className="text-center text-xs text-on-surface-variant">
                    By submitting, you agree to our{" "}
                    <Link href="/privacy" className="underline">
                      Privacy Policy
                    </Link>{" "}
                    and{" "}
                    <Link href="/terms" className="underline">
                      Terms of Service
                    </Link>
                    .
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Product Preview ── */}
      <section className="mx-auto max-w-7xl px-8 pb-20">
        <div className="group relative">
          <div className="absolute -inset-4 rounded-xl bg-primary/5 blur-2xl transition-colors group-hover:bg-primary/10" />
          <div className="ambient-shadow relative overflow-hidden rounded-xl border border-white/50 bg-surface-container-high">
            <Image
              src="/images/marketing/dark-dashboard.jpg"
              alt="StrataDash platform dashboard"
              width={1280}
              height={600}
              className="h-auto w-full"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
          </div>
          <div className="ambient-shadow absolute -bottom-6 -right-6 hidden items-center gap-3 rounded-xl bg-white p-4 md:flex">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <CheckCircle size={20} weight="fill" />
            </div>
            <div className="pr-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                Live System Status
              </p>
              <p className="font-headline text-sm font-bold">
                99.9% Uptime Verified
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── How Teams Go Live ── */}
      <section className="bg-surface-container-low py-24 px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="font-headline text-4xl font-extrabold">
              How teams go live
            </h2>
            <p className="mt-4 text-lg text-on-surface-variant">
              A rollout sequence that fits district reality.
            </p>
          </div>

          <div className="relative grid grid-cols-1 gap-16 md:grid-cols-3">
            <div className="absolute left-0 top-10 z-0 hidden h-0.5 w-full bg-outline-variant/30 md:block" />
            {workflowSteps.map((step) => (
              <div key={step.step} className="relative z-10 text-center">
                <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-full border-4 border-surface bg-surface-container-lowest text-3xl font-extrabold text-primary shadow-xl">
                  {step.step}
                </div>
                <h3 className="mb-4 font-headline text-2xl font-bold">
                  {step.title}
                </h3>
                <p className="text-on-surface-variant">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="px-8 py-24">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-12 font-headline text-4xl font-extrabold">
            Questions districts ask before switching
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {faqItems.map((item) => (
              <div
                key={item.question}
                className="rounded-xl bg-surface-container-lowest p-6 ambient-shadow"
              >
                <h3 className="font-headline text-lg font-bold text-on-surface">
                  {item.question}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-on-surface-variant">
                  {item.answer}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Create the route file**

Create `src/app/(root)/demo/page.tsx`:

```tsx
"use client";
import dynamic from "next/dynamic";
import { V2MarketingLayout } from "@/components/v2/layout/V2MarketingLayout";

const DemoPage = dynamic(
  () =>
    import("@/views/v2/marketing/DemoPage").then((m) => ({
      default: m.DemoPage,
    })),
  { ssr: false },
);

export default function Page() {
  return (
    <V2MarketingLayout>
      <DemoPage />
    </V2MarketingLayout>
  );
}
```

- [ ] **Step 3: Verify build succeeds**

Run: `npx next build --webpack 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add src/views/v2/marketing/DemoPage.tsx src/app/\(root\)/demo/page.tsx
git commit -m "feat: add /demo request page with form and Stitch design"
```

---

### Task 8: Write DemoPage tests

**Files:**

- Create: `src/views/v2/marketing/__tests__/DemoPage.test.tsx`

- [ ] **Step 1: Write tests**

```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/setup";
import userEvent from "@testing-library/user-event";
import { DemoPage } from "../DemoPage";

// Mock apiPost
vi.mock("@/lib/api", () => ({
  apiPost: vi.fn().mockResolvedValue({ id: "test-id" }),
}));

describe("DemoPage", () => {
  it("renders the page heading", () => {
    render(<DemoPage />);
    expect(
      screen.getByRole("heading", {
        name: /experience the future of data governance/i,
      }),
    ).toBeInTheDocument();
  });

  it("renders value propositions", () => {
    render(<DemoPage />);
    expect(screen.getByText("Personalized walkthrough")).toBeInTheDocument();
    expect(screen.getByText("Implementation consultation")).toBeInTheDocument();
    expect(screen.getByText("Procurement readiness")).toBeInTheDocument();
  });

  it("renders the demo form", () => {
    render(<DemoPage />);
    expect(screen.getByPlaceholderText("Jane Smith")).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText("jane@district.org"),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /submit request/i }),
    ).toBeInTheDocument();
  });

  it("renders how teams go live section", () => {
    render(<DemoPage />);
    expect(screen.getByText("How teams go live")).toBeInTheDocument();
    expect(screen.getByText("Bring in the plan")).toBeInTheDocument();
  });

  it("renders FAQ section", () => {
    render(<DemoPage />);
    expect(
      screen.getByText("Questions districts ask before switching"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Can we import from our current spreadsheet?"),
    ).toBeInTheDocument();
  });

  it("shows success state after form submission", async () => {
    const user = userEvent.setup();
    render(<DemoPage />);

    await user.type(screen.getByPlaceholderText("Jane Smith"), "Jane Smith");
    await user.type(
      screen.getByPlaceholderText("jane@district.org"),
      "jane@test.org",
    );
    await user.selectOptions(screen.getByRole("combobox"), "Superintendent");
    await user.click(screen.getByRole("button", { name: /submit request/i }));

    expect(
      await screen.findByText(/thanks for reaching out/i),
    ).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests**

Run: `npx vitest run src/views/v2/marketing/__tests__/DemoPage.test.tsx`
Expected: All tests pass

- [ ] **Step 3: Commit**

```bash
git add src/views/v2/marketing/__tests__/DemoPage.test.tsx
git commit -m "test: add DemoPage tests"
```

---

### Task 9: Add Resend notification for demo requests

**Files:**

- Modify: `_api/lib/email-templates.ts`
- Modify: `src/app/api/contact/route.ts`

- [ ] **Step 1: Add email template**

In `_api/lib/email-templates.ts`, add a new exported function at the end of the file (before the closing of the file):

```typescript
export function demoRequestNotificationHtml(fields: {
  name: string;
  email: string;
  organization: string;
  role: string;
  message: string;
}): string {
  const content = `
    <h2 style="margin:0 0 16px;font-size:20px;color:#111827;font-weight:600;">New Demo Request</h2>
    <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;margin-bottom:16px;">
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#6b7280;font-weight:600;width:120px;">Name</td>
        <td style="padding:8px 0;font-size:14px;color:#374151;">${fields.name}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#6b7280;font-weight:600;">Email</td>
        <td style="padding:8px 0;font-size:14px;color:#374151;"><a href="mailto:${fields.email}">${fields.email}</a></td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#6b7280;font-weight:600;">Organization</td>
        <td style="padding:8px 0;font-size:14px;color:#374151;">${fields.organization || "Not provided"}</td>
      </tr>
      <tr>
        <td style="padding:8px 0;font-size:14px;color:#6b7280;font-weight:600;">Role</td>
        <td style="padding:8px 0;font-size:14px;color:#374151;">${fields.role}</td>
      </tr>
    </table>
    <div style="padding:16px;background:#f9fafb;border-radius:8px;margin-bottom:16px;">
      <p style="margin:0 0 8px;font-size:13px;color:#6b7280;font-weight:600;">Message</p>
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;white-space:pre-wrap;">${fields.message}</p>
    </div>
    ${footer("Reply directly to this email to respond to the prospect.")}
  `;
  return layout(content);
}
```

- [ ] **Step 2: Add Resend notification to contact route**

In `src/app/api/contact/route.ts`, add the notification email after a successful demo_request insert. Add the import at the top:

```typescript
import { sendEmail } from "@api/lib/email";
import { demoRequestNotificationHtml } from "@api/lib/email-templates";
```

Then in the `POST` handler, after the successful `db.insert(...).returning()` call, add:

```typescript
// Send notification email for demo requests
if (body.topic === "demo_request") {
  const name =
    [body.first_name, body.last_name].filter(Boolean).join(" ") || "Unknown";
  // Extract role from message (appended as "...\n\nRole: X" by the frontend)
  const roleMatch = message.match(/\nRole:\s*(.+)$/);
  const role = roleMatch ? roleMatch[1].trim() : "Not specified";
  sendEmail({
    to: "sales@stratadash.org",
    subject: `Demo Request from ${name} — ${body.organization || "Unknown org"}`,
    html: demoRequestNotificationHtml({
      name,
      email: email.trim(),
      organization: body.organization || "",
      role,
      message: message.trim(),
    }),
  }).catch((err) =>
    console.error("[contact] Failed to send demo notification:", err),
  );
}
```

Note: The `sendEmail` call is fire-and-forget (`.catch` only logs). The API response should not wait for the email to send.

- [ ] **Step 3: Verify build succeeds**

Run: `npx next build --webpack 2>&1 | tail -10`
Expected: Build succeeds

- [ ] **Step 4: Commit**

```bash
git add _api/lib/email-templates.ts src/app/api/contact/route.ts
git commit -m "feat: add Resend notification for demo requests"
```

---

### Task 10: Clean up dead code

**Files:**

- Delete: `src/components/public-site/ProductCanvas.tsx`
- Delete: `src/components/public-site/PublicSectionHeading.tsx`

- [ ] **Step 1: Verify no remaining imports**

Run: `grep -rn "ProductCanvas\|PublicSectionHeading" src/ --include="*.tsx" --include="*.ts" | grep -v "__tests__" | grep -v "node_modules"`

Expected: Only the files themselves and possibly their test files. If V2Landing.tsx or any other file still imports them, that import was missed and needs fixing first.

- [ ] **Step 2: Delete the files**

```bash
rm src/components/public-site/ProductCanvas.tsx
rm src/components/public-site/PublicSectionHeading.tsx
```

- [ ] **Step 3: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass. If any test imports ProductCanvas or PublicSectionHeading, delete those test files too.

- [ ] **Step 4: Commit**

```bash
git add -u src/components/public-site/ProductCanvas.tsx src/components/public-site/PublicSectionHeading.tsx
git commit -m "chore: remove ProductCanvas and PublicSectionHeading (replaced by screenshots)"
```

---

### Task 11: Final verification

- [ ] **Step 1: Run full build**

Run: `npx next build --webpack 2>&1 | tail -20`
Expected: Build succeeds with no errors

- [ ] **Step 2: Run full test suite**

Run: `npx vitest run`
Expected: All tests pass

- [ ] **Step 3: Run linter**

Run: `npm run lint`
Expected: No errors

- [ ] **Step 4: Visual smoke test**

Start the dev server and check:

- Home page renders all 7 sections
- `/demo` page renders with form
- Nav links work (Product, Pricing, About, Sign in, Request a demo)
- Footer links work
- Mobile nav hamburger menu works

Run: `npm run dev`
Check: http://localhost:3000 and http://localhost:3000/demo

- [ ] **Step 5: Commit any remaining fixes and push**

```bash
git push origin feat/chart-design
```
