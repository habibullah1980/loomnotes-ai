-- Migration: Extend profiles table for growth / free early-access product
-- Adds optional phone number, company name, marketing consent tracking, and role/plan

ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS phone_number TEXT NULL,
  ADD COLUMN IF NOT EXISTS company_name TEXT NULL,
  ADD COLUMN IF NOT EXISTS marketing_consent BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS marketing_consent_at TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'user',
  ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free';

-- Ensure index on role and marketing_consent for fast filtering in Admin Console
CREATE INDEX IF NOT EXISTS idx_profiles_marketing_consent ON public.profiles(marketing_consent);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- Ensure RLS policies remain in place
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);
