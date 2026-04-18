# StrataDash Marketing + Public Pages — Stitch Prompt

Use this prompt in Stitch to generate the public marketing site for StrataDash: home, pricing, about, privacy policy, and terms of service.

## Paste Into Stitch

```text
Design a responsive public marketing website for StrataDash, a software product that helps K-12 school districts publish beautiful, interactive strategic plan dashboards for families, board members, staff, and the wider community. This is a public-facing SaaS website, not an admin dashboard. The site should feel like premium civic-tech: trustworthy, modern, calm, data-literate, and built for superintendents, communications leaders, cabinet teams, and school boards who need transparency without hiring a consulting firm.

The core positioning:
StrataDash helps school districts share their strategic plans with the community through beautiful, interactive public dashboards at a fraction of the cost of current solutions.

The core emotional message:
Your strategic plan deserves better than a buried PDF.

Product summary to reflect in the site:
- School districts often rely on clunky tools, static PDFs, board portal attachments, spreadsheets, or custom consulting firms to communicate strategic plans.
- Those methods are expensive, hard to navigate, visually weak, and rarely read by the community.
- StrataDash turns a multi-year strategic plan into a polished public dashboard with plan landing pages, objective overviews, goal detail pages, KPI cards, health bars, progress visuals, and district-branded subdomains.
- District teams also get a back-office system for plan editing, goal management, Excel import, team management, widget configuration, and appearance customization.
- The product differentiators are: beautiful by default, real-time progress tracking, clear 3-level hierarchy, district subdomains, Excel import, and much lower cost than the status quo.

DESIGN SYSTEM (REQUIRED):
- Platform: Web, desktop-first but fully responsive, mobile collapse below 768px
- Atmosphere: institutional credibility meets modern analytics; editorial whitespace, crisp hierarchy, restrained polish, not startup hype and not generic education nonprofit styling
- Visual direction: premium public-sector software; calm, clear, persuasive, product-first
- Palette:
  - Canvas: #F5F2EA
  - Surface: #FFFFFF
  - Ink: #171A1F
  - Muted Text: #66707B
  - Border: rgba(23, 26, 31, 0.10)
  - Accent: #2F5E8A
  - Accent Wash: #EAF0F5
- Product-only semantic colors inside mockups and diagrams:
  - On Target: #2F7D4C
  - In Progress: #B7791F
  - Off Track: #B4493F
  - Exceeding: #1F7A72
  - No Data: #8A96A3
- Typography:
  - Headlines: Outfit
  - Body: Geist
  - Data labels and metric numerals: JetBrains Mono
- Components:
  - Border-led cards with minimal shadow
  - Generous corner radius
  - Strong spacing rhythm
  - Tactile buttons
  - Long-form reading layouts for legal pages
- Motion:
  - Subtle staggered reveals on section load
  - Small hover lift on interactive cards
  - Mockups can gently slide or parallax on page load
  - Use only transform and opacity for animation
  - Motion should feel deliberate, not playful

ANTI-PATTERNS:
- Do not use Inter
- Do not use purple gradients, neon glows, or generic SaaS blue-on-white defaults
- Do not make it feel like a startup for creators or agencies
- Do not rely on stock photography of smiling students or teachers as the primary visual language
- Do not fabricate customer counts, compliance claims, procurement badges, district logos, or testimonials that were not provided
- Do not use copy clichés like “elevate,” “unleash,” “next-gen,” or “seamless”
- Do not build every section as three equal-width cards in a row
- Do not make legal pages look like unstyled black text on white paper
- Do not use consumer-app pricing vibes; this is district software with public-budget sensitivity

COPY STYLE:
- Plainspoken, superintendent-ready, confident, and specific
- Short sentences over hype
- Explain value in practical terms: transparency, trust, readability, accountability, faster setup, lower cost
- Sound like a product used by real districts, not a venture-backed startup chasing buzzwords
- Do not make legal promises or policy guarantees beyond clearly labeled starter copy

GLOBAL SITE REQUIREMENTS:
- Build these pages: Home, Pricing, About, Privacy Policy, Terms of Service
- Shared header and footer across all pages
- Primary CTA across the site: Book a demo
- Secondary CTA on the home page only: View a live district example
- Include a clean sign-in link in the header
- Use product mockups and dashboard previews as the hero visual language, not generic illustrations
- Show that the product serves both public visitors and district admins
- Fully responsive with no horizontal scroll on mobile
- WCAG AA contrast, visible focus states, touch targets at least 44px
- Long-form pages should keep body copy around 65ch max width
- Legal pages should clearly look like polished starter pages that will later be reviewed by counsel

SHARED HEADER:
- Left: StrataDash wordmark
- Center/right desktop nav: Product, Pricing, About, Sign in
- Primary button: Book a demo
- Mobile: clean sheet menu, not a cramped icon row
- Sticky or semi-sticky behavior is acceptable if elegant

SHARED FOOTER:
- Brand block with one-sentence value proposition
- Product links
- Company links
- Legal links
- Demo/contact CTA
- Clean, editorial spacing with a credible company feel

PAGE STRUCTURE:

1. HOME PAGE
Create a persuasive home page that sells the product clearly in under one scroll, then deepens the story with product proof and decision-maker confidence.

Home page sections:
- Hero:
  - Asymmetric split layout
  - Left side: headline, subheadline, primary CTA, secondary CTA
  - Right side: layered product mockups showing a district plan landing page, objective cards, and a goal detail panel
  - Headline direction: “Your strategic plan deserves better than a PDF” or an equivalent line with the same clarity
  - Subheadline should explain that StrataDash helps districts publish interactive public dashboards for strategic plans, progress tracking, and community transparency
- Trust/credibility strip:
  - Instead of fake logos, use district-seal-style placeholder marks or proof statements such as “Built for district leadership teams,” “Made for board presentations,” and “Readable on any device”
- Problem section:
  - Contrast old way vs new way
  - Old way: board attachments, buried PDFs, spreadsheet exports, consulting-heavy microsites
  - New way: live district-branded public dashboard with progress visibility
- Product preview section:
  - Show 3 product preview frames:
    - Plan landing page with KPI cards and plan health bar
    - Objective overview with numbered cards and status dots
    - Goal detail view with KPI panel, donut/bar charts, and sub-goal accordion
  - Each frame should have short callouts explaining what the viewer is seeing
- How it works:
  - 3 steps:
    - Import your plan
    - Customize your district dashboard
    - Share your public subdomain
  - Make this visually stronger than a standard icon row; use an offset editorial layout or a connected process rail
- Feature section:
  - Group features into two buckets:
    - For the public: beautiful plan pages, clear hierarchy, real-time progress, district-branded subdomain
    - For district admins: plan editor, goal management, widget builder, Excel import, team management, branding controls
  - Use a varied layout, not repetitive equal cards
- Why districts switch:
  - Emphasize lower cost than consultants or enterprise board tools
  - Emphasize trust, clarity, and faster updates
  - Add a small comparison table or visual benchmark
- Pricing teaser:
  - Short section pointing to the pricing page
  - Message: straightforward pricing that respects public budgets
- FAQ or objections section:
  - Questions like:
    - Can we import our existing spreadsheet?
    - Can each district have its own branding?
    - Is this public-facing or internal only?
    - Can we manage multiple districts?
- Final CTA:
  - Strong close with Book a demo
  - Keep it direct and professional

2. PRICING PAGE
Design a pricing page for school districts and public-sector buyers. It should feel credible and easy to scan, not like a consumer SaaS pricing page.

Pricing page structure:
- Intro hero:
  - Clear headline about simple, transparent pricing for district strategic plan publishing
  - One-sentence note that StrataDash is typically far less expensive than consultants, custom microsites, or bloated enterprise tooling
- Pricing architecture:
  - Use 3 tiers:
    - Pilot
    - District
    - Multi-District / Enterprise
  - Present pricing as annual public-sector software pricing, not tiny monthly creator-app pricing
  - It is acceptable to use realistic placeholder annual pricing if needed, but the layout should make prices easy to update
  - Show what changes across tiers: number of plans, districts, branding, admin seats, advanced support, implementation help
- Included in every plan:
  - Public dashboard publishing
  - Strategic plan hierarchy
  - KPI visualizations
  - District branding
  - Role-based admin access
- Comparison callout:
  - Visually frame StrataDash as a fraction of the cost of the status quo
- FAQ:
  - procurement timing
  - onboarding help
  - data import
  - annual billing
- CTA:
  - Book a demo

3. ABOUT PAGE
Design an about page that feels grounded, mission-driven, and product-aware. It should explain why StrataDash exists without turning into founder mythology or startup theatre.

About page structure:
- Hero:
  - Clear statement about modernizing how districts communicate strategic progress
  - Supporting line about trust, transparency, and community understanding
- Origin/problem section:
  - Strategic plans often disappear into binders, PDFs, or board decks
  - Districts deserve a more readable and more accountable way to share progress
- What we believe:
  - Transparency should be usable
  - Progress should be visible
  - Public-sector tools should respect limited budgets
  - District communication should not require a custom consulting engagement
- Who it is for:
  - K-12 districts
  - Charter networks
  - education service agencies
  - mission-driven education organizations
- Principles or values strip:
  - clarity over complexity
  - usefulness over flash
  - trust over hype
  - accessibility over cleverness
- CTA:
  - Book a demo or view a live district example

4. PRIVACY POLICY PAGE
Design a polished privacy page with real hierarchy, not just raw prose. The content should be structured starter copy for later legal review.

Privacy page structure:
- Header:
  - Page title
  - Last updated label
  - Short explanatory subtitle
- Layout:
  - Main reading column plus optional sticky table of contents on desktop
  - Clear section dividers and anchor navigation
- Suggested sections:
  - Introduction
  - Information we collect
  - How we use information
  - Cookies and analytics
  - Data sharing and vendors
  - Data retention
  - Security
  - Your choices and rights
  - Student and district data considerations
  - Contact
- Add a clean contact callout card at the end
- Tone should be calm, precise, and readable
- Make it visually consistent with the rest of the site, but less promotional

5. TERMS OF SERVICE PAGE
Design a polished terms page that feels serious, readable, and professionally structured. This is starter copy and layout, not final legal advice.

Terms page structure:
- Header:
  - Title
  - Last updated label
  - Short summary sentence
- Layout:
  - Main content column plus optional sticky section navigation on desktop
- Suggested sections:
  - Acceptance of terms
  - Description of service
  - Accounts and access
  - Acceptable use
  - Customer data and ownership
  - Fees and billing
  - Service availability
  - Intellectual property
  - Termination
  - Disclaimers
  - Limitation of liability
  - Governing law
  - Contact information
- End with a clear contact/legal support block
- Keep the design quieter than the marketing pages but still intentional and well-composed

PRODUCT MOCKUP DIRECTION:
- The marketing site should repeatedly show the product itself, because the product visuals are the strongest proof
- The dashboard previews should depict:
  - Plan landing page with district name, date range, KPI summary cards, and a horizontal plan health bar
  - Objective cards with numbered sections and green/amber/red status dots
  - Goal detail cards with baseline vs target, trend delta, donut chart or bar chart, and expandable sub-goals
- Use this concrete sample content in the mockups so the UI feels specific and believable:
  - District: Westside Community Schools
  - Public subdomain: westside.stratadash.org
  - Strategic Plan: 2024-2029
  - Objective: Academic Excellence
  - Goal 1: Increase graduation rate to 95%
    - KPI: Current 87% -> Target 95%
    - Delta: up 3.2% from baseline
    - Visualization: annual bar chart showing progress over multiple years
    - Sub-goals: AP enrollment, tutoring hours, college and career readiness indicators
  - Goal 2: Reduce chronic absenteeism
    - KPI: Current 12% -> Target 8%
    - This is an inverse metric, so lower is better
    - Visualization should make the lower-is-better logic obvious
- Product mockups should feel polished, data-rich, and realistic enough that a superintendent could imagine showing them to a board
- Keep public pages distinct from admin pages, but mention the back-office admin tools in the feature narrative

RESPONSIVE RULES:
- All multi-column layouts collapse cleanly to one column on mobile
- Hero mockups stack below hero copy on mobile
- Footer collapses into simple grouped columns
- Long-form legal pages remain highly readable on small screens
- No horizontal overflow anywhere

FINAL QUALITY BAR:
This should look like a premium, intelligent software company serving school districts, not a generic SaaS template. The design should feel composed, trustworthy, and visually memorable without being loud. Product clarity matters more than decoration. Every page should feel intentionally art-directed, but still practical enough for public-sector buyers.
```

## Notes

- If Stitch drifts into generic startup patterns, re-emphasize: `premium civic-tech, product-first, no stock-photo hero, no fake logos, no purple SaaS gradient`.
- If Stitch tries to over-design the legal pages, pull it back toward `editorial, readable, polished long-form documentation`.
- If you want, this prompt can be split into page-by-page follow-up prompts after Stitch establishes the home page design language.
