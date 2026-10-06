-- Migration: 20261005000001_add_loom_url_to_meetings.sql
-- Description: Add optional loom_url column to meetings table

ALTER TABLE public.meetings ADD COLUMN IF NOT EXISTS loom_url TEXT;
