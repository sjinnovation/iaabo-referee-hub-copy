-- ============================================================
-- Member Progression Tracking Table
-- Tracks each member's journey through the IAABO membership process
-- ============================================================

-- Create progression status enum
CREATE TYPE public.progression_status AS ENUM (
  'not_started',
  'in_progress',
  'completed',
  'failed',
  'waived'
);

-- Create progression step type enum
CREATE TYPE public.progression_step_type AS ENUM (
  'registration',
  'rules_test',
  'board_assignment',
  'mechanics_course',
  'payment',
  'active_member'
);

-- Create member_progression table
CREATE TABLE public.member_progression (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  step_type public.progression_step_type NOT NULL,
  status public.progression_status NOT NULL DEFAULT 'not_started',
  started_at timestamptz,
  completed_at timestamptz,
  due_date timestamptz,
  notes text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, step_type)
);

-- Create indexes for efficient queries
CREATE INDEX idx_member_progression_user_id ON public.member_progression(user_id);
CREATE INDEX idx_member_progression_status ON public.member_progression(status);
CREATE INDEX idx_member_progression_step_type ON public.member_progression(step_type);
CREATE INDEX idx_member_progression_completed_at ON public.member_progression(completed_at);

-- Enable RLS
ALTER TABLE public.member_progression ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own progression"
  ON public.member_progression FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all progression"
  ON public.member_progression FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

CREATE POLICY "Admins can insert progression"
  ON public.member_progression FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

CREATE POLICY "Admins can update progression"
  ON public.member_progression FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

CREATE POLICY "Service role full access progression"
  ON public.member_progression FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Create trigger for updated_at
CREATE TRIGGER update_member_progression_updated_at
  BEFORE UPDATE ON public.member_progression
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- Function to initialize progression for new members
-- ============================================================
CREATE OR REPLACE FUNCTION public.initialize_member_progression(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert initial progression steps for a new member
  INSERT INTO public.member_progression (user_id, step_type, status, started_at, completed_at)
  VALUES
    -- Registration is always completed when this function is called
    (p_user_id, 'registration'::progression_step_type, 'completed'::progression_status, now(), now()),
    -- Other steps start as not_started
    (p_user_id, 'rules_test'::progression_step_type, 'not_started'::progression_status, NULL, NULL),
    (p_user_id, 'board_assignment'::progression_step_type, 'not_started'::progression_status, NULL, NULL),
    (p_user_id, 'mechanics_course'::progression_step_type, 'not_started'::progression_status, NULL, NULL),
    (p_user_id, 'payment'::progression_step_type, 'not_started'::progression_status, NULL, NULL),
    (p_user_id, 'active_member'::progression_step_type, 'not_started'::progression_status, NULL, NULL)
  ON CONFLICT (user_id, step_type) DO NOTHING;
END;
$$;

-- ============================================================
-- Function to update progression step
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_progression_step(
  p_user_id uuid,
  p_step_type progression_step_type,
  p_status progression_status,
  p_notes text DEFAULT NULL,
  p_metadata jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.member_progression
  SET 
    status = p_status,
    started_at = CASE 
      WHEN p_status = 'in_progress'::progression_status AND started_at IS NULL 
      THEN now() 
      ELSE started_at 
    END,
    completed_at = CASE 
      WHEN p_status = 'completed'::progression_status 
      THEN now() 
      ELSE NULL 
    END,
    notes = COALESCE(p_notes, notes),
    metadata = COALESCE(p_metadata, metadata)
  WHERE user_id = p_user_id AND step_type = p_step_type;
END;
$$;

-- ============================================================
-- Function to get member progression summary
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_member_progression_summary(p_user_id uuid)
RETURNS TABLE (
  step_type progression_step_type,
  status progression_status,
  started_at timestamptz,
  completed_at timestamptz,
  notes text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mp.step_type,
    mp.status,
    mp.started_at,
    mp.completed_at,
    mp.notes
  FROM public.member_progression mp
  WHERE mp.user_id = p_user_id
  ORDER BY 
    CASE mp.step_type
      WHEN 'registration'::progression_step_type THEN 1
      WHEN 'rules_test'::progression_step_type THEN 2
      WHEN 'board_assignment'::progression_step_type THEN 3
      WHEN 'mechanics_course'::progression_step_type THEN 4
      WHEN 'payment'::progression_step_type THEN 5
      WHEN 'active_member'::progression_step_type THEN 6
    END;
END;
$$;

-- ============================================================
-- Update handle_new_user to initialize progression
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (
    id, 
    email, 
    first_name, 
    last_name,
    phone,
    street_address,
    city,
    state,
    zip_code,
    date_of_birth,
    is_over_18
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'phone', ''),
    COALESCE(NEW.raw_user_meta_data->>'street_address', ''),
    COALESCE(NEW.raw_user_meta_data->>'city', ''),
    COALESCE(NEW.raw_user_meta_data->>'state', ''),
    COALESCE(NEW.raw_user_meta_data->>'zip_code', ''),
    (NEW.raw_user_meta_data->>'date_of_birth')::date,
    COALESCE((NEW.raw_user_meta_data->>'is_over_18')::boolean, false)
  )
  ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        updated_at = now();

  -- Insert default role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'public_user'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Add member role (new registrations are members)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'member'::public.app_role)
  ON CONFLICT (user_id, role) DO NOTHING;

  -- Initialize member progression
  PERFORM public.initialize_member_progression(NEW.id);

  RETURN NEW;
END;
$$;

-- ============================================================
-- Trigger to auto-update board_assignment step when board_id is set
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_board_assignment_progression()
RETURNS TRIGGER AS $$
BEGIN
  -- If board_id is set and wasn't set before, mark board_assignment as completed
  IF NEW.board_id IS NOT NULL AND (OLD.board_id IS NULL OR OLD.board_id != NEW.board_id) THEN
    PERFORM public.update_progression_step(
      NEW.id,
      'board_assignment'::progression_step_type,
      'completed'::progression_status,
      'Board assigned automatically',
      jsonb_build_object('board_id', NEW.board_id)
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_board_assignment ON public.profiles;
CREATE TRIGGER on_board_assignment
  AFTER UPDATE OF board_id ON public.profiles
  FOR EACH ROW
  WHEN (NEW.board_id IS NOT NULL)
  EXECUTE FUNCTION public.sync_board_assignment_progression();

-- ============================================================
-- Trigger to auto-update active_member step when is_active is set
-- ============================================================
CREATE OR REPLACE FUNCTION public.sync_active_member_progression()
RETURNS TRIGGER AS $$
BEGIN
  -- If is_active becomes true, mark active_member as completed
  IF NEW.is_active = true AND (OLD.is_active = false OR OLD.is_active IS NULL) THEN
    PERFORM public.update_progression_step(
      NEW.id,
      'active_member'::progression_step_type,
      'completed'::progression_status,
      'Member activated',
      NULL
    );
  -- If is_active becomes false, mark active_member as in_progress
  ELSIF NEW.is_active = false AND OLD.is_active = true THEN
    PERFORM public.update_progression_step(
      NEW.id,
      'active_member'::progression_step_type,
      'in_progress'::progression_status,
      'Member status changed to inactive',
      NULL
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_active_status_change ON public.profiles;
CREATE TRIGGER on_active_status_change
  AFTER UPDATE OF is_active ON public.profiles
  FOR EACH ROW
  WHEN (OLD.is_active IS DISTINCT FROM NEW.is_active)
  EXECUTE FUNCTION public.sync_active_member_progression();
