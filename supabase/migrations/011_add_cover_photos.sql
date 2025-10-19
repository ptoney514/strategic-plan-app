-- Add cover photo support to goals (objectives)
-- Run this in Supabase Studio SQL Editor at http://127.0.0.1:54323

-- Add cover_photo_url column to spb_goals table
ALTER TABLE public.spb_goals 
ADD COLUMN IF NOT EXISTS cover_photo_url TEXT,
ADD COLUMN IF NOT EXISTS cover_photo_alt TEXT;

-- Create a table for stock photos library
CREATE TABLE IF NOT EXISTS public.spb_stock_photos (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  url TEXT NOT NULL,
  alt_text TEXT NOT NULL,
  category VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert some default stock photos for education
INSERT INTO public.spb_stock_photos (url, alt_text, category) VALUES
  ('https://images.unsplash.com/photo-1523050854058-8df90110c9f1', 'Students celebrating success', 'achievement'),
  ('https://images.unsplash.com/photo-1522202176988-66273c2fd55f', 'Students collaborating', 'collaboration'),
  ('https://images.unsplash.com/photo-1509062522246-3755977927d7', 'Teacher with students', 'teaching'),
  ('https://images.unsplash.com/photo-1427504494785-3a9ca7044f45', 'Students studying', 'learning'),
  ('https://images.unsplash.com/photo-1580582932707-520aed937b7b', 'School classroom', 'environment'),
  ('https://images.unsplash.com/photo-1571260899304-425eee4c7efc', 'Students reading', 'literacy'),
  ('https://images.unsplash.com/photo-1503676260728-1c00da094a0b', 'Education books', 'resources'),
  ('https://images.unsplash.com/photo-1559827260-dc66d52bef19', 'Students with technology', 'technology'),
  ('https://images.unsplash.com/photo-1588072432836-e10032774350', 'Online learning', 'digital'),
  ('https://images.unsplash.com/photo-1596495578065-6e0763fa1178', 'Graduation celebration', 'success')
ON CONFLICT DO NOTHING;

-- Update existing Westside objective with a default cover photo
UPDATE public.spb_goals 
SET cover_photo_url = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1',
    cover_photo_alt = 'Students celebrating success'
WHERE district_id = 'a0000000-0000-0000-0000-000000000002' 
  AND level = 0
  AND title = 'Student Achievement & Well-being';

SELECT 'Cover photo support added successfully!' as message;