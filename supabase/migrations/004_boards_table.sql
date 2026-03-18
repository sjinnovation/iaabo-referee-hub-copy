-- ============================================================
-- Boards Table Migration
-- Run this in Supabase Dashboard -> SQL Editor
-- ============================================================

-- 1. Drop existing objects if they exist (for clean re-runs)
DROP TABLE IF EXISTS public.boards CASCADE;

-- 2. Create boards table
CREATE TABLE public.boards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  board_number integer NOT NULL UNIQUE,
  region_id uuid REFERENCES public.regions(id) ON DELETE SET NULL,
  secretary_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  dues_status text NOT NULL DEFAULT 'unpaid' CHECK (dues_status IN ('paid', 'unpaid', 'partial')),
  training_completion integer NOT NULL DEFAULT 0 CHECK (training_completion >= 0 AND training_completion <= 100),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_boards_region_id ON public.boards(region_id);
CREATE INDEX idx_boards_secretary_id ON public.boards(secretary_id);
CREATE INDEX idx_boards_status ON public.boards(status);
CREATE INDEX idx_boards_board_number ON public.boards(board_number);

-- 3. Enable RLS
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

-- 4. Create updated_at trigger
CREATE TRIGGER update_boards_updated_at
  BEFORE UPDATE ON public.boards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. RLS Policies for boards

-- Anyone (authenticated or not) can view boards
CREATE POLICY "Anyone can view boards"
  ON public.boards FOR SELECT
  USING (true);

-- Only admins can insert boards
CREATE POLICY "Admins can insert boards"
  ON public.boards FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

-- Only admins can update boards
CREATE POLICY "Admins can update boards"
  ON public.boards FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

-- Only admins can delete boards
CREATE POLICY "Admins can delete boards"
  ON public.boards FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

-- Service role has full access
CREATE POLICY "Service role full access boards"
  ON public.boards FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
