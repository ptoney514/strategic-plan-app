-- Simple Sample Data for Strategic Plan Vite

-- Insert sample district
INSERT INTO spb_districts (id, name, slug, primary_color, is_public, admin_email)
VALUES 
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Lincoln School District', 'lincoln', '#0F4C81', true, 'admin@lincoln.edu')
ON CONFLICT (id) DO NOTHING;

-- Insert sample goals (hierarchical structure)
INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, description, level, order_position)
VALUES
  -- Strategic Objectives (Level 0)
  ('g1000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, '1', 
   'Academic Excellence', 'Ensure all students achieve academic success and are prepared for college and career', 0, 1),
  
  ('g1000000-0000-0000-0000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', NULL, '2',
   'Safe & Supportive Environment', 'Create inclusive learning environments that support student well-being', 0, 2),
  
  -- Goals under Academic Excellence (Level 1)
  ('g1100000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
   'g1000000-0000-0000-0000-000000000001', '1.1',
   'Improve Literacy Rates', 'Increase reading proficiency across all grade levels', 1, 1),
  
  ('g1100000-0000-0000-0000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 
   'g1000000-0000-0000-0000-000000000001', '1.2',
   'Enhance STEM Programs', 'Expand and improve science, technology, engineering, and math offerings', 1, 2),
  
  -- Sub-goals under Improve Literacy (Level 2)
  ('g1110000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'g1100000-0000-0000-0000-000000000001', '1.1.1',
   'Early Reading Intervention', 'Implement targeted intervention programs for K-3 students', 2, 1)
ON CONFLICT (id) DO NOTHING;

-- Insert sample metrics
INSERT INTO spb_metrics (id, goal_id, district_id, metric_name, description, metric_type, 
  current_value, target_value, unit, frequency, is_primary)
VALUES
  ('m1000000-0000-0000-0000-000000000001', 'g1100000-0000-0000-0000-000000000001', 
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   '3rd Grade Reading Proficiency', 'Percentage of 3rd graders at or above grade level',
   'percent', 72, 85, '%', 'quarterly', true),
  
  ('m1000000-0000-0000-0000-000000000002', 'g1100000-0000-0000-0000-000000000002',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'STEM Enrollment', 'Number of students enrolled in advanced STEM courses',
   'number', 450, 600, 'students', 'yearly', true),
  
  ('m1000000-0000-0000-0000-000000000003', 'g1000000-0000-0000-0000-000000000002',
   'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
   'School Climate Survey', 'Average positive response rate on annual climate survey',
   'percent', 78, 90, '%', 'yearly', true)
ON CONFLICT (id) DO NOTHING;

-- Insert sample time series data
INSERT INTO spb_metric_time_series (metric_id, district_id, period, period_type, actual_value, target_value)
VALUES
  ('m1000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-Q1', 'quarterly', 68, 75),
  ('m1000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-Q2', 'quarterly', 70, 78),
  ('m1000000-0000-0000-0000-000000000001', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024-Q3', 'quarterly', 72, 80),
  ('m1000000-0000-0000-0000-000000000002', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024', 'annual', 450, 500),
  ('m1000000-0000-0000-0000-000000000003', 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', '2024', 'annual', 78, 85)
ON CONFLICT DO NOTHING;