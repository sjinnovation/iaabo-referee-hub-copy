-- ============================================
-- Backfill enrollment_id, member_id, embedded_course_id for rows that were
-- inserted before the schema was updated. These rows have the old
-- embedded_course_enrollment_id column filled but the new columns as NULL.
-- ============================================

-- 1. Backfill enrollment_id from embedded_course_enrollment_id
update public.embedded_course_quiz_results r
set enrollment_id = r.embedded_course_enrollment_id
where r.enrollment_id is null
  and r.embedded_course_enrollment_id is not null;

-- 2. Backfill member_id and embedded_course_id from the enrollment row
update public.embedded_course_quiz_results r
set
  member_id          = e.member_id,
  embedded_course_id = e.embedded_course_id
from public.embedded_course_enrollments e
where r.enrollment_id = e.id
  and (r.member_id is null or r.embedded_course_id is null);

-- 3. Remove NOT NULL / UNIQUE constraints that block new-style inserts.
--    New inserts use enrollment_id / member_id and do NOT set the old columns.

alter table public.embedded_course_quiz_results
  alter column embedded_course_enrollment_id drop not null;

alter table public.embedded_course_quiz_results
  alter column quiz_identifier drop not null;

-- The unique constraint ties (embedded_course_enrollment_id, quiz_identifier)
-- together; drop it so new rows (which leave those columns NULL) can be inserted freely.
alter table public.embedded_course_quiz_results
  drop constraint if exists embedded_course_quiz_results_embedded_course_enrollment_id_qui;

-- 4. Drop the stale RLS policies that reference the old column name and
--    recreate them using member_id (simpler, works for both old and new rows).

do $$
begin
  -- Drop old policies that use embedded_course_enrollment_id
  drop policy if exists "Members can view own embedded quiz results"   on public.embedded_course_quiz_results;
  drop policy if exists "Members can insert own embedded quiz results" on public.embedded_course_quiz_results;
  drop policy if exists "Members can update own embedded quiz results" on public.embedded_course_quiz_results;
  drop policy if exists "Admins can manage all embedded quiz results"  on public.embedded_course_quiz_results;
  -- Also drop the policies created by the 20260313000000 migration (different names)
  drop policy if exists "Admins can manage embedded quiz results"      on public.embedded_course_quiz_results;
end
$$;

-- Re-create policies using member_id (populated by backfill above and by all new inserts)
create policy "Members can view own embedded quiz results"
  on public.embedded_course_quiz_results for select
  using (member_id = auth.uid());

create policy "Members can insert own embedded quiz results"
  on public.embedded_course_quiz_results for insert
  with check (member_id = auth.uid());

create policy "Members can update own embedded quiz results"
  on public.embedded_course_quiz_results for update
  using (member_id = auth.uid())
  with check (member_id = auth.uid());

create policy "Admins can manage all embedded quiz results"
  on public.embedded_course_quiz_results for all
  using (
    public.has_role(auth.uid(), 'admin'::public.app_role)
    or public.has_role(auth.uid(), 'super_admin'::public.app_role)
  );
