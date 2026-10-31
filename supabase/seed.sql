-- ==============================================================================
-- AICTE PRAMAN (VerifyAI) - Supabase Seed Data Script
-- ==============================================================================
-- HOW TO RUN THIS FILE:
-- 1. Ensure you have executed /supabase/schema.sql first in the Supabase SQL Editor.
-- 2. In Supabase Dashboard, open "SQL Editor", paste this file, and click "Run".
-- 3. This script seeds:
--    - 2 Accredited Institutions (SVIT Pune and Sahyadri College)
--    - 3 Demo Accounts (1 Officer, 1 Admin, 1 Institution User)
--    - 6 Applications covering every finding_status:
--        * Passed
--        * Missing
--        * Mismatch
--        * Expired
--        * Suspicious
--        * Needs Manual Review
--    - Seed documents, extracted fields, validation runs, findings, queries & audit trail.
--
-- DEFAULT DEMO PASSWORDS (in auth.users):
--   * Officer:      sara.abraham@aicte-india.org  /  officer@2026
--   * Admin:        admin@aicte-india.org        /  admin@2026
--   * Institution:  registrar@svit.ac.in         /  svit@pune2026
-- ==============================================================================

-- 1. Insert 2 Accredited Institutions
insert into public.institutions (
  id,
  name,
  code,
  state,
  city,
  type,
  trust_name,
  land_survey_no,
  address,
  pincode,
  established_year
) values
(
  'b3a8d1e2-0001-4000-8000-000000000001',
  'Sri Venkateswara Institute of Technology, Pune',
  '1-4829101',
  'Maharashtra',
  'Pune',
  'Engineering & Technology (Autonomous)',
  'Sri Venkateswara Educational Trust',
  'Survey No. 44/A',
  'Survey No. 44/A, Hinjawadi Phase 2, Maan Road, Pune',
  '411057',
  2004
),
(
  'b3a8d1e2-0002-4000-8000-000000000002',
  'Sahyadri College of Engineering, Mangalore',
  '1-5910283',
  'Karnataka',
  'Mangalore',
  'Engineering & Technology',
  'Bhandary Foundation Charitable Trust',
  'Plot 118/C',
  'Sahyadri Campus, Adyar, Mangalore',
  '575007',
  2007
)
on conflict (id) do nothing;

-- 2. Create Auth Users and Profiles
-- Note: inserting directly into auth.users allows demo credentials to work immediately in Supabase Auth.
do $$
declare
  officer_id uuid := 'a1000000-0000-4000-8000-000000000001';
  admin_id   uuid := 'a1000000-0000-4000-8000-000000000002';
  inst_id    uuid := 'a1000000-0000-4000-8000-000000000003';
  enc_pwd_officer text := crypt('officer@2026', gen_salt('bf'));
  enc_pwd_admin   text := crypt('admin@2026', gen_salt('bf'));
  enc_pwd_inst    text := crypt('svit@pune2026', gen_salt('bf'));
begin
  -- Officer User
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) values (
    officer_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'sara.abraham@aicte-india.org', enc_pwd_officer, now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Sara Abraham","role":"officer","title":"Senior Scrutiny Officer (Western Regional Office)"}'::jsonb,
    now(), now()
  ) on conflict (id) do nothing;

  -- Admin User
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) values (
    admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'admin@aicte-india.org', enc_pwd_admin, now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Dr. Anil Sahasrabudhe","role":"admin","title":"Executive Director & System Administrator"}'::jsonb,
    now(), now()
  ) on conflict (id) do nothing;

  -- Institution User (SVIT Pune)
  insert into auth.users (
    id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) values (
    inst_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
    'registrar@svit.ac.in', enc_pwd_inst, now(),
    '{"provider":"email","providers":["email"]}'::jsonb,
    '{"full_name":"Dr. V. Kulkarni","role":"institution","title":"Principal / Registrar","institution_id":"b3a8d1e2-0001-4000-8000-000000000001"}'::jsonb,
    now(), now()
  ) on conflict (id) do nothing;

  -- Upsert profiles
  insert into public.profiles (id, role, institution_id, full_name, email, title, avatar)
  values
  (
    officer_id,
    'officer',
    null,
    'Sara Abraham',
    'sara.abraham@aicte-india.org',
    'Senior Scrutiny Officer (Western Regional Office)',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80'
  ),
  (
    admin_id,
    'admin',
    null,
    'Dr. Anil Sahasrabudhe',
    'admin@aicte-india.org',
    'Executive Director & System Administrator',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80'
  ),
  (
    inst_id,
    'institution',
    'b3a8d1e2-0001-4000-8000-000000000001',
    'Dr. V. Kulkarni',
    'registrar@svit.ac.in',
    'Principal / Registrar',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'
  )
  on conflict (id) do update set
    role = excluded.role,
    institution_id = excluded.institution_id,
    full_name = excluded.full_name,
    title = excluded.title,
    avatar = excluded.avatar;
end $$;

-- 3. Insert Versioned Regulatory Rules
insert into public.rules (id, code, version, application_type, title, description, severity, category, source_reference) values
('r1000000-0000-4000-8000-000000000001', 'APH-4.2', '2026-27-v1', 'ALL', 'Mandatory Document Availability', 'Mandatory statutory submissions checklist compliance under Section 4.2', 'CRITICAL', 'Mandatory Check', 'AICTE Approval Process Handbook (APH) 2026-27, Clause 4.2'),
('r1000000-0000-4000-8000-000000000002', 'APH-7.1', '2026-27-v1', 'ALL', 'Statutory Certificate Validity', 'Verification that Fire Safety, Occupancy, and Pollution NOCs remain unexpired throughout the academic year', 'HIGH', 'Expiry Check', 'APH 2026-27, Clause 7.1'),
('r1000000-0000-4000-8000-000000000003', 'APH-5.3', '2026-27-v1', 'ALL', 'Cross-Document Spatial Consistency', 'Cross-verification of land survey numbers and spatial boundaries between revenue deed and self-attested affidavit', 'CRITICAL', 'Cross-Verification', 'APH 2026-27, Clause 5.3'),
('r1000000-0000-4000-8000-000000000004', 'DUP-CHK-01', '2026-27-v1', 'ALL', 'Cryptographic & Structural Duplicate Detection', 'Evaluation of SHA-256 hashes and blueprint vector patterns to prevent identical document reuse across colleges', 'CRITICAL', 'Authenticity Check', 'AICTE Vigilance & Anti-Plagiarism Guidelines 2026-27'),
('r1000000-0000-4000-8000-000000000005', 'APH-3.4', '2026-27-v1', 'ALL', 'Faculty Cadre & Ratio Verification', 'Cadre ratio validation (1:2:6 Prof/Assoc/Asst) and student-to-faculty proportion adherence', 'MEDIUM', 'Faculty Norms', 'AICTE Norms for Cadre Ratio Clause 3.4')
on conflict (code) do nothing;

-- 4. Insert 6 Applications covering every finding_status
insert into public.applications (
  id,
  application_number,
  institution_id,
  application_type,
  academic_year,
  status,
  stage,
  overall_confidence,
  recommended_action,
  officer_observation,
  assigned_officer
) values
-- App 1: Mismatch
(
  'c1000000-0000-4000-8000-000000000001',
  'AICTE-2026-04821',
  'b3a8d1e2-0001-4000-8000-000000000001',
  'Extension of Approval',
  'AY 2026-27',
  'clarification_requested',
  'Officer Review',
  0.7200,
  'Seek Clarification',
  'Spatial discrepancy detected: Self-attested affidavit mentions Survey 44/B while registered title deed shows Survey 44/A.',
  'Sara Abraham (Western Regional Bureau)'
),
-- App 2: Missing
(
  'c1000000-0000-4000-8000-000000000002',
  'AICTE-2026-07192',
  'b3a8d1e2-0002-4000-8000-000000000002',
  'Extension of Approval',
  'AY 2026-27',
  'under_review',
  'AI Validation',
  0.6400,
  'Seek Clarification',
  'Fire Safety Renewal NOC has not been uploaded for the newly added engineering block.',
  'Sara Abraham (Western Regional Bureau)'
),
-- App 3: Expired
(
  'c1000000-0000-4000-8000-000000000003',
  'AICTE-2026-03918',
  'b3a8d1e2-0001-4000-8000-000000000001',
  'Increase in Intake',
  'AY 2026-27',
  'in_validation',
  'AI Validation',
  0.6800,
  'Seek Clarification',
  'Building Occupancy Certificate expired on 12 Mar 2026. Renewal certificate required.',
  'Dr. Anil Sahasrabudhe'
),
-- App 4: Suspicious
(
  'c1000000-0000-4000-8000-000000000004',
  'AICTE-2026-08812',
  'b3a8d1e2-0002-4000-8000-000000000002',
  'New Institution',
  'AY 2026-27',
  'under_review',
  'Officer Review',
  0.5100,
  'Request Inspection',
  'Building floor plan vector layout exhibits 94% structural overlap with a previously archived blueprint.',
  'Sara Abraham (Western Regional Bureau)'
),
-- App 5: Needs Manual Review
(
  'c1000000-0000-4000-8000-000000000005',
  'AICTE-2026-01549',
  'b3a8d1e2-0001-4000-8000-000000000001',
  'Change in Program',
  'AY 2026-27',
  'under_review',
  'Officer Review',
  0.7900,
  'Needs Manual Review',
  'Non-standard municipal approval stamp detected on mechanical lab structural safety certificate.',
  'Prof. R. K. Singhal'
),
-- App 6: Passed
(
  'c1000000-0000-4000-8000-000000000006',
  'AICTE-2026-09204',
  'b3a8d1e2-0002-4000-8000-000000000002',
  'Extension of Approval',
  'AY 2026-27',
  'approved',
  'Final Decision',
  0.9800,
  'Approve to Next Stage',
  'All 32 statutory documents, PKI signatures, and faculty cadre ratios verified successfully without discrepancy.',
  'Executive Scrutiny Committee'
)
on conflict (id) do nothing;

-- 5. Insert Documents for App 1 (SVIT Pune)
insert into public.documents (
  id,
  application_id,
  doc_type,
  name,
  category,
  storage_path,
  file_name,
  mime_type,
  size_bytes,
  sha256,
  version,
  ocr_status,
  ocr_confidence,
  status
) values
(
  'd1000000-0000-4000-8000-000000000001',
  'c1000000-0000-4000-8000-000000000001',
  'Registered Revenue Title Deed',
  'Land Title Deed & Mutation Extract',
  'Land & Ownership',
  'b3a8d1e2-0001-4000-8000-000000000001/c1000000-0000-4000-8000-000000000001/v1_Land_Title_Deed.pdf',
  'Land_Title_Deed_v1.0.pdf',
  'application/pdf',
  4613734,
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
  'v1.0',
  'Extracted',
  0.9800,
  'passed'
),
(
  'd1000000-0000-4000-8000-000000000002',
  'c1000000-0000-4000-8000-000000000001',
  'Notarized Self-Attested Affidavit',
  'AICTE Format Affidavit (Clause 5.3)',
  'Legal & Governance',
  'b3a8d1e2-0001-4000-8000-000000000001/c1000000-0000-4000-8000-000000000001/v1_Affidavit_Notarized.pdf',
  'Affidavit_Notarized_v1.0.pdf',
  'application/pdf',
  2516582,
  '8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4',
  'v1.0',
  'Extracted',
  0.9400,
  'mismatch'
),
(
  'd1000000-0000-4000-8000-000000000003',
  'c1000000-0000-4000-8000-000000000001',
  'Fire Safety Certificate',
  'Fire Department NOC 2026',
  'Building & Safety',
  'b3a8d1e2-0001-4000-8000-000000000001/c1000000-0000-4000-8000-000000000001/v1_Fire_NOC.pdf',
  'Fire_NOC_2026.pdf',
  'application/pdf',
  1887436,
  '3a7bd3e2360a3d29eea436fcfb7e44c735d117c42d1c1835420b6b9942dd4f1b',
  'v1.0',
  'Extracted',
  0.9600,
  'passed'
)
on conflict (id) do nothing;

-- 6. Insert Extracted Fields for Document 2
insert into public.extracted_fields (
  id,
  document_id,
  field_key,
  value,
  claimed_value,
  confidence,
  page,
  source,
  status
) values
(
  'e1000000-0000-4000-8000-000000000001',
  'd1000000-0000-4000-8000-000000000002',
  'Land Survey / Plot ID',
  'Survey No. 44/B, Hinjawadi',
  'Survey No. 44/A',
  0.9400,
  2,
  'Spatial Coordinate OCR',
  'mismatch'
),
(
  'e1000000-0000-4000-8000-000000000002',
  'd1000000-0000-4000-8000-000000000002',
  'Institution Legal Name',
  'Sri Venkateswara Institute of Technology',
  'Sri Venkateswara Institute of Technology',
  0.9900,
  1,
  'Spatial Coordinate OCR',
  'passed'
)
on conflict (id) do nothing;

-- 7. Insert Validation Run & Finding for App 1
insert into public.validation_runs (
  id,
  application_id,
  rule_set_version,
  triggered_by,
  trigger_reason,
  overall_confidence,
  recommended_action,
  findings_count
) values
(
  'v1000000-0000-4000-8000-000000000001',
  'c1000000-0000-4000-8000-000000000001',
  '2026-27-v1',
  'PRAMAN Neural Scrutiny Engine',
  'Application submitted for EoA 2026-27',
  0.7200,
  'Seek Clarification',
  '{"passed": 28, "missing": 0, "mismatch": 1, "expired": 0, "suspicious": 0, "needsReview": 1}'::jsonb
)
on conflict (id) do nothing;

insert into public.findings (
  id,
  run_id,
  application_id,
  document_id,
  rule_code,
  rule_version,
  status,
  severity,
  field_key,
  page,
  value_a,
  value_b,
  confidence,
  explanation,
  suggested_action,
  why_line
) values
(
  'f1000000-0000-4000-8000-000000000001',
  'v1000000-0000-4000-8000-000000000001',
  'c1000000-0000-4000-8000-000000000001',
  'd1000000-0000-4000-8000-000000000002',
  'APH-5.3',
  '2026-27-v1',
  'mismatch',
  'CRITICAL',
  'Land Survey / Plot ID',
  2,
  'Survey 44/B (Affidavit)',
  'Survey 44/A (Revenue Deed)',
  0.9400,
  'Spatial discrepancy detected: Self-attested affidavit mentions Survey 44/B while registered title deed shows Survey 44/A.',
  'Seek Clarification from Institution to submit amended affidavit or certified Sub-Registrar rectification deed.',
  'Affidavit land coordinates diverge from government revenue records.'
)
on conflict (id) do nothing;

-- 8. Insert Clarification Query for App 1
insert into public.queries (
  id,
  application_id,
  sender_name,
  sender_role,
  recipient_role,
  subject,
  message,
  status
) values
(
  'q1000000-0000-4000-8000-000000000001',
  'c1000000-0000-4000-8000-000000000001',
  'Sara Abraham (Senior Scrutiny Officer)',
  'officer',
  'institution',
  'Notice: Discrepancy in Land Survey Number (Survey 44/A vs 44/B)',
  'Spatial verification detected a mismatch between your registered deed (Survey 44/A) and affidavit (Survey 44/B). Please upload an amended notarized affidavit or Sub-Registrar endorsement.',
  'Open'
)
on conflict (id) do nothing;

-- 9. Insert Audit Events
insert into public.audit_events (
  id,
  application_id,
  application_number,
  actor,
  actorRole,
  action,
  rule_version,
  details
) values
(
  'a1000000-0000-4000-8000-000000000001',
  'c1000000-0000-4000-8000-000000000001',
  'AICTE-2026-04821',
  'Dr. V. Kulkarni (Principal / Registrar)',
  'institution',
  'Application Dossier Submitted',
  '2026-27-v1',
  'Application AICTE-2026-04821 submitted with 3 statutory documents'
),
(
  'a1000000-0000-4000-8000-000000000002',
  'c1000000-0000-4000-8000-000000000001',
  'AICTE-2026-04821',
  'PRAMAN Neural Engine v4.11.2',
  'system',
  'Automated Neural Scrutiny Executed',
  '2026-27-v1',
  'Evaluated 3 documents against 5 versioned handbook rules. 1 critical mismatch flagged (APH-5.3).'
),
(
  'a1000000-0000-4000-8000-000000000003',
  'c1000000-0000-4000-8000-000000000001',
  'AICTE-2026-04821',
  'Sara Abraham (Senior Scrutiny Officer)',
  'officer',
  'Clarification Inquiry Dispatched',
  '2026-27-v1',
  'Officer reviewed discrepancy and dispatched formal clarification query to institution.'
)
on conflict (id) do nothing;
