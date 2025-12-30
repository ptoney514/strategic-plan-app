/**
 * ObjectiveBuilder Module
 *
 * This module contains the ObjectiveBuilder component and its supporting utilities.
 *
 * REFACTORING PLAN (incremental):
 * ================================
 * The ObjectiveBuilder.tsx is currently 2,049 lines. Target: <200 lines per file.
 *
 * Phase 1 (Complete):
 * - [x] Extract types to types.ts
 * - [x] Extract validation to validation.ts
 *
 * Phase 2 (TODO):
 * - [ ] Extract GoalModal component (~300 lines)
 * - [ ] Extract PropertyEditModal component (~200 lines)
 * - [ ] Extract MetricSection component (~150 lines)
 *
 * Phase 3 (TODO):
 * - [ ] Extract useObjectiveBuilder hook (state + business logic ~400 lines)
 * - [ ] Extract CenterCanvas component (~350 lines)
 * - [ ] Extract ComponentLibrary component (~250 lines)
 * - [ ] Extract ActiveComponentsPanel component (~150 lines)
 *
 * Final Structure:
 * objective-builder/
 * ├── index.ts              - Re-exports
 * ├── types.ts              - Type definitions
 * ├── validation.ts         - Validation utilities
 * ├── useObjectiveBuilder.ts - Custom hook for state/logic
 * ├── ObjectiveBuilder.tsx  - Main component (~200 lines)
 * ├── components/
 * │   ├── CenterCanvas.tsx
 * │   ├── ComponentLibrary.tsx
 * │   ├── ActiveComponentsPanel.tsx
 * │   ├── GoalModal.tsx
 * │   ├── PropertyEditModal.tsx
 * │   └── MetricSection.tsx
 */

export * from './types';
export * from './validation';
