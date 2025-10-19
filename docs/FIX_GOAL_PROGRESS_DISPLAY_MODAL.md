# Fix: Goal Progress Display Mode Modal Issue

## Issue
When editing Goal 1.1 (a level 1 sub-goal) in the Objective Builder, clicking the edit icon next to "Progress Display Mode" wasn't properly displaying the configuration modal. The modal appeared to be opening, but it was hidden behind the Goal Edit Modal.

## Root Cause
The Property Edit Modal and Goal Edit Modal both had the same z-index (`z-50`), causing the Property Edit Modal to render behind or at the same layer as the Goal Edit Modal when both were open simultaneously.

## Solution

### 1. Increased Z-Index of Property Edit Modal
**File**: `src/pages/client/admin/ObjectiveBuilder.tsx`

**Change at line 1428**:
```tsx
// Before:
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

// After:
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
```

This ensures the Property Edit Modal appears **on top** of the Goal Edit Modal (which has `z-50`).

### 2. Added Visual Distinction
**File**: `src/pages/client/admin/ObjectiveBuilder.tsx`

**Change at line 1429**:
```tsx
// Before:
<div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">

// After:
<div className="bg-white rounded-lg shadow-2xl max-w-md w-full mx-4 border-2 border-primary">
```

Added a blue border (`border-2 border-primary`) to make it visually clear that the Property Edit Modal is the active modal when it's layered on top of the Goal Edit Modal.

### 3. Added Debug Logging
**File**: `src/pages/client/admin/ObjectiveBuilder.tsx`

**Changes**:
- Line 1800: Added console.log when opening progress display config
- Line 229: Added console.log when saving progress display mode

These logs help verify that the click handlers are firing correctly and the state is being updated as expected.

## Modal Flow

The component now correctly handles nested modals:

1. **User clicks "Edit" on Goal 1.1** → Goal Edit Modal opens (`z-50`)
2. **User clicks edit icon next to "OVERALL PROGRESS"** → Property Edit Modal opens (`z-[60]`)
3. **User selects a display mode and clicks "Save"** → Property Edit Modal closes, Goal Edit Modal remains open
4. **User clicks "Update Goal"** → Goal Edit Modal closes

## State Management

The `saveProperty()` function (lines 224-276) correctly handles the nested modal state:

```tsx
if (showGoalModal) {
  console.log('Saving progress display mode from goal modal:', propertyValue);
  // Update goalForm instead of builderState
  if (editingProperty === 'progress_display') {
    setGoalForm(prev => ({
      ...prev,
      overall_progress_display_mode: propertyValue as any,
      overall_progress_custom_value: propertyValue !== 'custom' ? '' : prev.overall_progress_custom_value
    }));
  }
  setEditingProperty(null);
  setPropertyValue('');
  return;
}
```

When the Property Edit Modal is opened from within the Goal Edit Modal (`showGoalModal === true`), it updates the `goalForm` state instead of the `builderState.objective` state. This ensures the changes are applied to the correct goal being edited.

## Testing

### Manual Test
1. Navigate to: http://localhost:5173/westside/admin/objectives/7443c003-7600-45a3-baa1-01d8b89930e3/edit
2. Click the Edit icon (pencil) next to "Goal 1.1" in the left sidebar
3. In the "Edit Goal" modal, click the edit icon next to "OVERALL PROGRESS (Preview)"
4. **Verify**: The "Progress Display Mode" modal appears with a blue border on top of the "Edit Goal" modal
5. Select a different display mode (e.g., "Score out of 5")
6. Click "Save"
7. **Verify**: The modal closes and the progress display in the Goal Edit Modal updates to show the new format
8. Click "Update Goal"
9. Click "Save & Publish"
10. **Verify**: Changes persist to the database

### Automated Test Script
Run the test script to verify the current state and get step-by-step instructions:

```bash
cd strategic-plan-vite
./test-goal-progress-display.sh
```

After making changes, verify the database was updated:

```bash
./test-goal-progress-display.sh verify
```

## Console Log Output

When working correctly, you should see console logs like:

```
Opening progress display config for goal: Grow and nurture a district culture Current mode: percentage
Saving progress display mode from goal modal: score
```

## Files Modified

1. `src/pages/client/admin/ObjectiveBuilder.tsx`
   - Line 1428: Increased z-index to `z-[60]`
   - Line 1429: Added `border-2 border-primary` for visual distinction
   - Line 1800: Added debug logging for opening modal
   - Line 229: Added debug logging for saving changes

## Related Documentation

- [PROGRESS_DISPLAY_MODE_FIX.md](./PROGRESS_DISPLAY_MODE_FIX.md) - Original fix for progress display modes
- [TEST_PLAN_PROGRESS_DISPLAY.md](../TEST_PLAN_PROGRESS_DISPLAY.md) - Comprehensive test plan

## Date
2025-10-06

## Status
✅ Fixed and tested
