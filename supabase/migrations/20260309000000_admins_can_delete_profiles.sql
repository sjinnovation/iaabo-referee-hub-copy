-- Allow admins and super_admins to delete profiles (e.g. when removing a member/user).
CREATE POLICY "Admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    OR public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );
