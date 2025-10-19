# Test Plan: Sub-Goal Feature (Level 2 Goals)

## Feature Overview
This feature adds the ability to create **sub-goals (level 2)** under **goals (level 1)** in the Objective Builder, supporting a full 3-level hierarchy:
- Level 0: Strategic Objective (e.g., "1 Student Achievement & Well-being")
- Level 1: Goal (e.g., "1.1 Grow and nurture a district culture")
- Level 2: Sub-Goal (e.g., "1.1.1 Proportional enrollment")

## Test Steps

### 1. Open the Objective Editor
Navigate to: http://localhost:5174/westside/admin/objectives/7443c003-7600-45a3-baa1-01d8b89930e3/edit

### 2. Locate Goal 1.1 in the Left Sidebar
- Look in the "GOALS (2)" section
- Find "Goal 1.1 - Grow and nurture a district culture"

### 3. Add a Sub-Goal
1. **Hover over Goal 1.1**
2. You should see 4 action buttons appear:
   - 🟣 **Plus icon (purple)** - Add Sub-Goal ← THIS IS NEW!
   - 🟢 Bar chart icon (green) - Add Measure
   - 🔵 Pencil icon (blue) - Edit Goal
   - 🔴 Trash icon (red) - Remove Goal

3. **Click the purple Plus icon** to add a sub-goal

### 4. Fill Out the Sub-Goal Form
A modal should open with the title **"Create New Sub-Goal"**

1. Enter the title: `Proportional enrollment`
2. Enter description: `Proportional enrollment of non-white students in Honors/AP classes mirroring the student population`
3. (Optional) Add a visual badge if desired
4. Click **"Save Goal"**

### 5. Verify the Sub-Goal Appears
- The modal should close
- In the left sidebar under "Goal 1.1", you should now see a purple section labeled "SUB-GOALS"
- The sub-goal should be listed with:
  - Goal number: **1.1.1**
  - Title: "Proportional enrollment"
  - A purple chevron (→) icon indicating it's nested
  - Hover buttons: Add Measure, Edit, Delete

### 6. Save the Changes
1. Click **"Save & Publish"** at the top of the page
2. Wait for the success message: "Strategic Objective updated successfully!"

### 7. Verify in the Database
Run this query to verify the sub-goal was created correctly:

```bash
cd strategic-plan-vite
docker exec supabase_db_strategic-plan-vite psql -U postgres -d postgres -c "
SELECT
  goal_number,
  title,
  level,
  parent_id,
  (SELECT goal_number FROM spb_goals p WHERE p.id = g.parent_id) as parent_goal_number
FROM spb_goals g
WHERE district_id = (SELECT id FROM spb_districts WHERE slug = 'westside')
ORDER BY goal_number;
"
```

**Expected Result**:
```
 goal_number |                title                | level |              parent_id               | parent_goal_number
-------------+-------------------------------------+-------+--------------------------------------+--------------------
 1           | Student Achievement & Well-being    |     0 |                                      |
 1.1         | Grow and nurture a district culture |     1 | 7443c003-7600-45a3-baa1-01d8b89930e3 | 1
 1.1.1       | Proportional enrollment             |     2 | a771ed47-3b5a-4ad2-84ee-0c785e42c928 | 1.1
 1.2         | Goal 1.1.1 Proportional enrollment  |     1 | 7443c003-7600-45a3-baa1-01d8b89930e3 | 1
```

Note: Goal "1.2" should be deleted or updated since it's incorrectly numbered.

### 8. Add Another Sub-Goal
Let's add a second sub-goal to Goal 1.1:

1. Hover over Goal 1.1 again
2. Click the purple Plus icon
3. Enter title: `Staff diversity initiatives`
4. Enter description: `Recruit and retain diverse staff members`
5. Click "Save Goal"
6. Verify it appears as **1.1.2** under Goal 1.1
7. Click "Save & Publish"

### 9. Test Editing a Sub-Goal
1. Hover over the sub-goal "1.1.1 Proportional enrollment"
2. Click the blue Edit icon
3. The modal should open with title **"Edit Sub-Goal"**
4. Change the description
5. Click "Update Goal"
6. Verify the changes are saved

### 10. Test Adding Metrics to a Sub-Goal
1. Hover over sub-goal 1.1.1
2. Click the green Bar chart icon (Add Measure)
3. The Metric Builder Wizard should open
4. Create a metric (e.g., "Honors/AP Enrollment Percentage")
5. Save the metric
6. Verify it shows a green badge with "1 metric" next to the sub-goal

### 11. Test Deleting a Sub-Goal
1. Hover over a sub-goal
2. Click the red Trash icon
3. Confirm deletion
4. Verify the sub-goal is removed from the UI
5. Click "Save & Publish"
6. Verify it's deleted from the database

## Features Implemented

### Visual Indicators
- **Purple color scheme** for sub-goals (different from green for metrics, blue for edit)
- **Chevron icon (→)** to indicate nesting
- **Purple background** for the SUB-GOALS section
- **Goal numbering**: Auto-generated as 1.1.1, 1.1.2, etc.

### Functionality
- ✅ Add sub-goals to level 1 goals
- ✅ Edit existing sub-goals
- ✅ Delete sub-goals
- ✅ Add metrics to sub-goals
- ✅ Nested display under parent goal
- ✅ Proper level (2) and parent_id in database
- ✅ Auto-incrementing goal numbers (1.1.1, 1.1.2, etc.)
- ✅ Load existing sub-goals when editing an objective
- ✅ Save sub-goals with correct hierarchy

### Modal Titles
- "Create New Sub-Goal" when adding
- "Edit Sub-Goal" when editing
- Different messaging than regular goals

## Known Limitations

1. **No Drag-and-Drop**: You cannot drag goals to reorganize them or move them under different parents. This is planned for a future feature branch.

2. **Goal 1.2 Issue**: There's currently a goal "1.2 Goal 1.1.1 Proportional enrollment" that should actually be "1.1.1". You'll need to:
   - Delete this incorrect goal
   - Recreate it as a sub-goal under 1.1

## Database Schema

The feature uses the existing schema:
- `level`: 0 (objective), 1 (goal), or 2 (sub-goal)
- `parent_id`: References the parent goal
- `goal_number`: String like "1.1.1"

## Next Steps

After verifying this works:
1. Fix the incorrect "1.2" goal by converting it to "1.1.1"
2. Test the public view to ensure sub-goals display correctly
3. Add more sub-goals to other goals to test the full hierarchy
4. Plan for drag-and-drop feature in a future branch

## Date
2025-10-06

## Status
✅ Feature implemented and ready for testing
