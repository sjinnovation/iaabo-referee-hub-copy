-- ============================================
-- Embedded course quiz results: one row per quiz slide per enrollment
-- Populated via postMessage events from the embedded course iframe
-- ============================================

create table if not exists public.embedded_course_quiz_results (
  id                 uuid primary key default gen_random_uuid(),
  enrollment_id      uuid not null references public.embedded_course_enrollments(id) on delete cascade,
  embedded_course_id uuid not null references public.embedded_courses(id) on delete cascade,
  member_id          uuid not null references auth.users(id) on delete cascade,
  slide_title        text,
  score              integer check (score >= 0),
  max_score          integer check (max_score >= 0),
  passed             boolean,
  submitted_at       timestamptz not null default now()
);

create index if not exists idx_embedded_quiz_results_enrollment on public.embedded_course_quiz_results(enrollment_id);
create index if not exists idx_embedded_quiz_results_course    on public.embedded_course_quiz_results(embedded_course_id);
create index if not exists idx_embedded_quiz_results_member    on public.embedded_course_quiz_results(member_id);

alter table public.embedded_course_quiz_results enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'embedded_course_quiz_results'
      and policyname = 'Members can view own embedded quiz results'
  ) then
    create policy "Members can view own embedded quiz results"
      on public.embedded_course_quiz_results for select
      using (member_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'embedded_course_quiz_results'
      and policyname = 'Members can insert own embedded quiz results'
  ) then
    create policy "Members can insert own embedded quiz results"
      on public.embedded_course_quiz_results for insert
      with check (member_id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename  = 'embedded_course_quiz_results'
      and policyname = 'Admins can manage embedded quiz results'
  ) then
    create policy "Admins can manage embedded quiz results"
      on public.embedded_course_quiz_results for all
      using (auth.role() = 'authenticated');
  end if;
end
$$;
