create table if not exists public.assessment_lab_results (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.case_assessments(id) on delete cascade,

  lab_code text not null,
  canonical_code text null,
  lab_name text not null,
  section text not null,
  group_name text null,

  value_type text not null default 'numeric',
  value_numeric numeric null,
  value_text text null,
  value_boolean boolean null,
  raw_result_text text null,

  unit text null,
  reference_range_text text null,
  ref_low numeric null,
  ref_high numeric null,
  ref_operator text null,

  abnormal_flag text null,
  abnormal_mark text null,
  procedure_code text null,

  specimen_type text null,
  measured_at timestamptz null,
  note text null,

  source_type text not null default 'manual',
  source_report_id uuid null,
  source_assessment_id uuid null references public.case_assessments(id) on delete set null,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_assessment_lab_results_assessment_id
  on public.assessment_lab_results(assessment_id);

create index if not exists idx_assessment_lab_results_lab_code
  on public.assessment_lab_results(lab_code);

create index if not exists idx_assessment_lab_results_canonical_code
  on public.assessment_lab_results(canonical_code);

create table if not exists public.assessment_lab_reports (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid not null references public.case_assessments(id) on delete cascade,

  facility_name text null,
  report_title text not null,
  sample_id text null,
  receipt_number text null,
  specimen_type text null,
  department text null,
  referring_physician text null,
  diagnosis_text text null,
  specimen_quality text null,

  ordered_at timestamptz null,
  collected_at timestamptz null,
  received_at timestamptz null,
  performed_at timestamptz null,

  report_kind text not null default 'lab_pdf',
  source_file_path text null,
  source_file_name text null,
  mime_type text null,

  note text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_assessment_lab_reports_assessment_id
  on public.assessment_lab_reports(assessment_id);

alter table public.assessment_lab_results enable row level security;
alter table public.assessment_lab_reports enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'assessment_lab_results'
      and policyname = 'assessment_lab_results_select_authenticated'
  ) then
    create policy assessment_lab_results_select_authenticated
      on public.assessment_lab_results
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'assessment_lab_results'
      and policyname = 'assessment_lab_results_insert_authenticated'
  ) then
    create policy assessment_lab_results_insert_authenticated
      on public.assessment_lab_results
      for insert
      to authenticated
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'assessment_lab_results'
      and policyname = 'assessment_lab_results_update_authenticated'
  ) then
    create policy assessment_lab_results_update_authenticated
      on public.assessment_lab_results
      for update
      to authenticated
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'assessment_lab_results'
      and policyname = 'assessment_lab_results_delete_authenticated'
  ) then
    create policy assessment_lab_results_delete_authenticated
      on public.assessment_lab_results
      for delete
      to authenticated
      using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'assessment_lab_reports'
      and policyname = 'assessment_lab_reports_select_authenticated'
  ) then
    create policy assessment_lab_reports_select_authenticated
      on public.assessment_lab_reports
      for select
      to authenticated
      using (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'assessment_lab_reports'
      and policyname = 'assessment_lab_reports_insert_authenticated'
  ) then
    create policy assessment_lab_reports_insert_authenticated
      on public.assessment_lab_reports
      for insert
      to authenticated
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'assessment_lab_reports'
      and policyname = 'assessment_lab_reports_update_authenticated'
  ) then
    create policy assessment_lab_reports_update_authenticated
      on public.assessment_lab_reports
      for update
      to authenticated
      using (true)
      with check (true);
  end if;

  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'assessment_lab_reports'
      and policyname = 'assessment_lab_reports_delete_authenticated'
  ) then
    create policy assessment_lab_reports_delete_authenticated
      on public.assessment_lab_reports
      for delete
      to authenticated
      using (true);
  end if;
end $$;