# SaaS Landing Page Redesign — Design Spec

**Date:** 2026-04-03
**Branch:** `feat/chart-design` (or new branch)
**Scope:** Home page redesign + new `/demo` request page

## Summary

Redesign the StrataDash marketing home page using the visual design system from a Stitch MCP prototype (project 10849397591075386149), while preserving the existing district-specific copy. Add a new `/demo` route with a demo request form that replaces the current `mailto:` CTA.

### Design Source

- **Stitch project:** 10849397591075386149
- **Design system:** "The Authoritative Canvas" — editorial, architectural aesthetic
- **Key tokens:** Manrope 800 headlines, Inter body, deep indigo primary (#1100ac → #2419df gradient), tonal surface layering, no-border rule

### What Changes

1. **V2Landing.tsx** — full rewrite with 7 new sections
2. **MarketingNav.tsx** — updated styling (wordmark, gradient CTA shadow, updated links)
3. **MarketingFooter.tsx** — updated to match Stitch footer structure
4. **New: `/demo` route** — demo request form page with Resend email notification
5. **Delete: ProductCanvas.tsx** — replaced by product screenshots
6. **Delete: PublicSectionHeading.tsx** — no longer used after rewrite

### What Stays Unchanged

- About, Pricing, Terms, Privacy pages
- V2MarketingLayout wrapper
- All admin and district routes
- Authentication flow

---

## Home Page Sections (V2Landing.tsx rewrite)

### Section 1: Hero

**Layout:** 12-col grid — 6 cols text, 6 cols product screenshot
**Typography:** Manrope font-extrabold (800), ~text-7xl on desktop, tight tracking (-0.02em)
**Headline:** "Make your strategic plan **visible** to your community" (Stitch headline, "visible" in primary color)
**Body:** Current V2 copy — "StrataDash turns static strategic plans into a hosted district surface that stays readable, current, and board-ready as leadership updates the work."
**CTAs:**

- "Request a demo →" — gradient button (primary → primary-container, 135deg) with `shadow-xl shadow-primary/25`, links to `/demo`
- "View example dashboard" — surface-container-highest background, links to `/district/westside`

**Product screenshot:** Stitch placeholder image (AI-generated dashboard), positioned with `translate-x-12 translate-y-8` to break grid boundary. White card wrapper with ambient shadow. Blurred primary circle accent behind.

### Section 2: Social Proof Strip

**New section from Stitch.**
**Background:** surface-container-low (tonal shift, no border)
**Content:** "Trusted by forward-thinking districts" label + district name wordmarks
**Behavior:** Grayscale by default, color on hover. Opacity 60%.
**District names:** WESTSIDE USD, EASTSIDE ISD, LAKESIDE K-12, METRO SCHOOLS (aspirational until real logos available)

### Section 3: Bento Feature Grid — "Built for clarity"

**Replaces:** Current 3 feature rows with alternating text/ProductCanvas layout
**Layout:** Asymmetric bento grid

- Row 1: 2-col span card + 1-col card + 1-col card (md:grid-cols-4)
- Row 2: Full-width primary-colored card with screenshot

**Cards (no borders — tonal surfaces only):**

1. **Public dashboards** (2-col, surface-container-low) — "Publish a living plan instead of sending families to a buried PDF. One URL for the whole district."
2. **Transparent visualization** (1-col, surface-container-highest) — "Turn complex academic data into easy-to-read visuals for every stakeholder."
3. **Board-ready reports** (1-col, surface-container-highest) — "Status changes visible before board meetings. No more deck rebuilds."
4. **Simple for admins** (full-width, primary gradient) — "Department leads update notes directly in the product, giving cabinet teams a clean weekly summary." White CTA button, rotated admin UI screenshot.

**Icons:** Phosphor Icons (not Material Symbols) — PresentationChart, Eye, FileText, GearSix

### Section 4: Reporting Showcase — "High-fidelity metrics for every KPI"

**From Stitch.** Two-column: text left, screenshot right.
**Background:** surface-container-lowest (white) — differentiated from surrounding sections by tonal shift
**Left column:**

- Primary kicker: "Unmatched Reporting"
- Manrope 800 headline
- Two feature items with circular secondary-tinted icon + title + description:
  - Multi-year timelines
  - District-wide KPIs

**Right column:**

- Analytics screenshot in surface-container-low card with shadow
- Floating "Goal Achieved" card positioned absolute bottom-left with ambient shadow

### Section 5: Leadership vs Community — Dual Persona Cards

**New section from Stitch.**
**Layout:** 2-col grid, equal width
**Left card (For Leadership):** Dark indigo background (#1e1b4b), white text

- Checklist: Internal performance monitoring, Automated board reports
- CTA: "Solutions for Superintendents" (white pill button)

**Right card (For Community):** surface-container-highest background

- Checklist: Public progress portals, Mobile-optimized viewing
- CTA: "Solutions for Public Relations" (primary pill button)

**Min-height:** 400px, flex column with justify-between

### Section 6: Final CTA Strip

**Enhanced from Stitch.** Centered layout (vs current two-column).
**Background:** Primary gradient with diagonal skew accent (white/5, skewX(12deg))
**Headline:** "Ready to visualize your district's future?" (Manrope 800)
**CTAs:**

- "Request a demo" — white pill button, links to `/demo`
- "Chat with an expert" — ghost border button (white/30), links to `/demo`

### Removed from Home Page

- **FAQ section** — relocated to `/demo` page
- **"How teams go live" workflow steps** — relocated to `/demo` page
- **"Show the product" video section** — removed (no showreel video available; screenshots replace this)
- **ProductCanvas animated mock panels** — replaced by Stitch placeholder screenshots

---

## Demo Request Page (`/demo`)

### Route: `src/app/(root)/demo/page.tsx`

Uses `V2MarketingLayout` wrapper (same nav/footer as home).

### Layout

**Section 1: Hero + Form (split layout)**

- 5/12 cols: Value propositions
- 7/12 cols: Form card

**Left column — Value props:**

- Headline: "See how StrataDash makes the public-facing plan the easiest place to understand district progress."
- Body: "Book a walkthrough tailored to your district's planning workflow."
- 3 value prop items with icon + title + description:
  1. Personalized walkthrough — "Tailored to your district size, planning structure, and board reporting cadence."
  2. Implementation consultation — "Direct access to discuss timelines, import from your current spreadsheet, and district branding setup."
  3. Procurement readiness — "Review security protocols, data hosting, and pricing aligned to district budget cycles."
- Icons: Phosphor (Notepad, Wrench, ShieldCheck)

**Right column — Form card:**

- Background: surface-container-lowest (white), ambient shadow, ghost border
- Fields:
  - Full Name (text) + Work Email (email) — 2-col grid
  - District/Organization (text) + Role (select) — 2-col grid
  - "What are you hoping to solve?" (textarea)
- Role options: Superintendent, Chief Academic Officer, Chief Technology Officer, Director, Board Member, Communications/PR, Other
- Submit button: Full-width gradient pill, Manrope 800, shadow-xl
- Footer text: "By submitting, you agree to our Privacy Policy and Terms of Service." (linked)

**Section 2: Product Preview**

- Dark dashboard screenshot from Stitch (full-width, rounded)
- Floating "99.9% Uptime" badge (absolute positioned)
- Gradient overlay from primary/20 at bottom

**Section 3: How Teams Go Live (relocated from home)**

- Background: surface-container-low
- 3-col grid with numbered circles and connector line
- Content from current V2Landing workflowSteps array

**Section 4: FAQ (relocated from home)**

- Content from current V2Landing faqItems array
- Cards instead of `<details>` accordions (always expanded, simpler)

### Form Submission

**API Route:** `POST /api/contact` (existing Next.js route handler at `src/app/api/contact/route.ts`)

The demo form submits to the existing contact submissions endpoint with `topic: "demo_request"`. No schema changes needed — the `contactSubmissions` table already has: email (required), firstName, lastName, organization, topic, message (required).

**Note:** The API routes use `@api/lib/` path alias which maps to `_api/lib/`. Both `_api/` (legacy Vercel serverless) and `src/app/api/` (Next.js route handlers) exist — the Next.js versions are the active ones.

**Field mapping:**

- `email` → work email
- `first_name` → from full name (split on first space)
- `last_name` → from full name (split on first space)
- `organization` → district/organization
- `topic` → `"demo_request"`
- `message` → textarea value + role appended (e.g., "Message here\n\nRole: Superintendent")

**Resend notification:** After successful DB insert, send a notification email to `sales@stratadash.org` using the existing `sendEmail` helper from `_api/lib/email.ts`. Add a new `demoRequestNotificationHtml` template to `_api/lib/email-templates.ts`.

**Success state:** Replace form with a success message — "Thanks! We'll reach out within one business day to schedule your walkthrough."

**Rate limiting:** Uses existing `contactLimiter` from the contact endpoint.

---

## Visual Design System Changes

### Typography Updates

- Headlines: `font-headline font-extrabold` (Manrope 800) — up from current font-semibold (600)
- Hero headline: `text-6xl lg:text-7xl` with `tracking-tight` and `leading-[1.1]`
- Section headlines: `text-4xl font-extrabold` minimum
- Maintain 2:1+ ratio between headline and body size

### Tonal Surface Layering (No-Border Rule)

Replace `border border-outline-variant/70` section separators with background color shifts:

- `bg-surface` (#faf9fe) — default page background
- `bg-surface-container-low` (#f4f3f8) — secondary sections (social proof, how-it-works)
- `bg-surface-container-lowest` (#ffffff / white) — elevated content (reporting showcase)
- `bg-surface-container-highest` (#e3e2e7) — interactive components, card variants

Cards within sections use the "white-on-grey" principle: `bg-surface-container-lowest` cards on `bg-surface-container-low` backgrounds.

### CTA Buttons

- Primary: `bg-gradient-to-br from-primary to-primary-container` + `shadow-xl shadow-primary/25` + `rounded-full`
- Secondary: `bg-surface-container-highest` + `rounded-full` + no border
- Ghost: `border-2 border-white/30` on dark backgrounds

### Shadows (Ambient, Primary-Tinted)

Replace current `public-shadow` with Stitch ambient shadows:

```css
box-shadow:
  0 4px 6px -1px rgba(17, 0, 172, 0.04),
  0 20px 40px -10px rgba(26, 27, 31, 0.08);
```

### Product Screenshots

Use Stitch placeholder images for now. These are hosted on Google's CDN (`lh3.googleusercontent.com/aida-public/...`). Download and serve from `/public/images/marketing/` to avoid external dependency.

Images to download:

1. Hero dashboard — from home screen
2. Admin UI — from bento grid
3. Analytics charts — from reporting showcase
4. Dark dashboard — from demo page

---

## Files Changed

| File                                                  | Action  | Description                                       |
| ----------------------------------------------------- | ------- | ------------------------------------------------- |
| `src/views/v2/marketing/V2Landing.tsx`                | Rewrite | 7 new sections replacing current content          |
| `src/components/marketing/MarketingNav.tsx`           | Edit    | Wordmark, updated links, gradient CTA shadow      |
| `src/components/marketing/MarketingFooter.tsx`        | Edit    | Align with Stitch footer structure                |
| `src/app/(root)/demo/page.tsx`                        | Create  | New demo request route                            |
| `src/views/v2/marketing/DemoPage.tsx`                 | Create  | Demo page view component                          |
| `_api/lib/email-templates.ts`                         | Edit    | Add demoRequestNotificationHtml template          |
| `src/app/api/contact/route.ts`                        | Edit    | Add Resend notification on demo_request topic     |
| `src/components/public-site/ProductCanvas.tsx`        | Delete  | Replaced by screenshots                           |
| `src/components/public-site/PublicSectionHeading.tsx` | Delete  | No longer imported                                |
| `public/images/marketing/`                            | Create  | Downloaded Stitch placeholder screenshots         |
| `src/app.css` (or equivalent)                         | Edit    | Add ambient shadow utility, tonal surface classes |

## Files NOT Changed

- `src/app/(root)/page.tsx` — still imports V2Landing, no change needed
- `src/components/v2/layout/V2MarketingLayout.tsx` — unchanged wrapper
- `src/views/v2/marketing/V2Pricing.tsx` — pricing page untouched
- `src/views/legal/` — about, terms, privacy pages untouched
- All admin/district routes — untouched

---

## Testing Considerations

- **Visual QA:** Check home page at mobile, tablet, desktop breakpoints
- **Demo form:** Test submission, rate limiting, success state, Resend notification
- **Nav links:** Verify "Request a demo" buttons across home page all link to `/demo`
- **Screenshot loading:** Verify local images load (not dependent on Google CDN)
- **Existing tests:** `V2Landing.test.tsx` will need updates to match new section structure
