# StrataDash Public Pages — Stitch Prompt

**Created:** 2026-04-03
**Design Reference:** Mixpanel public boards
**Design Intent:** Redesign (not rebuild)
**Tech Stack:** Next.js + Tailwind + Radix UI primitives + Recharts

---

## Lessons Learned

### Rebuild vs Redesign matters

When a design reference is provided (like Mixpanel), the prompt must break from the current visual language entirely. The first attempt carried forward the dark sidebar and brown/maroon accents from the existing app — Stitch faithfully reproduced the old look. The fix: treat screenshots as a structural data map (what pages exist, what data goes where) and let the design reference drive all visual decisions.

### These are performance metrics, not tasks

School district goals like "K-2 Reading Foundation" are measured against a target score annually — they're never "completed." The first Stitch output showed completion donuts (75% COMPLETE) which is wrong framing. Correct framing: On Target / Off Track / Exceeding / Awaiting Data. Every metric shows current vs target, not current vs total.

### The sidebar is for public navigation, not admin

The Stitch-generated designs kept producing admin sidebars (Dashboard, Settings, Import, "+ New Objective"). The public site needs a plan explorer sidebar — district identity, plan health summary, and an expandable objective/goal tree with inline status dots and scores.

### Weave the design reference throughout

Mentioning Mixpanel once in the opening paragraph isn't enough. By view 5, Stitch forgets. The reference needs to appear in at least 3 places: opening, specific view descriptions, and general requirements.

### Status dots > donut rings for objective cards

A row of colored dots (● ● ● ○ ○) with "3 on target · 2 off track" communicates goal health at a glance without implying completion. This replaced the donut ring approach from the Stitch-generated mockups.

### Inverse metrics need annotation

Some goals (like Chronic Absenteeism) have targets where lower is better. The prompt explicitly calls this out with "(lower is better)" annotations so Stitch doesn't default to "higher = good" everywhere.

### Chart animations sell it

The Mixpanel reference page has loading spinners and animated chart entries. Adding specific animation specs (staggered bar growth, clockwise donut draw, number count-up with easing) makes the difference between a static dashboard and something that feels alive.

---

## The Prompt

```
Scaffold a Next.js + React + TypeScript project using Tailwind CSS and Radix UI primitives with Recharts for data visualization. Build the public-facing pages of StrataDash, a strategic planning platform where school districts share their multi-year strategic plans, goals, and KPI progress with parents, board members, and the community. This is a read-only public site — there are no admin controls, no "New Objective" buttons, no settings, no editing. Use the Stitch MCP to pull the design reference and grab any images or assets from the Stitch project. For design language and interaction patterns, reference Mixpanel's public boards — specifically: its metric card treatment (bold question title, big number, unit label, colored delta badge with trend arrow like "↑ 26.74%"), its vibrant chart palette (purple, coral, teal, gold — not monotone blue), and its card-based layout where every card has a 1px light gray border, rounded corners, generous padding, and absolutely no drop shadow. The current app works functionally but the design feels like a wireframe — I want this to feel like a polished, Mixpanel-tier analytics product that a superintendent would proudly present to their school board and that parents would actually want to read. Take creative liberties with layout, spacing, typography, and component design. Surprise me. Focus entirely on the UI. No backend. Use localStorage for any state persistence. Use realistic mocked data throughout — school districts (Westside Community Schools, Eastside Unified District), strategic objectives (Student Achievement & Well-being, Educational Excellence & Innovation, Safe & Supportive Learning Environment, Operational Excellence), goals with mixed metric types: percentages (ELA/Reading Proficiency at 72% vs 85% target), rubric scores (Instructional Quality at 3.2 out of 4), hour counts (Professional Development at 42 of 50 hours), and inverse metrics where lower is better (Chronic Absenteeism at 18% vs 12% target). Include time-series data spanning 2021–2025.

IMPORTANT — these are ongoing performance metrics, NOT tasks. Goals like "K-2 Reading Foundation" are measured against a target score every year — they are never "completed." Do NOT use completion framing anywhere: no "75% complete," no completion donut rings, no progress-toward-done language. Instead, use status-based framing: On Target (current score meets or approaches target), Off Track (current score is significantly below target), Exceeding (current score surpasses target), In Progress (data exists but trending), and Awaiting Data (no measurements yet). Every metric visualization should show current score vs target, not current vs total.

Implement light and dark mode with a toggle. In dark mode, surfaces shift to gray-900/950, card borders become gray-700, text inverts to gray-100/200, and charts adjust their grid lines and labels to light-on-dark. Preserve chart vibrancy against dark surfaces.

All charts must animate. Bar charts grow upward from baseline with staggered ease-out (each bar starts 50ms after previous). Donut/ring charts draw clockwise from 12 o'clock with ease-in-out over 800ms. Line charts draw left-to-right as progressive reveal. Big metric numbers count up from zero over 600ms with ease-out. Delta badges (↑ 7.0% from baseline) fade in 200ms after the number finishes counting. Use Recharts' isAnimationActive, animationBegin, animationDuration, and animationEasing props. Build a custom useInView hook (Intersection Observer) so animations trigger when cards scroll into the viewport, not on page load.

**Layout: Public Plan Explorer Sidebar + Content Area.** The left sidebar is a plan navigation tool for public visitors — NOT an admin panel. No Dashboard, no Settings, no Import, no "+ New Objective." The sidebar contains: (1) District identity at top — square avatar with initials + district name + plan title and date range. (2) Plan Health section — a status distribution summary showing counts: "● 6 On Target · ○ 5 Off Track · ◉ 1 Exceeding · ◦ 2 Awaiting Data" with a small stacked horizontal bar visualizing the distribution (green/red/teal/gray segments). Text below: "14 goals across 4 objectives." (3) Objectives section — a tree navigator using nested Radix Accordions. Each objective is expandable (▶/▼). Collapsed state shows: objective number, truncated name, and "N of M on target." Expanded state reveals child goals, each showing: status dot (● ○ ◉ ◦), goal number (1.1, 1.2), truncated name, and current score right-aligned. Goals with sub-goals have their own expand arrow revealing 1.1.1, 1.1.2 etc. Clicking any item navigates the main content area. The active item gets a left accent border and tinted background. (4) Footer — light/dark mode toggle using Radix Switch, and "Powered by StrataDash" link. Style the sidebar like Mixpanel's navigation — light or softly tinted background, quiet muted text, no heavy dark treatment. On mobile, the sidebar becomes a slide-over sheet triggered by a hamburger icon in the top bar. The top bar shows: district avatar + name on left, breadcrumb navigation in center, dark mode toggle + "Powered by StrataDash" on right.

1. **Public Plan Landing Page.** The entry point for community visitors. A hero section with the plan title ("Westside Strategic Plan 2025-2027"), a vision statement paragraph, the plan timeframe badge ("JUL 2025 — JUN 2027"), and a "Download Vision PDF" button. Below the hero, four summary KPI cards in a row: Total Objectives (4), Total Goals (14), On Target (6, green dot), Needs Attention (5, amber/red dot). Style these like Mixpanel's metric cards — big bold number, small uppercase label, colored status dot. No sparklines needed here, just clean and bold. Below the KPIs, a "Plan Health at a Glance" section with a full-width stacked horizontal bar chart showing the status distribution across all 14 goals — green (On Target), amber (In Progress), red (Off Track), gray (Awaiting Data) — with a legend and percentage axis. This bar should animate segments growing left-to-right on scroll-into-view. Below the health bar, a grid of objective cards that serve as navigation. Each card shows: a unique icon per objective (not the same icon repeated), objective title, one-line description, goal count, and a row of status dots — one dot per goal, colored by status (● ● ● ● ○ ○ = 4 on target, 2 off track). Below the dots: "4 on target · 2 off track" as summary text. No completion percentages, no donut rings. Add hover lift (translateY -2px, border color shift) and stagger fade-in animation on page load. Consider adding a "Last updated: Mar 4, 2026" timestamp near the hero.

2. **Strategic Objectives Overview.** Breadcrumbs: Plan > All Objectives. Title "Strategic Objectives" with count subtitle and "Updated 2 days ago" timestamp. A responsive card grid (3 columns desktop, 2 tablet, 1 mobile). Each objective card: unique accent color from the Mixpanel palette (purple for #1, coral for #2, teal for #3, gold for #4) as a left border stripe, large faded objective number (01, 02, 03, 04), bold title, truncated description, goal count, and the status dot row with summary text — same pattern as the landing page cards. No progress rings, no completion percentages. Stagger animation: cards fade-and-slide-up in sequence (50ms offset each). Add a Filter button (use Radix Popover) that lets visitors filter by status: show only objectives with off-track goals, on-target goals, etc.

3. **Objective Detail with Goal Cards.** Breadcrumbs: Plan > Objective Name. Objective header with colored numbered badge (using the objective's accent color), title, and full description. A "Goal Health" summary row: status dots for all goals in this objective with summary text ("3 on target · 2 off track · 1 awaiting data"). Below, a "Goals (6)" section header with an "Export PDF" button. A 3-column card grid of goal cards. Each card shows: numbered badge (1.1, 1.2), goal name, status badge (ON TARGET in green, IN PROGRESS in amber, OFF TRACK in red, NOT STARTED in gray, EXCEEDING in teal), metric label ("CURRENT SCORE" or "CURRENT RATE" for inverse metrics), big animated number (72%, 3.2 out of 4, 42 hours), delta from baseline with colored arrow ("↑7.0% from baseline" in green, "↓1.5% from baseline" in red), a thin progress bar showing current position relative to target (not a completion bar — the bar shows where the current score sits on the scale from 0 to target), target value in muted text ("target: 85%"), and for inverse metrics add "(lower is better)" annotation. At the bottom of each card, a mini trend visualization — 5-6 small blocks representing yearly data points, colored by whether that year was on/off track — like a tiny heatmap strip. Use Radix Tooltip on status badges: "Off Track: current score is more than 10% below target." Sub-goal count shown as "3 sub-goals" with a "View →" link. Don't just stack numbers — every card should instantly communicate health through color and proportion.

4. **Goal Detail with Time-Series Bar Chart.** Breadcrumbs: Plan > Objective > Goal. Objective header with badge, then a "← Back to goals" link. The goal card fills the width: goal name with numbered badge, full description, and status pill (In Progress) top-right. Split layout below: left panel shows status badge (Off Track), metric label ("CURRENT SCORE"), huge animated count-up number ("72%"), Target ("85%"), Baseline ("65%"), and delta badge ("↑ 7.0% from baseline" — styled like Mixpanel's colored pill badges with arrow icon and tinted background). Right panel shows a Recharts BarChart with bars that animate upward on scroll-into-view. Style bars with the objective's accent color, rounded top corners (radius 4px), subtle gradient from accent to lighter tint. On hover, show a Radix Tooltip with exact value and year. Faint dashed gridlines. "Updated Mar 4, 2026" timestamp below chart. Below the chart, a "Sub-Goals (3)" section using Radix Accordion — each row shows numbered badge (1.1.1), name, and expands to reveal a mini metric card with that sub-goal's score, target, and trend delta.

5. **Goal Detail with Donut/Ring Chart.** Same layout as above but for completion-type and ratio metrics. Right panel shows a Recharts PieChart (donut) that draws clockwise on scroll-into-view. Filled segment uses the objective's accent color, remaining track is gray-100 (light) or gray-800 (dark). Center shows the value with contextual label ("100% Deployed," "42 of 50 hours completed," "3.2 of 4.0 rating"). Do not show a generic "X% COMPLETE." For metrics at 100% or exceeding target, add a subtle celebration state — gentle pulse or shimmer on the ring. Below the donut, show the fraction or contextual label ("Target met" or "42 of 50 hours — 84% of target").

Fully responsive. Card grids collapse: 3-col → 2-col → 1-col. Goal detail split layout stacks vertically on mobile (metric above, chart below). Breadcrumbs truncate to current + parent on mobile. Sidebar becomes slide-over sheet on mobile. Color system: neutral surfaces (white/gray-50 light, gray-900/950 dark), primary accent palette inspired by Mixpanel (purple-600 primary, coral-500, teal-500, amber-500 as per-objective accents — not the current brown/maroon), semantic status: emerald-500 On Target, amber-500 In Progress, red-500 Off Track, teal-500 Exceeding, gray-400 Awaiting Data. All cards use 1px borders in gray-200 (light) or gray-700 (dark), never shadows. Typography: plan titles 32px font-bold, objective headers 24px font-semibold, goal names 18px font-medium, metric numbers 36–48px font-bold tabular-nums, labels 12px font-medium uppercase tracking-widest gray-500, body 15px font-normal. Footer: district name, "© 2025 School District Strategic Planning," "Powered by StrataDash," Accessibility, Privacy Policy, Contact Support links. This should feel like a public analytics dashboard that makes school data feel alive and trustworthy — data-forward, calm, animated without being distracting, and visually clear enough that a parent scanning on their phone immediately knows if their district's goals are on track. If you think a view needs an extra detail, empty state, loading skeleton, or interaction to feel complete, add it.
```

---

## ASCII Reference: Public Plan Explorer Sidebar

```
┌─────────────────────────────────┐
│                                 │
│  ┌──┐  Westside Community       │
│  │WE│  Schools                  │
│  └──┘                           │
│  Westside Strategic Plan        │
│  2025-2027                      │
│                                 │
│─────────────────────────────────│
│                                 │
│  PLAN HEALTH                    │
│                                 │
│  ● 6 On Target                  │
│  ○ 5 Off Track                  │
│  ◉ 1 Exceeding                  │
│  ◦ 2 Awaiting Data              │
│                                 │
│  ■■■■■■□□□□□◆◇◇                 │
│  14 goals across 4 objectives   │
│                                 │
│─────────────────────────────────│
│                                 │
│  OBJECTIVES                     │
│                                 │
│  ▼ 1. Student Achievement       │
│  │  4 of 6 on target            │
│  │                              │
│  ├─ ○ 1.1 ELA/Reading     72%  │
│  │       target: 85%            │
│  ├─ ○ 1.2 Mathematics     65%  │
│  │       target: 80%            │
│  ├─ ◦ 1.3 Science          —   │
│  │       not yet measured       │
│  ├─ ◉ 1.4 Growth Mindset  4.5  │
│  │       target: 4.2            │
│  ├─ ○ 1.5 Engagement      12%  │
│  │       target: 8%             │
│  └─ ● 1.6 Early Childhood 80%  │
│         target: 90%             │
│                                 │
│  ▶ 2. Educational Excellence    │
│     2 of 3 on target            │
│                                 │
│  ▶ 3. Safe & Supportive        │
│     1 of 3 on target            │
│                                 │
│  ▶ 4. Operational Excellence    │
│     0 of 2 on target            │
│                                 │
│─────────────────────────────────│
│                                 │
│  ☀ / ☾  Light / Dark           │
│                                 │
│  Powered by StrataDash          │
│                                 │
└─────────────────────────────────┘
```
