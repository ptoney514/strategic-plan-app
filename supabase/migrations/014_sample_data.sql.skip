-- Add Lincoln Public Schools district with sample data

-- Insert Lincoln district if it doesn't exist
INSERT INTO public.spb_districts (id, name, slug, primary_color, secondary_color, is_public)
VALUES (
  'a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Lincoln Public Schools', 
  'lincoln',
  '#CC0000',
  '#000000',
  true
) ON CONFLICT (slug) DO NOTHING;

-- Insert strategic objectives (Level 0 goals) for Lincoln
INSERT INTO public.spb_goals (id, district_id, parent_id, goal_number, title, description, level, order_position)
VALUES 
  ('b1000000-0000-0000-0000-000000000001', 'a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, '1', 'Academic Excellence', 'Ensure all students achieve academic excellence and are college and career ready', 0, 1),
  ('b1000000-0000-0000-0000-000000000002', 'a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, '2', 'Equity and Access', 'Provide equitable access to quality education for all students', 0, 2),
  ('b1000000-0000-0000-0000-000000000003', 'a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, '3', 'Safe and Supportive Environment', 'Create safe and supportive learning environments', 0, 3)
ON CONFLICT (id) DO NOTHING;

-- Insert Level 1 goals for Lincoln
INSERT INTO public.spb_goals (id, district_id, parent_id, goal_number, title, description, level, order_position)
VALUES 
  -- Academic Excellence goals
  ('b1100000-0000-0000-0000-000000000001', 'a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1000000-0000-0000-0000-000000000001', '1.1', 'Improve Student Achievement', 'Increase student achievement across all grade levels', 1, 1),
  ('b1100000-0000-0000-0000-000000000002', 'a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1000000-0000-0000-0000-000000000001', '1.2', 'College Readiness', 'Prepare students for college success', 1, 2),
  
  -- Equity goals
  ('b1200000-0000-0000-0000-000000000001', 'a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1000000-0000-0000-0000-000000000002', '2.1', 'Close Achievement Gaps', 'Eliminate achievement gaps between student groups', 1, 1),
  ('b1200000-0000-0000-0000-000000000002', 'a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1000000-0000-0000-0000-000000000002', '2.2', 'Inclusive Programs', 'Expand inclusive educational programs', 1, 2),
  
  -- Safe Environment goals
  ('b1300000-0000-0000-0000-000000000001', 'a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1000000-0000-0000-0000-000000000003', '3.1', 'School Safety', 'Enhance physical and emotional safety in schools', 1, 1),
  ('b1300000-0000-0000-0000-000000000002', 'a3eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b1000000-0000-0000-0000-000000000003', '3.2', 'Student Well-being', 'Support student mental health and well-being', 1, 2)
ON CONFLICT (id) DO NOTHING;

-- Insert sample metrics for Lincoln
INSERT INTO public.spb_metrics (
  id, goal_id, name, metric_type, current_value, target_value, 
  unit, display_width, visualization_type, is_primary, display_order, description
)
VALUES 
  -- Metrics for Student Achievement
  ('c1100001-0000-0000-0000-000000000001', 'b1100000-0000-0000-0000-000000000001', 
   'Reading Proficiency Rate', 'percent', 72, 85, '%', 'half', 'percentage', true, 0,
   'Percentage of students meeting or exceeding reading standards'),
  
  ('c1100001-0000-0000-0000-000000000002', 'b1100000-0000-0000-0000-000000000001', 
   'Math Proficiency Rate', 'percent', 68, 80, '%', 'half', 'percentage', true, 1,
   'Percentage of students meeting or exceeding math standards'),
  
  -- Metrics for College Readiness
  ('c1100002-0000-0000-0000-000000000001', 'b1100000-0000-0000-0000-000000000002', 
   'SAT Average Score', 'number', 1050, 1200, 'points', 'third', 'number', true, 0,
   'Average SAT score for graduating seniors'),
  
  ('c1100002-0000-0000-0000-000000000002', 'b1100000-0000-0000-0000-000000000002', 
   'College Enrollment Rate', 'percent', 65, 75, '%', 'third', 'percentage', false, 1,
   'Percentage of graduates enrolling in college within one year'),
  
  -- Metrics for Achievement Gaps
  ('c1200001-0000-0000-0000-000000000001', 'b1200000-0000-0000-0000-000000000001', 
   'Achievement Gap Index', 'percent', 15, 5, '%', 'full', 'performance-trend', true, 0,
   'Gap in proficiency rates between demographic groups'),
  
  -- Metrics for School Safety
  ('c1300001-0000-0000-0000-000000000001', 'b1300000-0000-0000-0000-000000000001', 
   'Student Safety Survey', 'rating', 3.8, 4.5, 'rating', 'half', 'survey', true, 0,
   'Average student rating of school safety (1-5 scale)'),
  
  ('c1300002-0000-0000-0000-000000000001', 'b1300000-0000-0000-0000-000000000002', 
   'Mental Health Support Access', 'percent', 78, 95, '%', 'half', 'percentage', true, 0,
   'Percentage of students with access to mental health support services')
ON CONFLICT (id) DO NOTHING;

-- Add time series data for performance trend metric
INSERT INTO public.spb_metric_time_series (
  id, metric_id, period, period_type, target_value, actual_value, status
)
VALUES 
  (gen_random_uuid(), 'c1200001-0000-0000-0000-000000000001', '2023-Q1', 'quarterly', 12, 15, 'off-target'),
  (gen_random_uuid(), 'c1200001-0000-0000-0000-000000000001', '2023-Q2', 'quarterly', 11, 14, 'off-target'),
  (gen_random_uuid(), 'c1200001-0000-0000-0000-000000000001', '2023-Q3', 'quarterly', 10, 13, 'off-target'),
  (gen_random_uuid(), 'c1200001-0000-0000-0000-000000000001', '2023-Q4', 'quarterly', 9, 12, 'off-target'),
  (gen_random_uuid(), 'c1200001-0000-0000-0000-000000000001', '2024-Q1', 'quarterly', 8, 11, 'off-target'),
  (gen_random_uuid(), 'c1200001-0000-0000-0000-000000000001', '2024-Q2', 'quarterly', 7, 10, 'off-target')
ON CONFLICT (id) DO NOTHING;