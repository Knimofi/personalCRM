
-- Add new columns to contacts table for split locations, profile pictures, and phone
ALTER TABLE public.contacts 
ADD COLUMN location_met text,
ADD COLUMN location_from text,
ADD COLUMN location_met_latitude numeric,
ADD COLUMN location_met_longitude numeric,
ADD COLUMN location_from_latitude numeric,
ADD COLUMN location_from_longitude numeric,
ADD COLUMN profile_picture_url text,
ADD COLUMN phone text;

-- Migrate existing location data to location_from (assuming current location represents where they're from)
UPDATE public.contacts 
SET location_from = location,
    location_from_latitude = latitude,
    location_from_longitude = longitude
WHERE location IS NOT NULL;

-- Create storage bucket for contact profile pictures
INSERT INTO storage.buckets (id, name, public)
VALUES ('contact-profile-pictures', 'contact-profile-pictures', true);

-- Create RLS policy for profile pictures - users can view all profile pictures
CREATE POLICY "Profile pictures are publicly viewable"
ON storage.objects FOR SELECT
USING (bucket_id = 'contact-profile-pictures');

-- Create RLS policy for profile pictures - authenticated users can upload
CREATE POLICY "Authenticated users can upload profile pictures"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'contact-profile-pictures' AND auth.uid() IS NOT NULL);

-- Create RLS policy for profile pictures - authenticated users can update their own
CREATE POLICY "Authenticated users can update profile pictures"
ON storage.objects FOR UPDATE
USING (bucket_id = 'contact-profile-pictures' AND auth.uid() IS NOT NULL);

-- Create RLS policy for profile pictures - authenticated users can delete
CREATE POLICY "Authenticated users can delete profile pictures"
ON storage.objects FOR DELETE
USING (bucket_id = 'contact-profile-pictures' AND auth.uid() IS NOT NULL);
