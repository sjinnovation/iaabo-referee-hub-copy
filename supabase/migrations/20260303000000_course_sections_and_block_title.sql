-- ============================================
-- Course Sections (for section-based content)
-- ============================================

create table public.course_sections (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null default 'Section',
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create index idx_course_sections_course on public.course_sections(course_id);
create index idx_course_sections_order on public.course_sections(course_id, sort_order);

alter table public.course_sections enable row level security;

create policy "Course sections viewable for published courses"
  on public.course_sections for select
  using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.courses c
      where c.id = course_sections.course_id
    )
  );

create policy "Admins can manage course sections"
  on public.course_sections for all
  using (auth.role() = 'authenticated');

-- ============================================
-- Add section_id and title to content blocks
-- ============================================

alter table public.course_content_blocks
  add column if not exists section_id uuid references public.course_sections(id) on delete cascade,
  add column if not exists title text;

-- Allow 'drive_url' in content block type
alter table public.course_content_blocks
  drop constraint if exists course_content_blocks_type_check;

alter table public.course_content_blocks
  add constraint course_content_blocks_type_check
  check (type in ('text', 'video', 'audio', 'youtube_embed', 'embed', 'drive_url'));

create index idx_content_blocks_section on public.course_content_blocks(section_id)
  where section_id is not null;
