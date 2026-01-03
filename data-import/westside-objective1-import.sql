-- Westside Community Schools - Objective 1 Data Import
-- Generated from OnStrategy data capture on 2026-01-02
-- FIXED: Added visualization_type to all metric inserts

-- ============================================================================
-- CONFIGURATION
-- ============================================================================
DO $$
DECLARE
  v_district_id UUID := 'a0000000-0000-0000-0000-000000000002';
  v_district_exists BOOLEAN;
BEGIN
  SELECT EXISTS(SELECT 1 FROM spb_districts WHERE id = v_district_id) INTO v_district_exists;
  IF NOT v_district_exists THEN
    RAISE EXCEPTION 'Westside district not found. Please run setup_westside_complete.sql first.';
  END IF;
  RAISE NOTICE 'Westside district found. Starting import...';
END $$;

-- ============================================================================
-- CLEAN UP EXISTING OBJECTIVE 1 DATA
-- ============================================================================
DO $$
DECLARE
  v_district_id UUID := 'a0000000-0000-0000-0000-000000000002';
BEGIN
  DELETE FROM spb_metric_time_series
  WHERE metric_id IN (
    SELECT m.id FROM spb_metrics m
    JOIN spb_goals g ON m.goal_id = g.id
    WHERE g.district_id = v_district_id AND g.goal_number LIKE '1%'
  );

  DELETE FROM spb_metrics
  WHERE goal_id IN (
    SELECT id FROM spb_goals WHERE district_id = v_district_id AND goal_number LIKE '1%'
  );

  DELETE FROM spb_goals WHERE district_id = v_district_id AND goal_number LIKE '1%' AND level = 2;
  DELETE FROM spb_goals WHERE district_id = v_district_id AND goal_number LIKE '1%' AND level = 1;
  DELETE FROM spb_goals WHERE district_id = v_district_id AND goal_number = '1' AND level = 0;

  RAISE NOTICE 'Cleaned up existing Objective 1 data.';
END $$;

-- ============================================================================
-- OBJECTIVE 1 (Level 0)
-- ============================================================================
INSERT INTO spb_goals (id, district_id, goal_number, title, level, order_position)
VALUES ('b1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '1', 'Student Achievement & Well-being', 0, 1);

-- ============================================================================
-- GOAL 1.1 (Level 1)
-- ============================================================================
INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, level, order_position)
VALUES ('b1100000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', '1.1', 'Grow and nurture a district culture that values, demonstrates, and promotes a sense of belonging', 1, 1);

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type)
VALUES ('c1100000-0000-0000-0000-000000000001', 'b1100000-0000-0000-0000-000000000001', 'Sense of Belonging Rating', 'rating', 3.74, 3.66, 'rating (1-5)', true, 'Overall average of responses (1-5 rating) on sense of belonging', 'gauge');

-- Goal 1.1.1
INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, level, order_position)
VALUES ('b1110000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1100000-0000-0000-0000-000000000001', '1.1.1', 'Proportional enrollment of non-white students in Honors / AP classes mirroring the student population', 2, 1);

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type)
VALUES ('c1110000-0000-0000-0000-000000000001', 'b1110000-0000-0000-0000-000000000001', '% non-white students in Honors/AP', 'percent', 85, 90, '%', true, '% non-white students involved in Honors/AP courses', 'progress');

-- Goal 1.1.2
INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, level, order_position)
VALUES ('b1120000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1100000-0000-0000-0000-000000000001', '1.1.2', 'Discipline disproportionality - Risk Ratio for Students who are OSS / Expulsion and Black/AA', 2, 2);

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, baseline_value, description, visualization_type)
VALUES ('c1120000-0000-0000-0000-000000000001', 'b1120000-0000-0000-0000-000000000001', 'Risk Ratio (Black/AA OSS/Expulsion)', 'number', 4.1, 1.8, 'risk ratio', false, 2.0, 'Risk ratio as compared to 1 white student - LOWER is better', 'number');

-- Goal 1.1.3
INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, level, order_position)
VALUES ('b1130000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1100000-0000-0000-0000-000000000001', '1.1.3', 'Special Education disproportionality', 2, 3);

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type)
VALUES ('c1130000-0000-0000-0000-000000000001', 'b1130000-0000-0000-0000-000000000001', 'SpEd Disproportionality Risk Ratio', 'number', 3.1, 1.0, 'risk ratio', false, 'Risk ratio as compared to 1 white student - LOWER is better', 'number');

-- ============================================================================
-- GOAL 1.2 (Level 1)
-- ============================================================================
INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, level, order_position)
VALUES ('b1200000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', '1.2', 'NDE Academic Classification', 1, 2);

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type)
VALUES ('c1200000-0000-0000-0000-000000000001', 'b1200000-0000-0000-0000-000000000001', 'NDE Academic Classification Score', 'percent', 90, 100, 'score', true, 'Excellent: 100%; Great: 90%; Good: 80%; Needs Improvement: 70%', 'gauge');

-- Goal 1.2.1
INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, level, order_position)
VALUES ('b1210000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1200000-0000-0000-0000-000000000001', '1.2.1', 'NSCAS 3 ELA', 2, 1);

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type)
VALUES ('c1210000-0000-0000-0000-000000000001', 'b1210000-0000-0000-0000-000000000001', 'NSCAS 3 ELA vs State Average', 'number', 8, 0, 'percent diff', true, 'Percent higher or lower than the state average', 'number');

-- Goal 1.2.2
INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, level, order_position)
VALUES ('b1220000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1200000-0000-0000-0000-000000000001', '1.2.2', 'NSCAS 3 Math', 2, 2);

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type)
VALUES ('c1220000-0000-0000-0000-000000000001', 'b1220000-0000-0000-0000-000000000001', 'NSCAS 3 Math vs State Average', 'number', 5, 0, 'percent diff', true, 'Percent higher or lower than the state average', 'number');

-- Goal 1.2.3
INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, level, order_position)
VALUES ('b1230000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1200000-0000-0000-0000-000000000001', '1.2.3', 'NSCAS 4 ELA', 2, 3);

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type)
VALUES ('c1230000-0000-0000-0000-000000000001', 'b1230000-0000-0000-0000-000000000001', 'NSCAS 4 ELA vs State Average', 'number', 12, 0, 'percent diff', true, 'Percent higher or lower than the state average', 'number');

-- ============================================================================
-- GOAL 1.3 (Level 1)
-- ============================================================================
INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, level, order_position)
VALUES ('b1300000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', '1.3', 'Average Score of Teachers on the Instructional Model Self-Assessment Rubric', 1, 3);

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type)
VALUES ('c1300000-0000-0000-0000-000000000001', 'b1300000-0000-0000-0000-000000000001', 'Instructional Model Self-Assessment Score', 'rating', 3.65, 3.7, 'rating', true, '% meeting expectations', 'gauge');

-- ============================================================================
-- GOAL 1.4 (Level 1)
-- ============================================================================
INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, level, order_position)
VALUES ('b1400000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', '1.4', 'Student learning is personalized, with intervention and enrichment opportunities included', 1, 4);

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type)
VALUES ('c1400000-0000-0000-0000-000000000001', 'b1400000-0000-0000-0000-000000000001', 'Status of Supporting Items', 'percent', 100, 100, '%', true, 'Status of Supporting Items', 'progress');

-- Goal 1.4.1-1.4.6
INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, level, order_position) VALUES
  ('b1410000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1400000-0000-0000-0000-000000000001', '1.4.1', 'Instructors personalize learning by offering intervention opportunities', 2, 1),
  ('b1420000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1400000-0000-0000-0000-000000000001', '1.4.2', 'Instructors use data to determine students who struggle with course content', 2, 2),
  ('b1430000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1400000-0000-0000-0000-000000000001', '1.4.3', 'When teachers can tell a student doesnt know the material, students feel like they are offered help', 2, 3),
  ('b1440000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1400000-0000-0000-0000-000000000001', '1.4.4', 'Instructors use data to determine which students excel', 2, 4),
  ('b1450000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1400000-0000-0000-0000-000000000001', '1.4.5', 'Instructors personalized learning by offering extension', 2, 5),
  ('b1460000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1400000-0000-0000-0000-000000000001', '1.4.6', 'When teachers can tell a student knows the material, they are given opportunities to extend', 2, 6);

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type) VALUES
  ('c1410000-0000-0000-0000-000000000001', 'b1410000-0000-0000-0000-000000000001', 'Instructors offering intervention', 'percent', 96, 90, '%', true, 'Percent of instructors who personalize learning by offering intervention', 'progress'),
  ('c1420000-0000-0000-0000-000000000001', 'b1420000-0000-0000-0000-000000000001', 'Instructors using data for struggling students', 'percent', 96, 90, '%', true, 'Percent of instructors who use data to determine students who struggle', 'progress'),
  ('c1430000-0000-0000-0000-000000000001', 'b1430000-0000-0000-0000-000000000001', 'Students feel offered help', 'percent', 82, 80, '%', true, 'Percent of students who indicate teachers offer help', 'progress'),
  ('c1440000-0000-0000-0000-000000000001', 'b1440000-0000-0000-0000-000000000001', 'Instructors using data for excelling students', 'percent', 95, 90, '%', true, 'Percent of instructors who use data to determine which students excel', 'progress'),
  ('c1450000-0000-0000-0000-000000000001', 'b1450000-0000-0000-0000-000000000001', 'Instructors offering extension', 'percent', 87, 85, '%', true, 'Percent of instructors who offer extension', 'progress'),
  ('c1460000-0000-0000-0000-000000000001', 'b1460000-0000-0000-0000-000000000001', 'Students given extension opportunities', 'percent', 69, 70, '%', true, 'Percent of students given extension opportunities', 'progress');

-- ============================================================================
-- GOAL 1.5 (Level 1)
-- ============================================================================
INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, level, order_position)
VALUES ('b1500000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', '1.5', 'Curriculum is regularly reviewed and updated to reflect that the highest materials and assessments', 1, 5);

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type)
VALUES ('c1500000-0000-0000-0000-000000000001', 'b1500000-0000-0000-0000-000000000001', '% complete audit of curriculum maps', 'percent', 90, 90, '%', true, '% complete audit of curriculum maps', 'progress');

-- ============================================================================
-- GOAL 1.6 (Level 1)
-- ============================================================================
INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, level, order_position)
VALUES ('b1600000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', '1.6', 'All students learn and practice social-emotional skills, including how to manage emotions, set goals', 1, 6);

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type)
VALUES ('c1600000-0000-0000-0000-000000000001', 'b1600000-0000-0000-0000-000000000001', '% not at risk on SAEBRS PBiS screener', 'percent', 69.8, 70, '%', true, '% not at risk on SAEBRS PBiS screener', 'progress');

-- Goal 1.6.1
INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, level, order_position)
VALUES ('b1610000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1600000-0000-0000-0000-000000000001', '1.6.1', 'Office referral data', 2, 1);

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type)
VALUES ('c1610000-0000-0000-0000-000000000001', 'b1610000-0000-0000-0000-000000000001', '# total major office referrals', 'number', 5600, 6500, 'count', false, '# total major office referrals - LOWER is better', 'bar');

INSERT INTO spb_metric_time_series (metric_id, district_id, period, period_type, target_value, actual_value, status) VALUES
  ('c1610000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2021', 'annual', 7800, 8200, 'off-target'),
  ('c1610000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2022', 'annual', 6800, 6400, 'on-target'),
  ('c1610000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2023', 'annual', 6200, 6200, 'on-target'),
  ('c1610000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2024', 'annual', 7400, 5600, 'on-target');

-- Goal 1.6.2
INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, level, order_position)
VALUES ('b1620000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1600000-0000-0000-0000-000000000001', '1.6.2', 'Percent of students with 0-1 office referrals', 2, 2);

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type)
VALUES ('c1620000-0000-0000-0000-000000000001', 'b1620000-0000-0000-0000-000000000001', '% of Students with 0-1 referrals', 'percent', 85.22, 87, '%', true, '% of Students with 0-1 office referrals', 'bar');

INSERT INTO spb_metric_time_series (metric_id, district_id, period, period_type, target_value, actual_value, status) VALUES
  ('c1620000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2021', 'annual', 84, 85, 'on-target'),
  ('c1620000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2022', 'annual', 85, 91, 'on-target'),
  ('c1620000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2023', 'annual', 86, 86, 'on-target'),
  ('c1620000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2024', 'annual', 87, 89, 'on-target');

-- ============================================================================
-- GOAL 1.7 (Level 1)
-- ============================================================================
INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, level, order_position)
VALUES ('b1700000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', '1.7', 'Career readiness skills are integrated throughout the K-12 curriculum across all content areas', 1, 7);

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type)
VALUES ('c1700000-0000-0000-0000-000000000001', 'b1700000-0000-0000-0000-000000000001', '% complete integration of career readiness skills', 'percent', 90, 90, '%', true, '% complete integration of career readiness skills to curriculum maps', 'progress');

-- ============================================================================
-- GOAL 1.8 (Level 1)
-- ============================================================================
INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, level, order_position)
VALUES ('b1800000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1000000-0000-0000-0000-000000000001', '1.8', 'Dual enrollment coursework, career academies, and work-based learning opportunities are available to all', 1, 8);

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type)
VALUES ('c1800000-0000-0000-0000-000000000001', 'b1800000-0000-0000-0000-000000000001', 'Status of Supporting Items', 'percent', 89, 100, '%', true, 'Status of Supporting Items', 'progress');

-- Goal 1.8.1
INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, level, order_position)
VALUES ('b1810000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1800000-0000-0000-0000-000000000001', '1.8.1', '# of AP course registrations', 2, 1);

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type)
VALUES ('c1810000-0000-0000-0000-000000000001', 'b1810000-0000-0000-0000-000000000001', '# of AP course registrations', 'number', 985, 950, 'count', true, '# of AP course registrations', 'number');

-- Goal 1.8.2
INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, level, order_position)
VALUES ('b1820000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1800000-0000-0000-0000-000000000001', '1.8.2', '# in MCC, UNMC, zoo Career Academies', 2, 2);

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type)
VALUES ('c1820000-0000-0000-0000-000000000001', 'b1820000-0000-0000-0000-000000000001', '# in MCC, UNMC, zoo Career Academies', 'number', 19, 15, 'count', true, '# in MCC, UNMC, zoo Career Academies', 'number');

-- Goal 1.8.3
INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, level, order_position)
VALUES ('b1830000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1800000-0000-0000-0000-000000000001', '1.8.3', 'Avenue Scholars Participants', 2, 3);

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type)
VALUES ('c1830000-0000-0000-0000-000000000001', 'b1830000-0000-0000-0000-000000000001', '# Intern Omaha accepted offers', 'number', 42, 35, 'count', true, '# Intern Omaha accepted offers', 'bar');

INSERT INTO spb_metric_time_series (metric_id, district_id, period, period_type, target_value, actual_value, status) VALUES
  ('c1830000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2021', 'annual', 3, 3, 'on-target'),
  ('c1830000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2022', 'annual', 25, 25, 'on-target'),
  ('c1830000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2023', 'annual', 34, 42, 'on-target'),
  ('c1830000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2024', 'annual', 34, 25, 'off-target');

-- Goal 1.8.4
INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, level, order_position)
VALUES ('b1840000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1800000-0000-0000-0000-000000000001', '1.8.4', '# UNO and Wesleyan Dual Enrollments', 2, 4);

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type)
VALUES ('c1840000-0000-0000-0000-000000000001', 'b1840000-0000-0000-0000-000000000001', '# UNO Dual Enrollments', 'number', 503, 470, 'count', true, '# UNO Dual Enrollments', 'number');

-- Goal 1.8.5
INSERT INTO spb_goals (id, district_id, parent_id, goal_number, title, level, order_position)
VALUES ('b1850000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b1800000-0000-0000-0000-000000000001', '1.8.5', 'MCC Total Hours', 2, 5);

INSERT INTO spb_metrics (id, goal_id, name, metric_type, current_value, target_value, unit, is_higher_better, description, visualization_type)
VALUES ('c1850000-0000-0000-0000-000000000001', 'b1850000-0000-0000-0000-000000000001', '# MCC total hours', 'number', 6200, 2500, 'hours', true, '# MCC total hours', 'bar');

INSERT INTO spb_metric_time_series (metric_id, district_id, period, period_type, target_value, actual_value, status) VALUES
  ('c1850000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2021', 'annual', 1500, 2000, 'on-target'),
  ('c1850000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2022', 'annual', 2000, 5000, 'on-target'),
  ('c1850000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2023', 'annual', 2500, 6000, 'on-target'),
  ('c1850000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', '2024', 'annual', 1000, 6500, 'on-target');

-- ============================================================================
-- RECALCULATE PROGRESS
-- ============================================================================
SELECT recalculate_district_progress('a0000000-0000-0000-0000-000000000002');

-- ============================================================================
-- VERIFICATION
-- ============================================================================
SELECT
  'Import Complete!' as message,
  (SELECT COUNT(*) FROM spb_goals WHERE district_id = 'a0000000-0000-0000-0000-000000000002' AND goal_number LIKE '1%') as goals_imported,
  (SELECT COUNT(*) FROM spb_metrics WHERE goal_id IN (SELECT id FROM spb_goals WHERE district_id = 'a0000000-0000-0000-0000-000000000002' AND goal_number LIKE '1%')) as metrics_imported,
  (SELECT COUNT(*) FROM spb_metric_time_series WHERE district_id = 'a0000000-0000-0000-0000-000000000002') as time_series_records;

SELECT goal_number, title, level, overall_progress FROM spb_goals
WHERE district_id = 'a0000000-0000-0000-0000-000000000002' AND goal_number LIKE '1%'
ORDER BY goal_number;
