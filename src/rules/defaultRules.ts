import { RuleDefinition } from './types';

export const DEFAULT_RULES: RuleDefinition[] = [
  {
    code: 'RULE-DOC-EOA-MANDATORY',
    version: '2026-27-v1',
    application_type: 'Extension of Approval',
    title: 'Extension of Approval Mandatory Document Checklist',
    description: 'Verifies that all statutory documents required for annual Extension of Approval (EoA) are present and verified.',
    severity: 'CRITICAL',
    category: 'Mandatory Checklist',
    config: {
      required_docs: [
        'Land Title Deed',
        'Building Safety Certificate',
        'Fire Safety NOC',
        'Faculty Cadre Roster',
        'Audited Financial Statements'
      ]
    },
    depends_on: {
      doc_types: [
        'Land Title Deed',
        'Building Safety Certificate',
        'Fire Safety NOC',
        'Faculty Cadre Roster',
        'Audited Financial Statements'
      ],
      field_keys: []
    },
    source_reference: 'APH 2024-27, Chapter II, Clause 2.1.3 & Annexure 4',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-DOC-NEW-MANDATORY',
    version: '2026-27-v1',
    application_type: 'New Institution',
    title: 'New Technical Institution Statutory Document Dossier',
    description: 'Verifies that all prerequisite statutory deeds and NOCs for establishing a new technical institution are uploaded.',
    severity: 'CRITICAL',
    category: 'Mandatory Checklist',
    config: {
      required_docs: [
        'Registered Trust Deed',
        'Land Title Deed',
        'Sanctioned Master Plan',
        'Occupancy Certificate',
        'Fixed Deposit Receipt'
      ]
    },
    depends_on: {
      doc_types: [
        'Registered Trust Deed',
        'Land Title Deed',
        'Sanctioned Master Plan',
        'Occupancy Certificate',
        'Fixed Deposit Receipt'
      ],
      field_keys: []
    },
    source_reference: 'APH 2024-27, Chapter I, Clause 1.4 & Annexure 1',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-DOC-CIP-MANDATORY',
    version: '2026-27-v1',
    application_type: 'Change in Program',
    title: 'Program Restructuring & Change in Course Checklist',
    description: 'Verifies state government and affiliating university approvals for program alterations or intake increases.',
    severity: 'HIGH',
    category: 'Mandatory Checklist',
    config: {
      required_docs: [
        'Affiliating University NOC',
        'State Government NOC',
        'Governing Body Resolution',
        'Faculty Transition Plan'
      ]
    },
    depends_on: {
      doc_types: [
        'Affiliating University NOC',
        'State Government NOC',
        'Governing Body Resolution',
        'Faculty Transition Plan'
      ],
      field_keys: []
    },
    source_reference: 'APH 2024-27, Chapter II, Clause 2.7',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-EXP-FIRE-NOC',
    version: '2026-27-v1',
    application_type: 'ALL',
    title: 'Fire and Life Safety NOC Certificate Validity',
    description: 'Fire Safety NOC issued by competent state/municipal fire authority must remain valid at least until the end of the academic year.',
    severity: 'CRITICAL',
    category: 'Safety & Compliance',
    config: {
      min_valid_until: '2026-12-31',
      grace_period_days: 0
    },
    depends_on: {
      doc_types: ['Fire Safety NOC'],
      field_keys: ['valid_until', 'expiry_date', 'certificate_number']
    },
    source_reference: 'APH 2024-27, Chapter VI, Clause 6.3.2 & National Building Code (NBC) 2016 Part 4',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-EXP-BUILDING-STABILITY',
    version: '2026-27-v1',
    application_type: 'ALL',
    title: 'Building Structural Stability Certificate Currency',
    description: 'Structural soundness certificate issued by a registered chartered structural engineer must be unexpired and within 5 years of issue.',
    severity: 'HIGH',
    category: 'Building Safety',
    config: {
      min_valid_until: '2026-12-31'
    },
    depends_on: {
      doc_types: ['Building Safety Certificate'],
      field_keys: ['valid_until', 'inspection_date', 'structural_engineer_reg_no']
    },
    source_reference: 'APH 2024-27, Chapter VI, Clause 6.2.1',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-EXP-OCCUPANCY-CERT',
    version: '2026-27-v1',
    application_type: 'ALL',
    title: 'Municipal Occupancy / Completion Certificate Legality',
    description: 'Permanent Building Occupancy Certificate issued by the Town Planning Authority or Municipal Corporation must not be provisional.',
    severity: 'CRITICAL',
    category: 'Building Safety',
    config: {
      disallow_provisional: true
    },
    depends_on: {
      doc_types: ['Occupancy Certificate'],
      field_keys: ['certificate_type', 'issuing_authority', 'approval_date']
    },
    source_reference: 'APH 2024-27, Chapter VI, Clause 6.1.4',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-MATCH-ADDRESS-LAND-AFFIDAVIT',
    version: '2026-27-v1',
    application_type: 'ALL',
    title: 'Land Parcel ID & Campus Address Consistency Across Deed and Affidavit',
    description: 'Survey number, revenue village, and physical address in the Notarized Sworn Affidavit must exactly match the registered Land Title Deed.',
    severity: 'CRITICAL',
    category: 'Data Consistency',
    config: {
      similarity_threshold: 0.85
    },
    depends_on: {
      doc_types: ['Land Title Deed', 'Notarized Sworn Affidavit'],
      field_keys: ['land_survey_no', 'campus_address', 'revenue_village']
    },
    source_reference: 'APH 2024-27, Chapter I, Clause 1.6 & Section 10(k) AICTE Act',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-MATCH-INSTITUTION-NAME',
    version: '2026-27-v1',
    application_type: 'ALL',
    title: 'Legal Institution Name Concordance',
    description: 'Institution name declared in the application header must match the Society/Trust Deed and Municipal Sanction Orders verbatim.',
    severity: 'CRITICAL',
    category: 'Data Consistency',
    config: {
      similarity_threshold: 0.90
    },
    depends_on: {
      doc_types: ['Registered Trust Deed', 'Notarized Sworn Affidavit'],
      field_keys: ['institution_name', 'society_name']
    },
    source_reference: 'APH 2024-27, Chapter I, Clause 1.5.1',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-MATCH-TRUST-REG-NO',
    version: '2026-27-v1',
    application_type: 'ALL',
    title: 'Sponsoring Society / Trust Registration Number Consistency',
    description: 'Trust registration number under the Public Trusts Act or Societies Act must be identical across Trust Deed and Audited Accounts.',
    severity: 'HIGH',
    category: 'Data Consistency',
    config: {
      exact_match: true
    },
    depends_on: {
      doc_types: ['Registered Trust Deed', 'Audited Financial Statements'],
      field_keys: ['trust_registration_no']
    },
    source_reference: 'APH 2024-27, Chapter I, Clause 1.5.2',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-MATCH-LAND-SURVEY-AREA',
    version: '2026-27-v1',
    application_type: 'ALL',
    title: 'Plot Area Concordance Between Revenue Extract and Master Plan',
    description: 'Total land acreage in the certified Revenue 7/12 Extract or Sale Deed must equal or exceed the plot area in the Sanctioned Master Plan.',
    severity: 'HIGH',
    category: 'Land & Property',
    config: {
      max_discrepancy_percentage: 2.0
    },
    depends_on: {
      doc_types: ['Land Title Deed', 'Sanctioned Master Plan'],
      field_keys: ['land_survey_no', 'total_land_area']
    },
    source_reference: 'APH 2024-27, Chapter IV, Clause 4.2',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-LAND-MIN-AREA-URBAN',
    version: '2026-27-v1',
    application_type: 'ALL',
    title: 'Minimum Contiguous Land Norm for Urban Technical Campuses',
    description: 'Technical campus in Urban/Metro zones must possess minimum 2.50 contiguous acres (10,117 sq.m) of registered institutional land.',
    severity: 'CRITICAL',
    category: 'Land Norms',
    config: {
      min_area_acres: 2.5,
      metro_area_acres: 1.5,
      rural_area_acres: 7.5
    },
    depends_on: {
      doc_types: ['Land Title Deed'],
      field_keys: ['total_land_area', 'location_category']
    },
    source_reference: 'APH 2024-27, Chapter IV, Table 4.1 (Land Requirements)',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-LAND-CONTIGUITY',
    version: '2026-27-v1',
    application_type: 'ALL',
    title: 'Land Parcel Contiguity & Non-Bisection Certification',
    description: 'Campus land must be a single contiguous parcel without public roads, railway tracks, or public waterways bisecting the boundaries.',
    severity: 'HIGH',
    category: 'Land Norms',
    config: {
      must_be_contiguous: true
    },
    depends_on: {
      doc_types: ['Land Title Deed', 'Sanctioned Master Plan'],
      field_keys: ['contiguity_certified', 'demarcation_boundary']
    },
    source_reference: 'APH 2024-27, Chapter IV, Clause 4.3',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-LAND-ENCUMBRANCE',
    version: '2026-27-v1',
    application_type: 'ALL',
    title: 'Non-Encumbrance Certificate Search Record',
    description: 'Sub-Registrar non-encumbrance certificate must verify that the institutional land is free from any adverse mortgage, lien, or litigation.',
    severity: 'HIGH',
    category: 'Land Norms',
    config: {
      min_search_period_years: 30
    },
    depends_on: {
      doc_types: ['Land Title Deed'],
      field_keys: ['encumbrance_status', 'search_period_years', 'sub_registrar_seal']
    },
    source_reference: 'APH 2024-27, Chapter IV, Clause 4.4',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-PLAN-SANCTION-AUTHORITY',
    version: '2026-27-v1',
    application_type: 'ALL',
    title: 'Competent Authority Approval for Architectural Building Plans',
    description: 'Building layout plans must be officially stamped and approved by Town Planning Authority, Municipal Corporation, or Urban Development Authority.',
    severity: 'CRITICAL',
    category: 'Building Norms',
    config: {
      allowed_authorities: ['Municipal Corporation', 'DTCP', 'BDA', 'PMDA', 'Town Planning Authority']
    },
    depends_on: {
      doc_types: ['Sanctioned Master Plan', 'Building Safety Certificate'],
      field_keys: ['sanctioning_authority', 'approval_letter_number']
    },
    source_reference: 'APH 2024-27, Chapter VI, Clause 6.1.2',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-PLAN-BUILTUP-AREA',
    version: '2026-27-v1',
    application_type: 'ALL',
    title: 'Total Approved Built-up Instructional Carpet Area',
    description: 'The total built-up academic carpet area must satisfy the minimum floor space calculated according to AICTE space calculation norms.',
    severity: 'CRITICAL',
    category: 'Building Norms',
    config: {
      min_builtup_sqm: 10000
    },
    depends_on: {
      doc_types: ['Sanctioned Master Plan', 'Building Safety Certificate'],
      field_keys: ['total_built_up_area', 'instructional_area']
    },
    source_reference: 'APH 2024-27, Chapter V, Clause 5.1 & Table 5.1',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-FACULTY-CADRE-RATIO',
    version: '2026-27-v1',
    application_type: 'ALL',
    title: 'Faculty Cadre Ratio Compliance (1:2:6 Distribution)',
    description: 'Teaching faculty must be structured in the cadre proportion of 1 Professor : 2 Associate Professors : 6 Assistant Professors.',
    severity: 'HIGH',
    category: 'Faculty Norms',
    config: {
      target_ratio: [1, 2, 6],
      tolerance_percentage: 15
    },
    depends_on: {
      doc_types: ['Faculty Cadre Roster'],
      field_keys: ['professor_count', 'associate_professor_count', 'assistant_professor_count']
    },
    source_reference: 'APH 2024-27, Chapter VII, Clause 7.2 & Pay Gazette Notification',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-FACULTY-STUDENT-RATIO',
    version: '2026-27-v1',
    application_type: 'ALL',
    title: 'Student to Faculty Ratio (SFR 1:15 or 1:20 Norm)',
    description: 'Maintains required full-time faculty count based on approved student intake (SFR <= 1:15 for UG Engineering, 1:12 for PG).',
    severity: 'CRITICAL',
    category: 'Faculty Norms',
    config: {
      max_sfr_ug: 15,
      max_sfr_pg: 12
    },
    depends_on: {
      doc_types: ['Faculty Cadre Roster'],
      field_keys: ['total_faculty_count', 'total_approved_intake', 'sfr_computed']
    },
    source_reference: 'APH 2024-27, Chapter VII, Clause 7.1',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-FACULTY-PAY-SCALE',
    version: '2026-27-v1',
    application_type: 'ALL',
    title: '7th CPC Pay Scale & Statutory EPF Compliance',
    description: 'Faculty compensation must follow 7th Central Pay Commission scales disbursed through scheduled bank transfers with statutory EPF and TDS deposits.',
    severity: 'HIGH',
    category: 'Faculty Norms',
    config: {
      requires_epf_statement: true,
      disallow_cash_disbursement: true
    },
    depends_on: {
      doc_types: ['Faculty Cadre Roster', 'Audited Financial Statements'],
      field_keys: ['epf_challan_number', 'salary_mode', 'form_16_declared']
    },
    source_reference: 'APH 2024-27, Chapter VII, Clause 7.4',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-FACULTY-PRINCIPAL-QUAL',
    version: '2026-27-v1',
    application_type: 'ALL',
    title: 'Principal / Director Qualification & Approval Norm',
    description: 'Every technical institute must have a full-time regular Principal/Director with Ph.D. in relevant discipline and university ratification.',
    severity: 'CRITICAL',
    category: 'Faculty Norms',
    config: {
      requires_phd: true,
      min_experience_years: 15
    },
    depends_on: {
      doc_types: ['Faculty Cadre Roster'],
      field_keys: ['principal_name', 'principal_highest_degree', 'principal_university_ratified']
    },
    source_reference: 'APH 2024-27, Chapter VII, Clause 7.3',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-INFRA-CLASSROOM-AREA',
    version: '2026-27-v1',
    application_type: 'ALL',
    title: 'Instructional Classroom Dimensions & Smart Amenities',
    description: 'Instructional classrooms must have a minimum carpet area of 66 sq.m each with multimedia projection, ventilation, and CCTV surveillance.',
    severity: 'MEDIUM',
    category: 'Infrastructure',
    config: {
      min_classroom_sqm: 66
    },
    depends_on: {
      doc_types: ['Sanctioned Master Plan'],
      field_keys: ['classroom_count', 'average_classroom_area']
    },
    source_reference: 'APH 2024-27, Chapter V, Clause 5.2',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-INFRA-LABORATORIES',
    version: '2026-27-v1',
    application_type: 'ALL',
    title: 'Disciplinary Laboratory Provision & Computing Setup',
    description: 'Adequate departmental laboratories equipped with licensed software and modern machinery for all approved curricula.',
    severity: 'HIGH',
    category: 'Infrastructure',
    config: {
      min_computer_terminal_ratio: 4
    },
    depends_on: {
      doc_types: ['Sanctioned Master Plan'],
      field_keys: ['laboratory_count', 'computing_terminals_count']
    },
    source_reference: 'APH 2024-27, Chapter V, Clause 5.3',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-INFRA-LIBRARY-TITLES',
    version: '2026-27-v1',
    application_type: 'ALL',
    title: 'Central Digital Library Volume & Subscription Norms',
    description: 'Central Library must maintain at least 1,000 distinct book titles per sanctioned course, e-journal subscriptions (IEEE/ScienceDirect), and multimedia terminals.',
    severity: 'MEDIUM',
    category: 'Infrastructure',
    config: {
      min_titles_per_course: 1000,
      min_digital_terminals: 20
    },
    depends_on: {
      doc_types: ['Audited Financial Statements', 'Sanctioned Master Plan'],
      field_keys: ['library_titles_count', 'digital_terminals_count', 'e_journal_package']
    },
    source_reference: 'APH 2024-27, Chapter V, Clause 5.4',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-INFRA-BARRIER-FREE',
    version: '2026-27-v1',
    application_type: 'ALL',
    title: 'Barrier-Free Environment for Persons with Disabilities (PwD)',
    description: 'Mandatory provision of wheel-chair ramps (slope <= 1:12), lifts connecting all floors, tactile paving, Braille lift buttons, and accessible restrooms.',
    severity: 'CRITICAL',
    category: 'Infrastructure',
    config: {
      requires_ramps: true,
      requires_lift: true,
      requires_braille: true
    },
    depends_on: {
      doc_types: ['Building Safety Certificate', 'Sanctioned Master Plan'],
      field_keys: ['barrier_free_certified', 'pwd_restrooms_present']
    },
    source_reference: 'APH 2024-27, Chapter VI, Clause 6.4 & Rights of Persons with Disabilities Act 2016',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-INFRA-SAFETY-ELECTRICAL',
    version: '2026-27-v1',
    application_type: 'ALL',
    title: 'Electrical Inspectorate Safety Certificate & Standby Power',
    description: 'Valid electrical safety fitness certificate issued by the State Chief Electrical Inspectorate with designated standby power generation capacity.',
    severity: 'HIGH',
    category: 'Safety & Compliance',
    config: {
      requires_dg_set: true
    },
    depends_on: {
      doc_types: ['Building Safety Certificate'],
      field_keys: ['electrical_inspector_cert', 'dg_backup_capacity_kva']
    },
    source_reference: 'APH 2024-27, Chapter VI, Clause 6.5',
    effective_from: '2026-01-01',
    active: true
  },
  {
    code: 'RULE-FIN-ENDOWMENT-FDR',
    version: '2026-27-v1',
    application_type: 'ALL',
    title: 'Joint Fixed Deposit Receipt (FDR) / Corpus Security Reserve',
    description: 'Verifies that the required Joint Fixed Deposit Receipt (FDR) in the joint name of Sponsoring Body and Regional Officer AICTE is encumbered and intact.',
    severity: 'CRITICAL',
    category: 'Financial Health',
    config: {
      min_fdr_amount_inr: 10000000,
      joint_name_required: true
    },
    depends_on: {
      doc_types: ['Fixed Deposit Receipt', 'Audited Financial Statements'],
      field_keys: ['fdr_amount_inr', 'fdr_account_number', 'joint_holder_name']
    },
    source_reference: 'APH 2024-27, Chapter I, Clause 1.8 & Annexure 2',
    effective_from: '2026-01-01',
    active: true
  }
];
