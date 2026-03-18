-- ============================================
-- Embedded course quiz results (per-quiz scores)
-- ============================================

create table public.embedded_course_quiz_results (
  id uuid primary key default gen_random_uuid(),
  embedded_course_enrollment_id uuid not null references public.embedded_course_enrollments(id) on delete cascade,
  quiz_identifier text not null,
  score numeric,
  max_score numeric,
  passed boolean not null default false,
  completed_at timestamptz not null default now(),
  unique(embedded_course_enrollment_id, quiz_identifier)
);

create index idx_embedded_course_quiz_results_enrollment on public.embedded_course_quiz_results(embedded_course_enrollment_id);

alter table public.embedded_course_quiz_results enable row level security;

-- Members can view/insert/update own results (via their enrollment)
create policy "Members can view own embedded quiz results"
  on public.embedded_course_quiz_results for select
  using (
    exists (
      select 1 from public.embedded_course_enrollments e
      where e.id = embedded_course_quiz_results.embedded_course_enrollment_id
      and e.member_id = auth.uid()
    )
  );

create policy "Members can insert own embedded quiz results"
  on public.embedded_course_quiz_results for insert
  with check (
    exists (
      select 1 from public.embedded_course_enrollments e
      where e.id = embedded_course_quiz_results.embedded_course_enrollment_id
      and e.member_id = auth.uid()
    )
  );

create policy "Members can update own embedded quiz results"
  on public.embedded_course_quiz_results for update
  using (
    exists (
      select 1 from public.embedded_course_enrollments e
      where e.id = embedded_course_quiz_results.embedded_course_enrollment_id
      and e.member_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.embedded_course_enrollments e
      where e.id = embedded_course_quiz_results.embedded_course_enrollment_id
      and e.member_id = auth.uid()
    )
  );

create policy "Admins can manage all embedded quiz results"
  on public.embedded_course_quiz_results for all
  using (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    or public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );
