-- Complete Westside Setup with Status Column
-- Run this in Supabase Studio SQL Editor at http://127.0.0.1:54323

-- Step 1: Add status columns to spb_goals if they don't exist
ALTER TABLE public.spb_goals 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'not-started',
ADD COLUMN IF NOT EXISTS calculated_status VARCHAR(20),
ADD COLUMN IF NOT EXISTS status_source VARCHAR(20) DEFAULT 'calculated';

-- Step 2: Clean up existing goals for Westside (if any)
DELETE FROM public.spb_goals WHERE district_id = 'a0000000-0000-0000-0000-000000000002';

-- Step 3: Insert Strategic Objective 1
INSERT INTO public.spb_goals (
  id, district_id, parent_id, goal_number, title, description, level, order_position, status, created_at, updated_at
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
  NOW(),
  NOW()
);

-- Step 4: Insert Level 1 Goals (1.1 through 1.6)
INSERT INTO public.spb_goals (
  id, district_id, parent_id, goal_number, title, description, level, order_position, status, created_at, updated_at
) VALUES 
  ('b0000001-0001-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000000', '1.1', 'ELA/Reading Proficiency', 'All students will meet or exceed state standards in English Language Arts and Reading', 1, 1, 'on-target', NOW(), NOW()),
  ('b0000001-0002-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000000', '1.2', 'Mathematics Achievement', 'All students will demonstrate proficiency in mathematics at or above grade level', 1, 2, 'on-target', NOW(), NOW()),
  ('b0000001-0003-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000000', '1.3', 'Science Proficiency', 'Students will develop scientific literacy and meet state science standards', 1, 3, 'monitoring', NOW(), NOW()),
  ('b0000001-0004-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000000', '1.4', 'Growth Mindset Development', 'Foster resilience and growth mindset in all students', 1, 4, 'on-target', NOW(), NOW()),
  ('b0000001-0005-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000000', '1.5', 'Student Engagement', 'Increase student engagement and reduce chronic absenteeism', 1, 5, 'critical', NOW(), NOW()),
  ('b0000001-0006-0000-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'b0000001-0000-0000-0000-000000000000', '1.6', 'Early Childhood Success', 'Ensure kindergarten readiness and early elementary achievement', 1, 6, 'on-target', NOW(), NOW());

-- Step 5: Insert Sub-goals for Goal 1.1 (ELA/Reading)
INSERT INTO public.spb_goals (
  id, district_id, parent_id, goal_number, title, description, level, order_position, status, created_at, updated_at
) VALUES 
  ('b0000001-0001-0001-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'b0000001-0001-0000-0000-000000000000', '1.1.1', 'K-2 Reading Foundation', 'Establish strong reading foundations in grades K-2 with 90% meeting benchmarks', 2, 1, 'on-target', NOW(), NOW()),
  ('b0000001-0001-0002-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'b0000001-0001-0000-0000-000000000000', '1.1.2', 'Grade 3-5 Reading Comprehension', 'Improve reading comprehension and fluency in intermediate grades', 2, 2, 'monitoring', NOW(), NOW()),
  ('b0000001-0001-0003-0000-000000000000', 'a0000000-0000-0000-0000-000000000002', 'b0000001-0001-0000-0000-000000000000', '1.1.3', 'Middle School Literacy', 'Advance literacy skills across content areas in grades 6-8', 2, 3, 'on-target', NOW(), NOW());

-- Step 6: Verify the structure
SELECT 
  goal_number,
  title,
  level,
  status,
  CASE level
    WHEN 0 THEN 'Strategic Objective'
    WHEN 1 THEN 'Goal'
    WHEN 2 THEN 'Sub-goal'
  END as type
FROM spb_goals 
WHERE district_id = 'a0000000-0000-0000-0000-000000000002'
ORDER BY goal_number;

-- Show success message
SELECT 'Success! Westside goals created with proper hierarchy.' as message;