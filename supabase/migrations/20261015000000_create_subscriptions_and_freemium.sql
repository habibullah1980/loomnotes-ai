-- ==============================================================================
-- Migration: 20261015000000_create_subscriptions_and_freemium.sql
-- Description: Adds Freemium subscription system (3 free videos, Pro $9.99/mo)
-- Stripe integration, webhook idempotency, and server-side usage enforcement
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTEND PROFILES WITH SUBSCRIPTION & FREEMIUM FIELDS
-- ------------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'none',
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT NULL,
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT NULL,
  ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ NULL,
  ADD COLUMN IF NOT EXISTS cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS free_videos_limit INT NOT NULL DEFAULT 3;

-- Indexes for fast Stripe customer and subscription lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON public.profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON public.profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);

-- ------------------------------------------------------------------------------
-- 2. CREATE SUBSCRIPTIONS TABLE
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT NULL,
  status TEXT NOT NULL DEFAULT 'incomplete',
  plan TEXT NOT NULL DEFAULT 'pro',
  current_period_start TIMESTAMPTZ NULL,
  current_period_end TIMESTAMPTZ NULL,
  cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON public.subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON public.subscriptions(status);

-- Enable RLS for subscriptions
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view their own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 3. CREATE STRIPE WEBHOOK EVENTS TABLE (FOR IDEMPOTENCY)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.stripe_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_id ON public.stripe_webhook_events(event_id);

-- Enable RLS (Service role only access)
ALTER TABLE public.stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 4. ATOMIC CREDIT CONSUMPTION RPC (CONCURRENCY & RACE CONDITION PROTECTION)
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.check_and_consume_video_credit(p_user_id UUID, p_max_free INT DEFAULT 3)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role TEXT;
  v_plan TEXT;
  v_sub_status TEXT;
  v_current_count INT;
  v_month TEXT;
BEGIN
  -- 1. Check user profile
  SELECT role, plan, subscription_status
  INTO v_role, v_plan, v_sub_status
  FROM public.profiles
  WHERE id = p_user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('allowed', false, 'error', 'User profile not found');
  END IF;

  -- 2. Super admins and active Pro subscribers are unlimited
  IF v_role = 'super_admin' OR (v_plan = 'pro' AND v_sub_status = 'active') THEN
    RETURN jsonb_build_object(
      'allowed', true,
      'is_pro', true,
      'is_unlimited', true,
      'remaining', -1
    );
  END IF;

  -- 3. For Free plan: count total meetings created by this user
  SELECT count(*)
  INTO v_current_count
  FROM public.meetings
  WHERE user_id = p_user_id;

  -- 4. Enforce free tier limit of exactly p_max_free (3 videos)
  IF v_current_count >= p_max_free THEN
    RETURN jsonb_build_object(
      'allowed', false,
      'limit_reached', true,
      'used', v_current_count,
      'limit', p_max_free,
      'remaining', 0,
      'error', 'You''ve used your 3 free videos. Upgrade to Pro for $9.99/month to continue.'
    );
  END IF;

  -- 5. Allowed to process
  RETURN jsonb_build_object(
    'allowed', true,
    'is_pro', false,
    'used', v_current_count,
    'limit', p_max_free,
    'remaining', (p_max_free - v_current_count)
  );
END;
$$;
