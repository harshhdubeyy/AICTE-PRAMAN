-- ==============================================================================
-- AICTE PRAMAN (VerifyAI) - Supabase Database Schema & Storage Configuration
-- ==============================================================================
-- HOW TO RUN THIS FILE:
-- 1. Log in to your Supabase project dashboard (https://supabase.com/dashboard).
-- 2. Open the "SQL Editor" from the left navigation.
-- 3. Click "New query", paste the entire contents of this file, and click "Run".
-- 4. Next, open and run /supabase/seed.sql to populate initial institutions,
--    officers, demo accounts, applications, and documents.
-- ==============================================================================

-- Enable UUID and pgcrypto extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ==============================================================================
-- 1. ENUMS
-- ==============================================================================

create type public.user_role as enum (
  'institution',
  'officer',
  'admin',
  'auditor'
);

create type public.finding_status as enum (
  'passed',
  'missing',
  'mismatch',
  'expired',
  'suspicious',
  'needs_manual_review',
  'verification_unavailable'
);

create type public.application_status as enum (
  'draft',
  'submitted',
  'in_validation',
  'under_review',
  'clarification_requested',
  'inspection_requested',
  'approved',
  'rejected'
);

-- ==============================================================================
-- 2. TABLES
-- ==============================================================================

-- 2.1 Institutions Master Table
create table public.institutions (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique not null,
  state text,
  city text,
  type text default 'Engineering & Technology',
  trust_name text,
  land_survey_no text,
  address text,
  pincode text,
  established_year integer,
  created_at timestamptz default now() not null
);

-- 2.2 Profiles Table (Linked to auth.users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role public.user_role not null default 'institution',
  institution_id uuid references public.institutions(id) on delete set null,
  full_name text not null,
  email text,
  title text,
  avatar text,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2.3 Applications Table
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  application_number text unique not null,
  institution_id uuid not null references public.institutions(id) on delete cascade,
  application_type text not null,
  academic_year text not null default 'AY 2026-27',
  status public.application_status not null default 'submitted',
  stage text not null default 'Submitted',
  overall_confidence numeric(5, 4) default 0.9500,
  recommended_action text default 'Approve to Next Stage',
  officer_observation text,
  assigned_officer text,
  submitted_at timestamptz default now() not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2.4 Documents Table
create table public.documents (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  doc_type text not null,
  name text not null,
  category text not null default 'Legal & Governance',
  storage_path text not null,
  file_name text not null,
  mime_type text default 'application/pdf',
  size_bytes bigint default 0,
  sha256 text not null,
  version text not null default 'v1.0',
  is_current boolean not null default true,
  replaced_by uuid references public.documents(id) on delete set null,
  uploaded_by uuid references auth.users(id) on delete set null,
  ocr_status text default 'Extracted',
  ocr_confidence numeric(5, 4) default 0.9500,
  status public.finding_status default 'passed',
  valid_until date,
  external_verification jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2.5 Extracted Fields Table
create table public.extracted_fields (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  field_key text not null,
  value text not null,
  claimed_value text,
  confidence numeric(5, 4) default 0.9500,
  page integer default 1,
  bbox jsonb,
  source text default 'Spatial Coordinate OCR',
  status public.finding_status default 'passed',
  notes text,
  created_at timestamptz default now() not null
);

-- 2.6 Versioned Regulatory Rules Table
create table public.rules (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  version text not null default '2026-27-v1',
  application_type text not null default 'ALL',
  title text not null,
  description text not null,
  severity text default 'MEDIUM',
  category text default 'Compliance',
  config jsonb default '{}'::jsonb,
  depends_on jsonb default '[]'::jsonb,
  source_reference text,
  effective_from date default '2026-01-01',
  active boolean not null default true,
  created_at timestamptz default now() not null
);

-- 2.7 Validation Runs Table
create table public.validation_runs (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  rule_set_version text not null default '2026-27-v1',
  triggered_by text default 'System AI Engine',
  trigger_reason text default 'Application submitted',
  overall_confidence numeric(5, 4) default 0.9500,
  recommended_action text default 'Approve to Next Stage',
  findings_count jsonb default '{"passed": 0, "missing": 0, "mismatch": 0, "expired": 0, "suspicious": 0, "needsReview": 0}'::jsonb,
  created_at timestamptz default now() not null
);

-- 2.8 Findings Table
create table public.findings (
  id uuid primary key default gen_random_uuid(),
  run_id uuid references public.validation_runs(id) on delete cascade,
  application_id uuid not null references public.applications(id) on delete cascade,
  document_id uuid references public.documents(id) on delete set null,
  rule_code text not null,
  rule_version text not null default '2026-27-v1',
  status public.finding_status not null default 'passed',
  severity text not null default 'MEDIUM',
  field_key text,
  page integer default 1,
  bbox jsonb,
  value_a text,
  value_b text,
  confidence numeric(5, 4) default 0.9500,
  explanation text,
  suggested_action text,
  why_line text,
  superseded_by uuid references public.findings(id) on delete set null,
  created_at timestamptz default now() not null
);

-- 2.9 Queries / Clarification Thread Table
create table public.queries (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  sender_id uuid references auth.users(id) on delete set null,
  sender_name text,
  sender_role public.user_role default 'officer',
  recipient_role public.user_role not null default 'institution',
  subject text,
  message text not null,
  attachment_path text,
  attachment_name text,
  status text not null default 'Open',
  replies jsonb default '[]'::jsonb,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- 2.10 Physical Inspections Table
create table public.inspections (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  institution_name text,
  date date not null,
  committee_lead text not null,
  status text not null default 'Scheduled',
  purpose text,
  location text,
  notes text,
  created_at timestamptz default now() not null
);

-- 2.11 Final Decisions Table
create table public.decisions (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications(id) on delete cascade,
  officer_id uuid references auth.users(id) on delete set null,
  officer_name text,
  decision text not null,
  notes text,
  created_at timestamptz default now() not null
);

-- 2.12 Audit Events Table (APPEND-ONLY, Immutable, Cryptographically Hash-Chained)
create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor text not null default 'AICTE System',
  actor_role text not null default 'system',
  action text not null,
  entity_type text not null default 'application',
  entity_id uuid,
  application_id uuid references public.applications(id) on delete set null,
  application_number text,
  details jsonb default '{}'::jsonb not null,
  rule_set_version text default '2026-27-v1',
  model_version text default 'gemini-1.5-flash',
  is_simulated_external boolean default false,
  external_source text,
  created_at timestamptz default now() not null,
  prev_hash text,
  hash text
);

-- 2.13 Realtime Notifications Table
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  role public.user_role,
  application_id uuid references public.applications(id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info', -- 'info', 'warning', 'action_required', 'success'
  read boolean not null default false,
  link_nav text,
  created_at timestamptz default now() not null
);

-- ==============================================================================
-- 3. SECURITY DEFINER HELPER FUNCTIONS
-- ==============================================================================

-- 3.1 Get Current User Role
create or replace function public.get_current_user_role()
returns public.user_role
language sql
security definer
stable
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

-- 3.2 Get Current User Institution ID
create or replace function public.get_current_user_institution_id()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select institution_id from public.profiles where id = auth.uid();
$$;

-- 3.3 Trigger to handle new user registration automatically
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, role, title, institution_id)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'institution'::public.user_role),
    coalesce(new.raw_user_meta_data->>'title', 'Authorized Representative'),
    (new.raw_user_meta_data->>'institution_id')::uuid
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    role = coalesce(excluded.role, profiles.role),
    title = coalesce(excluded.title, profiles.title),
    institution_id = coalesce(excluded.institution_id, profiles.institution_id);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ==============================================================================
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS across all tables
alter table public.institutions enable row level security;
alter table public.profiles enable row level security;
alter table public.applications enable row level security;
alter table public.documents enable row level security;
alter table public.extracted_fields enable row level security;
alter table public.rules enable row level security;
alter table public.validation_runs enable row level security;
alter table public.findings enable row level security;
alter table public.queries enable row level security;
alter table public.inspections enable row level security;
alter table public.decisions enable row level security;
alter table public.audit_events enable row level security;

-- 4.1 Institutions Policies
create policy "Institutions viewable by authorized roles or own institution"
  on public.institutions for select
  using (
    public.get_current_user_role() in ('officer', 'admin', 'auditor')
    or id = public.get_current_user_institution_id()
  );

create policy "Institutions insertable/editable by officers and admins"
  on public.institutions for all
  using (public.get_current_user_role() in ('officer', 'admin'));

-- 4.2 Profiles Policies
create policy "Profiles viewable by user themselves or officers/admins/auditors"
  on public.profiles for select
  using (
    id = auth.uid()
    or public.get_current_user_role() in ('officer', 'admin', 'auditor')
    or institution_id = public.get_current_user_institution_id()
  );

create policy "Users can update their own profile"
  on public.profiles for update
  using (id = auth.uid() or public.get_current_user_role() in ('admin'));

-- 4.3 Applications Policies
create policy "Applications readable by officers, admins, auditors or own institution"
  on public.applications for select
  using (
    public.get_current_user_role() in ('officer', 'admin', 'auditor')
    or institution_id = public.get_current_user_institution_id()
  );

create policy "Institution can insert applications for their own institution"
  on public.applications for insert
  with check (
    (public.get_current_user_role() = 'institution' and institution_id = public.get_current_user_institution_id())
    or public.get_current_user_role() in ('officer', 'admin')
  );

create policy "Applications updatable by officers, admins or institution if draft"
  on public.applications for update
  using (
    public.get_current_user_role() in ('officer', 'admin')
    or (institution_id = public.get_current_user_institution_id() and status in ('draft', 'clarification_requested'))
  );

-- 4.4 Documents Policies
create policy "Documents readable by officers, admins, auditors or own institution"
  on public.documents for select
  using (
    public.get_current_user_role() in ('officer', 'admin', 'auditor')
    or exists (
      select 1 from public.applications a
      where a.id = documents.application_id
        and a.institution_id = public.get_current_user_institution_id()
    )
  );

create policy "Documents insertable by own institution or officers/admins"
  on public.documents for insert
  with check (
    public.get_current_user_role() in ('officer', 'admin')
    or exists (
      select 1 from public.applications a
      where a.id = documents.application_id
        and a.institution_id = public.get_current_user_institution_id()
    )
  );

create policy "Documents updatable by own institution or officers/admins"
  on public.documents for update
  using (
    public.get_current_user_role() in ('officer', 'admin')
    or exists (
      select 1 from public.applications a
      where a.id = documents.application_id
        and a.institution_id = public.get_current_user_institution_id()
    )
  );

-- 4.5 Extracted Fields Policies
create policy "Extracted fields readable by officers or own institution"
  on public.extracted_fields for select
  using (
    public.get_current_user_role() in ('officer', 'admin', 'auditor')
    or exists (
      select 1 from public.documents d
      join public.applications a on a.id = d.application_id
      where d.id = extracted_fields.document_id
        and a.institution_id = public.get_current_user_institution_id()
    )
  );

-- 4.6 Rules Policies (Read-only for all authenticated, manageable by admins)
create policy "Rules readable by all authenticated users"
  on public.rules for select
  to authenticated
  using (true);

create policy "Rules manageable by admins"
  on public.rules for all
  using (public.get_current_user_role() = 'admin');

-- 4.7 Validation Runs Policies
create policy "Validation runs readable by officers or own institution"
  on public.validation_runs for select
  using (
    public.get_current_user_role() in ('officer', 'admin', 'auditor')
    or exists (
      select 1 from public.applications a
      where a.id = validation_runs.application_id
        and a.institution_id = public.get_current_user_institution_id()
    )
  );

-- 4.8 Findings Policies
create policy "Findings readable by officers or own institution"
  on public.findings for select
  using (
    public.get_current_user_role() in ('officer', 'admin', 'auditor')
    or exists (
      select 1 from public.applications a
      where a.id = findings.application_id
        and a.institution_id = public.get_current_user_institution_id()
    )
  );

-- 4.9 Queries Policies
create policy "Queries readable by officers, admins or own institution"
  on public.queries for select
  using (
    public.get_current_user_role() in ('officer', 'admin', 'auditor')
    or exists (
      select 1 from public.applications a
      where a.id = queries.application_id
        and a.institution_id = public.get_current_user_institution_id()
    )
  );

create policy "Queries insertable by officers, admins or own institution"
  on public.queries for insert
  with check (
    public.get_current_user_role() in ('officer', 'admin')
    or exists (
      select 1 from public.applications a
      where a.id = queries.application_id
        and a.institution_id = public.get_current_user_institution_id()
    )
  );

create policy "Queries updatable by thread participants"
  on public.queries for update
  using (
    public.get_current_user_role() in ('officer', 'admin')
    or exists (
      select 1 from public.applications a
      where a.id = queries.application_id
        and a.institution_id = public.get_current_user_institution_id()
    )
  );

-- 4.10 Inspections Policies
create policy "Inspections readable by officers or own institution"
  on public.inspections for select
  using (
    public.get_current_user_role() in ('officer', 'admin', 'auditor')
    or exists (
      select 1 from public.applications a
      where a.id = inspections.application_id
        and a.institution_id = public.get_current_user_institution_id()
    )
  );

create policy "Inspections manageable by officers and admins"
  on public.inspections for all
  using (public.get_current_user_role() in ('officer', 'admin'));

-- 4.11 Decisions Policies
create policy "Decisions readable by officers or own institution"
  on public.decisions for select
  using (
    public.get_current_user_role() in ('officer', 'admin', 'auditor')
    or exists (
      select 1 from public.applications a
      where a.id = decisions.application_id
        and a.institution_id = public.get_current_user_institution_id()
    )
  );

create policy "Decisions insertable by officers and admins"
  on public.decisions for insert
  with check (public.get_current_user_role() in ('officer', 'admin'));

-- 4.12 Audit Events Policies (IMMUTABLE, Append-only: No UPDATE or DELETE allowed)
create policy "Audit events readable by officers, admins, auditors or own institution"
  on public.audit_events for select
  using (
    public.get_current_user_role() in ('officer', 'admin', 'auditor')
    or exists (
      select 1 from public.applications a
      where a.id = audit_events.application_id
        and a.institution_id = public.get_current_user_institution_id()
    )
  );

create policy "Audit events insertable by authenticated users"
  on public.audit_events for insert
  to authenticated
  with check (true);

-- ==============================================================================
-- 5. PRIVATE STORAGE BUCKET: "documents" & POLICIES
-- ==============================================================================

-- Create private bucket 'documents' if it does not already exist
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'documents',
  'documents',
  false,
  52428800, -- 50MB limit
  array['application/pdf', 'image/jpeg', 'image/png']
)
on conflict (id) do update set
  public = false,
  file_size_limit = 52428800;

-- 5.1 Storage Select Policy:
-- - Officers, Admins, Auditors can read all files.
-- - Institution users can read files only under their own {institution_id}/... folder.
create policy "Documents storage read policy"
  on storage.objects for select
  using (
    bucket_id = 'documents'
    and (
      public.get_current_user_role() in ('officer', 'admin', 'auditor')
      or (
        public.get_current_user_role() = 'institution'
        and name like (public.get_current_user_institution_id()::text || '/%')
      )
    )
  );

-- 5.2 Storage Insert Policy:
-- - Institution users can upload only under {institution_id}/{application_id}/...
-- - Officers and Admins can upload to any path in the documents bucket.
create policy "Documents storage upload policy"
  on storage.objects for insert
  with check (
    bucket_id = 'documents'
    and (
      public.get_current_user_role() in ('officer', 'admin')
      or (
        public.get_current_user_role() = 'institution'
        and name like (public.get_current_user_institution_id()::text || '/%')
      )
    )
  );

-- 5.3 Storage Delete Policy:
create policy "Documents storage delete policy"
  on storage.objects for delete
  using (
    bucket_id = 'documents'
    and (
      public.get_current_user_role() in ('officer', 'admin')
      or (
        public.get_current_user_role() = 'institution'
        and name like (public.get_current_user_institution_id()::text || '/%')
      )
    )
  );

-- ==============================================================================
-- 6. NOTIFICATIONS RLS POLICIES
-- ==============================================================================
alter table public.notifications enable row level security;

create policy "Notifications readable by role or recipient user"
  on public.notifications for select
  using (
    user_id = auth.uid()
    or role = public.get_current_user_role()
    or public.get_current_user_role() in ('admin')
  );

create policy "Notifications updateable by recipient to mark read"
  on public.notifications for update
  using (
    user_id = auth.uid()
    or role = public.get_current_user_role()
    or public.get_current_user_role() in ('admin')
  );

create policy "Notifications insertable by system/authenticated"
  on public.notifications for insert
  to authenticated
  with check (true);

-- ==============================================================================
-- 7. AUDIT TRAIL IMMUTABILITY & HASH CHAIN TRIGGERS
-- ==============================================================================

-- 7.1 Compute Cryptographic Hash Chain on INSERT
create or replace function public.compute_audit_event_hash()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  last_hash text;
  canonical_payload text;
begin
  select hash into last_hash 
  from public.audit_events 
  order by created_at desc, id desc 
  limit 1;

  new.prev_hash := coalesce(last_hash, 'GENESIS');

  if new.application_number is null and new.application_id is not null then
    select application_number into new.application_number 
    from public.applications 
    where id = new.application_id;
  end if;

  if new.created_at is null then
    new.created_at := now();
  end if;

  canonical_payload := concat_ws(
    '|',
    new.prev_hash,
    coalesce(new.actor_id::text, ''),
    coalesce(new.actor_role, ''),
    coalesce(new.action, ''),
    coalesce(new.entity_type, ''),
    coalesce(new.entity_id::text, ''),
    coalesce(new.application_id::text, ''),
    coalesce(new.details::text, '{}'),
    coalesce(new.rule_set_version, '2026-27-v1'),
    coalesce(new.model_version, 'gemini-1.5-flash'),
    to_char(new.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"')
  );

  new.hash := encode(digest(canonical_payload, 'sha256'), 'hex');
  return new;
end;
$$;

drop trigger if exists trg_compute_audit_hash on public.audit_events;
create trigger trg_compute_audit_hash
  before insert on public.audit_events
  for each row execute function public.compute_audit_event_hash();

-- 7.2 Prohibit UPDATE and DELETE on audit_events
create or replace function public.prohibit_audit_events_mutation()
returns trigger
language plpgsql
as $$
begin
  raise exception 'Statutory Audit Ledger is immutable. UPDATE and DELETE operations are strictly prohibited under AICTE Section 10(k).';
end;
$$;

drop trigger if exists trg_audit_events_immutable on public.audit_events;
create trigger trg_audit_events_immutable
  before update or delete on public.audit_events
  for each row execute function public.prohibit_audit_events_mutation();

-- ==============================================================================
-- 8. AUTOMATED AUDIT TRIGGERS (8 SOURCES) & NOTIFICATIONS
-- ==============================================================================

-- 8.1 Application Status Changes
create or replace function public.trg_fn_audit_application_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_name text := 'AICTE Officer';
begin
  if (old.status is distinct from new.status) or (old.stage is distinct from new.stage) then
    select full_name into v_actor_name from public.profiles where id = auth.uid();
    
    insert into public.audit_events (
      actor_id, actor, actor_role, action, entity_type, entity_id,
      application_id, application_number, details, rule_set_version
    ) values (
      auth.uid(),
      coalesce(v_actor_name, 'Scrutiny Officer'),
      coalesce(public.get_current_user_role()::text, 'officer'),
      'Application Status Transition',
      'application',
      new.id,
      new.id,
      new.application_number,
      jsonb_build_object(
        'old_status', old.status,
        'new_status', new.status,
        'old_stage', old.stage,
        'new_stage', new.stage,
        'recommended_action', new.recommended_action
      ),
      '2026-27-v1'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_audit_application_status on public.applications;
create trigger trg_audit_application_status
  after update on public.applications
  for each row execute function public.trg_fn_audit_application_change();

-- 8.2 Document Lifecycle (Upload/Replace)
create or replace function public.trg_fn_audit_document_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_app_num text;
  v_actor_name text;
begin
  select application_number into v_app_num from public.applications where id = coalesce(new.application_id, old.application_id);
  select full_name into v_actor_name from public.profiles where id = auth.uid();

  if tg_op = 'INSERT' then
    insert into public.audit_events (
      actor_id, actor, actor_role, action, entity_type, entity_id,
      application_id, application_number, details, rule_set_version
    ) values (
      coalesce(new.uploaded_by, auth.uid()),
      coalesce(v_actor_name, 'Institution Authorized Signatory'),
      coalesce(public.get_current_user_role()::text, 'institution'),
      'Statutory Document Uploaded',
      'document',
      new.id,
      new.application_id,
      v_app_num,
      jsonb_build_object(
        'document_name', new.name,
        'doc_type', new.doc_type,
        'file_name', new.file_name,
        'sha256', new.sha256,
        'version', new.version,
        'is_current', new.is_current
      ),
      '2026-27-v1'
    );
  elsif tg_op = 'UPDATE' and old.is_current = true and new.is_current = false then
    insert into public.audit_events (
      actor_id, actor, actor_role, action, entity_type, entity_id,
      application_id, application_number, details, rule_set_version
    ) values (
      auth.uid(),
      coalesce(v_actor_name, 'Institution Authorized Signatory'),
      coalesce(public.get_current_user_role()::text, 'institution'),
      'Statutory Document Version Superseded',
      'document',
      new.id,
      new.application_id,
      v_app_num,
      jsonb_build_object(
        'document_name', new.name,
        'old_version', old.version,
        'new_version', new.version,
        'replaced_by', new.replaced_by
      ),
      '2026-27-v1'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_audit_document_lifecycle on public.documents;
create trigger trg_audit_document_lifecycle
  after insert or update on public.documents
  for each row execute function public.trg_fn_audit_document_change();

-- 8.3 Validation Run Execution
create or replace function public.trg_fn_audit_validation_run()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_app_num text;
begin
  select application_number into v_app_num from public.applications where id = new.application_id;

  insert into public.audit_events (
    actor_id, actor, actor_role, action, entity_type, entity_id,
    application_id, application_number, details, rule_set_version, model_version
  ) values (
    auth.uid(),
    coalesce(new.triggered_by, 'PRAMAN Compliance Engine'),
    'System AI',
    'Deterministic Rules Validation Executed',
    'validation_run',
    new.id,
    new.application_id,
    v_app_num,
    jsonb_build_object(
      'trigger_reason', new.trigger_reason,
      'rule_set_version', new.rule_set_version,
      'overall_confidence', new.overall_confidence,
      'findings_count', new.findings_count,
      'recommended_action', new.recommended_action
    ),
    new.rule_set_version,
    'gemini-1.5-flash'
  );
  return new;
end;
$$;

drop trigger if exists trg_audit_validation_run on public.validation_runs;
create trigger trg_audit_validation_run
  after insert on public.validation_runs
  for each row execute function public.trg_fn_audit_validation_run();

-- 8.4 Finding Status Changes
create or replace function public.trg_fn_audit_finding_status()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_app_num text;
  v_actor_name text;
begin
  if (old.status is distinct from new.status) then
    select application_number into v_app_num from public.applications where id = new.application_id;
    select full_name into v_actor_name from public.profiles where id = auth.uid();

    insert into public.audit_events (
      actor_id, actor, actor_role, action, entity_type, entity_id,
      application_id, application_number, details, rule_set_version
    ) values (
      auth.uid(),
      coalesce(v_actor_name, 'Scrutiny Officer'),
      coalesce(public.get_current_user_role()::text, 'officer'),
      'AI Finding Adjudication Modified',
      'finding',
      new.id,
      new.application_id,
      v_app_num,
      jsonb_build_object(
        'rule_code', new.rule_code,
        'old_status', old.status,
        'new_status', new.status,
        'superseded_by', new.superseded_by,
        'field_key', new.field_key
      ),
      new.rule_version
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_audit_finding_status on public.findings;
create trigger trg_audit_finding_status
  after update on public.findings
  for each row execute function public.trg_fn_audit_finding_status();

-- 8.5 Clarification Queries (Sent & Answered)
create or replace function public.trg_fn_audit_query()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_app_num text;
  v_actor_name text;
  v_old_replies_count int := 0;
  v_new_replies_count int := 0;
begin
  select application_number into v_app_num from public.applications where id = coalesce(new.application_id, old.application_id);
  select full_name into v_actor_name from public.profiles where id = auth.uid();

  if tg_op = 'INSERT' then
    insert into public.audit_events (
      actor_id, actor, actor_role, action, entity_type, entity_id,
      application_id, application_number, details, rule_set_version
    ) values (
      coalesce(new.sender_id, auth.uid()),
      coalesce(new.sender_name, v_actor_name, 'Scrutiny Officer'),
      coalesce(new.sender_role::text, 'officer'),
      'Clarification Inquiry Issued',
      'query',
      new.id,
      new.application_id,
      v_app_num,
      jsonb_build_object(
        'subject', new.subject,
        'recipient_role', new.recipient_role,
        'inquiry_preview', left(new.message, 120),
        'status', new.status
      ),
      '2026-27-v1'
    );
  elsif tg_op = 'UPDATE' then
    if old.replies is not null then
      v_old_replies_count := jsonb_array_length(old.replies);
    end if;
    if new.replies is not null then
      v_new_replies_count := jsonb_array_length(new.replies);
    end if;

    if v_new_replies_count > v_old_replies_count then
      insert into public.audit_events (
        actor_id, actor, actor_role, action, entity_type, entity_id,
        application_id, application_number, details, rule_set_version
      ) values (
        auth.uid(),
        coalesce(v_actor_name, 'Institution Principal'),
        coalesce(public.get_current_user_role()::text, 'institution'),
        'Clarification Response Submitted',
        'query',
        new.id,
        new.application_id,
        v_app_num,
        jsonb_build_object(
          'subject', new.subject,
          'status', new.status,
          'latest_reply', new.replies->-1
        ),
        '2026-27-v1'
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_audit_query_lifecycle on public.queries;
create trigger trg_audit_query_lifecycle
  after insert or update on public.queries
  for each row execute function public.trg_fn_audit_query();

-- 8.6 Physical Inspection Scheduled
create or replace function public.trg_fn_audit_inspection()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_app_num text;
  v_actor_name text;
begin
  select application_number into v_app_num from public.applications where id = new.application_id;
  select full_name into v_actor_name from public.profiles where id = auth.uid();

  insert into public.audit_events (
    actor_id, actor, actor_role, action, entity_type, entity_id,
    application_id, application_number, details, rule_set_version
  ) values (
    auth.uid(),
    coalesce(v_actor_name, 'Expert Visiting Committee'),
    'officer',
    'Physical Inspection Committee Scheduled',
    'inspection',
    new.id,
    new.application_id,
    v_app_num,
    jsonb_build_object(
      'inspection_date', new.date,
      'committee_lead', new.committee_lead,
      'purpose', new.purpose,
      'location', new.location,
      'status', new.status
    ),
    '2026-27-v1'
  );
  return new;
end;
$$;

drop trigger if exists trg_audit_inspection on public.inspections;
create trigger trg_audit_inspection
  after insert on public.inspections
  for each row execute function public.trg_fn_audit_inspection();

-- 8.7 Decisions Recorded
create or replace function public.trg_fn_audit_decision()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_app_num text;
  v_actor_name text;
begin
  select application_number into v_app_num from public.applications where id = new.application_id;
  select full_name into v_actor_name from public.profiles where id = auth.uid();

  insert into public.audit_events (
    actor_id, actor, actor_role, action, entity_type, entity_id,
    application_id, application_number, details, rule_set_version
  ) values (
    coalesce(new.officer_id, auth.uid()),
    coalesce(new.officer_name, v_actor_name, 'Regional Scrutiny Director'),
    'officer',
    'Formal Scrutiny Decision Recorded',
    'decision',
    new.id,
    new.application_id,
    v_app_num,
    jsonb_build_object(
      'decision', new.decision,
      'officer_name', new.officer_name,
      'notes', new.notes
    ),
    '2026-27-v1'
  );
  return new;
end;
$$;

drop trigger if exists trg_audit_decision on public.decisions;
create trigger trg_audit_decision
  after insert on public.decisions
  for each row execute function public.trg_fn_audit_decision();

-- 8.8 Manual Field Corrections
create or replace function public.trg_fn_audit_manual_field_correction()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_app_id uuid;
  v_app_num text;
  v_actor_name text;
begin
  if new.source = 'manual' and (old.value is distinct from new.value or old.source is distinct from new.source) then
    select application_id into v_app_id from public.documents where id = new.document_id;
    if v_app_id is not null then
      select application_number into v_app_num from public.applications where id = v_app_id;
    end if;
    select full_name into v_actor_name from public.profiles where id = auth.uid();

    insert into public.audit_events (
      actor_id, actor, actor_role, action, entity_type, entity_id,
      application_id, application_number, details, rule_set_version
    ) values (
      auth.uid(),
      coalesce(v_actor_name, 'Scrutiny Officer'),
      coalesce(public.get_current_user_role()::text, 'officer'),
      'Manual Extracted Field Correction',
      'extracted_field',
      new.id,
      v_app_id,
      v_app_num,
      jsonb_build_object(
        'document_id', new.document_id,
        'field_key', new.field_key,
        'old_value', old.value,
        'new_value', new.value,
        'old_confidence', old.confidence,
        'new_confidence', 1.0000,
        'source', 'manual'
      ),
      '2026-27-v1'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_audit_extracted_fields on public.extracted_fields;
create trigger trg_audit_extracted_fields
  after update on public.extracted_fields
  for each row execute function public.trg_fn_audit_manual_field_correction();

-- ==============================================================================
-- 9. NOTIFICATIONS DISPATCH & REALTIME REPLICATION
-- ==============================================================================

create or replace function public.trg_fn_dispatch_notifications()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_app_num text;
begin
  if tg_table_name = 'queries' and tg_op = 'INSERT' then
    select application_number into v_app_num from public.applications where id = new.application_id;
    insert into public.notifications (role, application_id, title, message, type, link_nav)
    values (
      new.recipient_role,
      new.application_id,
      'Clarification Inquiry Issued',
      'Officer raised clarification on ' || coalesce(v_app_num, 'Application') || ': ' || coalesce(new.subject, 'Statutory verification'),
      'action_required',
      'queries'
    );
  elsif tg_table_name = 'queries' and tg_op = 'UPDATE' and jsonb_array_length(coalesce(new.replies, '[]'::jsonb)) > jsonb_array_length(coalesce(old.replies, '[]'::jsonb)) then
    select application_number into v_app_num from public.applications where id = new.application_id;
    insert into public.notifications (role, application_id, title, message, type, link_nav)
    values (
      'officer',
      new.application_id,
      'Clarification Reply Received',
      'Institution replied to inquiry regarding ' || coalesce(v_app_num, 'docket'),
      'info',
      'clarifications'
    );
  elsif tg_table_name = 'applications' and tg_op = 'UPDATE' and old.status is distinct from new.status then
    insert into public.notifications (role, application_id, title, message, type, link_nav)
    values (
      'institution',
      new.id,
      'Application Lifecycle Update',
      'Status transitioned to ' || new.status::text || ' (' || new.stage || ') for ' || new.application_number,
      case 
        when new.status = 'approved' then 'success'
        when new.status in ('clarification_requested', 'rejected', 'inspection_requested') then 'warning'
        else 'info'
      end,
      'track-status'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists trg_notify_queries on public.queries;
create trigger trg_notify_queries
  after insert or update on public.queries
  for each row execute function public.trg_fn_dispatch_notifications();

drop trigger if exists trg_notify_applications on public.applications;
create trigger trg_notify_applications
  after update on public.applications
  for each row execute function public.trg_fn_dispatch_notifications();

-- Enable Realtime replication
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end
$$;

alter publication supabase_realtime add table public.audit_events;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.applications;
alter publication supabase_realtime add table public.queries;
