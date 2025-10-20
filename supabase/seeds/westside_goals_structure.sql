-- Westside Strategic Objectives, Goals, and Sub-goals
-- Based on real data provided by user
-- Run this in Supabase Studio SQL Editor at http://127.0.0.1:54323

-- Clean up existing goals for Westside (if any)
DELETE FROM public.spb_goals WHERE district_id = 'a0000000-0000-0000-0000-000000000002';

-- Level 0: Strategic Objective 1
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

-- Level 1: Goal 1.1
INSERT INTO public.spb_goals (
  id, district_id, parent_id, goal_number, title, description, level, order_position, status, created_at, updated_at
) VALUES (
  'b0000001-0001-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'b0000001-0000-0000-0000-000000000000',
  '1.1',
  'ELA/Reading Proficiency',
  'All students will meet or exceed state standards in English Language Arts and Reading',
  1,
  1,
  'on-target',
  NOW(),
  NOW()
);

-- Level 1: Goal 1.2
INSERT INTO public.spb_goals (
  id, district_id, parent_id, goal_number, title, description, level, order_position, status, created_at, updated_at
) VALUES (
  'b0000001-0002-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'b0000001-0000-0000-0000-000000000000',
  '1.2',
  'Mathematics Achievement',
  'All students will demonstrate proficiency in mathematics at or above grade level',
  1,
  2,
  'on-target',
  NOW(),
  NOW()
);

-- Level 1: Goal 1.3
INSERT INTO public.spb_goals (
  id, district_id, parent_id, goal_number, title, description, level, order_position, status, created_at, updated_at
) VALUES (
  'b0000001-0003-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'b0000001-0000-0000-0000-000000000000',
  '1.3',
  'Science Proficiency',
  'Students will develop scientific literacy and meet state science standards',
  1,
  3,
  'monitoring',
  NOW(),
  NOW()
);

-- Level 1: Goal 1.4
INSERT INTO public.spb_goals (
  id, district_id, parent_id, goal_number, title, description, level, order_position, status, created_at, updated_at
) VALUES (
  'b0000001-0004-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'b0000001-0000-0000-0000-000000000000',
  '1.4',
  'Growth Mindset Development',
  'Foster resilience and growth mindset in all students',
  1,
  4,
  'on-target',
  NOW(),
  NOW()
);

-- Level 1: Goal 1.5
INSERT INTO public.spb_goals (
  id, district_id, parent_id, goal_number, title, description, level, order_position, status, created_at, updated_at
) VALUES (
  'b0000001-0005-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'b0000001-0000-0000-0000-000000000000',
  '1.5',
  'Student Engagement',
  'Increase student engagement and reduce chronic absenteeism',
  1,
  5,
  'critical',
  NOW(),
  NOW()
);

-- Level 1: Goal 1.6
INSERT INTO public.spb_goals (
  id, district_id, parent_id, goal_number, title, description, level, order_position, status, created_at, updated_at
) VALUES (
  'b0000001-0006-0000-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'b0000001-0000-0000-0000-000000000000',
  '1.6',
  'Early Childhood Success',
  'Ensure kindergarten readiness and early elementary achievement',
  1,
  6,
  'on-target',
  NOW(),
  NOW()
);

-- Level 2: Sub-goals for Goal 1.1 (ELA/Reading)
INSERT INTO public.spb_goals (
  id, district_id, parent_id, goal_number, title, description, level, order_position, status, created_at, updated_at
) VALUES 
(
  'b0000001-0001-0001-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'b0000001-0001-0000-0000-000000000000',
  '1.1.1',
  'K-2 Reading Foundation',
  'Establish strong reading foundations in grades K-2 with 90% meeting benchmarks',
  2,
  1,
  'on-target',
  NOW(),
  NOW()
),
(
  'b0000001-0001-0002-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'b0000001-0001-0000-0000-000000000000',
  '1.1.2',
  'Grade 3-5 Reading Comprehension',
  'Improve reading comprehension and fluency in intermediate grades',
  2,
  2,
  'monitoring',
  NOW(),
  NOW()
),
(
  'b0000001-0001-0003-0000-000000000000',
  'a0000000-0000-0000-0000-000000000002',
  'b0000001-0001-0000-0000-000000000000',
  '1.1.3',
  'Middle School Literacy',
  'Advance literacy skills across content areas in grades 6-8',
  2,
  3,
  'on-target',
  NOW(),
  NOW()
);

-- Add sample metrics for Goal 1.1 (ELA/Reading)
INSERT INTO public.spb_metrics (
  id, goal_id, name, type, description, current_value, target_value, unit, frequency, created_at, updated_at
) VALUES 
(
  'c0000001-0001-0000-0000-000000000001',
  'b0000001-0001-0000-0000-000000000000',
  'NSCAS ELA Proficiency Rate',
  'percent',
  'Percentage of students scoring proficient or above on state ELA assessment',
  67.5,
  75.0,
  '%',
  'annual',
  NOW(),
  NOW()
),
(
  'c0000001-0001-0000-0000-000000000002',
  'b0000001-0001-0000-0000-000000000000',
  'MAP Reading Growth',
  'percent',
  'Percentage of students meeting MAP reading growth targets',
  72.3,
  80.0,
  '%',
  'tri-annual',
  NOW(),
  NOW()
),
(
  'c0000001-0001-0000-0000-000000000003',
  'b0000001-0001-0000-0000-000000000000',
  'Lexile Level Progress',
  'number',
  'Average Lexile growth per year',
  125,
  150,
  'points',
  'annual',
  NOW(),
  NOW()
);

-- Add sample metrics for Goal 1.5 (Student Engagement - Critical Status)
INSERT INTO public.spb_metrics (
  id, goal_id, name, type, description, current_value, target_value, unit, frequency, created_at, updated_at
) VALUES 
(
  'c0000001-0005-0000-0000-000000000001',
  'b0000001-0005-0000-0000-000000000000',
  'Chronic Absenteeism Rate',
  'percent',
  'Percentage of students missing 10% or more of school days',
  18.5,
  10.0,
  '%',
  'monthly',
  NOW(),
  NOW()
),
(
  'c0000001-0005-0000-0000-000000000002',
  'b0000001-0005-0000-0000-000000000000',
  'Daily Attendance Rate',
  'percent',
  'Average daily attendance across all schools',
  92.1,
  95.0,
  '%',
  'daily',
  NOW(),
  NOW()
);

-- Verify the structure was created
SELECT 
  'Goals created successfully!' as message;

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