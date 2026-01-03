# Strategic Plan Data Import Template

This document provides a reusable template for importing strategic plan data from CSV exports (OnStrategy or similar systems) into Supabase.

## CSV Input Format

Your CSV export should have this structure:

```csv
Goal ID,Goal Name,Metric Name,2021 Actual,2021 Target,2022 Actual,2022 Target,2023 Actual,2023 Target,2024 Actual,2024 Target,Status
1.1,Goal title here,Metric description,3.66,3.66,3.75,3.66,3.74,3.66,3.83,3.66,On Target
1.2,Another goal,Another metric,90,100,,100,,100,100,100,On Target
```

## UUID Generation Strategy

Use predictable UUIDs based on objective number for consistency:

| Entity | UUID Pattern | Example |
|--------|-------------|---------|
| Objective N | `bN000000-0000-0000-0000-000000000001` | `b1000000-...` for Obj 1 |
| Goal N.X | `bNX00000-0000-0000-0000-000000000001` | `b1100000-...` for Goal 1.1 |
| Metric for N.X | `cNX00000-0000-0000-0000-000000000001` | `c1100000-...` |
| Time Series Year Y | `dNX0000Y-0000-0000-0000-000000000001` | `d1100001-...` for 2021 |

## Metric Type Detection

| Pattern | metric_type | visualization_type |
|---------|-------------|-------------------|
| Values like 3.66, 3.75 (1-5 scale) | `rating` | `gauge` |
| Values like 85%, 100% | `percent` | `progress` |
| Whole numbers (counts) | `number` | `bar` |
| Currency values | `currency` | `number` |
| Status descriptions | `status` | `number` |

## Status Mapping

| CSV Value | Database Value |
|-----------|---------------|
| On Target | `on-target` |
| Off Target | `off-target` |
| At Risk | `at-risk` |
| Critical | `critical` |
| No Data | `no-data` |
| Not Started | `not-started` |

## SQL Template

### 1. Delete Existing Data (if replacing)

```sql
-- Delete time series
DELETE FROM spb_metric_time_series
WHERE metric_id IN (
    SELECT m.id FROM spb_metrics m
    JOIN spb_goals g ON m.goal_id = g.id
    WHERE g.district_id = 'YOUR_DISTRICT_ID'
      AND g.goal_number LIKE 'N%'
);

-- Delete metrics
DELETE FROM spb_metrics
WHERE goal_id IN (
    SELECT id FROM spb_goals
    WHERE district_id = 'YOUR_DISTRICT_ID'
      AND goal_number LIKE 'N%'
);

-- Delete goals (order: sub-goals, goals, objective)
DELETE FROM spb_goals WHERE district_id = 'YOUR_DISTRICT_ID' AND goal_number LIKE 'N.%.%';
DELETE FROM spb_goals WHERE district_id = 'YOUR_DISTRICT_ID' AND goal_number LIKE 'N.%';
DELETE FROM spb_goals WHERE district_id = 'YOUR_DISTRICT_ID' AND goal_number = 'N';
```

### 2. Create Objective (Level 0)

```sql
INSERT INTO spb_goals (id, district_id, goal_number, title, description, level, status, parent_id)
VALUES (
    'bN000000-0000-0000-0000-000000000001',
    'YOUR_DISTRICT_ID',
    'N',
    'Objective Title',
    'Objective description...',
    0,
    'on-target',
    NULL
);
```

### 3. Create Goals (Level 1)

```sql
INSERT INTO spb_goals (id, district_id, goal_number, title, description, level, status, parent_id) VALUES
('bN100000-0000-0000-0000-000000000001', 'DISTRICT_ID', 'N.1', 'Goal Title', 'Description', 1, 'on-target', 'bN000000-0000-0000-0000-000000000001'),
('bN200000-0000-0000-0000-000000000001', 'DISTRICT_ID', 'N.2', 'Goal Title', 'Description', 1, 'on-target', 'bN000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description;
```

### 4. Create Metrics

```sql
INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type) VALUES
('cN100000-0000-0000-0000-000000000001', 'bN100000-0000-0000-0000-000000000001',
 'Metric Name', 'rating', 3.83, 3.66, 'rating', true, 'Description', 'gauge')
ON CONFLICT (id) DO UPDATE SET current_value = EXCLUDED.current_value, target_value = EXCLUDED.target_value;
```

### 5. Create Time Series

```sql
INSERT INTO spb_metric_time_series (id, metric_id, district_id, period, period_type, target_value, actual_value, status) VALUES
('dN100001-0000-0000-0000-000000000001', 'cN100000-...', 'DISTRICT_ID', '2021', 'annual', 3.66, 3.66, 'on-target'),
('dN100002-0000-0000-0000-000000000001', 'cN100000-...', 'DISTRICT_ID', '2022', 'annual', 3.66, 3.75, 'on-target'),
('dN100003-0000-0000-0000-000000000001', 'cN100000-...', 'DISTRICT_ID', '2023', 'annual', 3.66, 3.74, 'on-target'),
('dN100004-0000-0000-0000-000000000001', 'cN100000-...', 'DISTRICT_ID', '2024', 'annual', 3.66, 3.83, 'on-target')
ON CONFLICT (metric_id, period) DO UPDATE SET target_value = EXCLUDED.target_value, actual_value = EXCLUDED.actual_value;
```

## Westside District IDs

| Entity | UUID |
|--------|------|
| District | `a0000000-0000-0000-0000-000000000002` |
| Objective 1 | `b1000000-0000-0000-0000-000000000001` |
| Objective 2 | `b2000000-0000-0000-0000-000000000001` |
| Objective 3 | `b3000000-0000-0000-0000-000000000001` |
| Objective 4 | `b4000000-0000-0000-0000-000000000001` |

## Handling Special Cases

### Missing Data
Use `NULL` for missing values:
```sql
('id', 'metric_id', 'district_id', '2022', 'annual', 100, NULL, 'no-data')
```

### Percentage Values
Strip the `%` symbol and store as number:
- CSV: `85%` → SQL: `85`

### Rating Values
Keep decimal precision:
- CSV: `3.66` → SQL: `3.66`

### Lower-is-Better Metrics
Set `is_higher_better = false`:
```sql
('id', 'goal_id', 'Risk Ratio', 'number', 2.27, 2.00, 'ratio', false, 'Description', 'gauge')
```

## Verification Queries

After import, run these to verify:

```sql
-- Count by type
SELECT 'Goals' as type, COUNT(*) FROM spb_goals WHERE goal_number LIKE 'N%'
UNION ALL
SELECT 'Metrics', COUNT(*) FROM spb_metrics m JOIN spb_goals g ON m.goal_id = g.id WHERE g.goal_number LIKE 'N%'
UNION ALL
SELECT 'Time Series', COUNT(*) FROM spb_metric_time_series ts JOIN spb_metrics m ON ts.metric_id = m.id JOIN spb_goals g ON m.goal_id = g.id WHERE g.goal_number LIKE 'N%';

-- List goals with metrics
SELECT g.goal_number, g.title, m.name as metric, m.current_value, m.target_value
FROM spb_goals g
LEFT JOIN spb_metrics m ON m.goal_id = g.id
WHERE g.goal_number LIKE 'N%'
ORDER BY g.goal_number;
```

## Workflow

1. Export CSV from OnStrategy
2. Copy relevant objective data
3. Create SQL file using template above
4. Use Data Manager to preview (Load SQL File → Compare tab)
5. Run delete script in Supabase SQL Editor
6. Run import script in Supabase SQL Editor
7. Verify in Data Manager and public view
