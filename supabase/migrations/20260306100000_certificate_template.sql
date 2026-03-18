-- ============================================
-- Certificate template (single global template for all courses)
-- Superadmin/Admin uploads a blank PNG and sets position for member name and course title.
-- ============================================

create table public.certificate_template (
  id uuid primary key default gen_random_uuid(),
  template_url text,
  -- Position as percentage of image width/height (0-100). Text is centered at this point.
  member_name_x_percent numeric not null default 50
    check (member_name_x_percent >= 0 and member_name_x_percent <= 100),
  member_name_y_percent numeric not null default 35
    check (member_name_y_percent >= 0 and member_name_y_percent <= 100),
  course_title_x_percent numeric not null default 50
    check (course_title_x_percent >= 0 and course_title_x_percent <= 100),
  course_title_y_percent numeric not null default 48
    check (course_title_y_percent >= 0 and course_title_y_percent <= 100),
  font_size_px integer not null default 28
    check (font_size_px >= 12 and font_size_px <= 72),
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);

-- Single row: only one template is used app-wide
insert into public.certificate_template (
  id,
  template_url,
  member_name_x_percent,
  member_name_y_percent,
  course_title_x_percent,
  course_title_y_percent,
  font_size_px
) values (
  '00000000-0000-0000-0000-000000000001'::uuid,
  null,
  50,
  35,
  50,
  48,
  28
) on conflict (id) do nothing;

alter table public.certificate_template enable row level security;

-- All authenticated users can read (members need template + positions to generate certificate)
create policy "Authenticated can read certificate template"
  on public.certificate_template for select
  using (auth.role() = 'authenticated');

-- Only admins and super_admin can update
create policy "Admins can update certificate template"
  on public.certificate_template for update
  using (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    or public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

create policy "Admins can insert certificate template"
  on public.certificate_template for insert
  with check (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    or public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

create policy "Admins can delete certificate template"
  on public.certificate_template for delete
  using (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    or public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

-- ============================================
-- Storage bucket for certificate template images
-- ============================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'certificate-templates',
  'certificate-templates',
  true,
  5242880,
  array['image/png']
)
on conflict (id) do nothing;

create policy "Admins can upload certificate template"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'certificate-templates');

create policy "Admins can update certificate template"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'certificate-templates');

create policy "Public read for certificate templates"
  on storage.objects for select
  using (bucket_id = 'certificate-templates');

create policy "Admins can delete certificate template"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'certificate-templates');
