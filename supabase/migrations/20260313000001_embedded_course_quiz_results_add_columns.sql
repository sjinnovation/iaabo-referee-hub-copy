-- Add any columns that may be missing from embedded_course_quiz_results
-- if the table was created before the full schema was finalised.

do $$
begin
  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'embedded_course_quiz_results'
      and column_name  = 'enrollment_id'
  ) then
    alter table public.embedded_course_quiz_results
      add column enrollment_id uuid references public.embedded_course_enrollments(id) on delete cascade;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'embedded_course_quiz_results'
      and column_name  = 'embedded_course_id'
  ) then
    alter table public.embedded_course_quiz_results
      add column embedded_course_id uuid references public.embedded_courses(id) on delete cascade;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'embedded_course_quiz_results'
      and column_name  = 'member_id'
  ) then
    alter table public.embedded_course_quiz_results
      add column member_id uuid references auth.users(id) on delete cascade;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'embedded_course_quiz_results'
      and column_name  = 'slide_title'
  ) then
    alter table public.embedded_course_quiz_results
      add column slide_title text;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'embedded_course_quiz_results'
      and column_name  = 'score'
  ) then
    alter table public.embedded_course_quiz_results
      add column score integer check (score >= 0);
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'embedded_course_quiz_results'
      and column_name  = 'max_score'
  ) then
    alter table public.embedded_course_quiz_results
      add column max_score integer check (max_score >= 0);
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'embedded_course_quiz_results'
      and column_name  = 'passed'
  ) then
    alter table public.embedded_course_quiz_results
      add column passed boolean;
  end if;

  if not exists (
    select 1 from information_schema.columns
    where table_schema = 'public'
      and table_name   = 'embedded_course_quiz_results'
      and column_name  = 'submitted_at'
  ) then
    alter table public.embedded_course_quiz_results
      add column submitted_at timestamptz not null default now();
  end if;
end
$$;

-- Ensure indexes exist for any newly added columns
create index if not exists idx_embedded_quiz_results_enrollment on public.embedded_course_quiz_results(enrollment_id);
create index if not exists idx_embedded_quiz_results_course    on public.embedded_course_quiz_results(embedded_course_id);
create index if not exists idx_embedded_quiz_results_member    on public.embedded_course_quiz_results(member_id);
