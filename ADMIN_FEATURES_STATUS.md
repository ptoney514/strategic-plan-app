# Admin Interface - Current Status & Next Steps

**Last Updated**: 2025-09-30
**Branch**: develop
**Phase**: Admin Interface Cleanup (85% Complete)

---

## 📊 Admin Interface Overview

The admin interface provides district administrators with powerful tools to manage strategic plan data, override calculated statuses, and perform bulk data entry operations.

### Admin Routes
- `/[slug]/admin` - Admin Dashboard
- `/[slug]/admin/goals` - Goals & Status Management
- `/[slug]/admin/metrics` - Metrics Data Entry
- `/[slug]/admin/audit` - Audit Trail (UI not implemented yet)

---

## ✅ Implemented Features

### 1. Admin Dashboard (`AdminDashboard.tsx`)
**Status**: 90% Complete - Display Only

**Features Working**:
- ✅ Status summary cards (on-target, at-risk, critical, not-started)
- ✅ Quick action buttons with links
- ✅ Goals needing attention list
- ✅ Metrics updates due list
- ✅ Data health indicators
- ✅ Completeness percentage calculation
- ✅ Status overrides counter

**What's Missing**:
- ❌ No data persistence (read-only)
- ❌ Last import date is hardcoded
- ❌ No actual import functionality

### 2. Goals & Status Management (`AdminGoals.tsx`)
**Status**: 85% Complete - UI Complete, Save Missing

**Features Working**:
- ✅ Hierarchical goal display with expand/collapse
- ✅ Status icons and badges
- ✅ Metrics progress summary per goal
- ✅ Calculated vs current status comparison
- ✅ Status override modal trigger
- ✅ Manual override indicator

**What's Missing**:
- ❌ Save functionality not connected to database
- ❌ "Save All Changes" button does nothing
- ❌ Status updates not persisted

### 3. Status Override Manager (`StatusManager.tsx`)
**Status**: 95% Complete - Full UI, Save Hook Missing

**Features Working**:
- ✅ Status selection with visual indicators
- ✅ System recommendation display
- ✅ Override reason category selection
- ✅ Detailed justification textarea
- ✅ Validation (minimum 50 characters)
- ✅ Confidence score display
- ✅ Visual distinction between calculated and selected status

**What's Missing**:
- ❌ `onSave` callback not implemented in parent
- ❌ No API call to save override to database
- ❌ No audit trail creation

**Expected Behavior**:
```typescript
onSave: async (status: string, reason: string) => {
  // Should save to spb_goals table:
  // - status
  // - status_source = 'manual'
  // - status_override_reason
  // - status_override_by (user_id)
  // - status_override_at (timestamp)

  // Should trigger spb_status_overrides insert via trigger
}
```

### 4. Metrics Data Management (`AdminMetrics.tsx`)
**Status**: 80% Complete - UI Complete, Save Missing

**Features Working**:
- ✅ Goal filter dropdown
- ✅ Period selection
- ✅ Grid view / List view toggle
- ✅ BulkDataEntry component integration
- ✅ Export template button (UI only)
- ✅ Import data button (UI only)
- ✅ Data validation warnings

**What's Missing**:
- ❌ Save All functionality not implemented
- ❌ Export template not generating CSV
- ❌ Import modal not created
- ❌ No time series data support yet

### 5. Bulk Data Entry Grid (`BulkDataEntry.tsx`)
**Status**: 90% Complete - Full Featured UI, Save Missing

**Features Working**:
- ✅ Excel-like editable grid
- ✅ Current value and target value editing
- ✅ Real-time progress calculation
- ✅ Visual indicators (changed cells highlighted)
- ✅ Data validation (variance warnings)
- ✅ YTD change display with trend icons
- ✅ Grouped by goal
- ✅ Unsaved changes indicator

**What's Missing**:
- ❌ `handleSaveAll` not implemented
- ❌ No batch update to database
- ❌ No optimistic updates

**Expected Behavior**:
```typescript
handleSaveAll: async () => {
  const changedEntries = Array.from(dataEntries.values())
    .filter(e => e.hasChanges);

  // Batch update spb_metrics table for each changed entry
  // Should also create metric_time_series records
  // Should update ytd_change and other calculated fields
}
```

### 6. Admin Layout (`AdminLayout.tsx`)
**Status**: 100% Complete

**Features Working**:
- ✅ Admin mode indicator banner
- ✅ Sidebar navigation
- ✅ Quick actions menu
- ✅ "View Public Site" link
- ✅ Auth check (placeholder - needs real auth)
- ✅ Responsive design

---

## 🔧 Database Schema Status

### Current Schema (Implemented)

#### `spb_goals` (from migration 006)
```sql
-- Status fields
status VARCHAR(20) DEFAULT 'not-started'
calculated_status VARCHAR(20)
status_source VARCHAR(20) DEFAULT 'calculated'
status_override_reason TEXT
status_override_by UUID
status_override_at TIMESTAMP WITH TIME ZONE
status_override_expires TIMESTAMP WITH TIME ZONE
status_calculation_confidence DECIMAL(5,2)
status_last_calculated TIMESTAMP WITH TIME ZONE

-- Cover photos (from migration 011)
cover_photo_url TEXT
cover_photo_alt TEXT
```

#### `spb_status_overrides` (from migration 006)
```sql
id UUID PRIMARY KEY
goal_id UUID REFERENCES spb_goals
previous_status VARCHAR(20)
new_status VARCHAR(20)
calculated_status VARCHAR(20)
override_reason TEXT NOT NULL
override_category VARCHAR(50)
evidence_urls TEXT[]
created_by UUID NOT NULL
created_by_name VARCHAR(255)
created_at TIMESTAMP
expires_at TIMESTAMP
reviewed_by UUID
reviewed_at TIMESTAMP
review_outcome VARCHAR(50)
review_notes TEXT
```

#### `spb_metrics` (existing)
```sql
id UUID PRIMARY KEY
goal_id UUID REFERENCES spb_goals
name VARCHAR(255)
metric_name VARCHAR(255)
description TEXT
unit VARCHAR(50)
current_value DECIMAL
target_value DECIMAL
baseline_value DECIMAL
ytd_change DECIMAL
last_actual_period VARCHAR(50)
-- ... other fields
```

### Schema Gaps Identified

#### ❌ Missing: Metric Time Series Support
The UI references periods (Q1, Q2, etc.) but there's no table for storing historical metric values.

**Recommended Addition**:
```sql
CREATE TABLE spb_metric_time_series (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_id UUID REFERENCES spb_metrics(id) ON DELETE CASCADE,
  period_type VARCHAR(20), -- 'quarterly', 'monthly', 'annual'
  period_key VARCHAR(20), -- '2024-Q1', '2024-12', '2024'
  period_start_date DATE,
  period_end_date DATE,
  actual_value DECIMAL,
  target_value DECIMAL,
  variance DECIMAL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by UUID
);
```

#### ❌ Missing: Bulk Import Audit Trail
Need to track when bulk imports occur.

**Recommended Addition**:
```sql
CREATE TABLE spb_bulk_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  district_id UUID REFERENCES spb_districts(id),
  import_type VARCHAR(50), -- 'metrics', 'goals', 'status_overrides'
  file_name VARCHAR(255),
  records_imported INTEGER,
  records_failed INTEGER,
  imported_by UUID,
  imported_at TIMESTAMP DEFAULT NOW(),
  import_summary JSONB
);
```

#### ⚠️ Potential Enhancement: User Activity Tracking
Currently using `created_by UUID` but no user names stored consistently.

**Recommended Enhancement**:
```sql
-- Add to relevant tables
ALTER TABLE spb_status_overrides
ADD COLUMN IF NOT EXISTS user_email VARCHAR(255),
ADD COLUMN IF NOT EXISTS user_display_name VARCHAR(255);
```

---

## 🎯 Next Steps (Priority Order)

### Phase 1: Critical - Database Persistence (Current Priority)

#### 1.1 Connect Status Override Save
**File**: `src/pages/AdminGoals.tsx`
**Task**: Implement the `onSave` callback for StatusManager

```typescript
// Need to create:
// src/lib/services/goalService.ts

export async function updateGoalStatus(
  goalId: string,
  status: string,
  reason: string,
  userId: string,
  overrideCategory: string = 'contextual'
) {
  const { data, error } = await supabase
    .from('spb_goals')
    .update({
      status,
      status_source: 'manual',
      status_override_reason: reason,
      status_override_by: userId,
      status_override_at: new Date().toISOString(),
    })
    .eq('id', goalId)
    .select();

  if (error) throw error;
  return data;
}
```

#### 1.2 Connect Metrics Bulk Save
**File**: `src/components/BulkDataEntry.tsx`
**Task**: Implement `handleSaveAll` to batch update metrics

```typescript
// Need to create:
// src/lib/services/metricService.ts

export async function batchUpdateMetrics(
  updates: Array<{
    id: string;
    current_value: number;
    target_value: number;
  }>
) {
  // Use supabase batch update or individual updates
  const promises = updates.map(update =>
    supabase
      .from('spb_metrics')
      .update({
        current_value: update.current_value,
        target_value: update.target_value,
        last_actual_period: new Date().toISOString()
      })
      .eq('id', update.id)
  );

  return Promise.all(promises);
}
```

#### 1.3 Add Authentication Context
**Files**: New - `src/lib/auth/AuthContext.tsx`
**Task**: Create auth context to get current user ID

```typescript
export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
}

export const AuthContext = createContext<{
  user: AuthUser | null;
  isAdmin: boolean;
}>({
  user: null,
  isAdmin: false
});
```

### Phase 2: High Priority - Data Integrity

#### 2.1 Add Form Validation
- Validate numeric inputs (no negative values where inappropriate)
- Validate override reason length (min 50 chars)
- Validate date ranges for periods
- Add success/error toast notifications

#### 2.2 Add Loading States
- Show spinners during save operations
- Disable buttons while saving
- Show optimistic updates

#### 2.3 Add Error Handling
- Try/catch blocks around all database operations
- User-friendly error messages
- Retry logic for failed saves

### Phase 3: Medium Priority - Enhanced Features

#### 3.1 Create Metric Time Series Support
- Add migration for `spb_metric_time_series` table
- Modify BulkDataEntry to save to time series
- Add period selection that actually filters data

#### 3.2 Implement Export Functionality
- CSV export of metrics data
- Excel template generation
- PDF reports

#### 3.3 Implement Import Functionality
- CSV/Excel file upload
- Data validation before import
- Preview imported data
- Bulk insert to database

#### 3.4 Build Audit Trail Page
- Display `spb_status_overrides` history
- Filter by goal, user, date range
- Show who changed what and when

### Phase 4: Polish - UI/UX Improvements

#### 4.1 Mobile Responsiveness
- Make admin tables scrollable on mobile
- Stack cards vertically on small screens
- Touch-friendly buttons

#### 4.2 Accessibility
- Add ARIA labels
- Keyboard navigation
- Screen reader support

#### 4.3 Performance Optimization
- Implement virtual scrolling for large datasets
- Debounce input changes
- Memoize expensive calculations

---

## 🧪 Testing Checklist

### Manual Testing Needed

- [ ] Can admin save status override?
- [ ] Does trigger create record in spb_status_overrides?
- [ ] Can admin save bulk metric updates?
- [ ] Do validation warnings appear correctly?
- [ ] Are unsaved changes tracked properly?
- [ ] Does "Save All Changes" button enable/disable correctly?
- [ ] Can admin filter metrics by goal?
- [ ] Do progress calculations match expected values?
- [ ] Is the audit trail accessible and readable?

### Edge Cases to Test

- [ ] What happens if database is offline during save?
- [ ] What if two admins edit same goal simultaneously?
- [ ] What if metric value is set to 0 vs null?
- [ ] What if user navigates away with unsaved changes?
- [ ] What if override reason contains special characters?

---

## 📝 Code Quality TODOs

### TypeScript
- [ ] Add proper types for all service functions
- [ ] Create zod schemas for validation
- [ ] Remove all `any` types
- [ ] Add JSDoc comments to exported functions

### Error Handling
- [ ] Create custom error classes
- [ ] Implement error boundary components
- [ ] Add Sentry or error tracking

### State Management
- [ ] Consider moving admin state to React Query
- [ ] Add optimistic updates for better UX
- [ ] Cache admin data appropriately

---

## 🔗 Related Files

### Core Admin Files
- `src/components/AdminLayout.tsx` - Main layout
- `src/pages/AdminDashboard.tsx` - Overview page
- `src/pages/AdminGoals.tsx` - Goals management
- `src/pages/AdminMetrics.tsx` - Metrics management
- `src/pages/AdminAudit.tsx` - Audit trail (stub)
- `src/components/StatusManager.tsx` - Status override modal
- `src/components/BulkDataEntry.tsx` - Grid editor

### Services to Create
- `src/lib/services/goalService.ts` - Goal CRUD operations
- `src/lib/services/metricService.ts` - Metric CRUD operations
- `src/lib/services/auditService.ts` - Audit queries
- `src/lib/services/importService.ts` - Import/export logic

### Database Files
- `migrations/006_goal_status_overrides.sql` - Status schema
- `migrations/011_add_cover_photos.sql` - Cover photos
- `migrations/NEW_012_metric_time_series.sql` - To be created
- `migrations/NEW_013_bulk_import_tracking.sql` - To be created

---

## 💬 Questions & Decisions Needed

1. **Authentication**: Which auth provider? Supabase Auth vs external?
2. **Permissions**: Beyond admin/user, need granular permissions?
3. **Real-time Updates**: Should admins see live updates from other admins?
4. **Metric Periods**: Enforce quarterly, monthly, or allow custom periods?
5. **Status Expiration**: Auto-expire manual overrides after certain period?
6. **Import Format**: CSV only, or support Excel (.xlsx)?

---

**Status**: Ready for Phase 1 implementation
**Blocker**: None
**Next Action**: Implement `goalService.ts` and connect StatusManager save
