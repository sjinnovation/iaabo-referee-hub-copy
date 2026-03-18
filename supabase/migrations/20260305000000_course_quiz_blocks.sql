-- ============================================
-- Quiz block type and quiz tables
-- ============================================

-- Allow 'quiz' in content block type
alter table public.course_content_blocks
  drop constraint if exists course_content_blocks_type_check;

alter table public.course_content_blocks
  add constraint course_content_blocks_type_check
  check (type in ('text', 'video', 'audio', 'youtube_embed', 'embed', 'drive_url', 'quiz'));

-- Quiz block config (one per quiz content block)
create table public.course_quiz_blocks (
  id uuid primary key default gen_random_uuid(),
  content_block_id uuid not null references public.course_content_blocks(id) on delete cascade unique,
  passing_score integer not null check (passing_score >= 0),
  created_at timestamptz not null default now()
);

create index idx_quiz_blocks_content_block on public.course_quiz_blocks(content_block_id);

alter table public.course_quiz_blocks enable row level security;

create policy "Quiz blocks viewable for published courses"
  on public.course_quiz_blocks for select
  using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.course_content_blocks b
      join public.courses c on c.id = b.course_id
      where b.id = course_quiz_blocks.content_block_id
    )
  );

create policy "Admins can manage quiz blocks"
  on public.course_quiz_blocks for all
  using (auth.role() = 'authenticated');

-- MCQ questions for a quiz block
create table public.course_quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_block_id uuid not null references public.course_quiz_blocks(id) on delete cascade,
  sort_order integer not null default 0,
  question_text text not null,
  options jsonb not null default '[]',  -- array of strings, e.g. ["A", "B", "C", "D"]
  correct_index integer not null check (correct_index >= 0),
  created_at timestamptz not null default now()
);

create index idx_quiz_questions_quiz_block on public.course_quiz_questions(quiz_block_id);

alter table public.course_quiz_questions enable row level security;

create policy "Quiz questions viewable for published courses"
  on public.course_quiz_questions for select
  using (
    auth.role() = 'authenticated'
    and exists (
      select 1 from public.course_quiz_blocks qb
      join public.course_content_blocks b on b.id = qb.content_block_id
      join public.courses c on c.id = b.course_id
      where qb.id = course_quiz_questions.quiz_block_id
    )
  );

create policy "Admins can manage quiz questions"
  on public.course_quiz_questions for all
  using (auth.role() = 'authenticated');
