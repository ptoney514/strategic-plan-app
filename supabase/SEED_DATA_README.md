# Seed Data Documentation

## Overview

This document describes the seed data structure for the Strategic Plan Builder application. The seed data provides consistent test data for development and testing.

## Quick Start

To load the seed data into your local database:

```bash
# Reset the database and apply all migrations + seed data
supabase db reset

# Optional: Validate seed data loaded correctly
docker exec -i supabase_db_strategic-plan-workspace psql -U postgres -d postgres < supabase/seed_data_validation.sql
```

The validation script verifies:
- District counts (2 expected)
- Goal hierarchy (16 Westside, 3 Eastside)
- Metric types and counts (9+ expected)
- Narrative content
- Status value validity
- Foreign key relationships

## Data Structure

### Districts

The seed includes 2 school districts:

1. **Westside School District** (slug: `westside`)
   - Comprehensive test data with full hierarchy
   - 16 goals across 3 levels
   - 9 metrics with various types
   - 1 narrative metric with rich content

2. **Eastside School District** (slug: `eastside`)
   - Basic test data
   - 3 goals (1 objective, 2 goals)
   - Minimal metrics (for future expansion)

### Goal Hierarchy

Goals are organized in a 3-level hierarchy:

- **Level 0: Strategic Objectives** - Top-level organizational goals
- **Level 1: Goals** - Specific goals supporting the objectives
- **Level 2: Sub-goals** - Tactical initiatives supporting the goals

#### Westside District Hierarchy

**Objective 1: Student Achievement & Well-being**
- 1.1 ELA/Reading Proficiency
  - 1.1.1 K-2 Reading Foundation
  - 1.1.2 Grade 3-5 Reading Comprehension
  - 1.1.3 Middle School Literacy
- 1.2 Mathematics Achievement
  - 1.2.1 Elementary Math Fundamentals
  - 1.2.2 Algebraic Thinking
- 1.3 Science Proficiency
- 1.4 Growth Mindset Development
- 1.5 Student Engagement
- 1.6 Early Childhood Success

**Objective 2: Educational Excellence & Innovation**
- 2.1 Instructional Quality
- 2.2 Technology Integration
- 2.3 Professional Development

#### Eastside District Hierarchy

**Objective 1: College & Career Readiness**
- 1.1 Graduation Rate
- 1.2 College Enrollment

### Metrics

The seed data includes various metric types:

#### Quantitative Metrics
- **Percentage metrics** (e.g., "K-2 Reading Proficiency Rate")
  - Current value, target value, status
  - Chart type: bar, line

- **Rating metrics** (e.g., "Reading Comprehension Score")
  - Scale-based measurements (e.g., out of 5)
  - Chart type: gauge

- **Number metrics** (e.g., "Fluency Words Per Minute")
  - Absolute numbers with targets
  - Chart type: bar

#### Ratio Metrics
- **Lower-is-better metrics** (e.g., "Chronic Absenteeism Rate")
  - Includes baseline value for improvement tracking
  - `is_higher_better = false`

#### Narrative Metrics
- **Rich text metrics** (e.g., "Instructional Framework Implementation")
  - HTML content with progress updates
  - Includes author, sentiment, status
  - Stored in `spb_metric_narratives` table

### Goal Status Values

Goals support the following status values:
- `on-target` - Goal is progressing as expected
- `off-target` - Goal is slightly behind
- `at-risk` - Goal needs attention
- `critical` - Goal requires immediate intervention
- `not-started` - Goal has not begun

### Metric Status Values

Metrics support the following status values:
- `on-target` - Metric is meeting targets
- `near-target` - Metric is close to target
- `off-target` - Metric is below target

### Cover Photos

Strategic objectives include cover photos from Unsplash:
- "Student Achievement & Well-being" - Students celebrating success
- "Educational Excellence & Innovation" - Teacher with students
- "College & Career Readiness" - Graduation celebration

A library of 10 stock photos is also seeded in `spb_stock_photos`.

## Data Access

### Direct URL Access

- Westside: http://localhost:5173/westside
- Eastside: http://localhost:5173/eastside

### Supabase Studio

Access the database directly at: http://127.0.0.1:54323

### Sample Queries

**View all goals with hierarchy:**
```sql
SELECT
  goal_number,
  REPEAT('  ', level) || title as title,
  CASE level
    WHEN 0 THEN 'Strategic Objective'
    WHEN 1 THEN 'Goal'
    WHEN 2 THEN 'Sub-goal'
  END as type,
  status
FROM spb_goals
WHERE district_id = (SELECT id FROM spb_districts WHERE slug = 'westside')
ORDER BY goal_number;
```

**View metrics summary:**
```sql
SELECT
  g.goal_number,
  g.title as goal_title,
  COUNT(m.id) as metric_count
FROM spb_goals g
LEFT JOIN spb_metrics m ON m.goal_id = g.id
WHERE g.district_id = (SELECT id FROM spb_districts WHERE slug = 'westside')
GROUP BY g.id, g.goal_number, g.title
HAVING COUNT(m.id) > 0
ORDER BY g.goal_number;
```

## UUID Format

All UUIDs in the seed data follow a structured pattern for easy identification:

| Entity Type | Pattern | Example | Prefix Meaning |
|------------|---------|---------|----------------|
| **Districts** | `a0000000-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | `a0000000-0000-0000-0000-000000000001` | `a` = administrative entities |
| **Goals** | `b0000xxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | `b0000001-0001-0000-0000-000000000000` | `b` = business/goal entities |
| **Metrics** | `a0000xxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | `a0000001-0001-0001-0001-000000000000` | `a` = measurement/analytics |
| **Narratives** | `a0001xxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | `a0001001-0000-0000-0000-000000000001` | `a0001` = narrative content |

### UUID Pattern Logic

**Why Different Prefixes?**
- Prefixes (`a`, `b`) make it easy to identify entity types when debugging or viewing raw data
- Helps prevent accidental UUID collisions between different entity types
- Makes database queries more readable when viewing UUIDs

**Test Data vs Production**
- ⚠️ **Important**: These structured UUIDs are for **test/seed data only**
- Production data should use PostgreSQL's `gen_random_uuid()` for true randomness
- Structured UUIDs make seed data predictable and easier to reference in documentation

**Technical Requirements**
- UUIDs must use **valid hexadecimal characters only** (0-9, a-f)
- Invalid characters like `m`, `n`, `c`, `g`, etc. will cause PostgreSQL errors
- Must be exactly 36 characters: 32 hex digits + 4 hyphens
- Format: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

## Known Limitations

### Time Series Data
Time series data is currently commented out in the seed file. Future iterations will include:
- Quarterly data points with `period_type` and `district_id`
- Historical trends for key metrics
- Year-over-year comparisons

### Progress Calculations
The `recalculate_district_progress()` function has a bug with multiple row updates. Progress calculation is currently skipped in the seed data and can be run manually after the bug is fixed.

### Eastside Metrics
Eastside district currently has no metrics. This is intentional to provide a minimal dataset for testing empty states.

## Extending the Seed Data

To add new data:

1. **Add a new district:**
   ```sql
   INSERT INTO spb_districts (id, name, slug, ...) VALUES (...);
   ```

2. **Add goals:**
   ```sql
   INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, level, ...) VALUES (...);
   ```

3. **Add metrics:**
   ```sql
   INSERT INTO spb_metrics (id, goal_id, name, metric_type, ...) VALUES (...);
   ```

4. **Test your changes:**
   ```bash
   supabase db reset
   ```

## Troubleshooting

### Seed Data Won't Load

**Error: "invalid input syntax for type uuid"**
- Check that all UUIDs use only hexadecimal characters (0-9, a-f)
- UUIDs must be exactly 36 characters (32 hex + 4 hyphens)

**Error: "violates check constraint"**
- Verify status values match allowed constraints
- Goals: `on-target`, `off-target`, `at-risk`, `critical`, `not-started`
- Metrics: `on-target`, `near-target`, `off-target`

**Error: "VALUES lists must all be the same length"**
- Ensure all rows in a multi-row INSERT have the same number of columns
- Check for missing values - use NULL if a value isn't available

### Database Reset Issues

If `supabase db reset` fails:

1. Stop and restart Supabase:
   ```bash
   supabase stop
   supabase start
   ```

2. Check for port conflicts (default: 54322)

3. Verify migrations are in correct order (numbered sequentially)

## Best Practices

1. **Always use `supabase db reset`** to reload seed data - this ensures migrations run in correct order

2. **Don't modify UUIDs** in the seed file unless necessary - many records reference each other

3. **Use descriptive goal_numbers** like "1.1.1" instead of random identifiers

4. **Test both districts** - Westside for full features, Eastside for minimal/empty states

5. **Document changes** - Update this README when adding significant new seed data

## Future Enhancements

- [ ] Add complete time series data with proper district_id and period_type
- [ ] Fix progress calculation function for automatic rollup
- [ ] Add Eastside metrics for comparison testing
- [ ] Include sample user accounts and permissions
- [ ] Add data for testing import/export functionality
- [ ] Create seed data variants (small, medium, large datasets)

## Related Files

- `/supabase/seed.sql` - The actual seed data SQL file
- `/supabase/migrations/` - Database schema migrations
- `/CLAUDE.md` - Project conventions and architecture
- `/WORKSPACE_STATUS.md` - Current development status

---

**Last Updated**: 2025-10-09
**Seed Data Version**: 1.0.0
**Issue**: [#6](https://github.com/ptoney514/strategic-plan-workspace/issues/6)
