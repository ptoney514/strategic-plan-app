# strataDASH - Design Brief & Product Overview

**Document Purpose**: Comprehensive design brief for UI/UX redesign
**Created**: 2025-11-16
**Status**: Production application seeking design refresh

---

## Product & Purpose

### What does strataDASH do?

**strataDASH** is a comprehensive strategic planning platform for educational districts and schools. It enables organizations to:

- **Create hierarchical strategic plans** with 3 levels:
  - Level 0: Strategic Objectives (top-level organizational goals)
  - Level 1: Goals (initiatives supporting each objective)
  - Level 2: Sub-goals (specific tactics and action items)

- **Track measurable outcomes** through flexible metrics:
  - Annual progress charts (line/bar charts)
  - Likert scale surveys (1-5 rating scales)
  - Single number displays (enrollment, ratios, percentages)
  - Narrative/blog-style updates
  - Custom visualizations

- **Monitor progress** with visual indicators:
  - Color-coded status badges (On Target, Off Track, Needs Attention)
  - Progress bars (percentage, qualitative, custom values)
  - Performance dashboards with real-time data

- **Manage multiple organizations**:
  - District-level strategic plans
  - Individual school plans under district umbrella
  - Multi-tenant architecture with role-based access

### Core Value Proposition

**For District Administrators**: Transform strategic planning from static PDF documents into living, data-driven dashboards that demonstrate accountability and progress to stakeholders.

**For Parents & Community**: Provide transparent, accessible insight into district priorities and achievements without needing to decipher lengthy planning documents.

**For Schools**: Align individual school goals with district objectives while maintaining autonomy and tracking unique metrics.

---

## Target Audience

### Primary Users: District Administrators

- **Role**: Superintendents, Assistant Superintendents, Planning Directors
- **Industry**: K-12 Education (Public School Districts)
- **Technical Expertise**: Low to Medium
  - Comfortable with Microsoft Office Suite (Excel, Word)
  - May not be familiar with SaaS dashboards
  - Appreciate simple, guided workflows
  - Need clear visual feedback
- **Pain Points**:
  - Current admin interface feels confusing with multiple pathways (Goals vs Objectives pages)
  - Too many clicks to accomplish basic tasks
  - Unclear hierarchy between objectives, goals, and sub-goals
  - Excel import wizard is powerful but overwhelming
  - Metric builder is complex for non-technical users

### Secondary Users: School Administrators

- **Role**: Principals, Assistant Principals
- **Industry**: Individual K-12 Schools
- **Technical Expertise**: Similar to district admins
- **Needs**: Same admin interface, just scoped to their school

### Tertiary Users: Parents & Public

- **Role**: Community members, parents, taxpayers, board members
- **Technical Expertise**: Varies widely (design for lowest common denominator)
- **Pain Points**:
  - Current public view is functional but uninspiring
  - Lacks modern web aesthetics (no animations, static layout)
  - Doesn't evoke trust or confidence visually
  - Missing "wow factor" that demonstrates innovation

---

## Main Features & User Workflows

### Most-Used Admin Features (by frequency)

1. **Goal Management** (AdminGoals.tsx)
   - View hierarchical goal tree (3 levels deep)
   - Expand/collapse objectives to see child goals
   - Edit goal details (title, description, progress)
   - Add metrics to track progress
   - Preview public view
   - **Current Issues**: Overwhelming for first-time users, unclear visual hierarchy

2. **Objective Builder** (ObjectiveBuilder.tsx)
   - Wizard-style interface for creating new strategic objectives
   - Multi-step form with validation
   - **Current State**: Good UX pattern, but visual design is basic

3. **Metric Builder** (MetricBuilderWizard component)
   - Choose metric type (chart, narrative, number, Likert scale)
   - Configure visualization settings
   - Enter data points
   - Preview live visualization
   - **Current Issues**: Complex for non-technical users, needs better onboarding

4. **Dashboard** (AdminDashboard.tsx)
   - Quick stats (objectives count, goals count, metrics count)
   - Quick action cards (Create Objective, Manage Goals, etc.)
   - **Current State**: Very basic, feels like placeholder UI

5. **Import Wizard** (ImportWizard.tsx)
   - Excel template download
   - Bulk data upload
   - Column mapping interface
   - **Current State**: Functional but intimidating

### Most-Used Public Features

1. **District Dashboard** (DistrictDashboard.tsx)
   - Hero section with district name
   - Grid of strategic objective cards
   - Click to expand and see child goals
   - Slide panel with detailed metrics
   - **Current Issues**: Static, lacks visual appeal, no animations

2. **Goal Detail View** (SlidePanel component)
   - Shows objective details
   - Lists child goals with progress indicators
   - Displays metric visualizations (charts, narratives)
   - **Current State**: Clean but generic

---

## Desired User Experience

### What feeling should the app evoke?

**For District Admins:**

- **Confident**: "I can manage our strategic plan without IT help"
- **Efficient**: "I can update progress in minutes, not hours"
- **Professional**: "This makes us look like a forward-thinking district"
- **In Control**: "I understand exactly what this button will do"

**For Parents & Public:**

- **Trustworthy**: "This district is transparent and accountable"
- **Impressive**: "Wow, they're really on top of their goals"
- **Accessible**: "I can understand our district's priorities at a glance"
- **Modern**: "This district embraces innovation"

---

## Brand Personality

### 3-5 Adjectives Describing strataDASH

1. **Data-driven** - Decisions backed by metrics, not just narratives
2. **Transparent** - Open access to strategic plans for public accountability
3. **Approachable** - Educational jargon-free, designed for non-technical users
4. **Professional** - Serious tool for serious planning, not a toy
5. **Progressive** - Forward-thinking districts use modern tools

### What Makes strataDASH Different?

**vs. Competitors (e.g., Tableau, Power BI, Smartsheet):**

- **Education-specific**: Built FOR schools, not adapted from corporate tools
- **Hierarchical goal structure**: Purpose-built for strategic planning frameworks (3 levels)
- **Public transparency**: Not just internal dashboards - designed for community engagement
- **Flexible metrics**: Mix quantitative (charts) and qualitative (narratives) seamlessly
- **Multi-tenant**: District + Schools in one unified platform
- **Accessible**: No training required for public viewers

**vs. Traditional Methods (PDF strategic plans):**

- **Living document**: Updates in real-time, not once per year
- **Visual storytelling**: Charts and progress bars instead of dense text
- **Searchable**: Find goals and metrics instantly
- **Always accessible**: Cloud-based, no downloading PDFs

---

## Existing Brand Identity

### Current Color Palette

**Primary Colors:**

```css
Primary: Blue (#3b82f6 to #2563eb) - Used for primary actions, admin branding
Background: Slate/Neutral 50 (#f9fafb) - Main background
Foreground: Neutral 900 (#171717) - Text
```

**Status Colors:**

```css
Success/On-Track: Emerald (#10b981) - Goals meeting targets
Warning/Off-Track: Amber to Red (#f59e0b to #dc2626) - Goals needing attention
```

**UI Neutrals:**

```css
Card: White (#ffffff)
Border: Gray 200 (#e5e7eb)
Muted Text: Gray 600 (#4b5563)
```

### Typography

- **System**: Uses browser defaults (no custom font loaded)
- **Current State**: Basic, no distinctive typeface
- **Recommendation Needed**: Should we establish a custom font stack?

### Logo & Branding

- **Current**: "SP" initials in blue gradient circle (placeholder)
- **District Branding**: Each district can customize:
  - Primary color
  - Secondary color
  - Logo upload
  - Custom header colors for goals

**Status**: **No established brand identity** - we're starting fresh for strataDASH branding, while allowing district customization.

---

## Aesthetic Direction

### Current State Assessment

#### What's Specifically Poor About Current Design?

**Admin Interface Issues:**

1. **Visual Hierarchy**: Everything feels the same importance
   - Stats cards, action cards, navigation all blend together
   - No clear primary action or focal point
   - Text sizes too similar throughout

2. **Typography**: Inconsistent and uninspiring
   - Headings don't have enough weight/contrast
   - Line heights feel cramped
   - No typographic scale or rhythm

3. **Colors**: Safe but boring
   - Gray-heavy (too much neutral)
   - Blue accent feels generic (every SaaS app uses blue)
   - Success/error states are standard but lack personality
   - No gradient usage beyond the placeholder logo

4. **Spacing**: Functional but unrefined
   - Tailwind defaults used without customization
   - Some areas feel cramped, others feel sparse
   - No consistent spacing scale specific to our brand

5. **Layout**: Boxy and rigid
   - Everything is rectangles with rounded corners
   - No variation in card styles
   - Grid layouts are predictable
   - Missing visual interest (no illustrations, icons are stock Lucide)

6. **Interactions**: Minimal feedback
   - Hover states are basic (bg-gray-50)
   - No micro-animations
   - No loading state animations beyond spinners
   - Slide panel is functional but not delightful

7. **Navigation Confusion**:
   - "Goals" vs "Objectives" terminology unclear
   - Multiple versions exist (AdminGoals.tsx vs AdminGoalsV2.tsx)
   - User doesn't know which path to take for common tasks

**Public Interface Issues:**

1. **Static & Lifeless**: No animations, transitions, or movement
2. **Generic Hero**: Standard centered text over white background
3. **Predictable Grid**: 2-column card grid is functional but uninspired
4. **Missing Delight**: No illustrations, branded graphics, or visual storytelling
5. **Mobile Experience**: Responsive but not mobile-optimized

#### Screenshots

_(User mentioned they can share - we don't have them yet)_

---

## Design Direction Questions for User

### Inspiration & References

**Question 8: What SaaS apps or websites do you admire aesthetically?**

We need your input on which direction resonates:

**Option A: Clean & Minimal** (Stripe, Linear, Vercel)

- Lots of white space
- Subtle shadows and borders
- Typography-focused
- Minimal color usage
- Fast, performant feel

**Option B: Bold & Vibrant** (Notion, Figma, Airtable)

- Colorful accent usage
- Playful illustrations
- Gradient backgrounds
- Interactive elements
- Friendly, approachable tone

**Option C: Professional & Corporate** (Salesforce, Microsoft 365, Oracle)

- Structured layouts
- Muted color palette
- Dense information display
- Traditional navigation patterns
- Enterprise-grade feel

**Option D: Dark & Technical** (GitHub, Vercel, Railway)

- Dark mode-first
- Code-like aesthetic
- Technical sophistication
- High contrast
- Developer-focused

**Option E: Data-Focused & Analytical** (Tableau, Power BI, Mixpanel)

- Chart and graph emphasis
- Dashboard-centric
- High information density
- Color for data meaning
- Executive presentation feel

**Our Recommendation**: We lean toward **Option A (Clean & Minimal)** with elements of **Option B (Bold accent colors)** for status indicators. Education audiences appreciate clarity and simplicity, but we need visual interest to avoid appearing generic.

---

### Color Direction

**Question 9: Colors to embrace or avoid?**

**Candidates for Primary Palette:**

- **Blue** (current): Trustworthy, professional, but generic
- **Teal/Cyan**: Modern, fresh, less common in education
- **Indigo/Purple**: Creative, innovative, differentiating
- **Green**: Growth-focused, positive, but conflicts with success indicators
- **Orange**: Energetic, bold, uncommon in SaaS

**Status Colors** (likely keep):

- **Success**: Emerald green (industry standard, works well)
- **Warning**: Amber (appropriate for "needs attention")
- **Error**: Red (critical issues)
- **Info**: Blue or Cyan (neutral information)

**Colors to Avoid:**

- Overly bright neons (unprofessional for education)
- Brown/beige (dated, uninspiring)
- Pure black (#000000) for text (too harsh)

**Question for User**:

- Do you have district brand colors we should align with?
- Any competitor colors to avoid?
- Any emotional associations with specific colors in education?

---

### Visual Style Preference

**Question 10: Which style resonates most?**

**We're considering a hybrid approach:**

**Foundation: Clean & Minimal (Stripe, Linear)**

- White/light backgrounds
- Generous white space
- Subtle shadows (`shadow-xs`, not `shadow-xl`)
- Border-focused over shadow-focused
- Typography hierarchy with clear scale
- Fast, snappy animations

**Accents: Bold & Vibrant (Notion, Figma)**

- Colorful status indicators (not just green/red)
- Gradient backgrounds for hero sections
- Illustrated empty states (vs generic icons)
- Playful micro-interactions
- Branded graphic elements

**Data: Analytical (Tableau)**

- Chart-first metric displays
- Clear data visualization hierarchy
- Color used for meaning, not decoration
- Dashboard-style layouts for admins

**Does this hybrid approach align with your vision?**

---

## Proposed Design Principles

### 1. **Clarity Over Cleverness**

Admin users need to accomplish tasks quickly. No hidden navigation, no mystery meat icons, no ambiguous labels.

**Example**: "Create New Objective" button (clear) vs "+" button (ambiguous)

### 2. **Progressive Disclosure**

Show the minimum needed to make a decision, reveal details on demand.

**Example**: Goal cards show title + status + progress, expand to show metrics/narratives.

### 3. **Consistent Mental Models**

Use familiar patterns from other SaaS tools (dashboards, slide panels, wizards).

**Example**: Slide panels for details (like Linear, Notion) vs modal popups.

### 4. **Accessible by Default**

WCAG 2.1 Level AA compliance is non-negotiable.

**Example**: 4.5:1 color contrast for text, keyboard navigation, screen reader support.

### 5. **Performance is a Feature**

Fast load times and snappy interactions build trust.

**Example**: Skeleton loaders during data fetching, optimistic UI updates.

---

## Technical Considerations for Designer

### Design System & Component Library

**Current State:**

- Using Tailwind CSS utility classes
- Custom CSS variables for theming
- Lucide icons (basic, no custom icon set)
- No component library (built custom with React)

**Options for Design Refresh:**

**Option A: shadcn/ui Components** (Recommended)

- Pre-built accessible components
- Customizable with Tailwind
- Matches "Clean & Minimal" aesthetic
- Easy for developers to implement
- Examples: Stripe, Vercel, Linear use similar patterns

**Option B: Custom Design System**

- Fully branded, unique look
- More design/dev work
- Total control over every detail

**Option C: Existing UI Library** (Material UI, Chakra, Ant Design)

- Faster implementation
- Risk of looking generic
- Harder to customize deeply

**Recommendation**: Use **shadcn/ui as foundation**, customize colors/typography/spacing to create strataDASH brand.

### Animation Library

**Options:**

- **Framer Motion**: Industry standard for React (recommended)
- **GSAP**: Powerful but heavier bundle size
- **CSS Animations**: Lightweight, good browser support
- **React Spring**: Physics-based animations

**Recommendation**: **Framer Motion** for micro-interactions + page transitions, **CSS animations** for simple hover states.

### Illustration Style

**Current State**: No illustrations (using Lucide icons only)

**Needs:**

- Empty state illustrations (no goals created yet)
- Error state illustrations (404, network errors)
- Onboarding illustrations (welcome to strataDASH)
- Feature spotlights (metric types, import wizard)

**Style Options:**

- **Line art** (clean, minimal, scales well)
- **Isometric** (modern, dimensional, professional)
- **Abstract shapes** (bold, colorful, contemporary)
- **Character-based** (friendly, approachable, human)

**Question for User**: Do you have illustration preferences or existing assets?

---

## Specific Design Challenges

### Challenge 1: Simplifying Admin Navigation

**Problem**: Users confused by multiple pathways to manage content.

**Current State**:

- Sidebar: Dashboard, Goals, Schools, Import Data, Branding, Activity Log
- "Goals" page shows ALL goals in tree view (complex)
- "Objectives" route also exists (duplicate? different?)
- Multiple versions (AdminGoals.tsx vs AdminGoalsV2.tsx in codebase)

**Design Question**:
Should we consolidate to a single "Strategic Plan" management page with tabs/sections?

- Tab 1: Objectives (Level 0)
- Tab 2: Goals (Level 1)
- Tab 3: Sub-goals (Level 2)

Or keep hierarchical tree view but improve visual clarity?

### Challenge 2: Metric Builder Complexity

**Problem**: Non-technical users struggle with configuration options.

**Current State**:

- Choose metric type: Chart, Number, Narrative, Likert Scale
- Each type has 5-10 configuration fields
- Data entry varies by type (annual data points, single number, text editor)
- Preview updates live but feels disconnected from form

**Design Question**:
Should we create type-specific wizards with contextual help? Or simplify to 2-3 "template" metrics with minimal configuration?

### Challenge 3: Public View Engagement

**Problem**: Public view is functional but doesn't inspire engagement.

**Current State**:

- Simple hero: District name + "Strategic Plan 2021-2026"
- 2-column grid of objective cards
- Click to open slide panel with details
- Footer with links

**Design Opportunity**:

- Add animated hero section (subtle motion graphics)
- Staggered card entrance animations
- Progress visualizations on card hover
- Interactive timeline (show multi-year progress)
- Featured metrics/success stories section
- Call-to-action (learn more, contact us, view schools)

**Question for User**: What's the primary goal of the public view?

- Information transparency (current focus)
- Community engagement (feedback, comments)
- Marketing/recruitment (attract families to district)
- Board/stakeholder reporting (executive summary view)

---

## Next Steps

### Information Needed from User

1. **Visual Inspiration**:
   - Share 3-5 websites/apps you admire aesthetically
   - Explain what you like about each (layout, colors, animations, etc.)

2. **Color Preferences**:
   - Any existing brand colors for strataDASH?
   - Colors to avoid (competitor colors, negative associations)?
   - Preference for warm (orange, red) vs cool (blue, teal) tones?

3. **Visual Style**:
   - Lean minimal or add vibrant accents?
   - Prefer subtle elegance or bold statements?
   - Professional/corporate vs friendly/approachable balance?

4. **Priority Features** for redesign:
   - Admin dashboard (first impression)
   - Public district view (stakeholder-facing)
   - Metric builder (complex workflow)
   - Navigation/information architecture

5. **Timeline & Constraints**:
   - Any deadlines (board presentations, new school year launch)?
   - Budget constraints affecting scope?
   - Must-have vs nice-to-have improvements?

### Proposed Design Deliverables

**Phase 1: Foundation** (1-2 weeks)

- [ ] Brand identity (colors, typography, logo refinement)
- [ ] Design system documentation (component library)
- [ ] UI pattern library (buttons, cards, forms, navigation)
- [ ] Accessibility guidelines

**Phase 2: Public View Redesign** (1-2 weeks)

- [ ] District dashboard redesign (hero, objective cards, animations)
- [ ] Goal detail slide panel redesign
- [ ] Mobile-optimized layouts
- [ ] Interactive prototypes (Figma)

**Phase 3: Admin Interface Redesign** (2-3 weeks)

- [ ] Admin dashboard redesign
- [ ] Goal management redesign (navigation simplification)
- [ ] Metric builder wizard redesign
- [ ] Settings/branding page redesign

**Phase 4: Refinement** (1 week)

- [ ] User testing feedback incorporation
- [ ] Animation polish
- [ ] Developer handoff documentation
- [ ] Design QA during implementation

---

## Appendix: Technical Context

### Current Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS 3.x
- **State**: Zustand (global), React Query (server state)
- **Database**: Supabase (PostgreSQL)
- **Charts**: Recharts library
- **Icons**: Lucide React

### Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Android)
- No IE11 support needed

### Performance Budgets

- Bundle size: <600KB gzipped (currently 480KB)
- Time to Interactive: <2s
- Lighthouse Score: >90

### Accessibility Requirements

- WCAG 2.1 Level AA compliance
- Keyboard navigation for all interactive elements
- Screen reader support (ARIA labels)
- Color contrast: 4.5:1 for text, 3:1 for UI elements
- Focus indicators (never remove focus outlines)

---

**Document Status**: Draft - Awaiting user feedback on questions
**Last Updated**: 2025-11-16
**Next Review**: After user provides design direction answers
