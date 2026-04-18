# Design System: StrataDash Public Dashboard

**Project ID:** 13452385600039992656

## 1. Visual Theme & Atmosphere

**Vibe:** Professional, editorial, data-rich. Inspired by Mixpanel/Linear analytics dashboards. Clean surfaces with ghost borders, generous whitespace, and typographic hierarchy that lets data breathe.

**Key characteristics:**

- Light backgrounds (#f4f6ff) with white card surfaces
- Ghost borders (1px solid rgba with low opacity) that strengthen on hover
- Tabular numerals throughout for data alignment
- Material Design 3 color token system
- Two layout paradigms: sidebar nav (plan/objectives) and top nav (goal detail)

## 2. Color Palette & Roles

### Core Colors

| Role                | Hex       | Usage                                    |
| ------------------- | --------- | ---------------------------------------- |
| Primary             | `#702ae1` | CTAs, active states, links, accent bars  |
| On Primary          | `#f8f0ff` | Text on primary backgrounds              |
| Primary Container   | `#b28cff` | Lighter primary surfaces, badges         |
| Secondary           | `#00675d` | Teal accents, "Exceeding" status         |
| Secondary Container | `#6df5e1` | Light teal surfaces                      |
| Tertiary            | `#994100` | Gold/amber accents, "In Progress" status |
| Tertiary Container  | `#ff955a` | Light orange surfaces                    |
| Error               | `#b41340` | Critical/off-track status                |

### Surface Colors

| Role                     | Hex       | Usage                         |
| ------------------------ | --------- | ----------------------------- |
| Surface                  | `#f4f6ff` | Page background               |
| Surface Container Lowest | `#ffffff` | Card backgrounds              |
| Surface Container Low    | `#eaf1ff` | Alternate section backgrounds |
| Surface Container        | `#dce9ff` | Elevated surface elements     |
| On Surface               | `#203044` | Primary text                  |
| On Surface Variant       | `#4d5d73` | Secondary text                |
| Outline                  | `#68788f` | Borders, labels               |
| Outline Variant          | `#9eaec7` | Lighter borders, dividers     |

### Status Colors

| Status    | Color   | Hex       |
| --------- | ------- | --------- |
| On Target | Emerald | `#10b981` |
| At Risk   | Amber   | `#f59e0b` |
| Critical  | Red     | `#ef4444` |
| No Data   | Slate   | `#94a3b8` |

## 3. Typography Rules

**Font Family:** Inter (all weights 100-900)

- Headline: Inter, weight 800-900, tracking tight
- Body: Inter, weight 400-500
- Label: Inter, weight 700, tracking widest, uppercase, size 10-12px
- Data: Inter, weight 700-900, tabular-nums

**Type Scale:**

- Hero title: 3xl-5xl (30-48px), font-black, tracking-tight
- Section title: 2xl (24px), font-bold, tracking-tight
- Card title: xl (20px), font-bold
- Body: sm-base (14-16px), font-normal
- Label: 10-12px, font-bold, uppercase, tracking-widest
- Data number: 4xl-7xl (36-72px), font-black, tabular-nums

## 4. Component Stylings

### Cards (Ghost Border)

```css
border: 1px solid rgba(0, 0, 0, 0.08);
border-radius: 0.75rem;
background: #ffffff;
hover: border-color rgba(0, 0, 0, 0.15);
```

### Buttons

- Primary: `bg-primary text-white rounded-lg px-6 py-3 font-bold text-sm`
- Ghost: `ghost-border bg-white rounded-lg px-4 py-2.5 font-semibold text-sm`

### Status Badges

- Pill-shaped: `px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest`
- On Target: `bg-emerald-50 text-emerald-700 border-emerald-100`
- At Risk: `bg-amber-100 text-amber-700 border-amber-200`
- Critical: `bg-red-50 text-red-700`
- In Progress: `bg-amber-100 text-tertiary`

### Status Dots

- 2.5px circles indicating goal health per objective
- Green filled = on target, amber filled = at risk, red filled = critical, empty ring = no data

### Progress Bars

- Height: 1-2px for inline, 10px for featured
- Track: `bg-slate-100 rounded-full`
- Fill: status-appropriate color

## 5. Layout Principles

### Sidebar Layout (Screens 1-4)

- Fixed sidebar: `w-80`, left-0, full height
- Main content: `ml-80`, `max-w-7xl mx-auto`, `px-8 py-10`
- Sidebar nav: icon + label, active state with `border-l-4 border-violet-700 bg-violet-50/50`
- Tree nav: nested under Objectives Tree, indented with `ml-4 pl-4 border-l`

### Top Nav Layout (Screens 5-6)

- Sticky navbar: `h-16`, white bg, `border-b`
- Nav tabs: Plan | Objectives | Goals, active has `border-b-2 border-violet-700`
- Content: `max-w-7xl mx-auto px-6 py-8`

### Grid System

- Objectives: `grid-cols-1 xl:grid-cols-2 gap-8`
- Goal cards: `grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6`
- Detail split: `grid-cols-12`, left panel col-span-4/5, right panel col-span-7/8

## 6. Icons

**Library:** Material Symbols Outlined (Google Fonts)
**Settings:** FILL 0, weight 400, GRAD 0, opsz 24

Key icons used:

- `domain` - District/org identity
- `analytics` - Plan health
- `account_tree` - Objectives tree
- `settings` - Settings
- `dark_mode` - Theme toggle
- `bolt` - Powered by badge
- `menu_book` - Academic objective
- `volunteer_activism` - Well-being objective
- `model_training` - Educator objective
- `diversity_3` - Community objective
- `download` - Export actions
- `filter_list` - Filter controls
- `chevron_right` - Breadcrumb separator
- `arrow_back` - Back navigation
- `trending_up/down` - Trend indicators
- `expand_more` - Accordion toggle
