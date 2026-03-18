-- ============================================
-- Embedded Courses (iframe packages with res/index.html)
-- ============================================

create table public.embedded_courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text default '',
  folder_slug text not null unique,
  is_active boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.embedded_course_enrollments (
  id uuid primary key default gen_random_uuid(),
  embedded_course_id uuid not null references public.embedded_courses(id) on delete cascade,
  member_id uuid not null references auth.users(id) on delete cascade,
  status text not null default 'enrolled'
    check (status in ('enrolled', 'in_progress', 'completed')),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(embedded_course_id, member_id)
);

create index idx_embedded_courses_active on public.embedded_courses(is_active);
create index idx_embedded_course_enrollments_course on public.embedded_course_enrollments(embedded_course_id);
create index idx_embedded_course_enrollments_member on public.embedded_course_enrollments(member_id);

create trigger embedded_courses_updated_at
  before update on public.embedded_courses
  for each row
  execute function public.update_updated_at_column();

alter table public.embedded_courses enable row level security;
alter table public.embedded_course_enrollments enable row level security;

-- Embedded courses: members see active ones; admins full access
create policy "Active embedded courses viewable by authenticated"
  on public.embedded_courses for select
  using (
    auth.role() = 'authenticated'
    and (is_active = true or public.has_role(auth.uid(), 'admin'::public.app_role) or public.has_role(auth.uid(), 'super_admin'::public.app_role))
  );

create policy "Admins can manage embedded courses"
  on public.embedded_courses for all
  using (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    or public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );

-- Enrollments: members see/update own; admins all
create policy "Members can view own embedded enrollments"
  on public.embedded_course_enrollments for select
  using (auth.uid() = member_id);

create policy "Members can insert own embedded enrollment"
  on public.embedded_course_enrollments for insert
  with check (auth.uid() = member_id);

create policy "Members can update own embedded enrollment"
  on public.embedded_course_enrollments for update
  using (auth.uid() = member_id)
  with check (auth.uid() = member_id);

create policy "Admins can manage all embedded enrollments"
  on public.embedded_course_enrollments for all
  using (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    or public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );
