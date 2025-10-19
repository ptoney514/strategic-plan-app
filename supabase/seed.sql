-- ============================================================================
-- Strategic Plan Builder - Comprehensive Seed Data
-- ============================================================================
-- Purpose: Provide consistent, realistic test data for development and testing
-- Districts: Westside (comprehensive), Eastside (basic)
-- Data includes: Goals hierarchy, Metrics, Time series, Stock photos
-- ============================================================================

BEGIN;

-- ============================================================================
-- STEP 1: Create Districts
-- ============================================================================

INSERT INTO public.spb_districts (id, name, slug, logo_url, primary_color, secondary_color, admin_email, is_public, created_at, updated_at) VALUES
  ('a0000000-0000-0000-0000-000000000001', 'Eastside School District', 'eastside', 'https://images.unsplash.com/photo-1509062522246-3755977927d7', '#1e40af', '#10b981', 'admin@eastside.edu', true, NOW(), NOW()),
  ('a0000000-0000-0000-0000-000000000002', 'Westside School District', 'westside', 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1', '#0099CC', '#51d01b', 'admin@westside.edu', true, NOW(), NOW());

-- ============================================================================
-- STEP 2: Create Stock Photos Library
-- ============================================================================

INSERT INTO public.spb_stock_photos (url, alt_text, category, created_at) VALUES
  ('https://images.unsplash.com/photo-1523050854058-8df90110c9f1', 'Students celebrating success', 'achievement', NOW()),
  ('https://images.unsplash.com/photo-1522202176988-66273c2fd55f', 'Students collaborating', 'collaboration', NOW()),
  ('https://images.unsplash.com/photo-1509062522246-3755977927d7', 'Teacher with students', 'teaching', NOW()),
  ('https://images.unsplash.com/photo-1427504494785-3a9ca7044f45', 'Students studying', 'learning', NOW()),
  ('https://images.unsplash.com/photo-1580582932707-520aed937b7b', 'School classroom', 'environment', NOW()),
  ('https://images.unsplash.com/photo-1571260899304-425eee4c7efc', 'Students reading', 'literacy', NOW()),
  ('https://images.unsplash.com/photo-1503676260728-1c00da094a0b', 'Education books', 'resources', NOW()),
  ('https://images.unsplash.com/photo-1559827260-dc66d52bef19', 'Students with technology', 'technology', NOW()),
  ('https://images.unsplash.com/photo-1588072432836-e10032774350', 'Online learning', 'digital', NOW()),
  ('https://images.unsplash.com/photo-1596495578065-6e0763fa1178', 'Graduation celebration', 'success', NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- STEP 3: Westside District - Complete Hierarchical Structure
-- ============================================================================

-- Strategic Objective 1: Student Achievement & Well-being
INSERT INTO public.spb_goals (
  id, district_id, parent_id, goal_number, title, description, level, order_position,
  status, cover_photo_url, cover_photo_alt, created_at, updated_at
) VALUES (
  'b0000001-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  NULL,
  '1',
  'Student Achievement & Well-being',
  'Ensure all students achieve academic excellence and develop social-emotional well-being',
  0,
  1,
  'on-target',
  'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
  'Students celebrating success',
  NOW(),
  NOW()
);

-- Level 1 Goals under Objective 1
INSERT INTO public.spb_goals (
  id, district_id, parent_id, goal_number, title, description, level, order_position, status, created_at, updated_at
) VALUES
  ('b0000001-0001-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000000', '1.1', 'ELA/Reading Proficiency', 'All students will meet or exceed state standards in English Language Arts and Reading', 1, 1, 'on-target', NOW(), NOW()),
  ('b0000001-0002-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000000', '1.2', 'Mathematics Achievement', 'All students will demonstrate proficiency in mathematics at or above grade level', 1, 2, 'on-target', NOW(), NOW()),
  ('b0000001-0003-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000000', '1.3', 'Science Proficiency', 'Students will develop scientific literacy and meet state science standards', 1, 3, 'at-risk', NOW(), NOW()),
  ('b0000001-0004-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000000', '1.4', 'Growth Mindset Development', 'Foster resilience and growth mindset in all students', 1, 4, 'on-target', NOW(), NOW()),
  ('b0000001-0005-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000000', '1.5', 'Student Engagement', 'Increase student engagement and reduce chronic absenteeism', 1, 5, 'critical', NOW(), NOW()),
  ('b0000001-0006-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000000', '1.6', 'Early Childhood Success', 'Ensure kindergarten readiness and early elementary achievement', 1, 6, 'on-target', NOW(), NOW());

-- Sub-goals for Goal 1.1 (ELA/Reading)
INSERT INTO public.spb_goals (
  id, district_id, parent_id, goal_number, title, description, level, order_position, status, created_at, updated_at
) VALUES
  ('b0000001-0001-0001-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'b0000001-0001-0000-0000-000000000000', '1.1.1', 'K-2 Reading Foundation', 'Establish strong reading foundations in grades K-2 with 90% meeting benchmarks', 2, 1, 'on-target', NOW(), NOW()),
  ('b0000001-0001-0002-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'b0000001-0001-0000-0000-000000000000', '1.1.2', 'Grade 3-5 Reading Comprehension', 'Improve reading comprehension and fluency in intermediate grades', 2, 2, 'at-risk', NOW(), NOW()),
  ('b0000001-0001-0003-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'b0000001-0001-0000-0000-000000000000', '1.1.3', 'Middle School Literacy', 'Advance literacy skills across content areas in grades 6-8', 2, 3, 'on-target', NOW(), NOW());

-- Sub-goals for Goal 1.2 (Mathematics)
INSERT INTO public.spb_goals (
  id, district_id, parent_id, goal_number, title, description, level, order_position, status, created_at, updated_at
) VALUES
  ('b0000001-0002-0001-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'b0000001-0002-0000-0000-000000000000', '1.2.1', 'Elementary Math Fundamentals', 'Build strong number sense and computational skills in K-5', 2, 1, 'on-target', NOW(), NOW()),
  ('b0000001-0002-0002-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'b0000001-0002-0000-0000-000000000000', '1.2.2', 'Algebraic Thinking', 'Develop algebraic reasoning and problem-solving skills', 2, 2, 'on-target', NOW(), NOW());

-- Strategic Objective 2: Educational Excellence
INSERT INTO public.spb_goals (
  id, district_id, parent_id, goal_number, title, description, level, order_position,
  status, cover_photo_url, cover_photo_alt, created_at, updated_at
) VALUES (
  'b0000002-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  NULL,
  '2',
  'Educational Excellence & Innovation',
  'Provide high-quality instruction and innovative learning experiences for all students',
  0,
  2,
  'at-risk',
  'https://images.unsplash.com/photo-1509062522246-3755977927d7',
  'Teacher with students',
  NOW(),
  NOW()
);

-- Level 1 Goals under Objective 2
INSERT INTO public.spb_goals (
  id, district_id, parent_id, goal_number, title, description, level, order_position, status, created_at, updated_at
) VALUES
  ('b0000002-0001-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'b0000002-0000-0000-0000-000000000000', '2.1', 'Instructional Quality', 'Deliver evidence-based, high-quality instruction aligned to standards', 1, 1, 'at-risk', NOW(), NOW()),
  ('b0000002-0002-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'b0000002-0000-0000-0000-000000000000', '2.2', 'Technology Integration', 'Effectively integrate technology to enhance learning outcomes', 1, 2, 'on-target', NOW(), NOW()),
  ('b0000002-0003-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'b0000002-0000-0000-0000-000000000000', '2.3', 'Professional Development', 'Support continuous professional growth for all educators', 1, 3, 'on-target', NOW(), NOW());

-- ============================================================================
-- STEP 4: Eastside District - Basic Structure
-- ============================================================================

-- Strategic Objective 1: College & Career Readiness
INSERT INTO public.spb_goals (
  id, district_id, parent_id, goal_number, title, description, level, order_position,
  status, cover_photo_url, cover_photo_alt, created_at, updated_at
) VALUES (
  'b0001001-0000-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000001',
  NULL,
  '1',
  'College & Career Readiness',
  'Prepare all students for success in college, career, and life',
  0,
  1,
  'on-target',
  'https://images.unsplash.com/photo-1596495578065-6e0763fa1178',
  'Graduation celebration',
  NOW(),
  NOW()
);

-- Level 1 Goals under Eastside Objective 1
INSERT INTO public.spb_goals (
  id, district_id, parent_id, goal_number, title, description, level, order_position, status, created_at, updated_at
) VALUES
  ('b0001001-0001-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000001', 'b0001001-0000-0000-0000-000000000000', '1.1', 'Graduation Rate', 'Achieve 95% four-year graduation rate', 1, 1, 'on-target', NOW(), NOW()),
  ('b0001001-0002-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000001', 'b0001001-0000-0000-0000-000000000000', '1.2', 'College Enrollment', 'Increase post-secondary enrollment to 80%', 1, 2, 'at-risk', NOW(), NOW());

-- ============================================================================
-- STEP 5: Metrics for Westside Goals
-- ============================================================================

-- Metrics for Goal 1.1.1 (K-2 Reading Foundation)
INSERT INTO public.spb_metrics (
  id, goal_id, name, metric_type, data_source, current_value, target_value, unit,
  status, chart_type, is_higher_better, metric_calculation_type, baseline_value, created_at, updated_at
) VALUES
  ('a0000001-0001-0001-0001-000000000000', 'b0000001-0001-0001-0000-000000000000', 'K-2 Reading Proficiency Rate', 'percent', 'state_testing', 85, 90, '%', 'near-target', 'bar', true, 'percentage', NULL, NOW(), NOW()),
  ('a0000001-0001-0001-0002-000000000000', 'b0000001-0001-0001-0000-000000000000', 'Benchmark Assessment Pass Rate', 'percent', 'map_data', 88, 92, '%', 'on-target', 'line', true, 'percentage', NULL, NOW(), NOW());

-- Metrics for Goal 1.1.2 (Grade 3-5 Reading)
INSERT INTO public.spb_metrics (
  id, goal_id, name, metric_type, data_source, current_value, target_value, unit,
  status, chart_type, is_higher_better, metric_calculation_type, baseline_value, created_at, updated_at
) VALUES
  ('a0000001-0001-0002-0001-000000000000', 'b0000001-0001-0002-0000-000000000000', 'Reading Comprehension Score', 'rating', 'state_testing', 3.8, 4.0, 'out of 5', 'near-target', 'gauge', true, 'numeric', NULL, NOW(), NOW()),
  ('a0000001-0001-0002-0002-000000000000', 'b0000001-0001-0002-0000-000000000000', 'Fluency Words Per Minute', 'number', 'map_data', 145, 160, 'wpm', 'off-target', 'bar', true, 'numeric', NULL, NOW(), NOW());

-- Metrics for Goal 1.2.1 (Elementary Math)
INSERT INTO public.spb_metrics (
  id, goal_id, name, metric_type, data_source, current_value, target_value, unit,
  status, chart_type, is_higher_better, metric_calculation_type, baseline_value, created_at, updated_at
) VALUES
  ('a0000001-0002-0001-0001-000000000000', 'b0000001-0002-0001-0000-000000000000', 'Math Proficiency Rate', 'percent', 'state_testing', 82, 85, '%', 'on-target', 'bar', true, 'percentage', NULL, NOW(), NOW()),
  ('a0000001-0002-0001-0002-000000000000', 'b0000001-0002-0001-0000-000000000000', 'Number Sense Assessment', 'percent', 'map_data', 90, 88, '%', 'on-target', 'line', true, 'percentage', NULL, NOW(), NOW());

-- Metrics for Goal 1.5 (Student Engagement)
INSERT INTO public.spb_metrics (
  id, goal_id, name, metric_type, data_source, current_value, target_value, unit,
  status, chart_type, is_higher_better, metric_calculation_type, baseline_value, created_at, updated_at
) VALUES
  ('a0000001-0005-0000-0001-000000000000', 'b0000001-0005-0000-0000-000000000000', 'Chronic Absenteeism Rate', 'percent', 'total_number', 12, 8, '%', 'off-target', 'line', false, 'ratio', 15, NOW(), NOW()),
  ('a0000001-0005-0000-0002-000000000000', 'b0000001-0005-0000-0000-000000000000', 'Student Engagement Survey', 'rating', 'survey', 3.6, 4.2, 'out of 5', 'off-target', 'gauge', true, 'numeric', NULL, NOW(), NOW());

-- Narrative metric example for Goal 2.1 (Instructional Quality)
INSERT INTO public.spb_metrics (
  id, goal_id, name, metric_type, data_source, current_value, target_value, unit,
  status, chart_type, is_higher_better, metric_calculation_type, baseline_value, created_at, updated_at
) VALUES
  ('a0000002-0001-0000-0001-000000000000', 'b0000002-0001-0000-0000-000000000000', 'Instructional Framework Implementation', 'narrative', 'narrative', NULL, NULL, NULL, NULL, 'narrative', true, 'qualitative', NULL, NOW(), NOW());

-- Add narrative content for the narrative metric
INSERT INTO public.spb_metric_narratives (
  id, metric_id, district_id, period, period_type, title, content, summary,
  sentiment, status_indicator, author_id, author_name, is_published, published_at, created_at, updated_at
) VALUES
  ('a0001001-0000-0000-0000-000000000001', 'a0000002-0001-0000-0001-000000000000',
   'a0000000-0000-0000-0000-000000000002', '2024-Q1', 'quarterly',
   'Instructional Framework Q1 Update',
   '<h3>Implementation Progress</h3><p>Our district has successfully implemented the new instructional framework across all K-12 buildings. Teacher feedback has been overwhelmingly positive, with 92% reporting increased student engagement.</p><p><strong>Key Achievements:</strong></p><ul><li>100% teacher training completion</li><li>Monthly coaching cycles established</li><li>Peer observation protocols in place</li></ul><p>Next steps include refining our assessment practices to better align with the framework.</p>',
   'Successful framework implementation with 92% teacher approval',
   'positive', 'on-track',
   'a0000000-0000-0000-0000-000000000003', 'Dr. Sarah Johnson',
   true, NOW(), NOW(), NOW());

-- TODO: Add Eastside metrics in future iteration for comparison testing

-- ============================================================================
-- STEP 6: Time Series Data for Metrics
-- ============================================================================
-- TODO: Add time series data with proper district_id and period_type fields in future iteration

-- ============================================================================
-- STEP 7: Calculate Overall Progress for All Goals
-- ============================================================================
-- TODO: Progress calculation disabled - see issue #8
-- Bug: RETURNING 1 INTO fails with multiple row updates in recalculate_district_progress()
-- Issue: https://github.com/ptoney514/strategic-plan-workspace/issues/8
-- Can be run manually after bug is fixed

-- ============================================================================
-- STEP 8: Verification & Summary
-- ============================================================================

-- Show district summary
SELECT
  d.name as district,
  d.slug,
  COUNT(DISTINCT g.id) as total_goals,
  COUNT(DISTINCT CASE WHEN g.level = 0 THEN g.id END) as objectives,
  COUNT(DISTINCT CASE WHEN g.level = 1 THEN g.id END) as goals,
  COUNT(DISTINCT CASE WHEN g.level = 2 THEN g.id END) as subgoals,
  COUNT(DISTINCT m.id) as total_metrics
FROM spb_districts d
LEFT JOIN spb_goals g ON g.district_id = d.id
LEFT JOIN spb_metrics m ON m.goal_id = g.id
GROUP BY d.id, d.name, d.slug
ORDER BY d.name;

-- Show goals hierarchy for Westside
SELECT
  goal_number,
  REPEAT('  ', level) || title as title,
  CASE level
    WHEN 0 THEN 'Strategic Objective'
    WHEN 1 THEN 'Goal'
    WHEN 2 THEN 'Sub-goal'
  END as type,
  status,
  COALESCE(overall_progress_override, overall_progress, 0) as progress
FROM spb_goals
WHERE district_id = 'a0000000-0000-0000-0000-000000000002'
ORDER BY goal_number;

-- Show metrics summary
SELECT
  g.goal_number,
  g.title as goal_title,
  COUNT(m.id) as metric_count,
  COUNT(ts.id) as time_series_points
FROM spb_goals g
LEFT JOIN spb_metrics m ON m.goal_id = g.id
LEFT JOIN spb_metric_time_series ts ON ts.metric_id = m.id
WHERE g.district_id = 'a0000000-0000-0000-0000-000000000002'
GROUP BY g.id, g.goal_number, g.title
HAVING COUNT(m.id) > 0
ORDER BY g.goal_number;

COMMIT;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

SELECT
  '✅ Seed data loaded successfully!' as message,
  'Access Westside at: http://localhost:5173/westside' as westside_url,
  'Access Eastside at: http://localhost:5173/eastside' as eastside_url,
  'Supabase Studio at: http://127.0.0.1:54323' as studio_url;
