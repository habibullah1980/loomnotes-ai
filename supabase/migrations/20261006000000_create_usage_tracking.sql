-- ==============================================================================
-- Migration: 20261006000000_create_usage_tracking.sql
-- Description: Adds usage_tracking table and atomic increment RPC for subscription limits
-- Free tier: Max 5 AI-generated meetings per calendar month
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. USAGE_TRACKING TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.usage_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  month TEXT NOT NULL, -- Format: YYYY-MM (e.g., '2026-10')
  meetings_generated INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_user_month UNIQUE (user_id, month),
  CONSTRAINT non_negative_meetings CHECK (meetings_generated >= 0)
);

-- Index for fast lookup by user_id and month
CREATE INDEX IF NOT EXISTS idx_usage_tracking_user_month ON public.usage_tracking(user_id, month);

-- Enable Row Level Security (RLS)
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. RLS POLICIES FOR USAGE_TRACKING
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Users can view their own usage tracking" ON public.usage_tracking;
CREATE POLICY "Users can view their own usage tracking"
  ON public.usage_tracking FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own usage tracking" ON public.usage_tracking;
CREATE POLICY "Users can insert their own usage tracking"
  ON public.usage_tracking FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own usage tracking" ON public.usage_tracking;
CREATE POLICY "Users can update their own usage tracking"
  ON public.usage_tracking FOR UPDATE
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 3. ATOMIC INCREMENT RPC (RACE CONDITION PREVENTION)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.increment_monthly_usage(p_month TEXT, p_max_limit INT DEFAULT 5)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_current_usage INT;
  v_new_usage INT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'Unauthorized');
  END IF;

  -- Ensure row exists for this user and month
  INSERT INTO public.usage_tracking (user_id, month, meetings_generated, updated_at)
  VALUES (v_user_id, p_month, 0, now())
  ON CONFLICT (user_id, month) DO NOTHING;

  -- Atomically check limit and increment in a single statement
  UPDATE public.usage_tracking
  SET meetings_generated = meetings_generated + 1,
      updated_at = now()
  WHERE user_id = v_user_id
    AND month = p_month
    AND meetings_generated < p_max_limit
  RETURNING meetings_generated INTO v_new_usage;

  -- If no row was updated, limit has already been reached
  IF v_new_usage IS NULL THEN
    SELECT meetings_generated INTO v_current_usage
    FROM public.usage_tracking
    WHERE user_id = v_user_id AND month = p_month;

    RETURN jsonb_build_object(
      'success', false,
      'error', 'Monthly limit reached',
      'limit_reached', true,
      'current_usage', COALESCE(v_current_usage, p_max_limit)
    );
  END IF;

  RETURN jsonb_build_object(
    'success', true,
    'meetings_generated', v_new_usage
  );
END;
$$;
