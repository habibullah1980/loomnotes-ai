-- ==============================================================================
-- Migration: 20261006000003_super_admin_permissions_audit_analytics.sql
-- Description: Full Super Admin System with Roles, Permissions, Audit Logs, and Analytics Events
-- ==============================================================================

-- 1. Extend profiles table with status, custom_permissions, and activity fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS custom_permissions TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS referral_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_source TEXT,
  ADD COLUMN IF NOT EXISTS utm_medium TEXT,
  ADD COLUMN IF NOT EXISTS utm_campaign TEXT;

-- Index for querying profiles by status and role
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. Role Permissions Table
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT UNIQUE NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Seed default role permissions
INSERT INTO public.role_permissions (role, permissions, description)
VALUES
  (
    'super_admin',
    ARRAY[
      'users.view', 'users.create', 'users.edit', 'users.delete', 'users.suspend', 'users.export',
      'meetings.view', 'meetings.delete',
      'analytics.view',
      'marketing.view', 'marketing.export',
      'settings.manage',
      'admins.manage'
    ],
    'Full administrative control over the entire platform, roles, permissions, and settings.'
  ),
  (
    'admin',
    ARRAY[
      'users.view', 'users.create', 'users.edit', 'users.suspend', 'users.export',
      'meetings.view',
      'analytics.view',
      'marketing.view', 'marketing.export',
      'settings.manage'
    ],
    'Day-to-day administrative management excluding role assignment and account deletion.'
  ),
  (
    'support',
    ARRAY[
      'users.view', 'users.edit', 'meetings.view'
    ],
    'Customer support access to view and assist users.'
  ),
  (
    'analyst',
    ARRAY[
      'users.view', 'analytics.view', 'marketing.view'
    ],
    'Read-only analytics and marketing intelligence.'
  ),
  (
    'user',
    ARRAY[]::TEXT[],
    'Standard LoomNotes user.'
  )
ON CONFLICT (role) DO UPDATE SET
  permissions = EXCLUDED.permissions,
  description = EXCLUDED.description,
  updated_at = now();

-- 3. Activity Events Table
CREATE TABLE IF NOT EXISTS public.activity_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  device_category TEXT,
  browser TEXT,
  country TEXT,
  city TEXT,
  referrer TEXT,
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_activity_events_user_id ON public.activity_events(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_events_event_type ON public.activity_events(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_events_created_at ON public.activity_events(created_at DESC);

-- 4. Admin Audit Logs Table
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  actor_email TEXT NOT NULL,
  action TEXT NOT NULL,
  target_id TEXT,
  target_type TEXT NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON public.admin_audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);

-- 5. Row-Level Security (RLS)
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read role_permissions
DROP POLICY IF EXISTS "Allow authenticated users to read role_permissions" ON public.role_permissions;
CREATE POLICY "Allow authenticated users to read role_permissions"
  ON public.role_permissions
  FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated users to insert their own activity events
DROP POLICY IF EXISTS "Allow users to log activity events" ON public.activity_events;
CREATE POLICY "Allow users to log activity events"
  ON public.activity_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Allow users to view their own activity events
DROP POLICY IF EXISTS "Allow users to view own activity events" ON public.activity_events;
CREATE POLICY "Allow users to view own activity events"
  ON public.activity_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Admin audit logs: strictly restricted (accessed via service role or admin guard)
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.admin_audit_logs;
CREATE POLICY "Admins can view audit logs"
  ON public.admin_audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('super_admin', 'admin')
    )
  );

-- 6. Bootstrap Super Admin for habibullah1980@gmail.com
UPDATE public.profiles
SET role = 'super_admin'
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'habibullah1980@gmail.com'
);
