-- Westside District Real Data Migration
-- Based on actual strategic plan metrics from screenshots

-- Create Westside District
INSERT INTO public.spb_districts (
  id,
  name,
  slug,
  primary_color,
  secondary_color,
  admin_email,
  is_public,
  created_at,
  updated_at
) VALUES (
  'a0000000-0000-0000-0000-000000000002',
  'Westside Community Schools',
  'westside',
  '#1e3a5f', -- Navy blue
  '#f7941d', -- Orange
  'admin@westside66.org',
  true,
  NOW(),
  NOW()
);

-- Level 0: Strategic Objective
INSERT INTO public.spb_goals (
  id,
  district_id,
  parent_id,
  goal_number,
  title,
  description,
  level,
  order_position,
  status,
  status_source,
  created_at,
  updated_at
) VALUES (
  'b0000001-0000-0000-0000-000000000000', -- Objective 1
  'a0000000-0000-0000-0000-000000000002',
  NULL,
  '1',
  'Student Achievement & Well-being',
  'Ensure all students achieve academic excellence and develop social-emotional well-being',
  0,
  1,
  'on-target',
  'calculated',
  NOW(),
  NOW()
);

-- Level 1: Goals under Objective 1
-- Goal 1.1
INSERT INTO public.spb_goals (
  id,
  district_id,
  parent_id,
  goal_number,
  title,
  description,
  level,
  order_position,
  status,
  created_at
) VALUES (
  'b0000001-0001-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'b0000001-0000-0000-0000-000000000000',
  '1.1',
  'Grow and nurture a district culture that values, demonstrates, and promotes a sense of belonging',
  'Foster an inclusive environment where all students feel valued and connected',
  1,
  1,
  'on-target',
  NOW()
);

-- Goal 1.2
INSERT INTO public.spb_goals (
  id,
  district_id,
  parent_id,
  goal_number,
  title,
  description,
  level,
  order_position,
  status,
  created_at
) VALUES (
  'b0000001-0002-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'b0000001-0000-0000-0000-000000000000',
  '1.2',
  'NDE Academic Classification',
  'Maintain excellent academic classification from Nebraska Department of Education',
  1,
  2,
  'on-target',
  NOW()
);

-- Goal 1.3
INSERT INTO public.spb_goals (
  id,
  district_id,
  parent_id,
  goal_number,
  title,
  description,
  level,
  order_position,
  status,
  created_at
) VALUES (
  'b0000001-0003-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'b0000001-0000-0000-0000-000000000000',
  '1.3',
  'Average Score of Teachers on the Instructional Model Self-Assessment Rubric',
  'Ensure high-quality instruction through continuous teacher development',
  1,
  3,
  'on-target',
  NOW()
);

-- Goal 1.4
INSERT INTO public.spb_goals (
  id,
  district_id,
  parent_id,
  goal_number,
  title,
  description,
  level,
  order_position,
  status,
  created_at
) VALUES (
  'b0000001-0004-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'b0000001-0000-0000-0000-000000000000',
  '1.4',
  'Student learning is personalized, with interventions and extensions',
  'Provide differentiated learning opportunities for all students',
  1,
  4,
  'on-target',
  NOW()
);

-- Goal 1.5
INSERT INTO public.spb_goals (
  id,
  district_id,
  parent_id,
  goal_number,
  title,
  description,
  level,
  order_position,
  status,
  created_at
) VALUES (
  'b0000001-0005-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'b0000001-0000-0000-0000-000000000000',
  '1.5',
  'Curriculum is regularly reviewed and updated to meet student needs',
  'Maintain current and relevant curriculum aligned with standards',
  1,
  5,
  'on-target',
  NOW()
);

-- Goal 1.6
INSERT INTO public.spb_goals (
  id,
  district_id,
  parent_id,
  goal_number,
  title,
  description,
  level,
  order_position,
  status,
  created_at
) VALUES (
  'b0000001-0006-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'b0000001-0000-0000-0000-000000000000',
  '1.6',
  'All students learn and practice social-emotional learning skills',
  'Develop comprehensive SEL programming for student well-being',
  1,
  6,
  'on-target',
  NOW()
);

-- Level 2: Sub-goals under Goal 1.1
-- Sub-goal 1.1.1
INSERT INTO public.spb_goals (
  id,
  district_id,
  parent_id,
  goal_number,
  title,
  description,
  level,
  order_position,
  status,
  created_at
) VALUES (
  'b0000001-0001-0001-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'b0000001-0001-0000-0000-000000000000',
  '1.1.1',
  'Proportional enrollment of non-white students in Honors/AP classes mirroring the student population',
  'Ensure equitable access to advanced coursework',
  2,
  1,
  'off-target',
  NOW()
);

-- Sub-goal 1.1.2
INSERT INTO public.spb_goals (
  id,
  district_id,
  parent_id,
  goal_number,
  title,
  description,
  level,
  order_position,
  status,
  created_at
) VALUES (
  'b0000001-0001-0002-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'b0000001-0001-0000-0000-000000000000',
  '1.1.2',
  'Discipline disproportionality - Risk Ratio for Students who are OSS/Expulsion and non-white compared to white',
  'Address discipline disparities and promote equitable practices',
  2,
  2,
  'critical',
  NOW()
);

-- Sub-goal 1.1.3
INSERT INTO public.spb_goals (
  id,
  district_id,
  parent_id,
  goal_number,
  title,
  description,
  level,
  order_position,
  status,
  created_at
) VALUES (
  'b0000001-0001-0003-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'b0000001-0001-0000-0000-000000000000',
  '1.1.3',
  'Special Education disproportionality in identification',
  'Monitor and address disproportionate identification in special education',
  2,
  3,
  'on-target',
  NOW()
);

-- METRICS DATA
-- Metric for Goal 1.1 (Sense of Belonging)
INSERT INTO public.spb_metrics (
  id,
  goal_id,
  district_id,
  name,
  metric_name,
  metric_type,
  current_value,
  target_value,
  display_value,
  display_label,
  display_sublabel,
  ytd_value,
  ytd_change,
  eoy_projection,
  unit,
  date_range_start,
  date_range_end,
  measurement_scale,
  is_higher_better,
  visualization_type,
  frequency,
  created_at
) VALUES (
  'c0000001-0001-0000-0000-000000000000',
  'b0000001-0001-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'Sense of Belonging Score',
  'Sense of Belonging Score',
  'rating',
  3.74,
  3.75,
  '3.74',
  'Overall average of responses',
  '(1-5 rating) on sense of belonging',
  3.66,
  0.08,
  3.66,
  'rating',
  '2021-09-01',
  '2026-08-31',
  '1-5 rating scale',
  true,
  'line',
  'quarterly',
  NOW()
);

-- Metric for Sub-goal 1.1.1 (AP Enrollment)
INSERT INTO public.spb_metrics (
  id,
  goal_id,
  district_id,
  name,
  metric_name,
  metric_type,
  current_value,
  target_value,
  display_value,
  display_label,
  display_sublabel,
  ytd_value,
  ytd_change,
  eoy_projection,
  unit,
  measurement_scale,
  is_higher_better,
  visualization_type,
  frequency,
  created_at
) VALUES (
  'c0000001-0001-0001-0000-000000000000',
  'b0000001-0001-0001-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'AP Enrollment Proportionality',
  'AP Enrollment Proportionality',
  'percent',
  0.85,
  0.90,
  '0.85',
  '% non-white students involved',
  'in Honors/AP courses',
  0.9,
  -0.05,
  0.9,
  '%',
  'percentage',
  true,
  'bar',
  'annual',
  NOW()
);

-- Metric for Sub-goal 1.1.2 (Discipline Ratio)
INSERT INTO public.spb_metrics (
  id,
  goal_id,
  district_id,
  name,
  metric_name,
  metric_type,
  current_value,
  target_value,
  display_value,
  display_label,
  display_sublabel,
  ytd_value,
  ytd_change,
  eoy_projection,
  unit,
  measurement_scale,
  is_higher_better,
  visualization_type,
  frequency,
  created_at
) VALUES (
  'c0000001-0001-0002-0000-000000000000',
  'b0000001-0001-0002-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'Discipline Risk Ratio',
  'Discipline Risk Ratio',
  'number',
  4.1,
  1.0,
  '4.1',
  'Risk ratio as compared to',
  '1 white student',
  1.8,
  -2.3,
  1.8,
  'ratio',
  'risk ratio',
  false, -- Lower is better for risk ratio
  'bar',
  'annual',
  NOW()
);

-- Metric for Sub-goal 1.1.3 (Special Ed Ratio)
INSERT INTO public.spb_metrics (
  id,
  goal_id,
  district_id,
  name,
  metric_name,
  metric_type,
  current_value,
  target_value,
  display_value,
  display_label,
  display_sublabel,
  unit,
  measurement_scale,
  is_higher_better,
  visualization_type,
  frequency,
  created_at
) VALUES (
  'c0000001-0001-0003-0000-000000000000',
  'b0000001-0001-0003-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'Special Education Risk Ratio',
  'Special Education Risk Ratio',
  'number',
  3.1,
  1.0,
  '3.1',
  'Risk ratio as compared to',
  '1 white student',
  'ratio',
  'risk ratio',
  false,
  'bar',
  'annual',
  NOW()
);

-- Metric for Goal 1.2 (NDE Classification)
INSERT INTO public.spb_metrics (
  id,
  goal_id,
  district_id,
  name,
  metric_name,
  metric_type,
  current_value,
  target_value,
  display_value,
  display_label,
  display_sublabel,
  unit,
  measurement_scale,
  visualization_type,
  created_at
) VALUES (
  'c0000001-0002-0000-0000-000000000000',
  'b0000001-0002-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'NDE Academic Classification',
  'NDE Academic Classification',
  'number',
  90,
  100,
  '90',
  'Excellent: 100%; Great: 90%',
  'Good: 80%; Needs Improvement: <80%',
  'score',
  'classification scale',
  'number',
  NOW()
);

-- Metric for Goal 1.3 (Teacher Score)
INSERT INTO public.spb_metrics (
  id,
  goal_id,
  district_id,
  name,
  metric_name,
  metric_type,
  current_value,
  target_value,
  display_value,
  display_label,
  display_sublabel,
  ytd_value,
  ytd_change,
  eoy_projection,
  unit,
  measurement_scale,
  is_higher_better,
  visualization_type,
  frequency,
  created_at
) VALUES (
  'c0000001-0003-0000-0000-000000000000',
  'b0000001-0003-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'Teacher Self-Assessment Score',
  'Teacher Self-Assessment Score',
  'rating',
  3.73,
  3.75,
  '3.73',
  '% meeting expectations',
  NULL,
  3.7,
  0.03,
  3.7,
  'rating',
  'rating scale',
  true,
  'line',
  'annual',
  NOW()
);

-- Metric for Goal 1.4 (Personalized Learning)
INSERT INTO public.spb_metrics (
  id,
  goal_id,
  district_id,
  name,
  metric_name,
  metric_type,
  current_value,
  target_value,
  display_value,
  display_label,
  unit,
  visualization_type,
  created_at
) VALUES (
  'c0000001-0004-0000-0000-000000000000',
  'b0000001-0004-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'Personalized Learning Implementation',
  'Personalized Learning Implementation',
  'percent',
  100,
  100,
  '100%',
  'Status of Supporting Items',
  '%',
  'progress',
  NOW()
);

-- Metric for Goal 1.5 (Curriculum Review)
INSERT INTO public.spb_metrics (
  id,
  goal_id,
  district_id,
  name,
  metric_name,
  metric_type,
  current_value,
  target_value,
  display_value,
  display_label,
  unit,
  visualization_type,
  created_at
) VALUES (
  'c0000001-0005-0000-0000-000000000000',
  'b0000001-0005-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'Curriculum Audit Completion',
  'Curriculum Audit Completion',
  'percent',
  90,
  100,
  '90%',
  '% complete audit of curriculum maps',
  '%',
  'progress',
  NOW()
);

-- Metric for Goal 1.6 (SEL)
INSERT INTO public.spb_metrics (
  id,
  goal_id,
  district_id,
  name,
  metric_name,
  metric_type,
  current_value,
  target_value,
  display_value,
  display_label,
  display_sublabel,
  unit,
  visualization_type,
  created_at
) VALUES (
  'c0000001-0006-0000-0000-000000000000',
  'b0000001-0006-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'SAEBRS PBIS Screening',
  'SAEBRS PBIS Screening',
  'percent',
  69.8,
  75,
  '69.8%',
  '% not at risk on SAEBRS',
  'PBIS screener',
  '%',
  'progress',
  NOW()
);

-- TIME SERIES DATA
-- Historical data for Goal 1.1 (Sense of Belonging)
INSERT INTO public.spb_metric_time_series (
  metric_id,
  district_id,
  period,
  period_type,
  actual_value,
  target_value,
  created_at
) VALUES
  ('c0000001-0001-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', '2023-12', 'monthly', 3.66, 3.75, NOW()),
  ('c0000001-0001-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', '2024-03', 'quarterly', 3.74, 3.75, NOW());

-- Historical data for AP Enrollment (1.1.1)
INSERT INTO public.spb_metric_time_series (
  metric_id,
  district_id,
  period,
  period_type,
  actual_value,
  target_value,
  created_at
) VALUES
  ('c0000001-0001-0001-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', '2021', 'annual', 0.79, 0.90, NOW()),
  ('c0000001-0001-0001-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', '2022', 'annual', 0.80, 0.90, NOW()),
  ('c0000001-0001-0001-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', '2023', 'annual', 0.85, 0.90, NOW());

-- Historical data for Discipline Ratio (1.1.2)
INSERT INTO public.spb_metric_time_series (
  metric_id,
  district_id,
  period,
  period_type,
  actual_value,
  target_value,
  created_at
) VALUES
  ('c0000001-0001-0002-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', '2021', 'annual', 4.5, 2.0, NOW()),
  ('c0000001-0001-0002-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', '2022', 'annual', 4.6, 2.0, NOW()),
  ('c0000001-0001-0002-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', '2023', 'annual', 4.1, 1.0, NOW());

-- Historical data for Teacher Score (1.3)
INSERT INTO public.spb_metric_time_series (
  metric_id,
  district_id,
  period,
  period_type,
  actual_value,
  target_value,
  created_at
) VALUES
  ('c0000001-0003-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', '2021', 'annual', 3.59, 3.50, NOW()),
  ('c0000001-0003-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', '2022', 'annual', 3.65, 3.60, NOW()),
  ('c0000001-0003-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', '2023', 'annual', 3.73, 3.70, NOW());

-- Update status calculations based on metrics
UPDATE spb_goals 
SET calculated_status = CASE 
  WHEN goal_number = '1.1.1' THEN 'off-target'  -- 0.85 < 0.90 target
  WHEN goal_number = '1.1.2' THEN 'critical'    -- 4.1 >> 1.0 target
  WHEN goal_number = '1.1.3' THEN 'on-target'   -- Making progress
  ELSE 'on-target'
END,
status_calculation_confidence = 90
WHERE district_id = 'a0000000-0000-0000-0000-000000000002';

-- Summary
SELECT 
  'Westside District data loaded successfully!' as message,
  COUNT(DISTINCT g.id) as total_goals,
  COUNT(DISTINCT m.id) as total_metrics,
  COUNT(DISTINCT t.id) as total_time_series_points
FROM spb_goals g
LEFT JOIN spb_metrics m ON m.goal_id = g.id
LEFT JOIN spb_metric_time_series t ON t.metric_id = m.id
WHERE g.district_id = 'a0000000-0000-0000-0000-000000000002';