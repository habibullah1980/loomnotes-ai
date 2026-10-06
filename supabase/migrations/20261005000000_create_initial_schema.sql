-- ==============================================================================
-- Migration: 20261005000000_create_initial_schema.sql
-- Description: Initial database schema for LoomNotes AI
-- Tables: profiles, meetings, action_items, key_takeaways
-- Features: UUID primary keys, Foreign keys with Cascade, RLS policies, Indexes, updated_at triggers
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------------------------
-- 2. MEETINGS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  transcript TEXT,
  summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for querying meetings by user_id
CREATE INDEX IF NOT EXISTS idx_meetings_user_id ON public.meetings(user_id);

-- ------------------------------------------------------------------------------
-- 3. ACTION_ITEMS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  task TEXT NOT NULL,
  assignee TEXT,
  due_date DATE,
  completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for querying action items by meeting_id
CREATE INDEX IF NOT EXISTS idx_action_items_meeting_id ON public.action_items(meeting_id);

-- ------------------------------------------------------------------------------
-- 4. KEY_TAKEAWAYS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.key_takeaways (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for querying key takeaways by meeting_id
CREATE INDEX IF NOT EXISTS idx_key_takeaways_meeting_id ON public.key_takeaways(meeting_id);

-- ------------------------------------------------------------------------------
-- UPDATED_AT TRIGGER FUNCTION
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS tr_profiles_updated_at ON public.profiles;
CREATE TRIGGER tr_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Trigger for meetings updated_at
DROP TRIGGER IF EXISTS tr_meetings_updated_at ON public.meetings;
CREATE TRIGGER tr_meetings_updated_at
  BEFORE UPDATE ON public.meetings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- AUTOMATIC PROFILE CREATION TRIGGER ON AUTH SIGNUP
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', ''),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ------------------------------------------------------------------------------

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.key_takeaways ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Meetings policies (Users can only access their own meetings)
DROP POLICY IF EXISTS "Users can view their own meetings" ON public.meetings;
CREATE POLICY "Users can view their own meetings"
  ON public.meetings FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own meetings" ON public.meetings;
CREATE POLICY "Users can insert their own meetings"
  ON public.meetings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own meetings" ON public.meetings;
CREATE POLICY "Users can update their own meetings"
  ON public.meetings FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own meetings" ON public.meetings;
CREATE POLICY "Users can delete their own meetings"
  ON public.meetings FOR DELETE
  USING (auth.uid() = user_id);

-- Action Items policies (Scoped via meeting.user_id = auth.uid())
DROP POLICY IF EXISTS "Users can view action items of their own meetings" ON public.action_items;
CREATE POLICY "Users can view action items of their own meetings"
  ON public.action_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings
      WHERE meetings.id = action_items.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert action items for their own meetings" ON public.action_items;
CREATE POLICY "Users can insert action items for their own meetings"
  ON public.action_items FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meetings
      WHERE meetings.id = action_items.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update action items of their own meetings" ON public.action_items;
CREATE POLICY "Users can update action items of their own meetings"
  ON public.action_items FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings
      WHERE meetings.id = action_items.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete action items of their own meetings" ON public.action_items;
CREATE POLICY "Users can delete action items of their own meetings"
  ON public.action_items FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings
      WHERE meetings.id = action_items.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

-- Key Takeaways policies (Scoped via meeting.user_id = auth.uid())
DROP POLICY IF EXISTS "Users can view key takeaways of their own meetings" ON public.key_takeaways;
CREATE POLICY "Users can view key takeaways of their own meetings"
  ON public.key_takeaways FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings
      WHERE meetings.id = key_takeaways.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert key takeaways for their own meetings" ON public.key_takeaways;
CREATE POLICY "Users can insert key takeaways for their own meetings"
  ON public.key_takeaways FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meetings
      WHERE meetings.id = key_takeaways.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update key takeaways of their own meetings" ON public.key_takeaways;
CREATE POLICY "Users can update key takeaways of their own meetings"
  ON public.key_takeaways FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings
      WHERE meetings.id = key_takeaways.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete key takeaways of their own meetings" ON public.key_takeaways;
CREATE POLICY "Users can delete key takeaways of their own meetings"
  ON public.key_takeaways FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings
      WHERE meetings.id = key_takeaways.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );
