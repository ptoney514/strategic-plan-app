# Goal Detail Page Redesign — Design Spec

## Summary

Redesign the public goal drill-down page (`V2GoalDrillDown`) to feel like a modern analytics product (Mixpanel, Linear, Vercel). The page retains the existing data model but restructures layout, spacing, typography, card zones, and chart presentation to create clear visual hierarchy and a calmer, more scannable experience.

## Design Decisions

These were validated via interactive mockups during brainstorming:

| Decision        | Choice                        | Rationale                                                                                                                                        |
| --------------- | ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Card layout     | **B: KPI-Led Split**          | Big number dominates left, chart alongside right. Quick KPI scanning while chart tells the trend story.                                          |
| Mobile collapse | **A: KPI Above Chart**        | KPI gets its own full-width block preserving number dominance, then chart below. Clean vertical flow.                                            |
| Expanded state  | **B: Full-width detail view** | Clicking a card replaces the grid with a single full-width goal module. Back button returns to grid. Maximum chart/KPI space.                    |
| Chart chrome    | **A: Subtle polish**          | Keep gridlines but very faint, reduce axis tick count, custom tooltip. Maintain readability for district administrators who need precise values. |

## Page Structure

### URL & Route

- Public: `/district/[slug]/goals/[goalId]`
- Component: `V2GoalDrillDown` in `src/views/v2/public/V2GoalDrillDown.tsx`

### Two-State Page Model

The page has two states controlled by local state (`selectedGoalId`):

**State 1: Grid View** (no child goal selected)

```
Breadcrumb
Objective Header (number badge + title + description + progress ring)
Section label: "Goals (N)"
3-column grid of collapsed GoalCards
```

**State 2: Detail View** (child goal selected)

```
Breadcrumb
Objective Header (same as above)
"← Back to goals" button
Full-width GoalDetailCard
```

Transition: clicking a collapsed card sets `selectedGoalId`, showing the detail view. Clicking "Back to goals" clears it, returning to the grid.

## Component Architecture

### New Components

#### 1. `GoalDetailCard`

**File:** `src/components/v2/public/GoalDetailCard.tsx`

Full-width card for the expanded goal view. Four distinct zones:

**Zone 1: Header**

- Goal number badge (36px, rounded-lg, `primaryColor` background, white text)
- Goal title (17px, font-weight 600)
- Goal description (13px, secondary color)
- Status badge (far right, pill shape, color-coded)

**Zone 2: KPI + Chart Split**

- Two-panel flex layout, `border-top: 1px solid --editorial-border-light`
- **Left panel (KPI):** `flex: 0 0 280px`, vertically centered
  - Label: "CURRENT SCORE" (10px, uppercase, tracking-wider, `--editorial-text-muted`)
  - Value: 44px, font-weight 700, `--editorial-text-primary`
  - Meta rows below: target (bold), delta (green/red), baseline, owner — all 13px
- **Right panel (Chart):** `flex: 1`, padding 24px, chart fills available space
  - Renders the primary widget chart
  - Minimum height: 180px desktop, 140px mobile

**Mobile (< 640px):** Stacks vertically. KPI panel becomes full-width block with `border-bottom` instead of `border-right`. Chart panel below.

**Zone 3: Source Annotation**

- Right-aligned, 11px, muted color
- Shows "Updated [date] · Source: [source]" if available from widget metadata
- Omitted if no metadata exists

**Zone 4: Sub-goals**

- Section label: "Sub-goals (N)" — 10px uppercase
- Each sub-goal is a hoverable row: number badge (24px), title, status dot, value, chevron
- Rows link to `/goals/[childId]` for further drill-down
- Hover state: `background: --editorial-surface-alt`

#### 2. `GoalCardCollapsed` (rename/refactor of `GoalCard`)

**File:** `src/components/v2/public/GoalCardCollapsed.tsx`

Simplified collapsed card for the grid. Structure:

- Header: number badge (28px, border style) + title
- Indicator badge (pill, color-coded)
- KPI value (28px font) + target line
- Footer: sub-goal count + "View →" link
- Card: 16px radius, `--editorial-surface` bg, `--editorial-border` border, hover shadow + translateY(-2px)

This replaces the existing `GoalCard` component. The current `GoalCard` mixes collapsed and expanded concerns (via `isExpanded` prop + `ExpandedGoalCard`). The redesign separates these into two focused components.

#### 3. `ChartTooltip`

**File:** `src/components/v2/widgets/ChartTooltip.tsx`

Shared custom Recharts tooltip used across all chart widget renderers:

- Background: `--editorial-surface` with `border: 1px solid --editorial-border`
- Border-radius: 8px
- Box-shadow: `0 4px 12px rgba(0,0,0,0.08)`
- Label: 11px, `--editorial-text-muted`
- Value: 14px, font-weight 600, `--editorial-text-primary`
- No default Recharts tooltip styling

### Modified Components

#### `AreaLineWidget`, `BarChartWidget`

Chart chrome changes (applied to both):

- `CartesianGrid`: change from `strokeDasharray="3 3"` to `stroke="#f0eee9" strokeWidth={0.5}` with `vertical={false}` (horizontal lines only)
- `XAxis`: reduce tick count with `interval="preserveStartEnd"` or explicit tick positions; font-size 9px; fill `#b0b0b0`
- `YAxis`: font-size 9px; fill `#b0b0b0`; fewer ticks via `tickCount={4}`
- `Tooltip`: replace default with `<ChartTooltip />`
- `Legend`: remove unless `config.legend` has 2+ entries
- Add optional target reference line: dashed, accent color at 40% opacity

#### `DonutWidget`, `ProgressBarWidget`, `BigNumberWidget`, `PieBreakdownWidget`

- No structural changes, just ensure they respect the same tooltip and color conventions

#### `WidgetGrid`

- No changes needed — still used in admin views

#### `V2GoalDrillDown`

Major refactor:

- Remove `expandedGoalId` state, `LayoutGroup`, `AnimatePresence` for inline expand/collapse
- Add `selectedGoalId` state for full-width detail view toggle
- When `selectedGoalId` is null: render `GoalCardCollapsed` in 3-column grid
- When `selectedGoalId` is set: render `GoalDetailCard` full-width with back button
- Keep existing data fetching hooks unchanged (`useGoalsByPlan`, `useWidgetsByGoals`)
- Keep existing `Breadcrumb` component

### Components to Remove

- `ExpandedGoalCard` — replaced by `GoalDetailCard`
- `GoalCard` `isExpanded` prop and related expand/collapse logic

## Visual Design Tokens

All values use existing `--editorial-*` CSS custom properties. No new CSS variables needed.

### Card Styling

| Property          | Value                               |
| ----------------- | ----------------------------------- |
| Border radius     | 16px (`rounded-2xl`)                |
| Background        | `var(--editorial-surface)`          |
| Border            | `1px solid var(--editorial-border)` |
| Padding (desktop) | 24px                                |
| Padding (mobile)  | 16px                                |
| Hover shadow      | `0 4px 12px rgba(0,0,0,0.06)`       |

### Typography Scale

| Role                | Size | Weight | Color                        |
| ------------------- | ---- | ------ | ---------------------------- |
| KPI value           | 44px | 700    | `--editorial-text-primary`   |
| Goal title (detail) | 17px | 600    | `--editorial-text-primary`   |
| Goal title (card)   | 14px | 600    | `--editorial-text-primary`   |
| KPI value (card)    | 28px | 700    | `--editorial-text-primary`   |
| Meta/description    | 13px | 400    | `--editorial-text-secondary` |
| Labels              | 10px | 600    | `--editorial-text-muted`     |
| Annotation          | 11px | 400    | `--editorial-text-muted`     |

### Status Badge Colors

Reuse existing `INDICATOR_COLORS` map:
| Status | Background | Text |
|--------|-----------|------|
| Green / On Track | `#dcfce7` | `#16a34a` |
| Amber / Needs Attention | `#fef3c7` | `#d97706` |
| Red / Off Track | `#fee2e2` | `#dc2626` |
| Gray / Not Started | `#f3f4f6` | `#6b7280` |

### Chart Styling

| Property              | Value                                                  |
| --------------------- | ------------------------------------------------------ |
| Gridline stroke       | `#f0eee9`, width 0.5, horizontal only                  |
| Axis tick font        | 9px, fill `#b0b0b0`                                    |
| Primary series        | `var(--editorial-accent-primary)` / `config.colors[0]` |
| Area gradient         | accent color at 12% → 1% opacity                       |
| Target reference line | accent color, dashed `4 4`, 40% opacity                |
| Tooltip bg            | `var(--editorial-surface)`                             |
| Tooltip border        | `1px solid var(--editorial-border)`                    |
| Tooltip shadow        | `0 4px 12px rgba(0,0,0,0.08)`                          |

## Page Background

The page already uses `--editorial-bg: #faf9f7` as the layout background in the district layout. Cards use `--editorial-surface: #ffffff`. This creates the one-tone-above separation specified in the brief. No changes needed to the layout/page background.

## Responsiveness

### Breakpoints

- **Desktop (≥ 768px):** 3-column goal grid, KPI/chart side-by-side in detail view
- **Mobile (< 768px):** Single-column goal grid
- **Mobile (< 640px):** KPI panel stacks above chart in detail view, padding reduces to 16px

### Mobile-specific behavior

- Grid collapses to single column
- Detail view KPI panel: full-width block, `border-bottom` replaces `border-right`
- Chart panel: full-width, min-height 140px
- Sub-goal rows: unchanged (already single-column)
- Card padding: 16px

## Interaction Model

1. Page loads → grid of collapsed `GoalCardCollapsed` components
2. User clicks a card → `selectedGoalId` is set → grid is replaced by `GoalDetailCard`
3. User clicks "← Back to goals" → `selectedGoalId` is cleared → grid returns
4. User clicks a sub-goal row → navigates to `/goals/[childId]` (new page load, same component)
5. Browser back button works naturally (each drill-down is a route change for sub-goals, or local state for grid↔detail)

## Data Model

No changes to the data model. The redesign uses the same:

- `HierarchicalGoal` interface (`Goal` with `children: HierarchicalGoal[]`)
- `Widget` interface with `WidgetConfig`
- `useGoalsByPlan()`, `useWidgetsByGoals()` hooks
- `useDistrict()` for `primaryColor`

## Files Changed

| File                                                     | Action     | Description                                                       |
| -------------------------------------------------------- | ---------- | ----------------------------------------------------------------- |
| `src/views/v2/public/V2GoalDrillDown.tsx`                | **Modify** | Replace expand/collapse grid with two-state (grid / detail) model |
| `src/components/v2/public/GoalDetailCard.tsx`            | **Create** | New full-width KPI-split detail card                              |
| `src/components/v2/public/GoalCardCollapsed.tsx`         | **Create** | New simplified collapsed card                                     |
| `src/components/v2/widgets/ChartTooltip.tsx`             | **Create** | Shared styled Recharts tooltip                                    |
| `src/components/v2/widgets/renderers/AreaLineWidget.tsx` | **Modify** | Soften chart chrome, use ChartTooltip                             |
| `src/components/v2/widgets/renderers/BarChartWidget.tsx` | **Modify** | Soften chart chrome, use ChartTooltip                             |
| `src/components/v2/public/GoalCard.tsx`                  | **Remove** | Replaced by GoalCardCollapsed                                     |
| `src/components/v2/public/ExpandedGoalCard.tsx`          | **Remove** | Replaced by GoalDetailCard                                        |
| `src/components/v2/public/index.ts`                      | **Modify** | Update exports                                                    |

## Acceptance Criteria

- [ ] Main KPI identifiable within 1 second of seeing the detail view
- [ ] Chart is the visual focal point of the detail card
- [ ] Clear visual separation between header, KPI, chart, and sub-goals zones
- [ ] Status badge colors appear only in small pills, not large blocks
- [ ] Chart gridlines are faint, axis labels are sparse and small
- [ ] Custom tooltip replaces default Recharts tooltip
- [ ] Cards use 16px border radius
- [ ] Page background (#faf9f7) is visually distinct from card surface (#ffffff)
- [ ] Mobile layout stacks KPI above chart with generous spacing
- [ ] Grid collapses to single column on mobile
- [ ] Sub-goal rows are clickable and navigate to child goal pages
- [ ] Back button returns from detail view to grid
- [ ] All existing data fetching and display functionality preserved
- [ ] No regressions in the admin goal detail page (separate component)

## Out of Scope

- Admin goal detail page (`V2GoalDetail`) — separate component, not affected
- Widget builder / configuration UI
- Dark mode (no dark mode editorial palette exists yet)
- New chart types or data visualizations
- Changes to the data model or API
