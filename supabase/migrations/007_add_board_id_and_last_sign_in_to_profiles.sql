-- Add board_id to profiles table for board association
ALTER TABLE public.profiles
ADD COLUMN board_id uuid REFERENCES public.boards(id) ON DELETE SET NULL;

-- Add last_sign_in_at to profiles table to track last login
ALTER TABLE public.profiles
ADD COLUMN last_sign_in_at timestamptz;

-- Create index for board_id lookups
CREATE INDEX idx_profiles_board_id ON public.profiles(board_id);

-- Create a function to sync last_sign_in_at from auth.users
CREATE OR REPLACE FUNCTION public.sync_last_sign_in()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET last_sign_in_at = NEW.last_sign_in_at
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to update last_sign_in_at when user signs in
DROP TRIGGER IF EXISTS on_auth_user_sign_in ON auth.users;
CREATE TRIGGER on_auth_user_sign_in
  AFTER UPDATE OF last_sign_in_at ON auth.users
  FOR EACH ROW
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.sync_last_sign_in();
