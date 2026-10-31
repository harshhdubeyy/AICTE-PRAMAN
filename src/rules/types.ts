/**
 * Types for the AICTE PRAMAN Versioned Regulatory Rules Engine
 */

export type FindingStatus =
  | 'passed'
  | 'missing'
  | 'mismatch'
  | 'expired'
  | 'suspicious'
  | 'needs_manual_review'
  | 'verification_unavailable';

export type RuleSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface RuleDefinition {
  id?: string;
  code: string;
  version: string;
  application_type: string; // 'ALL' | 'Extension of Approval' | 'New Institution' | 'Change in Program'
  title: string;
  description: string;
  severity: RuleSeverity;
  category: string;
  config: Record<string, any>;
  depends_on: {
    doc_types: string[];
    field_keys?: string[];
  };
  source_reference: string;
  effective_from?: string;
  active: boolean;
}

export interface EngineApplicationInput {
  id: string;
  application_number: string;
  institution_id: string;
  institution_name: string;
  application_type: string;
  academic_year: string;
  status?: string;
  stage?: string;
  submitted_at?: string;
}

export interface EngineDocumentInput {
  id: string;
  application_id: string;
  doc_type: string;
  name: string;
  category?: string;
  file_name: string;
  version: string;
  is_current: boolean;
  replaced_by?: string | null;
  valid_until?: string | null;
  sha256?: string;
  file_size?: string;
  ocr_status?: string;
  ocr_confidence?: number;
  external_verification?: {
    source: string;
    is_available?: boolean;
    verified?: boolean;
    timestamp?: string;
  } | null;
}

export interface EngineExtractedFieldInput {
  id?: string;
  document_id: string;
  field_key: string;
  value: string;
  claimed_value?: string;
  confidence: number;
  page: number;
  bbox?: BoundingBox | null;
  status?: FindingStatus;
  source?: string;
}

export interface EngineFindingOutput {
  id: string;
  run_id?: string;
  application_id: string;
  document_id?: string | null;
  document_name?: string;
  rule_code: string;
  rule_version: string;
  rule_title: string;
  status: FindingStatus;
  severity: RuleSeverity;
  field_key?: string | null;
  page?: number;
  bbox?: BoundingBox | null;
  value_a?: string | null; // Extracted value
  value_b?: string | null; // Claimed or reference norm value
  confidence: number;
  explanation: string;
  suggested_action: string;
  why_line?: string;
  source_reference: string;
  superseded_by?: string | null;
  created_at?: string;
}

export interface ValidationRunOutput {
  id: string;
  application_id: string;
  rule_set_version: string;
  triggered_by: string;
  trigger_reason: string;
  overall_confidence: number;
  recommended_action: string;
  findings_count: {
    passed: number;
    missing: number;
    mismatch: number;
    expired: number;
    suspicious: number;
    needsReview: number;
    verificationUnavailable: number;
  };
  created_at: string;
  findings: EngineFindingOutput[];
}

export interface SmartRevalidationResult {
  newDocument: EngineDocumentInput;
  oldDocument: EngineDocumentInput;
  newRun: ValidationRunOutput;
  affectedRuleCodes: string[];
  newFindings: EngineFindingOutput[];
  supersededFindingIds: string[];
}
