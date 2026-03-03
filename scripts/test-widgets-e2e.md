# Widget System E2E Test Script

Manual test procedure using Playwright MCP tools.
**Prerequisite**: `npm run dev:api` running on port 5174.

## Setup

1. Navigate to login page:

   ```
   browser_navigate → http://lvh.me:5174/login
   ```

2. Login as Westside admin:

   ```
   browser_fill_form → email: admin@westside66.org, password: Westside123!
   browser_click → Sign In button
   ```

3. Wait for redirect, take snapshot to confirm login:
   ```
   browser_snapshot
   ```

## Test 1: Widget Builder Page Load

4. Navigate to widget builder:

   ```
   browser_navigate → http://westside.lvh.me:5174/v2/admin/widgets
   ```

5. Verify page heading and empty state:
   ```
   browser_snapshot
   ```

   - Expect: "Widget Builder" heading
   - Expect: Empty state message ("No widgets yet")
   - Expect: "Add Widget" button visible

## Test 2: Create Donut Widget

6. Click "Add Widget":

   ```
   browser_click → "Add Widget" button
   ```

7. Verify catalog shows 6 types:

   ```
   browser_snapshot
   ```

   - Expect: Donut Chart, Big Number, Bar Chart, Area Line, Progress Bar, Pie Breakdown

8. Select "Donut Chart":

   ```
   browser_click → "Donut Chart" card
   ```

9. Verify config panel with appropriate fields:

   ```
   browser_snapshot
   ```

   - Expect: Title, Subtitle, Value, Target, Label fields

10. Fill in donut widget config:

    ```
    browser_fill_form → title: "Students Enrolled", value: 324, target: 500, label: "enrollment"
    ```

11. Click Save:

    ```
    browser_click → "Save" button
    ```

12. Verify widget appears in grid:
    ```
    browser_snapshot
    ```

    - Expect: Widget card with "Students Enrolled" title
    - Expect: Donut chart rendering

## Test 3: Edit Widget

13. Click edit button on the widget (hover to reveal):

    ```
    browser_hover → widget card
    browser_click → edit (pencil) icon
    ```

14. Verify config panel in edit mode:

    ```
    browser_snapshot
    ```

    - Expect: Pre-filled fields with current values

15. Update title:

    ```
    browser_fill_form → title: "Students Enrolled YTD"
    browser_click → "Save" button
    ```

16. Verify title updated:
    ```
    browser_snapshot
    ```

    - Expect: Widget card now shows "Students Enrolled YTD"

## Test 4: Delete Widget

17. Click delete button on the widget:

    ```
    browser_hover → widget card
    browser_click → delete (trash) icon
    ```

18. Confirm deletion if prompted:

    ```
    browser_click → confirm button (if dialog appears)
    ```

19. Verify widget removed:
    ```
    browser_snapshot
    ```

    - Expect: Empty state returns ("No widgets yet")

## Test 5: Create Big Number Widget

20. Click "Add Widget":

    ```
    browser_click → "Add Widget" button
    ```

21. Select "Big Number":

    ```
    browser_click → "Big Number" card
    ```

22. Fill in big number config:

    ```
    browser_fill_form → title: "Total Students", value: 480, unit: "students", trend: "+12%"
    ```

    Select trendDirection: "up"

23. Click Save:

    ```
    browser_click → "Save" button
    ```

24. Verify widget in grid:
    ```
    browser_snapshot
    ```

    - Expect: Widget card showing "Total Students"
    - Expect: "480 students" with "+12%" trend indicator

## Test 6: Persistence Check

25. Refresh the page:

    ```
    browser_navigate → http://westside.lvh.me:5174/v2/admin/widgets
    ```

26. Verify widgets persist:
    ```
    browser_snapshot
    ```

    - Expect: "Total Students" widget still visible

## Test 7: Org Isolation

27. Navigate to Eastside district:

    ```
    browser_navigate → http://eastside.lvh.me:5174/v2/admin/widgets
    ```

    (May need to login as `admin@eastside.edu` / `Eastside123!`)

28. Verify empty state (no Westside widgets visible):
    ```
    browser_snapshot
    ```

    - Expect: Empty state — Eastside should not see Westside's widgets

## Cleanup

29. Navigate back to Westside and delete test widgets:

    ```
    browser_navigate → http://westside.lvh.me:5174/v2/admin/widgets
    ```

    Delete any remaining test widgets.

30. Final snapshot:
    ```
    browser_snapshot
    ```

    - Expect: Clean empty state
