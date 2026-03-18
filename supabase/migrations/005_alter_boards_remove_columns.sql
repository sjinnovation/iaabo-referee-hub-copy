-- ============================================================
-- Alter Boards Table - Remove dues_status and training_completion
-- Run this in Supabase Dashboard -> SQL Editor
-- ============================================================

-- Remove dues_status column
ALTER TABLE public.boards DROP COLUMN IF EXISTS dues_status;

-- Remove training_completion column
ALTER TABLE public.boards DROP COLUMN IF EXISTS training_completion;
