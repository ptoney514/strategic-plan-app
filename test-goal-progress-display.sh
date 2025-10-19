#!/bin/bash

# Test script for Goal Progress Display Mode configuration
# Tests that editing Goal 1.1's progress display mode works correctly

echo "=========================================="
echo "Testing Goal 1.1 Progress Display Mode"
echo "=========================================="
echo ""

# Get current state
echo "Current state of Goal 1.1:"
docker exec supabase_db_strategic-plan-vite psql -U postgres -d postgres -c "
SELECT
  goal_number,
  title,
  overall_progress,
  overall_progress_display_mode,
  overall_progress_custom_value
FROM spb_goals
WHERE goal_number = '1.1'
AND district_id = (SELECT id FROM spb_districts WHERE slug = 'westside')
LIMIT 1;
"

echo ""
echo "=========================================="
echo "Test Instructions:"
echo "=========================================="
echo ""
echo "1. Open browser to:"
echo "   http://localhost:5173/westside/admin/objectives/7443c003-7600-45a3-baa1-01d8b89930e3/edit"
echo ""
echo "2. In the left sidebar, click the EDIT icon (pencil) next to 'Goal 1.1'"
echo ""
echo "3. In the 'Edit Goal' modal that opens, find the 'OVERALL PROGRESS' section"
echo ""
echo "4. Click the small edit icon (pencil) next to the progress percentage"
echo ""
echo "5. VERIFY: A second modal titled 'Progress Display Mode' should appear"
echo "   - It should have a blue border (border-2 border-primary)"
echo "   - It should be on TOP of the 'Edit Goal' modal (z-index 60)"
echo "   - It should show 6 options:"
echo "     • Percentage (currently selected)"
echo "     • Qualitative"
echo "     • Score out of 5"
echo "     • Custom Value"
echo "     • Color Only"
echo "     • Hidden"
echo ""
echo "6. Select 'Score out of 5' option"
echo ""
echo "7. Click 'Save' button"
echo ""
echo "8. VERIFY: You should return to the 'Edit Goal' modal"
echo "   - The progress display should now show '4.35/5.00' instead of '87%'"
echo ""
echo "9. Click 'Update Goal' button"
echo ""
echo "10. Click 'Save & Publish' at the top of the page"
echo ""
echo "11. Wait for success message"
echo ""
echo "=========================================="
echo "After completing the test, run this script again to verify the database update:"
echo "./test-goal-progress-display.sh verify"
echo "=========================================="

if [ "$1" = "verify" ]; then
  echo ""
  echo "Verification - checking if changes were saved:"
  docker exec supabase_db_strategic-plan-vite psql -U postgres -d postgres -c "
SELECT
  goal_number,
  title,
  overall_progress,
  overall_progress_display_mode,
  overall_progress_custom_value
FROM spb_goals
WHERE goal_number = '1.1'
AND district_id = (SELECT id FROM spb_districts WHERE slug = 'westside')
LIMIT 1;
"
  echo ""
  echo "Expected: overall_progress_display_mode should be 'score'"
  echo ""
fi
