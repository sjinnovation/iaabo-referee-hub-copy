-- ============================================
-- Block-level completion per enrollment
-- ============================================

create table public.course_enrollment_block_completions (
  id uuid primary key default gen_random_uuid(),
  enrollment_id uuid not null references public.course_enrollments(id) on delete cascade,
  block_id uuid not null references public.course_content_blocks(id) on delete cascade,
  completed_at timestamptz not null default now(),
  unique(enrollment_id, block_id)
);

create index idx_block_completions_enrollment on public.course_enrollment_block_completions(enrollment_id);
create index idx_block_completions_block on public.course_enrollment_block_completions(block_id);

alter table public.course_enrollment_block_completions enable row level security;

-- Members can view their own completions (via their enrollment)
create policy "Members can view own block completions"
  on public.course_enrollment_block_completions for select
  using (
    exists (
      select 1 from public.course_enrollments e
      where e.id = enrollment_id and e.member_id = auth.uid()
    )
  );

-- Members can insert their own completions
create policy "Members can insert own block completions"
  on public.course_enrollment_block_completions for insert
  with check (
    exists (
      select 1 from public.course_enrollments e
      where e.id = enrollment_id and e.member_id = auth.uid()
    )
  );

-- Members can update their own completions (e.g. completed_at)
create policy "Members can update own block completions"
  on public.course_enrollment_block_completions for update
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

-- Members can delete their own completions (unmark complete)
create policy "Members can delete own block completions"
  on public.course_enrollment_block_completions for delete
  using (
    exists (
      select 1 from public.course_enrollments e
      where e.id = enrollment_id and e.member_id = auth.uid()
    )
  );

-- Admins can manage all
create policy "Admins can manage block completions"
  on public.course_enrollment_block_completions for all
  using (auth.role() = 'authenticated');
