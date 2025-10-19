# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

### UX Changes

#### Removed Click-to-Expand Interaction for Goal Metrics
**Date**: 2025-10-05
**Commit**: 8cbbe41

**Previous Behavior**:
- Users had to click on the PerformanceIndicator to expand and view metric visualizations
- Metrics were hidden by default in a collapsed state
- Required an additional click interaction to see metric data

**New Behavior**:
- Metrics automatically display when the slide panel opens
- No click required to view metric visualizations
- PerformanceIndicator no longer has an onClick handler
- Metrics appear immediately if data is available

**Rationale**:
- Reduces friction in the user experience
- Makes important metric data immediately visible
- Aligns with user expectations on public-facing dashboard
- Eliminates unnecessary interaction step

**Migration Notes**:
- Users who were accustomed to clicking to expand will now see metrics automatically
- This is a non-breaking visual change - no code migration required
- All metric data that was previously accessible is still accessible, just more prominently displayed

**Files Changed**:
- `src/pages/client/public/DistrictDashboard.tsx`
  - Removed `onClick` handler from PerformanceIndicator (line ~499)
  - Changed conditional rendering from `isExpanded &&` to always show metrics when available (line ~504)
  - Level 2 sub-goals now always display instead of requiring expansion (line ~530)

**Related Features**:
- Auto-display metrics on public page
- Likert scale visualization improvements
- District-level metric queries

---

## [Previous Releases]

### 2025-10-05 - Likert Scale Visualization
- Added dedicated LikertScaleChart component
- Implemented MetricsService.getByDistrict() for district-level metric queries
- Added duplicate save prevention in MetricBuilderWizard
- Enhanced debug logging for development
