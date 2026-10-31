-- ==============================================================================
-- AICTE PRAMAN (VerifyAI) - Versioned Statutory Rules Seed (25 Rules)
-- ==============================================================================
-- Rule Set Version: 2026-27-v1 (AICTE Approval Process Handbook APH 2024-27)
-- This file populates active, versioned regulatory rules in the "public.rules" table.
-- Every rule specifies:
--   - code: Unique statutory rule identifier
--   - version: Rule version (e.g. 2026-27-v1)
--   - application_type: Applicable application category ('ALL', 'Extension of Approval', 'New Institution', 'Change in Program')
--   - title & description: Human-readable regulatory context
--   - severity: CRITICAL, HIGH, MEDIUM, LOW
--   - category: Compliance category
--   - config: JSON configuration for thresholds, required documents, regex, or ratios
--   - depends_on: JSON specifying doc_types and field_keys required by the rule
--   - source_reference: Exact chapter / section citation in the AICTE Approval Process Handbook
-- ==============================================================================

INSERT INTO public.rules (
  code,
  version,
  application_type,
  title,
  description,
  severity,
  category,
  config,
  depends_on,
  source_reference,
  effective_from,
  active
) VALUES

-- -----------------------------------------------------------------------------
-- 1. MANDATORY DOCUMENT CHECKLISTS (Rules 1-3)
-- -----------------------------------------------------------------------------
(
  'RULE-DOC-EOA-MANDATORY',
  '2026-27-v1',
  'Extension of Approval',
  'Extension of Approval Mandatory Document Checklist',
  'Verifies that all statutory documents required for annual Extension of Approval (EoA) are present and verified.',
  'CRITICAL',
  'Mandatory Checklist',
  '{
    "required_docs": [
      "Land Title Deed",
      "Building Safety Certificate",
      "Fire Safety NOC",
      "Faculty Cadre Roster",
      "Audited Financial Statements"
    ]
  }'::jsonb,
  '{
    "doc_types": [
      "Land Title Deed",
      "Building Safety Certificate",
      "Fire Safety NOC",
      "Faculty Cadre Roster",
      "Audited Financial Statements"
    ],
    "field_keys": []
  }'::jsonb,
  'APH 2024-27, Chapter II, Clause 2.1.3 & Annexure 4',
  '2026-01-01',
  true
),
(
  'RULE-DOC-NEW-MANDATORY',
  '2026-27-v1',
  'New Institution',
  'New Technical Institution Statutory Document Dossier',
  'Verifies that all prerequisite statutory deeds and NOCs for establishing a new technical institution are uploaded.',
  'CRITICAL',
  'Mandatory Checklist',
  '{
    "required_docs": [
      "Registered Trust Deed",
      "Land Title Deed",
      "Sanctioned Master Plan",
      "Occupancy Certificate",
      "Fixed Deposit Receipt"
    ]
  }'::jsonb,
  '{
    "doc_types": [
      "Registered Trust Deed",
      "Land Title Deed",
      "Sanctioned Master Plan",
      "Occupancy Certificate",
      "Fixed Deposit Receipt"
    ],
    "field_keys": []
  }'::jsonb,
  'APH 2024-27, Chapter I, Clause 1.4 & Annexure 1',
  '2026-01-01',
  true
),
(
  'RULE-DOC-CIP-MANDATORY',
  '2026-27-v1',
  'Change in Program',
  'Program Restructuring & Change in Course Checklist',
  'Verifies state government and affiliating university approvals for program alterations or intake increases.',
  'HIGH',
  'Mandatory Checklist',
  '{
    "required_docs": [
      "Affiliating University NOC",
      "State Government NOC",
      "Governing Body Resolution",
      "Faculty Transition Plan"
    ]
  }'::jsonb,
  '{
    "doc_types": [
      "Affiliating University NOC",
      "State Government NOC",
      "Governing Body Resolution",
      "Faculty Transition Plan"
    ],
    "field_keys": []
  }'::jsonb,
  'APH 2024-27, Chapter II, Clause 2.7',
  '2026-01-01',
  true
),

-- -----------------------------------------------------------------------------
-- 2. CERTIFICATE VALIDITY & EXPIRY (Rules 4-6)
-- -----------------------------------------------------------------------------
(
  'RULE-EXP-FIRE-NOC',
  '2026-27-v1',
  'ALL',
  'Fire and Life Safety NOC Certificate Validity',
  'Fire Safety NOC issued by competent state/municipal fire authority must remain valid at least until the end of the academic year.',
  'CRITICAL',
  'Safety & Compliance',
  '{
    "min_valid_until": "2026-12-31",
    "grace_period_days": 0
  }'::jsonb,
  '{
    "doc_types": ["Fire Safety NOC"],
    "field_keys": ["valid_until", "expiry_date", "certificate_number"]
  }'::jsonb,
  'APH 2024-27, Chapter VI, Clause 6.3.2 & National Building Code (NBC) 2016 Part 4',
  '2026-01-01',
  true
),
(
  'RULE-EXP-BUILDING-STABILITY',
  '2026-27-v1',
  'ALL',
  'Building Structural Stability Certificate Currency',
  'Structural soundness certificate issued by a registered chartered structural engineer must be unexpired and within 5 years of issue.',
  'HIGH',
  'Building Safety',
  '{
    "min_valid_until": "2026-12-31"
  }'::jsonb,
  '{
    "doc_types": ["Building Safety Certificate"],
    "field_keys": ["valid_until", "inspection_date", "structural_engineer_reg_no"]
  }'::jsonb,
  'APH 2024-27, Chapter VI, Clause 6.2.1',
  '2026-01-01',
  true
),
(
  'RULE-EXP-OCCUPANCY-CERT',
  '2026-27-v1',
  'ALL',
  'Municipal Occupancy / Completion Certificate Legality',
  'Permanent Building Occupancy Certificate issued by the Town Planning Authority or Municipal Corporation must not be provisional.',
  'CRITICAL',
  'Building Safety',
  '{
    "disallow_provisional": true
  }'::jsonb,
  '{
    "doc_types": ["Occupancy Certificate"],
    "field_keys": ["certificate_type", "issuing_authority", "approval_date"]
  }'::jsonb,
  'APH 2024-27, Chapter VI, Clause 6.1.4',
  '2026-01-01',
  true
),

-- -----------------------------------------------------------------------------
-- 3. CROSS-DOCUMENT CONSISTENCY (Rules 7-10)
-- -----------------------------------------------------------------------------
(
  'RULE-MATCH-ADDRESS-LAND-AFFIDAVIT',
  '2026-27-v1',
  'ALL',
  'Land Parcel ID & Campus Address Consistency Across Deed and Affidavit',
  'Survey number, revenue village, and physical address in the Notarized Sworn Affidavit must exactly match the registered Land Title Deed.',
  'CRITICAL',
  'Data Consistency',
  '{
    "similarity_threshold": 0.85,
    "compare_fields": [
      {"doc_a": "Land Title Deed", "key_a": "land_survey_no", "doc_b": "Notarized Sworn Affidavit", "key_b": "land_survey_no"},
      {"doc_a": "Land Title Deed", "key_a": "campus_address", "doc_b": "Notarized Sworn Affidavit", "key_b": "campus_address"}
    ]
  }'::jsonb,
  '{
    "doc_types": ["Land Title Deed", "Notarized Sworn Affidavit"],
    "field_keys": ["land_survey_no", "campus_address", "revenue_village"]
  }'::jsonb,
  'APH 2024-27, Chapter I, Clause 1.6 & Section 10(k) AICTE Act',
  '2026-01-01',
  true
),
(
  'RULE-MATCH-INSTITUTION-NAME',
  '2026-27-v1',
  'ALL',
  'Legal Institution Name Concordance',
  'Institution name declared in the application header must match the Society/Trust Deed and Municipal Sanction Orders verbatim.',
  'CRITICAL',
  'Data Consistency',
  '{
    "similarity_threshold": 0.90
  }'::jsonb,
  '{
    "doc_types": ["Registered Trust Deed", "Notarized Sworn Affidavit"],
    "field_keys": ["institution_name", "society_name"]
  }'::jsonb,
  'APH 2024-27, Chapter I, Clause 1.5.1',
  '2026-01-01',
  true
),
(
  'RULE-MATCH-TRUST-REG-NO',
  '2026-27-v1',
  'ALL',
  'Sponsoring Society / Trust Registration Number Consistency',
  'Trust registration number under the Public Trusts Act or Societies Act must be identical across Trust Deed and Audited Accounts.',
  'HIGH',
  'Data Consistency',
  '{
    "exact_match": true
  }'::jsonb,
  '{
    "doc_types": ["Registered Trust Deed", "Audited Financial Statements"],
    "field_keys": ["trust_registration_no"]
  }'::jsonb,
  'APH 2024-27, Chapter I, Clause 1.5.2',
  '2026-01-01',
  true
),
(
  'RULE-MATCH-LAND-SURVEY-AREA',
  '2026-27-v1',
  'ALL',
  'Plot Area Concordance Between Revenue Extract and Master Plan',
  'Total land acreage in the certified Revenue 7/12 Extract or Sale Deed must equal or exceed the plot area in the Sanctioned Master Plan.',
  'HIGH',
  'Land & Property',
  '{
    "max_discrepancy_percentage": 2.0
  }'::jsonb,
  '{
    "doc_types": ["Land Title Deed", "Sanctioned Master Plan"],
    "field_keys": ["land_survey_no", "total_land_area"]
  }'::jsonb,
  'APH 2024-27, Chapter IV, Clause 4.2',
  '2026-01-01',
  true
),

-- -----------------------------------------------------------------------------
-- 4. LAND & BUILDING NORMS (Rules 11-15)
-- -----------------------------------------------------------------------------
(
  'RULE-LAND-MIN-AREA-URBAN',
  '2026-27-v1',
  'ALL',
  'Minimum Contiguous Land Norm for Urban Technical Campuses',
  'Technical campus in Urban/Metro zones must possess minimum 2.50 contiguous acres (10,117 sq.m) of registered institutional land.',
  'CRITICAL',
  'Land Norms',
  '{
    "min_area_acres": 2.5,
    "metro_area_acres": 1.5,
    "rural_area_acres": 7.5
  }'::jsonb,
  '{
    "doc_types": ["Land Title Deed"],
    "field_keys": ["total_land_area", "location_category"]
  }'::jsonb,
  'APH 2024-27, Chapter IV, Table 4.1 (Land Requirements)',
  '2026-01-01',
  true
),
(
  'RULE-LAND-CONTIGUITY',
  '2026-27-v1',
  'ALL',
  'Land Parcel Contiguity & Non-Bisection Certification',
  'Campus land must be a single contiguous parcel without public roads, railway tracks, or public waterways bisecting the boundaries.',
  'HIGH',
  'Land Norms',
  '{
    "must_be_contiguous": true
  }'::jsonb,
  '{
    "doc_types": ["Land Title Deed", "Sanctioned Master Plan"],
    "field_keys": ["contiguity_certified", "demarcation_boundary"]
  }'::jsonb,
  'APH 2024-27, Chapter IV, Clause 4.3',
  '2026-01-01',
  true
),
(
  'RULE-LAND-ENCUMBRANCE',
  '2026-27-v1',
  'ALL',
  'Non-Encumbrance Certificate Search Record',
  'Sub-Registrar non-encumbrance certificate must verify that the institutional land is free from any adverse mortgage, lien, or litigation.',
  'HIGH',
  'Land Norms',
  '{
    "min_search_period_years": 30
  }'::jsonb,
  '{
    "doc_types": ["Land Title Deed"],
    "field_keys": ["encumbrance_status", "search_period_years", "sub_registrar_seal"]
  }'::jsonb,
  'APH 2024-27, Chapter IV, Clause 4.4',
  '2026-01-01',
  true
),
(
  'RULE-PLAN-SANCTION-AUTHORITY',
  '2026-27-v1',
  'ALL',
  'Competent Authority Approval for Architectural Building Plans',
  'Building layout plans must be officially stamped and approved by Town Planning Authority, Municipal Corporation, or Urban Development Authority.',
  'CRITICAL',
  'Building Norms',
  '{
    "allowed_authorities": ["Municipal Corporation", "DTCP", "BDA", "PMDA", "Town Planning Authority"]
  }'::jsonb,
  '{
    "doc_types": ["Sanctioned Master Plan", "Building Safety Certificate"],
    "field_keys": ["sanctioning_authority", "approval_letter_number"]
  }'::jsonb,
  'APH 2024-27, Chapter VI, Clause 6.1.2',
  '2026-01-01',
  true
),
(
  'RULE-PLAN-BUILTUP-AREA',
  '2026-27-v1',
  'ALL',
  'Total Approved Built-up Instructional Carpet Area',
  'The total built-up academic carpet area must satisfy the minimum floor space calculated according to AICTE space calculation norms.',
  'CRITICAL',
  'Building Norms',
  '{
    "min_builtup_sqm": 10000
  }'::jsonb,
  '{
    "doc_types": ["Sanctioned Master Plan", "Building Safety Certificate"],
    "field_keys": ["total_built_up_area", "instructional_area"]
  }'::jsonb,
  'APH 2024-27, Chapter V, Clause 5.1 & Table 5.1',
  '2026-01-01',
  true
),

-- -----------------------------------------------------------------------------
-- 5. FACULTY CADRE & QUALIFICATION NORMS (Rules 16-19)
-- -----------------------------------------------------------------------------
(
  'RULE-FACULTY-CADRE-RATIO',
  '2026-27-v1',
  'ALL',
  'Faculty Cadre Ratio Compliance (1:2:6 Distribution)',
  'Teaching faculty must be structured in the cadre proportion of 1 Professor : 2 Associate Professors : 6 Assistant Professors.',
  'HIGH',
  'Faculty Norms',
  '{
    "target_ratio": [1, 2, 6],
    "tolerance_percentage": 15
  }'::jsonb,
  '{
    "doc_types": ["Faculty Cadre Roster"],
    "field_keys": ["professor_count", "associate_professor_count", "assistant_professor_count"]
  }'::jsonb,
  'APH 2024-27, Chapter VII, Clause 7.2 & Pay Gazette Notification',
  '2026-01-01',
  true
),
(
  'RULE-FACULTY-STUDENT-RATIO',
  '2026-27-v1',
  'ALL',
  'Student to Faculty Ratio (SFR 1:15 or 1:20 Norm)',
  'Maintains required full-time faculty count based on approved student intake (SFR <= 1:15 for UG Engineering, 1:12 for PG).',
  'CRITICAL',
  'Faculty Norms',
  '{
    "max_sfr_ug": 15,
    "max_sfr_pg": 12
  }'::jsonb,
  '{
    "doc_types": ["Faculty Cadre Roster"],
    "field_keys": ["total_faculty_count", "total_approved_intake", "sfr_computed"]
  }'::jsonb,
  'APH 2024-27, Chapter VII, Clause 7.1',
  '2026-01-01',
  true
),
(
  'RULE-FACULTY-PAY-SCALE',
  '2026-27-v1',
  'ALL',
  '7th CPC Pay Scale & Statutory EPF Compliance',
  'Faculty compensation must follow 7th Central Pay Commission scales disbursed through scheduled bank transfers with statutory EPF and TDS deposits.',
  'HIGH',
  'Faculty Norms',
  '{
    "requires_epf_statement": true,
    "disallow_cash_disbursement": true
  }'::jsonb,
  '{
    "doc_types": ["Faculty Cadre Roster", "Audited Financial Statements"],
    "field_keys": ["epf_challan_number", "salary_mode", "form_16_declared"]
  }'::jsonb,
  'APH 2024-27, Chapter VII, Clause 7.4',
  '2026-01-01',
  true
),
(
  'RULE-FACULTY-PRINCIPAL-QUAL',
  '2026-27-v1',
  'ALL',
  'Principal / Director Qualification & Approval Norm',
  'Every technical institute must have a full-time regular Principal/Director with Ph.D. in relevant discipline and university ratification.',
  'CRITICAL',
  'Faculty Norms',
  '{
    "requires_phd": true,
    "min_experience_years": 15
  }'::jsonb,
  '{
    "doc_types": ["Faculty Cadre Roster"],
    "field_keys": ["principal_name", "principal_highest_degree", "principal_university_ratified"]
  }'::jsonb,
  'APH 2024-27, Chapter VII, Clause 7.3',
  '2026-01-01',
  true
),

-- -----------------------------------------------------------------------------
-- 6. INFRASTRUCTURE & AMENITIES (Rules 20-23)
-- -----------------------------------------------------------------------------
(
  'RULE-INFRA-CLASSROOM-AREA',
  '2026-27-v1',
  'ALL',
  'Instructional Classroom Dimensions & Smart Amenities',
  'Instructional classrooms must have a minimum carpet area of 66 sq.m each with multimedia projection, ventilation, and CCTV surveillance.',
  'MEDIUM',
  'Infrastructure',
  '{
    "min_classroom_sqm": 66
  }'::jsonb,
  '{
    "doc_types": ["Sanctioned Master Plan"],
    "field_keys": ["classroom_count", "average_classroom_area"]
  }'::jsonb,
  'APH 2024-27, Chapter V, Clause 5.2',
  '2026-01-01',
  true
),
(
  'RULE-INFRA-LABORATORIES',
  '2026-27-v1',
  'ALL',
  'Disciplinary Laboratory Provision & Computing Setup',
  'Adequate departmental laboratories equipped with licensed software and modern machinery for all approved curricula.',
  'HIGH',
  'Infrastructure',
  '{
    "min_computer_terminal_ratio": 4
  }'::jsonb,
  '{
    "doc_types": ["Sanctioned Master Plan"],
    "field_keys": ["laboratory_count", "computing_terminals_count"]
  }'::jsonb,
  'APH 2024-27, Chapter V, Clause 5.3',
  '2026-01-01',
  true
),
(
  'RULE-INFRA-LIBRARY-TITLES',
  '2026-27-v1',
  'ALL',
  'Central Digital Library Volume & Subscription Norms',
  'Central Library must maintain at least 1,000 distinct book titles per sanctioned course, e-journal subscriptions (IEEE/ScienceDirect), and multimedia terminals.',
  'MEDIUM',
  'Infrastructure',
  '{
    "min_titles_per_course": 1000,
    "min_digital_terminals": 20
  }'::jsonb,
  '{
    "doc_types": ["Audited Financial Statements", "Sanctioned Master Plan"],
    "field_keys": ["library_titles_count", "digital_terminals_count", "e_journal_package"]
  }'::jsonb,
  'APH 2024-27, Chapter V, Clause 5.4',
  '2026-01-01',
  true
),
(
  'RULE-INFRA-BARRIER-FREE',
  '2026-27-v1',
  'ALL',
  'Barrier-Free Environment for Persons with Disabilities (PwD)',
  'Mandatory provision of wheel-chair ramps (slope <= 1:12), lifts connecting all floors, tactile paving, Braille lift buttons, and accessible restrooms.',
  'CRITICAL',
  'Infrastructure',
  '{
    "requires_ramps": true,
    "requires_lift": true,
    "requires_braille": true
  }'::jsonb,
  '{
    "doc_types": ["Building Safety Certificate", "Sanctioned Master Plan"],
    "field_keys": ["barrier_free_certified", "pwd_restrooms_present"]
  }'::jsonb,
  'APH 2024-27, Chapter VI, Clause 6.4 & Rights of Persons with Disabilities Act 2016',
  '2026-01-01',
  true
),

-- -----------------------------------------------------------------------------
-- 7. SAFETY & FINANCIAL RESERVES (Rules 24-25)
-- -----------------------------------------------------------------------------
(
  'RULE-INFRA-SAFETY-ELECTRICAL',
  '2026-27-v1',
  'ALL',
  'Electrical Inspectorate Safety Certificate & Standby Power',
  'Valid electrical safety fitness certificate issued by the State Chief Electrical Inspectorate with designated standby power generation capacity.',
  'HIGH',
  'Safety & Compliance',
  '{
    "requires_dg_set": true
  }'::jsonb,
  '{
    "doc_types": ["Building Safety Certificate"],
    "field_keys": ["electrical_inspector_cert", "dg_backup_capacity_kva"]
  }'::jsonb,
  'APH 2024-27, Chapter VI, Clause 6.5',
  '2026-01-01',
  true
),
(
  'RULE-FIN-ENDOWMENT-FDR',
  '2026-27-v1',
  'ALL',
  'Joint Fixed Deposit Receipt (FDR) / Corpus Security Reserve',
  'Verifies that the required Joint Fixed Deposit Receipt (FDR) in the joint name of Sponsoring Body and Regional Officer AICTE is encumbered and intact.',
  'CRITICAL',
  'Financial Health',
  '{
    "min_fdr_amount_inr": 10000000,
    "joint_name_required": true
  }'::jsonb,
  '{
    "doc_types": ["Fixed Deposit Receipt", "Audited Financial Statements"],
    "field_keys": ["fdr_amount_inr", "fdr_account_number", "joint_holder_name"]
  }'::jsonb,
  'APH 2024-27, Chapter I, Clause 1.8 & Annexure 2',
  '2026-01-01',
  true
)
ON CONFLICT (code) DO UPDATE SET
  version = EXCLUDED.version,
  application_type = EXCLUDED.application_type,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  severity = EXCLUDED.severity,
  category = EXCLUDED.category,
  config = EXCLUDED.config,
  depends_on = EXCLUDED.depends_on,
  source_reference = EXCLUDED.source_reference,
  effective_from = EXCLUDED.effective_from,
  active = EXCLUDED.active;
