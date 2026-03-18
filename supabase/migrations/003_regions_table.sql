-- ============================================================
-- Regions Table Migration
-- Run this in Supabase Dashboard -> SQL Editor
-- ============================================================

-- 1. Drop existing objects if they exist (for clean re-runs)
DROP TRIGGER IF EXISTS update_regions_updated_at ON public.regions;

DO $$ BEGIN
  DROP POLICY IF EXISTS "Anyone can view regions" ON public.regions;
  DROP POLICY IF EXISTS "Admins can insert regions" ON public.regions;
  DROP POLICY IF EXISTS "Admins can update regions" ON public.regions;
  DROP POLICY IF EXISTS "Admins can delete regions" ON public.regions;
  DROP POLICY IF EXISTS "Service role full access regions" ON public.regions;
EXCEPTION WHEN undefined_table THEN NULL;
END $$;

DROP TABLE IF EXISTS public.regions CASCADE;

-- 2. Create regions table
CREATE TABLE public.regions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  short_name text NOT NULL UNIQUE,
  full_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_regions_short_name ON public.regions(short_name);

-- 3. Enable RLS
ALTER TABLE public.regions ENABLE ROW LEVEL SECURITY;

-- 4. Create updated_at trigger
CREATE TRIGGER update_regions_updated_at
  BEFORE UPDATE ON public.regions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 5. RLS Policies for regions

-- Anyone (authenticated or not) can view regions
CREATE POLICY "Anyone can view regions"
  ON public.regions FOR SELECT
  USING (true);

-- Only admins can insert regions
CREATE POLICY "Admins can insert regions"
  ON public.regions FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

-- Only admins can update regions
CREATE POLICY "Admins can update regions"
  ON public.regions FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

-- Only admins can delete regions
CREATE POLICY "Admins can delete regions"
  ON public.regions FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

-- Service role has full access
CREATE POLICY "Service role full access regions"
  ON public.regions FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');
