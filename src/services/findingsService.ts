import { supabase, isSupabaseConfigured, getUseSeedData } from './supabaseClient';
import { ValidationFinding, ValidationStatus, BoundingBox } from '../types';
import { SEED_APPLICATIONS } from '../data/seedData';
import {
  DEFAULT_RULES,
  RuleDefinition,
  evaluateRules,
  filterRulesForApplication,
  buildValidationRun,
  revalidateDocumentReplacement,
  EngineApplicationInput,
  EngineDocumentInput,
  EngineExtractedFieldInput,
  EngineFindingOutput,
  SmartRevalidationResult
} from '../rules';

export const findingsService = {
  /**
   * Load active versioned rules from the Supabase "rules" table
   * with fallback to DEFAULT_RULES
   */
  async getActiveRules(applicationType: string = 'ALL', ruleVersion?: string): Promise<RuleDefinition[]> {
    if (isSupabaseConfigured() && !getUseSeedData() && supabase) {
      try {
        let query = supabase
          .from('rules')
          .select('*')
          .eq('active', true);

        if (ruleVersion) {
          query = query.eq('version', ruleVersion);
        }

        const { data, error } = await query;

        if (!error && data && data.length > 0) {
          const loadedRules: RuleDefinition[] = data.map((r: any) => ({
            id: r.id,
            code: r.code,
            version: r.version,
            application_type: r.application_type,
            title: r.title,
            description: r.description,
            severity: r.severity || 'MEDIUM',
            category: r.category || 'Compliance',
            config: r.config || {},
            depends_on: r.depends_on || { doc_types: [], field_keys: [] },
            source_reference: r.source_reference || 'AICTE APH 2024-27',
            effective_from: r.effective_from,
            active: r.active
          }));

          return filterRulesForApplication(loadedRules, applicationType, ruleVersion);
        }
      } catch (err) {
        console.warn('Failed to load rules from Supabase, falling back to versioned rules:', err);
      }
    }

    return filterRulesForApplication(DEFAULT_RULES, applicationType, ruleVersion);
  },

  /**
   * Run the pure deterministic rules engine for an application
   */
  async runValidationEngine(params: {
    application: EngineApplicationInput;
    documents: EngineDocumentInput[];
    extractedFields: EngineExtractedFieldInput[];
    ruleVersion?: string;
    triggerReason?: string;
  }) {
    const { application, documents, extractedFields, ruleVersion = '2026-27-v1', triggerReason } = params;
    const rules = await this.getActiveRules(application.application_type, ruleVersion);

    const rawFindings = evaluateRules({
      application,
      documents,
      extractedFields,
      rules
    });

    const run = buildValidationRun(
      application.id,
      ruleVersion,
      rawFindings,
      triggerReason || 'Deterministic Rules Engine Run'
    );

    return {
      run,
      findings: rawFindings.map(this.mapEngineFindingToAppFinding)
    };
  },

  /**
   * Smart re-validation when an institution replaces a document
   */
  async revalidateDocument(params: {
    application: EngineApplicationInput;
    allDocuments: EngineDocumentInput[];
    allExtractedFields: EngineExtractedFieldInput[];
    previousFindings: EngineFindingOutput[];
    oldDocumentId: string;
    newDocumentData: Partial<EngineDocumentInput> & {
      file_name: string;
      doc_type: string;
      sha256: string;
    };
    newExtractedFields: EngineExtractedFieldInput[];
    ruleVersion?: string;
  }): Promise<SmartRevalidationResult> {
    const rules = await this.getActiveRules(params.application.application_type, params.ruleVersion);
    return revalidateDocumentReplacement({
      ...params,
      allRules: rules
    });
  },

  /**
   * Fetch findings for an application
   */
  async getFindings(applicationId: string): Promise<ValidationFinding[]> {
    if (isSupabaseConfigured() && !getUseSeedData() && supabase) {
      try {
        const { data, error } = await supabase
          .from('findings')
          .select(`
            id,
            application_id,
            document_id,
            rule_code,
            rule_version,
            status,
            severity,
            field_key,
            page,
            bbox,
            value_a,
            value_b,
            confidence,
            explanation,
            suggested_action,
            why_line,
            superseded_by,
            documents (name, file_name)
          `)
          .eq('application_id', applicationId)
          .is('superseded_by', null);

        if (!error && data && data.length > 0) {
          return data.map((f: any): ValidationFinding => ({
            id: f.id,
            applicationId: f.application_id,
            status: this.mapStatusFromDb(f.status),
            rule_code: f.rule_code,
            rule_version: f.rule_version || '2026-27-v1',
            ruleTitle: `Rule ${f.rule_code} Check`,
            documentName: (f.documents as any)?.file_name || (f.documents as any)?.name || 'Statutory Submission',
            documentId: f.document_id || '',
            page: f.page || 1,
            bbox: f.bbox,
            field: f.field_key || 'Document Field',
            extractedValue: f.value_a || '',
            claimedValue: f.value_b || '',
            confidence: Number(f.confidence) || 0.95,
            explanation: f.explanation || '',
            suggestedAction: f.suggested_action || '',
            whyLine: f.why_line,
            severity: f.severity || 'MEDIUM',
            sourceReference: `APH ${f.rule_version || '2026-27'}`,
            superseded_by: f.superseded_by
          }));
        }
      } catch (err) {
        console.warn('Supabase getFindings error, falling back:', err);
      }
    }

    const app = SEED_APPLICATIONS.find(a => a.id === applicationId);
    return app?.latestRun?.findings || [];
  },

  /**
   * Map database / engine status to UI status
   */
  mapStatusFromDb(status: string): ValidationStatus {
    switch (status.toLowerCase()) {
      case 'mismatch':
        return 'Mismatch';
      case 'missing':
        return 'Missing';
      case 'expired':
        return 'Expired';
      case 'suspicious':
        return 'Suspicious';
      case 'needs_manual_review':
        return 'Needs Manual Review';
      case 'verification_unavailable':
        return 'Verification Unavailable';
      case 'passed':
      default:
        return 'Passed';
    }
  },

  /**
   * Map EngineFindingOutput to ValidationFinding
   */
  mapEngineFindingToAppFinding(f: EngineFindingOutput): ValidationFinding {
    let uiStatus: ValidationStatus = 'Passed';
    if (f.status === 'mismatch') uiStatus = 'Mismatch';
    else if (f.status === 'missing') uiStatus = 'Missing';
    else if (f.status === 'expired') uiStatus = 'Expired';
    else if (f.status === 'suspicious') uiStatus = 'Suspicious';
    else if (f.status === 'needs_manual_review') uiStatus = 'Needs Manual Review';
    else if (f.status === 'verification_unavailable') uiStatus = 'Verification Unavailable';

    return {
      id: f.id,
      applicationId: f.application_id,
      status: uiStatus,
      rule_code: f.rule_code,
      rule_version: f.rule_version,
      ruleTitle: f.rule_title,
      documentName: f.document_name || 'Document Scan',
      documentId: f.document_id || '',
      page: f.page || 1,
      bbox: f.bbox || undefined,
      field: f.field_key || 'Field',
      extractedValue: f.value_a || '',
      claimedValue: f.value_b || '',
      confidence: f.confidence,
      explanation: f.explanation,
      suggestedAction: f.suggested_action,
      whyLine: f.why_line,
      severity: f.severity,
      sourceReference: f.source_reference,
      superseded_by: f.superseded_by
    };
  }
};
