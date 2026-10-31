import { describe, it, expect } from 'vitest';
import {
  evaluateRules,
  revalidateDocumentReplacement,
  getAffectedRules,
  filterRulesForApplication
} from '../src/rules/engine';
import { DEFAULT_RULES } from '../src/rules/defaultRules';
import {
  EngineApplicationInput,
  EngineDocumentInput,
  EngineExtractedFieldInput
} from '../src/rules/types';

describe('AICTE PRAMAN Versioned Regulatory Rules Engine', () => {
  const sampleApp: EngineApplicationInput = {
    id: 'app-test-01',
    application_number: 'AICTE-2026-04821',
    institution_id: 'inst-1',
    institution_name: 'Sri Venkateswara Institute of Technology',
    application_type: 'Extension of Approval',
    academic_year: 'AY 2026-27'
  };

  // ---------------------------------------------------------------------------
  // 1. Missing Document Test
  // ---------------------------------------------------------------------------
  it('flags missing document when mandatory statutory file is omitted', () => {
    // Only upload Land Title Deed, omit Fire Safety NOC, Building Safety, etc.
    const docs: EngineDocumentInput[] = [
      {
        id: 'doc-1',
        application_id: sampleApp.id,
        doc_type: 'Land Title Deed',
        name: 'Land Title Deed',
        file_name: 'Registered_Sale_Deed.pdf',
        version: 'v1.0',
        is_current: true,
        sha256: 'sha256_mock_123'
      }
    ];

    const fields: EngineExtractedFieldInput[] = [
      {
        document_id: 'doc-1',
        field_key: 'total_land_area',
        value: '3.1 Acres',
        confidence: 0.96,
        page: 1
      }
    ];

    const findings = evaluateRules({
      application: sampleApp,
      documents: docs,
      extractedFields: fields,
      rules: DEFAULT_RULES
    });

    const missingFindings = findings.filter(f => f.status === 'missing');
    expect(missingFindings.length).toBeGreaterThan(0);

    // Specifically verify mandatory checklist rule
    const eoaMandatory = missingFindings.find(f => f.rule_code === 'RULE-DOC-EOA-MANDATORY');
    expect(eoaMandatory).toBeDefined();
    expect(eoaMandatory?.severity).toBe('CRITICAL');
    expect(eoaMandatory?.explanation).toContain('Mandatory document');
    expect(eoaMandatory?.explanation.toLowerCase()).not.toContain('fraud');
  });

  // ---------------------------------------------------------------------------
  // 2. Expired Certificate Test
  // ---------------------------------------------------------------------------
  it('flags expired certificate when validity lapsed before academic cutoff date', () => {
    const docs: EngineDocumentInput[] = [
      {
        id: 'doc-fire',
        application_id: sampleApp.id,
        doc_type: 'Fire Safety NOC',
        name: 'Fire Safety NOC',
        file_name: 'Fire_NOC_Lapsed.pdf',
        version: 'v1.0',
        is_current: true,
        valid_until: '2026-03-12', // Expired relative to 2026-12-31
        sha256: 'sha256_fire_expired'
      }
    ];

    const fields: EngineExtractedFieldInput[] = [
      {
        document_id: 'doc-fire',
        field_key: 'valid_until',
        value: '2026-03-12',
        confidence: 0.98,
        page: 1
      }
    ];

    const fireRule = DEFAULT_RULES.find(r => r.code === 'RULE-EXP-FIRE-NOC')!;
    expect(fireRule).toBeDefined();

    const findings = evaluateRules({
      application: sampleApp,
      documents: docs,
      extractedFields: fields,
      rules: [fireRule]
    });

    expect(findings.length).toBe(1);
    const fireFinding = findings[0];
    expect(fireFinding.status).toBe('expired');
    expect(fireFinding.rule_code).toBe('RULE-EXP-FIRE-NOC');
    expect(fireFinding.severity).toBe('CRITICAL');
    expect(fireFinding.value_a).toContain('Expired: 2026-03-12');
    expect(fireFinding.explanation).toContain('Certificate expired on 2026-03-12');
    expect(fireFinding.explanation.toLowerCase()).not.toContain('fraud');
  });

  // ---------------------------------------------------------------------------
  // 3. Cross-Document Address Mismatch Test
  // ---------------------------------------------------------------------------
  it('detects cross-document address mismatch with evidence coordinates', () => {
    const docs: EngineDocumentInput[] = [
      {
        id: 'doc-land',
        application_id: sampleApp.id,
        doc_type: 'Land Title Deed',
        name: 'Land Title Deed',
        file_name: 'Land_Deed_Original.pdf',
        version: 'v1.0',
        is_current: true,
        sha256: 'sha256_land_deed'
      },
      {
        id: 'doc-affidavit',
        application_id: sampleApp.id,
        doc_type: 'Notarized Sworn Affidavit',
        name: 'Notarized Sworn Affidavit',
        file_name: 'Sworn_Affidavit.pdf',
        version: 'v1.0',
        is_current: true,
        sha256: 'sha256_affidavit'
      }
    ];

    const fields: EngineExtractedFieldInput[] = [
      {
        document_id: 'doc-land',
        field_key: 'land_survey_no',
        value: 'Survey No. 44/A, Hinjawadi Phase-1',
        claimed_value: 'Survey 44/A',
        confidence: 0.97,
        page: 2,
        bbox: { x: 100, y: 180, width: 250, height: 40 }
      },
      {
        document_id: 'doc-affidavit',
        field_key: 'land_survey_no',
        value: 'Plot 44/B, Hinjawadi Tech Park', // Mismatch!
        claimed_value: 'Survey 44/A',
        confidence: 0.95,
        page: 1,
        bbox: { x: 140, y: 260, width: 310, height: 45 }
      }
    ];

    const addressMatchRule = DEFAULT_RULES.find(r => r.code === 'RULE-MATCH-ADDRESS-LAND-AFFIDAVIT')!;
    expect(addressMatchRule).toBeDefined();

    const findings = evaluateRules({
      application: sampleApp,
      documents: docs,
      extractedFields: fields,
      rules: [addressMatchRule]
    });

    expect(findings.length).toBe(1);
    const mismatchFinding = findings[0];
    expect(mismatchFinding.status).toBe('mismatch');
    expect(mismatchFinding.rule_code).toBe('RULE-MATCH-ADDRESS-LAND-AFFIDAVIT');
    expect(mismatchFinding.value_a).toBe('Survey No. 44/A, Hinjawadi Phase-1');
    expect(mismatchFinding.value_b).toBe('Plot 44/B, Hinjawadi Tech Park');
    expect(mismatchFinding.bbox).toEqual({ x: 140, y: 260, width: 310, height: 45 });
    expect(mismatchFinding.explanation).toContain('Cross-document discrepancy detected');
    expect(mismatchFinding.explanation.toLowerCase()).not.toContain('fraud');
  });

  // ---------------------------------------------------------------------------
  // 4. Low-Confidence Abstain Logic Test
  // ---------------------------------------------------------------------------
  it('abstains with needs_manual_review when extracted field confidence is below 0.70', () => {
    const docs: EngineDocumentInput[] = [
      {
        id: 'doc-blurred',
        application_id: sampleApp.id,
        doc_type: 'Building Safety Certificate',
        name: 'Building Safety Certificate',
        file_name: 'Blurred_Stability_Cert.pdf',
        version: 'v1.0',
        is_current: true,
        sha256: 'sha256_blurred'
      }
    ];

    const fields: EngineExtractedFieldInput[] = [
      {
        document_id: 'doc-blurred',
        field_key: 'valid_until',
        value: '2027-05-30',
        confidence: 0.58, // Low confidence (< 0.70)
        page: 3,
        bbox: { x: 210, y: 400, width: 180, height: 35 }
      }
    ];

    const stabilityRule = DEFAULT_RULES.find(r => r.code === 'RULE-EXP-BUILDING-STABILITY')!;
    expect(stabilityRule).toBeDefined();

    const findings = evaluateRules({
      application: sampleApp,
      documents: docs,
      extractedFields: fields,
      rules: [stabilityRule]
    });

    expect(findings.length).toBe(1);
    const abstainFinding = findings[0];
    expect(abstainFinding.status).toBe('needs_manual_review');
    expect(abstainFinding.confidence).toBe(0.58);
    expect(abstainFinding.explanation).toContain('Low OCR extraction confidence (58% < 70%)');
    expect(abstainFinding.explanation).toContain('Manual human review required');
    expect(abstainFinding.explanation.toLowerCase()).not.toContain('fraud');
  });

  // ---------------------------------------------------------------------------
  // 5. Smart Re-validation Touching Only Affected Rules Test
  // ---------------------------------------------------------------------------
  it('re-validates touching ONLY rules whose depends_on includes the replaced doc_type and supersedes previous findings', () => {
    const initialDocs: EngineDocumentInput[] = [
      {
        id: 'doc-land-01',
        application_id: sampleApp.id,
        doc_type: 'Land Title Deed',
        name: 'Land Title Deed',
        file_name: 'Land_Deed.pdf',
        version: 'v1.0',
        is_current: true,
        sha256: 'sha256_land_1'
      },
      {
        id: 'doc-affidavit-01',
        application_id: sampleApp.id,
        doc_type: 'Notarized Sworn Affidavit',
        name: 'Notarized Sworn Affidavit',
        file_name: 'Affidavit_v1.pdf',
        version: 'v1.0',
        is_current: true,
        sha256: 'sha256_affidavit_1'
      },
      {
        id: 'doc-fire-01',
        application_id: sampleApp.id,
        doc_type: 'Fire Safety NOC',
        name: 'Fire Safety NOC',
        file_name: 'Fire_Safety_NOC.pdf',
        version: 'v1.0',
        is_current: true,
        valid_until: '2027-12-31',
        sha256: 'sha256_fire_1'
      }
    ];

    const initialFields: EngineExtractedFieldInput[] = [
      {
        document_id: 'doc-land-01',
        field_key: 'land_survey_no',
        value: 'Survey 44/A',
        confidence: 0.98,
        page: 1
      },
      {
        document_id: 'doc-affidavit-01',
        field_key: 'land_survey_no',
        value: 'Plot 44/B', // Mismatch initially
        confidence: 0.95,
        page: 1
      },
      {
        document_id: 'doc-fire-01',
        field_key: 'valid_until',
        value: '2027-12-31',
        confidence: 0.99,
        page: 1
      }
    ];

    // Initial evaluation
    const initialFindings = evaluateRules({
      application: sampleApp,
      documents: initialDocs,
      extractedFields: initialFields,
      rules: DEFAULT_RULES
    });

    const previousMismatch = initialFindings.find(
      f => f.rule_code === 'RULE-MATCH-ADDRESS-LAND-AFFIDAVIT' && f.status === 'mismatch'
    );
    expect(previousMismatch).toBeDefined();

    // Now Institution replaces 'Notarized Sworn Affidavit' with rectified Survey 44/A
    const newRectifiedFields: EngineExtractedFieldInput[] = [
      {
        document_id: 'temp',
        field_key: 'land_survey_no',
        value: 'Survey 44/A', // Rectified!
        claimed_value: 'Survey 44/A',
        confidence: 0.99,
        page: 1
      }
    ];

    const result = revalidateDocumentReplacement({
      application: sampleApp,
      allDocuments: initialDocs,
      allExtractedFields: initialFields,
      allRules: DEFAULT_RULES,
      previousFindings: initialFindings,
      oldDocumentId: 'doc-affidavit-01',
      newDocumentData: {
        doc_type: 'Notarized Sworn Affidavit',
        name: 'Notarized Sworn Affidavit (Rectified)',
        file_name: 'Affidavit_Rectified_v2.pdf',
        sha256: 'sha256_affidavit_rectified_2'
      },
      newExtractedFields: newRectifiedFields,
      triggerReason: 'Institution replaced affidavit to resolve address discrepancy'
    });

    // 1. Version incremented
    expect(result.newDocument.version).toBe('v2.0');
    expect(result.newDocument.is_current).toBe(true);

    // 2. Old doc marked not current and replaced_by set
    expect(result.oldDocument.is_current).toBe(false);
    expect(result.oldDocument.replaced_by).toBe(result.newDocument.id);

    // 3. Affected rules check:
    // Fire NOC rule does NOT depend on Notarized Sworn Affidavit, so it must not be in affected rules
    expect(result.affectedRuleCodes).toContain('RULE-MATCH-ADDRESS-LAND-AFFIDAVIT');
    expect(result.affectedRuleCodes).not.toContain('RULE-EXP-FIRE-NOC');

    // 4. Old finding is marked superseded
    expect(result.supersededFindingIds).toContain(previousMismatch!.id);

    // 5. In new run, the address rule is now PASSED
    const reevaluatedAddressFinding = result.newRun.findings.find(
      f => f.rule_code === 'RULE-MATCH-ADDRESS-LAND-AFFIDAVIT'
    );
    expect(reevaluatedAddressFinding).toBeDefined();
    expect(reevaluatedAddressFinding?.status).toBe('passed');

    // 6. New validation run record has trigger reason
    expect(result.newRun.trigger_reason).toBe(
      'Institution replaced affidavit to resolve address discrepancy'
    );
  });
});
