# Test Plan: Progress Display Mode for Sub-Goals

## Test Objective
Verify that the Progress Display Mode configuration modal works correctly when editing Goal 1.1 (a level 1 sub-goal).

## Test Steps

### 1. Open the Objective Editor
1. Navigate to: http://localhost:5173/westside/admin/objectives/7443c003-7600-45a3-baa1-01d8b89930e3/edit
2. Verify the page loads the "Student Achievement & Well-being" objective

### 2. Edit Goal 1.1
1. In the left sidebar under "GOALS (1)", find "Goal 1.1"
2. Click the blue Edit icon (pencil) next to "Goal 1.1"
3. Verify the "Edit Goal" modal opens
4. Verify the modal shows:
   - Goal Title: "Grow and nurture a district culture"
   - Description field
   - Visual Badge section
   - Overall Progress preview showing 87%

### 3. Open Progress Display Mode Configuration
1. In the "Edit Goal" modal, find the "OVERALL PROGRESS (Preview)" section
2. Look for the small edit icon (pencil) next to the progress percentage
3. Click the edit icon
4. **Expected Result**: A second modal titled "Progress Display Mode" should appear **on top** of the "Edit Goal" modal
5. **Current Status**: The modal should now have z-index of 60, appearing above the Goal Edit Modal (z-index 50)

### 4. Verify Progress Display Mode Options
In the "Progress Display Mode" modal, verify these options are visible:
- [ ] Percentage (Show as 75%)
- [ ] Qualitative (Show as Excellent/Great/Good/Below)
- [ ] Score out of 5 (Show as 3.75/5.00)
- [ ] Custom Value (Show custom text or number)
- [ ] Color Only (Just the progress bar color)
- [ ] Hidden (Don't show progress)

### 5. Verify Current Selection
- [ ] The "Percentage" option should be highlighted (since the database shows `overall_progress_display_mode = 'percentage'`)

### 6. Change to Score Mode
1. Click on "Score out of 5" option
2. Verify the option becomes highlighted
3. Click "Save" button
4. **Expected Result**: The modal should close and return to the "Edit Goal" modal
5. **Expected Result**: The progress display in the "Edit Goal" modal should now show "4.35/5.00" (87% = 4.35/5)

### 7. Save the Goal
1. Click "Update Goal" button in the "Edit Goal" modal
2. The goal modal should close
3. Click "Save & Publish" at the top of the page
4. Wait for success message

### 8. Verify Database Update
Run this query to verify the change was saved:
```sql
SELECT goal_number, overall_progress_display_mode, overall_progress_override
FROM spb_goals
WHERE goal_number = '1.1'
AND district_id = (SELECT id FROM spb_districts WHERE slug = 'westside');
```

Expected result:
- `overall_progress_display_mode` should be 'score'
- `overall_progress_override` should still be 87.00

### 9. Verify Public View
1. Navigate to: http://localhost:5173/westside/goals
2. Find the "Student Achievement & Well-being" objective card
3. Click to expand/view details
4. Verify Goal 1.1 shows "4.35/5.00" instead of "87%"

## Known Issues Fixed

### Issue 1: Modal Z-Index
**Problem**: The Property Edit Modal (Progress Display Mode) was not appearing above the Goal Edit Modal.

**Solution**: Changed z-index from `z-50` to `z-[60]` in ObjectiveBuilder.tsx line 1428.

**File**: `src/pages/client/admin/ObjectiveBuilder.tsx:1428`

### Issue 2: Modal State Management
**Problem**: The `saveProperty()` function checks if `showGoalModal` is true and updates `goalForm` accordingly.

**Current Implementation** (lines 227-239):
```tsx
if (showGoalModal) {
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

**Status**: ✅ This is correctly implemented - when editing from within the Goal modal, it updates the `goalForm` state instead of the `builderState.objective`.

## Success Criteria

- [ ] Property Edit Modal appears on top of Goal Edit Modal (z-index fix)
- [ ] All 6 display mode options are visible and selectable
- [ ] Current selection is properly highlighted
- [ ] Changing the selection updates the preview in the Goal Edit Modal
- [ ] Saving the changes persists to the database
- [ ] Public view reflects the new display mode

## Testing Timestamp
Date: 2025-10-06
Tester: Claude Code
Status: In Progress

## Next Steps
1. Manually test the complete flow in the browser
2. If issues persist, add debug logging to identify which modal is rendering
3. Consider adding visual indicators (border color, shadow) to distinguish nested modals
