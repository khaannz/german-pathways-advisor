-- Add avatar_url to profiles for storing profile photos
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;