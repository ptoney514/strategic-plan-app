#!/bin/bash

# Test script to verify all progress display modes
# This script will cycle through all display modes for the Student Achievement objective

DOCKER_CMD="docker exec supabase_db_strategic-plan-vite psql -U postgres -d postgres"

echo "=== Testing Progress Display Modes ==="
echo ""

# Get the objective ID
OBJECTIVE_ID=$($DOCKER_CMD -t -c "SELECT id FROM spb_goals WHERE title = 'Student Achievement & Well-being' AND level = 0;" | sed -n 3p | tr -d ' \r')

if [ -z "$OBJECTIVE_ID" ]; then
  echo "ERROR: Could not find Student Achievement & Well-being objective"
  exit 1
fi

echo "Found objective ID: $OBJECTIVE_ID"
echo "Current progress: 75.00"
echo ""

# Test each display mode
declare -a modes=("percentage" "qualitative" "score" "custom" "color-only" "hidden")
declare -a expected=(
  "percentage: Should show '75%'"
  "qualitative: Should show 'Great' (71-90 range)"
  "score: Should show '3.75/5.00'"
  "custom: Should show custom text or fallback to '75%'"
  "color-only: Should show only progress bar, no label"
  "hidden: Should not show progress bar at all"
)

for i in "${!modes[@]}"; do
  mode="${modes[$i]}"
  desc="${expected[$i]}"

  echo "--- Testing mode: $mode ---"
  echo "Expected: $desc"

  # Update the display mode
  if [ "$mode" = "custom" ]; then
    # For custom mode, also set a custom value
    $DOCKER_CMD -c "UPDATE spb_goals SET overall_progress_display_mode = '$mode', overall_progress_custom_value = 'Proficient' WHERE id = '$OBJECTIVE_ID';" > /dev/null
    echo "Set display mode to '$mode' with custom value 'Proficient'"
  else
    $DOCKER_CMD -c "UPDATE spb_goals SET overall_progress_display_mode = '$mode', overall_progress_custom_value = NULL WHERE id = '$OBJECTIVE_ID';" > /dev/null
    echo "Set display mode to '$mode'"
  fi

  echo "Visit: http://localhost:5173/westside/goals"
  echo "Check the 'Student Achievement & Well-being' card"
  echo ""
  read -p "Press Enter when you've verified this mode..."
  echo ""
done

# Restore to original mode (score)
echo "--- Restoring original mode ---"
$DOCKER_CMD -c "UPDATE spb_goals SET overall_progress_display_mode = 'score', overall_progress_custom_value = NULL WHERE id = '$OBJECTIVE_ID';" > /dev/null
echo "Restored to 'score' mode"
echo ""
echo "=== Testing Complete ==="
echo ""
echo "Summary of fixes:"
echo "1. DistrictDashboard.tsx - Now respects all display modes on public view"
echo "2. PerformanceIndicator.tsx - Now uses .toFixed(2) for score display"
echo "3. OverallProgressBar.tsx - Already working correctly"
