-- Quick script to add Westside district
-- Run this in Supabase Studio SQL editor at http://127.0.0.1:54323

-- First check if Westside already exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM spb_districts WHERE slug = 'westside') THEN
        -- Insert Westside district
        INSERT INTO public.spb_districts (
            id, name, slug, primary_color, secondary_color, admin_email, is_public
        ) VALUES (
            'a0000000-0000-0000-0000-000000000002',
            'Westside Community Schools',
            'westside',
            '#1e3a5f',
            '#f7941d',
            'admin@westside66.org',
            true
        );
        
        RAISE NOTICE 'Westside district created successfully!';
    ELSE
        RAISE NOTICE 'Westside district already exists.';
    END IF;
END $$;

-- Show all districts
SELECT name, slug, primary_color FROM spb_districts ORDER BY name;