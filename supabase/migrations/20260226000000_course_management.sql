-- ============================================
-- Course Management Tables
-- ============================================

-- Courses table
create table public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  category text not null default 'custom'
    check (category in ('rules', 'mechanics', 'academy', 'seminars', 'custom')),
  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),
  thumbnail_url text,
  is_required boolean not null default false,
  is_free boolean not null default true,
  price integer not null default 0,
  currency text not null default 'USD',
  season_year text not null,
  estimated_duration_minutes integer not null default 0,
  created_by uuid references auth.users(id),
  learndash_course_id integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Course content blocks table
create table public.course_content_blocks (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  type text not null
    check (type in ('text', 'video', 'audio', 'youtube_embed', 'embed')),
  sort_order integer not null default 0,
  text_content text,
  media_url text,
  youtube_video_id text,
  caption text,
  created_at timestamptz not null default now()
);

-- Course enrollments table
create table public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  member_id uuid not null references auth.users(id),
  enrolled_by uuid references auth.users(id),
  status text not null default 'enrolled'
    check (status in ('enrolled', 'in_progress', 'completed')),
  progress integer not null default 0
    check (progress >= 0 and progress <= 100),
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(course_id, member_id)
);

-- ============================================
-- Indexes
-- ============================================

create index idx_courses_status on public.courses(status);
create index idx_courses_category on public.courses(category);
create index idx_content_blocks_course on public.course_content_blocks(course_id);
create index idx_content_blocks_order on public.course_content_blocks(course_id, sort_order);
create index idx_enrollments_course on public.course_enrollments(course_id);
create index idx_enrollments_member on public.course_enrollments(member_id);
create index idx_enrollments_status on public.course_enrollments(status);

-- ============================================
-- Auto-update updated_at trigger
-- ============================================

create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger courses_updated_at
  before update on public.courses
  for each row
  execute function public.update_updated_at_column();

-- ============================================
-- Row Level Security
-- ============================================

alter table public.courses enable row level security;
alter table public.course_content_blocks enable row level security;
alter table public.course_enrollments enable row level security;

-- Courses: anyone authenticated can read published courses; admins can do everything
create policy "Published courses are viewable by all authenticated users"
  on public.courses for select
  using (auth.role() = 'authenticated' and status = 'published');

create policy "Admins can manage all courses"
  on public.courses for all
  using (auth.role() = 'authenticated');

-- Content blocks: readable if course is published; admins can manage
create policy "Content blocks are viewable for published courses"
  on public.course_content_blocks for select
  using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.courses
      where courses.id = course_content_blocks.course_id
    )
  );

create policy "Admins can manage content blocks"
  on public.course_content_blocks for all
  using (auth.role() = 'authenticated');

-- Enrollments: members can see their own; admins can manage all
create policy "Members can view their own enrollments"
  on public.course_enrollments for select
  using (auth.uid() = member_id);

create policy "Members can update their own enrollment progress"
  on public.course_enrollments for update
  using (auth.uid() = member_id)
  with check (auth.uid() = member_id);

create policy "Admins can manage all enrollments"
  on public.course_enrollments for all
  using (auth.role() = 'authenticated');
