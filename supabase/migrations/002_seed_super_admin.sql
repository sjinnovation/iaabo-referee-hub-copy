-- ============================================================
-- Seed Super Admin User
-- Run this AFTER 001_iaabo_auth_schema.sql
-- in Supabase Dashboard -> SQL Editor
-- ============================================================

-- Create the super admin auth user
INSERT INTO auth.users (
  instance_id, id, aud, role, email, encrypted_password,
  email_confirmed_at, created_at, updated_at,
  raw_user_meta_data, raw_app_meta_data,
  confirmation_token, email_change, email_change_token_new, recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'superadmin@iaabo.org',
  crypt('SuperAdmin123!', gen_salt('bf')),
  now(),
  now(),
  now(),
  jsonb_build_object('first_name', 'Super', 'last_name', 'Admin'),
  jsonb_build_object('provider', 'email', 'providers', ARRAY['email']),
  '', '', '', ''
);

-- Update the profile (created by trigger) with full details
UPDATE public.profiles
SET first_name = 'Super',
    last_name = 'Admin',
    phone = '000-000-0000',
    is_over_18 = true
WHERE email = 'superadmin@iaabo.org';

-- Upgrade role from public_user to super_admin
UPDATE public.user_roles
SET role = 'super_admin'::public.app_role
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'superadmin@iaabo.org');

-- Verify
SELECT p.email, p.first_name, p.last_name, ur.role
FROM public.profiles p
JOIN public.user_roles ur ON p.id = ur.user_id
WHERE p.email = 'superadmin@iaabo.org';
