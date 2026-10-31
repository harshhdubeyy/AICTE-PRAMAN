import { RuleDefinition, AppDocument, ValidationFinding, ApplicationType, ValidationRun } from '../types';
import { DEFAULT_RULES } from './defaultRules';
import {
  evaluateRules,
  buildValidationRun
} from './engine';
import {
  EngineApplicationInput,
  EngineDocumentInput,
  EngineExtractedFieldInput
} from './types';
import { findingsService } from '../services/findingsService';

export const CURRENT_RULESET_VERSION = '2026-27-v1';
export const CURRENT_ACADEMIC_YEAR = 'AY 2026-27';
export const CYCLE_CUTOFF_DATE = '2026-12-31';

export const AICTE_RULES: RuleDefinition[] = DEFAULT_RULES as any;

/**
 * Deterministic Rule Evaluation Engine delegating to the versioned pure engine
 */
export function evaluateApplication(
  applicationId: string,
  appType: ApplicationType,
  documents: AppDocument[],
  allDocsAcrossSystem: AppDocument[] = []
): ValidationRun {
  const engineApp: EngineApplicationInput = {
    id: applicationId,
    application_number: 'AICTE-2026-04821',
    institution_id: 'inst-1',
    institution_name: 'Sri Venkateswara Institute of Technology',
    application_type: appType,
    academic_year: CURRENT_ACADEMIC_YEAR
  };

  const engineDocs: EngineDocumentInput[] = documents.map(d => ({
    id: d.id,
    application_id: d.applicationId,
    doc_type: d.name,
    name: d.name,
    category: d.category,
    file_name: d.fileName,
    version: d.version,
    is_current: true,
    valid_until: d.validUntil || null,
    sha256: d.fileHash,
    file_size: d.fileSize,
    ocr_status: d.ocrStatus,
    ocr_confidence: d.ocrConfidence
  }));

  const engineFields: EngineExtractedFieldInput[] = [];
  documents.forEach(d => {
    (d.extractedFields || []).forEach(f => {
      engineFields.push({
        document_id: d.id,
        field_key: f.fieldName.toLowerCase().replace(/[\s/]+/g, '_'),
        value: f.extractedValue,
        claimed_value: f.claimedValue,
        confidence: f.confidence,
        page: f.pageNumber,
        bbox: f.boundingBox
      });
    });
  });

  const rawFindings = evaluateRules({
    application: engineApp,
    documents: engineDocs,
    extractedFields: engineFields,
    rules: DEFAULT_RULES
  });

  const run = buildValidationRun(
    applicationId,
    CURRENT_RULESET_VERSION,
    rawFindings,
    'Deterministic Rules Engine Run'
  );

  const mappedFindings = rawFindings.map(findingsService.mapEngineFindingToAppFinding);

  return {
    runId: run.id,
    timestamp: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) + ' IST',
    ruleVersion: CURRENT_RULESET_VERSION,
    triggerReason: run.trigger_reason,
    triggeredBy: run.triggered_by,
    findingsCount: {
      passed: run.findings_count.passed,
      missing: run.findings_count.missing,
      mismatch: run.findings_count.mismatch,
      expired: run.findings_count.expired,
      suspicious: run.findings_count.suspicious,
      needsReview: run.findings_count.needsReview
    },
    overallConfidence: run.overall_confidence,
    recommendedAction: run.recommended_action,
    findings: mappedFindings
  };
}
