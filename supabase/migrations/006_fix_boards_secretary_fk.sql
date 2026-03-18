-- ============================================================
-- Fix Boards Secretary Foreign Key
-- Changes secretary_id to reference profiles instead of auth.users
-- This allows Supabase PostgREST to join boards with profiles
-- Run this in Supabase Dashboard -> SQL Editor
-- ============================================================

-- Drop the existing foreign key constraint on secretary_id
ALTER TABLE public.boards DROP CONSTRAINT IF EXISTS boards_secretary_id_fkey;

-- Add new foreign key constraint referencing profiles table
ALTER TABLE public.boards
  ADD CONSTRAINT boards_secretary_id_fkey
  FOREIGN KEY (secretary_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
