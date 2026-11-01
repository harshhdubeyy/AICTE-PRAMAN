-- ==============================================================================
-- AICTE PRAMAN - Tamper-Evident Audit Trail & Realtime Synchronization Schema
-- ==============================================================================
-- This script configures:
-- 1. Immutable audit_events table with cryptographic SHA-256 hash chaining
-- 2. Anti-tamper triggers prohibiting UPDATE & DELETE
-- 3. 8 Automated database triggers recording statutory interventions:
--    - Application status transitions & committee stages
--    - Document uploads & version replacements
--    - Validation run executions
--    - AI finding status modifications
--    - Clarification query dispatches & replies
--    - Physical inspection committee scheduling
--    - Scrutiny Bureau final decisions
--    - Manual field OCR corrections
-- 4. Realtime notifications table & publication enablement
-- ==============================================================================

-- 1. Enable pgcrypto for SHA-256 hashing
create extension if not exists "pgcrypto";

-- 2. Audit Events Table (Cryptographic Hash-Chained, Append-Only)
create table if not exists public.audit_events (
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

-- Ensure index on application_id, action, actor_role and created_at
create index if not exists idx_audit_events_app_id on public.audit_events (application_id);
create index if not exists idx_audit_events_created_at on public.audit_events (created_at desc);
create index if not exists idx_audit_events_action on public.audit_events (action);
create index if not exists idx_audit_events_hash on public.audit_events (hash);

-- 3. Function & Trigger to Compute Cryptographic Hash Chain on INSERT
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
  -- Fetch the hash of the latest preceding audit event
  select hash into last_hash 
  from public.audit_events 
  order by created_at desc, id desc 
  limit 1;

  -- If this is the genesis block in the table, set prev_hash to GENESIS
  new.prev_hash := coalesce(last_hash, 'GENESIS');

  -- Populate application_number if missing but application_id is provided
  if new.application_number is null and new.application_id is not null then
    select application_number into new.application_number 
    from public.applications 
    where id = new.application_id;
  end if;

  -- Ensure created_at is populated
  if new.created_at is null then
    new.created_at := now();
  end if;

  -- Construct canonical string for cryptographic verification:
  -- sha256(prev_hash || canonical row data)
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

  -- Compute deterministic SHA-256 hash using pgcrypto
  new.hash := encode(digest(canonical_payload, 'sha256'), 'hex');

  return new;
end;
$$;

drop trigger if exists trg_compute_audit_hash on public.audit_events;
create trigger trg_compute_audit_hash
  before insert on public.audit_events
  for each row execute function public.compute_audit_event_hash();

-- 4. Anti-Tamper Trigger: Prohibit UPDATE & DELETE
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

-- 5. Row Level Security on audit_events
alter table public.audit_events enable row level security;

drop policy if exists "Audit events readable by officers, admins, auditors or own institution" on public.audit_events;
create policy "Audit events readable by officers, admins, auditors or own institution"
  on public.audit_events for select
  using (
    public.get_current_user_role() in ('officer', 'admin', 'auditor')
    or exists (
      select 1 from public.applications a
      where a.id = audit_events.application_id
        and a.institution_id = public.get_current_user_institution_id()
    )
    or application_id is null
  );

drop policy if exists "Audit events insertable by authenticated users" on public.audit_events;
create policy "Audit events insertable by authenticated users"
  on public.audit_events for insert
  to authenticated
  with check (true);

-- No UPDATE or DELETE policies are granted to anyone.

-- ==============================================================================
-- 6. AUTOMATED AUDIT TRIGGERS (8 SOURCES)
-- ==============================================================================

-- 6.1 Application Status & Stage Change Trigger
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
      actor_id,
      actor,
      actor_role,
      action,
      entity_type,
      entity_id,
      application_id,
      application_number,
      details,
      rule_set_version
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
        'recommended_action', new.recommended_action,
        'officer_observation', new.officer_observation
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

-- 6.2 Document Upload or Version Replacement Trigger
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
      actor_id,
      actor,
      actor_role,
      action,
      entity_type,
      entity_id,
      application_id,
      application_number,
      details,
      rule_set_version
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
        'file_size_bytes', new.size_bytes,
        'sha256', new.sha256,
        'version', new.version,
        'is_current', new.is_current
      ),
      '2026-27-v1'
    );
  elsif tg_op = 'UPDATE' and old.is_current = true and new.is_current = false then
    insert into public.audit_events (
      actor_id,
      actor,
      actor_role,
      action,
      entity_type,
      entity_id,
      application_id,
      application_number,
      details,
      rule_set_version
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

-- 6.3 Validation Run Execution Trigger
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
    actor_id,
    actor,
    actor_role,
    action,
    entity_type,
    entity_id,
    application_id,
    application_number,
    details,
    rule_set_version,
    model_version
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

-- 6.4 Finding Status Modification Trigger
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
      actor_id,
      actor,
      actor_role,
      action,
      entity_type,
      entity_id,
      application_id,
      application_number,
      details,
      rule_set_version
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

-- 6.5 Clarification Query Sent or Answered Trigger
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
      actor_id,
      actor,
      actor_role,
      action,
      entity_type,
      entity_id,
      application_id,
      application_number,
      details,
      rule_set_version
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
        actor_id,
        actor,
        actor_role,
        action,
        entity_type,
        entity_id,
        application_id,
        application_number,
        details,
        rule_set_version
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

-- 6.6 Physical Inspection Scheduled Trigger
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
    actor_id,
    actor,
    actor_role,
    action,
    entity_type,
    entity_id,
    application_id,
    application_number,
    details,
    rule_set_version
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

-- 6.7 Final Bureau Decision Recorded Trigger
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
    actor_id,
    actor,
    actor_role,
    action,
    entity_type,
    entity_id,
    application_id,
    application_number,
    details,
    rule_set_version
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

-- 6.8 Manual Extracted Field Correction Trigger
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
      actor_id,
      actor,
      actor_role,
      action,
      entity_type,
      entity_id,
      application_id,
      application_number,
      details,
      rule_set_version
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
-- 7. NOTIFICATIONS TABLE & LIVE SYNCHRONIZATION
-- ==============================================================================

create table if not exists public.notifications (
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

create index if not exists idx_notifications_role on public.notifications (role);
create index if not exists idx_notifications_user_id on public.notifications (user_id);
create index if not exists idx_notifications_created_at on public.notifications (created_at desc);

-- RLS for notifications
alter table public.notifications enable row level security;

drop policy if exists "Notifications readable by role or recipient user" on public.notifications;
create policy "Notifications readable by role or recipient user"
  on public.notifications for select
  using (
    user_id = auth.uid()
    or role = public.get_current_user_role()
    or public.get_current_user_role() in ('admin')
  );

drop policy if exists "Notifications updateable by recipient to mark read" on public.notifications;
create policy "Notifications updateable by recipient to mark read"
  on public.notifications for update
  using (
    user_id = auth.uid()
    or role = public.get_current_user_role()
    or public.get_current_user_role() in ('admin')
  );

drop policy if exists "Notifications insertable by system/authenticated" on public.notifications;
create policy "Notifications insertable by system/authenticated"
  on public.notifications for insert
  to authenticated
  with check (true);

-- 7.1 Notification Trigger: Dispatch alerts on clarification inquiry & status changes
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

-- ==============================================================================
-- 8. REALTIME PUBLICATION ENABLEMENT
-- ==============================================================================
-- Enable Realtime events for tables so client UI instantly updates across tabs/roles
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
