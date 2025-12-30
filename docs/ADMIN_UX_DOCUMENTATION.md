# Strategic Plan Builder - Admin Interface UX Documentation

**Purpose:** This document describes the current admin interface for the Strategic Plan Builder application. It is intended for designers to understand the existing functionality, data hierarchy, and user flows before redesigning for improved usability.

**Current State:** Features are complete and functional, but the user experience needs optimization for clarity, efficiency, and ease of use.

---

## Table of Contents

1. [Application Overview](#application-overview)
2. [Data Hierarchy](#data-hierarchy)
3. [Navigation Structure](#navigation-structure)
4. [Screen-by-Screen Breakdown](#screen-by-screen-breakdown)
5. [Current User Flows](#current-user-flows)
6. [Known UX Pain Points](#known-ux-pain-points)
7. [Feature Inventory](#feature-inventory)

---

## Application Overview

The Strategic Plan Builder is a web application for educational districts to create, manage, and publish strategic plans. District administrators use the admin interface to:

- Create and organize strategic objectives (high-level goals)
- Add supporting goals and sub-goals under each objective
- Attach measurable metrics to track progress
- Import bulk data from Excel spreadsheets
- Manage schools within the district
- Configure branding and visual settings

The admin interface powers a public-facing dashboard where community stakeholders can view the district's strategic plan progress.

---

## Data Hierarchy

The application uses a **three-level hierarchical structure**:

```
District
└── Strategic Objective (Level 0)
    ├── Goal (Level 1)
    │   ├── Sub-Goal (Level 1.1)
    │   │   └── Metrics/Measures
    │   └── Sub-Goal (Level 1.2)
    │       └── Metrics/Measures
    └── Goal (Level 2)
        └── Metrics/Measures
```

### Numbering Convention

| Level | Example | Description |
|-------|---------|-------------|
| Strategic Objective | `1`, `2`, `3` | Top-level strategic priorities |
| Goal | `1.1`, `1.2`, `2.1` | Supporting goals under an objective |
| Sub-Goal | `1.1.1`, `1.1.2` | Granular goals under a parent goal |

### Entity Relationships

- **Strategic Objective** → Has many Goals
- **Goal** → Has many Sub-Goals (optional)
- **Goal/Sub-Goal** → Has many Metrics/Measures

---

## Navigation Structure

### Sidebar Navigation

```
DISTRICT NAME
District Admin

─────────────────────
📊 Dashboard

CONTENT
├── 🎯 Goals
├── 🏫 Schools
└── 📄 Import Data

SETTINGS
├── 🎨 Branding
└── 📈 Activity Log
─────────────────────

[Admin dropdown - top right]
```

### Primary Actions

| Screen | Primary Action |
|--------|----------------|
| Goals | "Create Strategic Objective" button |
| Schools | "Add New School" button |
| Import Data | File upload / "Download Template" |
| Branding | Save settings |

---

## Screen-by-Screen Breakdown

### 1. Goals List View (`/admin/goals`)

**Purpose:** Display all strategic objectives and their nested goals in a hierarchical list.

**Layout:** Single-column expandable list with action buttons

**Components:**

| Element | Description |
|---------|-------------|
| Page Header | "Strategic Objectives & Goals" with subtitle |
| Action Buttons | "Reorder Goals" and "+ Create Strategic Objective" |
| Table Header | "Strategic Objectives and Goals" / "Actions" columns |
| Objective Row | Expandable row showing objective title, description, and icons (view/edit/delete) |
| Goal Row | Indented row under objective with edit icon and "Add Measure" button |
| Sub-Goal Row | Further indented row under goal |

**Interaction Patterns:**
- Click chevron (▶/▼) to expand/collapse objectives and goals
- Click eye icon to preview public view
- Click pencil icon to edit
- Click trash icon to delete
- Click "Add Measure" to attach a metric to a goal

**Current Issues:**
- Long descriptions truncate without clear indication
- No visual distinction between goal levels beyond indentation
- "Add Measure" button only appears on some rows (unclear logic)
- Reorder functionality separate from main list

---

### 2. Create/Edit Strategic Objective (`/admin/objectives/new` or `/admin/objectives/:id/edit`)

**Purpose:** Build or modify a strategic objective with its associated goals and visual settings.

**Layout:** Three-panel layout

```
┌─────────────────┬──────────────────────────┬─────────────────┐
│   Goals Panel   │   Objective Builder      │ Active          │
│   (Left)        │   (Center)               │ Components      │
│                 │                          │ (Right)         │
└─────────────────┴──────────────────────────┴─────────────────┘
```

#### Left Panel: Goals

| Element | Description |
|---------|-------------|
| Header | "Goals" with "Add goals to this objective" subtitle |
| Add Button | "+ Add New Goal" - blue outlined button |
| Goals List | Numbered goals (1.1, 1.2) with status badges |
| Goal Card | Shows: number, status badge, title preview, metric count |
| Sub-Goals | Expandable section under each goal showing sub-goals |

**Goal Card Details:**
- Status badge (e.g., "On Target", "Great!") with color coding
- Metric count indicator
- Nested metrics list (type indicators: bar, number, blog)

#### Center Panel: Objective Builder

| Element | Description |
|---------|-------------|
| Section Header | Drag handle + "Strategic Objective" label |
| Title Field | Large text input with character count (X/200) |
| Description | Textarea with character count (X/2000) |
| Progress Preview | Slider to preview progress bar appearance (0-100%) |
| Visual Badge | Text input + color picker (green/blue options) |

**Form Fields:**
- Objective Title (required, max 200 chars)
- Description (optional, max 2000 chars)
- Overall Progress (preview only, calculated from goals)
- Badge Text (e.g., "On Target", "Priority")
- Badge Color (green or blue selector)

#### Right Panel: Active Components

| Element | Description |
|---------|-------------|
| Header | "Active Components" with visibility toggle |
| Toggle List | On/off switches for each component |
| Component Indicators | Green dot = enabled, gray = disabled |
| Goals Summary | Count of attached goals with list |

**Toggleable Components:**
- Title (shows current value preview)
- Description (shows preview)
- Header Visual (shows URL)
- Progress Bar (Enabled/Disabled)
- Visual Badge (shows current badge text)

**Goals Section (bottom of right panel):**
- Goal count badge
- Draggable goal list with delete (trash) icons
- "Ready to save?" prompt

**Header Actions:**
- Cancel button
- "Save & Publish" button (blue, primary)

---

### 3. Schools Management (`/admin/schools`)

**Purpose:** Manage schools within the district (future feature for school-level strategic plans).

**Layout:** Stats cards + search + data table

**Components:**

| Element | Description |
|---------|-------------|
| Stats Cards | 3 cards showing Total Schools, Total Students, Avg Students/School |
| Search Bar | Filter by name, principal, or description |
| Data Table | Columns: School Name, Principal, Students, Status, Actions |
| Empty State | "No schools found" message |
| Info Note | Blue callout explaining school-level permissions |

**Current State:** Feature scaffolded but no schools added yet.

---

### 4. Import Data (`/admin/import`)

**Purpose:** Bulk import strategic plan data from Excel spreadsheets.

**Layout:** Multi-step wizard

**Steps:**
1. **Upload** - File selection
2. **Review** - Preview imported data
3. **Import** - Processing
4. **Complete** - Success confirmation

**Upload Step Components:**

| Element | Description |
|---------|-------------|
| Step Indicator | Numbered circles (1-4) with labels |
| Drop Zone | Large dashed area for drag-and-drop |
| File Support | ".xlsx and .xls files" note |
| Template Section | "Need a template?" card with download button |
| Format Guide | Blue info box listing expected column format |

**Expected Excel Format:**
- Column 1: Goal hierarchy (e.g., [1.1.1])
- Column 2: Goal name/title
- Column 3: Owner name
- Column 4: Measure/metric description
- Remaining columns: Time-series data with date headers

---

### 5. Branding (`/admin/branding`)

**Purpose:** Customize district branding and visual appearance.

*(Not shown in screenshots - needs documentation)*

---

### 6. Activity Log (`/admin/activity`)

**Purpose:** View audit trail of changes made to the strategic plan.

*(Not shown in screenshots - needs documentation)*

---

## Current User Flows

### Flow 1: Create a New Strategic Plan from Scratch

```
1. Login → Admin Dashboard
2. Navigate to Goals
3. Click "Create Strategic Objective"
4. Enter objective title and description
5. Configure visual components (badge, progress bar)
6. Click "Add New Goal" in left panel
7. Fill in goal details
8. Optionally add sub-goals
9. Click "Add Measure" to attach metrics
10. Save & Publish
11. Repeat for additional objectives
```

**Pain Points:**
- Must create objective before adding goals (no batch creation)
- Cannot see full hierarchy while editing
- No way to duplicate existing objectives/goals
- Progress calculated automatically but not immediately clear how

### Flow 2: Import Existing Strategic Plan

```
1. Download Excel template
2. Fill in data following column format
3. Navigate to Import Data
4. Upload file (drag-drop or browse)
5. Review parsed data
6. Confirm import
7. Verify in Goals list
```

**Pain Points:**
- Template format requires specific hierarchy notation
- No preview of how data will appear before final import
- Error handling unclear for malformed data

### Flow 3: Update Goal Progress

```
1. Navigate to Goals
2. Expand objective to find goal
3. Click edit on goal
4. Navigate to associated metric
5. Update metric value
6. Save changes
```

**Pain Points:**
- Multiple clicks to reach metric entry
- No quick-edit or inline editing
- Must drill down through hierarchy

---

## Known UX Pain Points

### Navigation & Hierarchy
- [ ] Difficult to understand three-level hierarchy at a glance
- [ ] No breadcrumb navigation when editing nested items
- [ ] Expanding/collapsing is the only way to see structure
- [ ] Can't drag-and-drop to reorder in main list view

### Form Experience
- [ ] Three-panel layout on create/edit may be overwhelming
- [ ] Right panel "Active Components" purpose unclear
- [ ] Visual badge options limited (only 2 colors)
- [ ] Character count helpful but takes visual space

### Data Entry
- [ ] No inline editing on list view
- [ ] Adding measures requires navigating away from goal
- [ ] No bulk operations (delete multiple, move multiple)
- [ ] No copy/duplicate functionality

### Visual Design
- [ ] Status badges inconsistent ("On Target" vs "Great!")
- [ ] Indentation as only hierarchy indicator is subtle
- [ ] Delete confirmation not always present
- [ ] Empty states could be more helpful

### Mobile/Responsive
- [ ] Three-panel layout doesn't work on mobile
- [ ] Sidebar navigation takes significant space
- [ ] Touch targets may be too small

---

## Feature Inventory

### Implemented Features

| Feature | Status | Notes |
|---------|--------|-------|
| Create Strategic Objective | ✅ Complete | Three-panel builder |
| Edit Strategic Objective | ✅ Complete | Same as create |
| Delete Objective | ✅ Complete | With confirmation |
| Add Goals | ✅ Complete | Via builder left panel |
| Add Sub-Goals | ✅ Complete | Nested under goals |
| Reorder Goals | ✅ Complete | Separate reorder mode |
| Add Metrics/Measures | ✅ Complete | Multiple metric types |
| Excel Import | ✅ Complete | 4-step wizard |
| Template Download | ✅ Complete | Pre-formatted Excel |
| Schools Management | 🟡 Scaffolded | UI complete, no data |
| Branding Settings | ✅ Complete | Not shown |
| Activity Log | ✅ Complete | Not shown |
| Visual Badge | ✅ Complete | Text + color |
| Progress Bar | ✅ Complete | Auto-calculated |
| Header Images | ✅ Complete | Via URL |

### Metric Types Supported

| Type | Description | Visualization |
|------|-------------|---------------|
| Number | Single numeric value | Text display |
| Percentage | 0-100% value | Progress bar |
| Bar Chart | Multi-value comparison | Bar visualization |
| Likert Scale | Survey-style ratings | Scale display |
| Link/Blog | URL or text content | Link display |
| Narrative | Long-form text | Text block |

---

## Technical Notes for Designer

### Framework & Styling
- Built with React + TypeScript
- Styled with Tailwind CSS
- Component library: Custom components (no UI kit)
- Icons: Lucide React

### Responsive Breakpoints
- Desktop: 1024px+
- Tablet: 768px - 1023px
- Mobile: < 768px

### Color Palette
- Primary Blue: `#3B82F6` (buttons, links)
- Success Green: `#22C55E` (status badges)
- Background: `#F9FAFB` (light gray)
- Text: `#111827` (near black)
- Border: `#E5E7EB` (light gray)

---

## Questions for Redesign

1. **Hierarchy Visualization:** How might we better visualize the three-level structure without overwhelming users?

2. **Progressive Disclosure:** Should we simplify the create flow and hide advanced options (badges, header images) behind an "advanced" toggle?

3. **Bulk Operations:** What bulk actions would save administrators the most time?

4. **Mobile Priority:** Is mobile admin access important, or is this primarily a desktop tool?

5. **Onboarding:** Should there be a guided setup wizard for first-time users?

6. **Metrics Entry:** Can we streamline the metric update flow for regular data entry?

---

*Document created: December 2024*
*For questions, contact the development team.*
