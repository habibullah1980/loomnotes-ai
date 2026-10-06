-- ==============================================================================
-- Migration: 20261005000002_add_key_decisions_and_follow_up_questions.sql
-- Description: Adds key_decisions and follow_up_questions tables with RLS policies
-- Features: UUID primary keys, CASCADE deletion with meetings, RLS policies, indexes
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. KEY_DECISIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.key_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for querying key decisions by meeting_id
CREATE INDEX IF NOT EXISTS idx_key_decisions_meeting_id ON public.key_decisions(meeting_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.key_decisions ENABLE ROW LEVEL SECURITY;

-- Policies for key_decisions (Scoped to meetings owned by auth.uid())
DROP POLICY IF EXISTS "Users can view key decisions of their own meetings" ON public.key_decisions;
CREATE POLICY "Users can view key decisions of their own meetings"
  ON public.key_decisions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings
      WHERE meetings.id = key_decisions.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert key decisions for their own meetings" ON public.key_decisions;
CREATE POLICY "Users can insert key decisions for their own meetings"
  ON public.key_decisions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meetings
      WHERE meetings.id = key_decisions.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update key decisions of their own meetings" ON public.key_decisions;
CREATE POLICY "Users can update key decisions of their own meetings"
  ON public.key_decisions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings
      WHERE meetings.id = key_decisions.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete key decisions of their own meetings" ON public.key_decisions;
CREATE POLICY "Users can delete key decisions of their own meetings"
  ON public.key_decisions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings
      WHERE meetings.id = key_decisions.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------------------------
-- 2. FOLLOW_UP_QUESTIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.follow_up_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meeting_id UUID NOT NULL REFERENCES public.meetings(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for querying follow up questions by meeting_id
CREATE INDEX IF NOT EXISTS idx_follow_up_questions_meeting_id ON public.follow_up_questions(meeting_id);

-- Enable Row Level Security (RLS)
ALTER TABLE public.follow_up_questions ENABLE ROW LEVEL SECURITY;

-- Policies for follow_up_questions (Scoped to meetings owned by auth.uid())
DROP POLICY IF EXISTS "Users can view follow-up questions of their own meetings" ON public.follow_up_questions;
CREATE POLICY "Users can view follow-up questions of their own meetings"
  ON public.follow_up_questions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings
      WHERE meetings.id = follow_up_questions.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can insert follow-up questions for their own meetings" ON public.follow_up_questions;
CREATE POLICY "Users can insert follow-up questions for their own meetings"
  ON public.follow_up_questions FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meetings
      WHERE meetings.id = follow_up_questions.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can update follow-up questions of their own meetings" ON public.follow_up_questions;
CREATE POLICY "Users can update follow-up questions of their own meetings"
  ON public.follow_up_questions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings
      WHERE meetings.id = follow_up_questions.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can delete follow-up questions of their own meetings" ON public.follow_up_questions;
CREATE POLICY "Users can delete follow-up questions of their own meetings"
  ON public.follow_up_questions FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.meetings
      WHERE meetings.id = follow_up_questions.meeting_id
      AND meetings.user_id = auth.uid()
    )
  );

-- Also ensure loom_url column exists on meetings
ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS loom_url TEXT;
