-- ============================================
-- Quiz attempts: one per enrollment per quiz block
-- ============================================

create table public.course_quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.course_enrollments(id) on delete cascade,
  content_block_id uuid not null references public.course_content_blocks(id) on delete cascade,
  score integer not null check (score >= 0),
  total_questions integer not null check (total_questions >= 0),
  passed boolean not null,
  submitted_at timestamptz not null default now(),
  unique(enrollment_id, content_block_id)
);

create index idx_quiz_attempts_enrollment on public.course_quiz_attempts(enrollment_id);
create index idx_quiz_attempts_block on public.course_quiz_attempts(content_block_id);

alter table public.course_quiz_attempts enable row level security;

create policy "Members can view own quiz attempts"
  on public.course_quiz_attempts for select
  using (
    exists (
      select 1 from public.course_enrollments e
      where e.id = enrollment_id and e.member_id = auth.uid()
    )
  );

create policy "Members can insert own quiz attempts"
  on public.course_quiz_attempts for insert
  with check (
    exists (
      select 1 from public.course_enrollments e
      where e.id = enrollment_id and e.member_id = auth.uid()
    )
  );

create policy "Members can update own quiz attempts"
  on public.course_quiz_attempts for update
  using (
    exists (
      select 1 from public.course_enrollments e
      where e.id = enrollment_id and e.member_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.course_enrollments e
      where e.id = enrollment_id and e.member_id = auth.uid()
    )
  );

create policy "Admins can manage quiz attempts"
  on public.course_quiz_attempts for all
  using (auth.role() = 'authenticated');
