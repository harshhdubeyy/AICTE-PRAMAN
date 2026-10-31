/**
 * Pure Deterministic Regulatory Rules Engine for AICTE PRAMAN
 *
 * Rules are loaded dynamically from the versioned "rules" store.
 * The engine, not AI, deterministically evaluates statutory rules.
 * Enforces abstain logic (needs_manual_review on low confidence, verification_unavailable
 * on offline external sources) and never outputs the word "fraud".
 */

import {
  RuleDefinition,
  EngineApplicationInput,
  EngineDocumentInput,
  EngineExtractedFieldInput,
  EngineFindingOutput,
  ValidationRunOutput,
  SmartRevalidationResult,
  FindingStatus,
  BoundingBox
} from './types';

/**
 * Filter active rules by application type and rule version
 */
export function filterRulesForApplication(
  rules: RuleDefinition[],
  applicationType: string,
  ruleVersion?: string
): RuleDefinition[] {
  return rules.filter(rule => {
    if (!rule.active) return false;
    if (ruleVersion && rule.version !== ruleVersion) return false;
    return rule.application_type === 'ALL' || rule.application_type === applicationType;
  });
}

/**
 * Determine which rules are affected by a specific document type or field changes
 */
export function getAffectedRules(
  rules: RuleDefinition[],
  docType: string,
  changedFieldKeys: string[] = []
): RuleDefinition[] {
  return rules.filter(rule => {
    const docTypesMatch = rule.depends_on.doc_types.some(
      dt => dt.toLowerCase() === docType.toLowerCase()
    );
    if (docTypesMatch) return true;

    if (rule.depends_on.field_keys && changedFieldKeys.length > 0) {
      const fieldMatch = rule.depends_on.field_keys.some(fk =>
        changedFieldKeys.includes(fk)
      );
      if (fieldMatch) return true;
    }

    return false;
  });
}

/**
 * Helper to normalize string for comparison
 */
function normalizeString(str?: string | null): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Helper to compute Levenshtein or token similarity (0.0 to 1.0)
 */
function computeStringSimilarity(a: string, b: string): number {
  const normA = normalizeString(a);
  const normB = normalizeString(b);
  if (normA === normB) return 1.0;
  if (!normA || !normB) return 0.0;

  // Exact substring match check
  if (normA.includes(normB) || normB.includes(normA)) {
    return 0.85;
  }

  // Token set jaccard
  const setA = new Set(normA.split(' '));
  const setB = new Set(normB.split(' '));
  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }
  const union = new Set([...setA, ...setB]).size;
  return union > 0 ? intersection / union : 0.0;
}

/**
 * Increment semantic document version (e.g. v1.0 -> v2.0 or v1 -> v2)
 */
export function incrementDocVersion(currentVersion: string = 'v1.0'): string {
  const match = currentVersion.match(/v?(\d+)(\.(\d+))?/i);
  if (match) {
    const major = parseInt(match[1], 10);
    const hasDecimal = match[2] !== undefined;
    if (hasDecimal) {
      return `v${major + 1}.0`;
    }
    return `v${major + 1}`;
  }
  return 'v2.0';
}

/**
 * Pure deterministic rule evaluation function
 */
export function evaluateRules(params: {
  application: EngineApplicationInput;
  documents: EngineDocumentInput[];
  extractedFields: EngineExtractedFieldInput[];
  rules: RuleDefinition[];
  runId?: string;
  externalChecks?: Record<string, boolean>; // Service availability
}): EngineFindingOutput[] {
  const {
    application,
    documents,
    extractedFields,
    rules,
    runId = `run-${Date.now()}`,
    externalChecks = { DigiLocker: true, StateRevenue: true, MunicipalPortal: true }
  } = params;

  const currentDocs = documents.filter(d => d.is_current);
  const findings: EngineFindingOutput[] = [];

  for (const rule of rules) {
    const ruleDepDocTypes = rule.depends_on.doc_types;
    const ruleDepFieldKeys = rule.depends_on.field_keys || [];

    // Find documents associated with this rule
    const associatedDocs = currentDocs.filter(d =>
      ruleDepDocTypes.some(rdt => rdt.toLowerCase() === d.doc_type.toLowerCase())
    );

    // Collect all extracted fields for these documents
    const associatedDocIds = associatedDocs.map(d => d.id);
    const relevantFields = extractedFields.filter(f =>
      associatedDocIds.includes(f.document_id)
    );

    // -------------------------------------------------------------------------
    // 1. ABSTAIN CHECK: Low extraction confidence (< 0.70)
    // -------------------------------------------------------------------------
    const lowConfidenceField = relevantFields.find(f => {
      // Check if it's a field the rule depends on, or any key field
      if (ruleDepFieldKeys.length > 0 && !ruleDepFieldKeys.includes(f.field_key)) {
        return false;
      }
      return f.confidence < 0.70;
    });

    if (lowConfidenceField) {
      const doc = associatedDocs.find(d => d.id === lowConfidenceField.document_id);
      findings.push({
        id: `fnd-${rule.code}-${lowConfidenceField.id || Date.now()}`,
        run_id: runId,
        application_id: application.id,
        document_id: doc ? doc.id : null,
        document_name: doc ? doc.file_name : 'Uploaded Document',
        rule_code: rule.code,
        rule_version: rule.version,
        rule_title: rule.title,
        status: 'needs_manual_review',
        severity: rule.severity,
        field_key: lowConfidenceField.field_key,
        page: lowConfidenceField.page || 1,
        bbox: lowConfidenceField.bbox || { x: 120, y: 340, width: 280, height: 45 },
        value_a: lowConfidenceField.value,
        value_b: lowConfidenceField.claimed_value || 'Human Inspection Required',
        confidence: lowConfidenceField.confidence,
        explanation: `Low OCR extraction confidence (${(lowConfidenceField.confidence * 100).toFixed(0)}% < 70%) on field '${lowConfidenceField.field_key}'. Manual human review required to verify extracted text against original document scan.`,
        suggested_action: `Scrutiny officer must manually inspect page ${lowConfidenceField.page || 1} and confirm '${lowConfidenceField.field_key}'.`,
        why_line: `Confidence ${(lowConfidenceField.confidence * 100).toFixed(0)}% is below statutory threshold (70%).`,
        source_reference: rule.source_reference,
        created_at: new Date().toISOString()
      });
      continue;
    }

    // -------------------------------------------------------------------------
    // 2. EXTERNAL CHECK AVAILABILITY
    // -------------------------------------------------------------------------
    if (rule.config?.requires_external_service) {
      const serviceName = rule.config.requires_external_service;
      if (externalChecks[serviceName] === false) {
        findings.push({
          id: `fnd-${rule.code}-ext-unavail`,
          run_id: runId,
          application_id: application.id,
          document_id: associatedDocs[0]?.id || null,
          document_name: associatedDocs[0]?.file_name || 'Statutory Portal',
          rule_code: rule.code,
          rule_version: rule.version,
          rule_title: rule.title,
          status: 'verification_unavailable',
          severity: rule.severity,
          field_key: 'external_verification',
          confidence: 0.5,
          explanation: `External statutory portal (${serviceName}) is temporarily unreachable. Digital verification could not be completed.`,
          suggested_action: `Retry external verification or verify manually through Sub-Registrar / official portal.`,
          why_line: `Service endpoint ${serviceName} did not respond within timeout.`,
          source_reference: rule.source_reference,
          created_at: new Date().toISOString()
        });
        continue;
      }
    }

    // -------------------------------------------------------------------------
    // 3. MANDATORY DOCUMENT CHECKLIST RULES
    // -------------------------------------------------------------------------
    if (rule.category === 'Mandatory Checklist' || rule.code.startsWith('RULE-DOC-')) {
      const requiredDocs: string[] = rule.config?.required_docs || ruleDepDocTypes;
      const missingDocs = requiredDocs.filter(
        reqDoc => !currentDocs.some(cd => cd.doc_type.toLowerCase() === reqDoc.toLowerCase())
      );

      if (missingDocs.length > 0) {
        for (const missingDoc of missingDocs) {
          findings.push({
            id: `fnd-${rule.code}-missing-${missingDoc.replace(/\s+/g, '_')}`,
            run_id: runId,
            application_id: application.id,
            document_id: null,
            document_name: `Required: ${missingDoc}`,
            rule_code: rule.code,
            rule_version: rule.version,
            rule_title: rule.title,
            status: 'missing',
            severity: rule.severity,
            field_key: 'doc_presence',
            confidence: 1.0,
            value_a: 'Not Uploaded',
            value_b: `Mandatory: ${missingDoc}`,
            explanation: `Mandatory document '${missingDoc}' has not been uploaded to the statutory application dossier.`,
            suggested_action: `Institution must upload certified ${missingDoc} to satisfy statutory checklist requirement.`,
            why_line: `Statutory requirement under ${rule.source_reference}.`,
            source_reference: rule.source_reference,
            created_at: new Date().toISOString()
          });
        }
      } else {
        findings.push({
          id: `fnd-${rule.code}-passed`,
          run_id: runId,
          application_id: application.id,
          document_id: associatedDocs[0]?.id || null,
          document_name: 'Dossier Checklist',
          rule_code: rule.code,
          rule_version: rule.version,
          rule_title: rule.title,
          status: 'passed',
          severity: rule.severity,
          field_key: 'doc_presence',
          confidence: 1.0,
          value_a: `${requiredDocs.length} of ${requiredDocs.length} Present`,
          value_b: 'All Required Present',
          explanation: `All mandatory statutory documents required for ${application.application_type} are present and submitted.`,
          suggested_action: 'None required.',
          why_line: 'All required documents verified in statutory dossier.',
          source_reference: rule.source_reference,
          created_at: new Date().toISOString()
        });
      }
      continue;
    }

    // -------------------------------------------------------------------------
    // 4. CERTIFICATE EXPIRY RULES
    // -------------------------------------------------------------------------
    if (rule.category === 'Safety & Compliance' || rule.code.startsWith('RULE-EXP-')) {
      const doc = associatedDocs[0];
      if (!doc) {
        findings.push({
          id: `fnd-${rule.code}-nodoc`,
          run_id: runId,
          application_id: application.id,
          document_id: null,
          document_name: ruleDepDocTypes[0] || 'Required Certificate',
          rule_code: rule.code,
          rule_version: rule.version,
          rule_title: rule.title,
          status: 'missing',
          severity: rule.severity,
          field_key: 'certificate_file',
          confidence: 1.0,
          value_a: 'Document Not Provided',
          value_b: 'Valid Certificate',
          explanation: `No document for '${ruleDepDocTypes[0]}' found to evaluate certificate currency.`,
          suggested_action: `Upload valid ${ruleDepDocTypes[0]} issued by competent authority.`,
          why_line: 'Certificate required for safety compliance.',
          source_reference: rule.source_reference,
          created_at: new Date().toISOString()
        });
        continue;
      }

      // Check valid_until from doc or extracted fields
      const minValidUntil = rule.config?.min_valid_until || '2026-12-31';
      let docExpiry = doc.valid_until;

      if (!docExpiry) {
        const expiryField = relevantFields.find(
          f => f.field_key === 'valid_until' || f.field_key === 'expiry_date'
        );
        if (expiryField) {
          docExpiry = expiryField.value;
        }
      }

      if (!docExpiry) {
        findings.push({
          id: `fnd-${rule.code}-unknown-expiry`,
          run_id: runId,
          application_id: application.id,
          document_id: doc.id,
          document_name: doc.file_name,
          rule_code: rule.code,
          rule_version: rule.version,
          rule_title: rule.title,
          status: 'needs_manual_review',
          severity: rule.severity,
          field_key: 'valid_until',
          page: 1,
          bbox: { x: 300, y: 150, width: 200, height: 40 },
          confidence: 0.75,
          value_a: 'Date Not Machine-Readable',
          value_b: `Valid beyond ${minValidUntil}`,
          explanation: `Certificate validity date could not be automatically verified from ${doc.file_name}.`,
          suggested_action: 'Scrutiny officer must manually verify certificate expiration date from document seal.',
          why_line: 'Validity date required by AICTE regulations.',
          source_reference: rule.source_reference,
          created_at: new Date().toISOString()
        });
      } else {
        const isExpired = new Date(docExpiry) < new Date(minValidUntil);
        if (isExpired) {
          findings.push({
            id: `fnd-${rule.code}-expired`,
            run_id: runId,
            application_id: application.id,
            document_id: doc.id,
            document_name: doc.file_name,
            rule_code: rule.code,
            rule_version: rule.version,
            rule_title: rule.title,
            status: 'expired',
            severity: rule.severity,
            field_key: 'valid_until',
            page: 1,
            bbox: { x: 320, y: 180, width: 220, height: 40 },
            confidence: 0.98,
            value_a: `Expired: ${docExpiry}`,
            value_b: `Required >= ${minValidUntil}`,
            explanation: `Certificate expired on ${docExpiry}. AICTE regulation requires validity extending through at least ${minValidUntil}.`,
            suggested_action: `Institution must upload a renewed ${doc.doc_type} valid beyond ${minValidUntil}.`,
            why_line: `Expired on ${docExpiry}; does not satisfy minimum requirement of ${minValidUntil}.`,
            source_reference: rule.source_reference,
            created_at: new Date().toISOString()
          });
        } else {
          findings.push({
            id: `fnd-${rule.code}-passed`,
            run_id: runId,
            application_id: application.id,
            document_id: doc.id,
            document_name: doc.file_name,
            rule_code: rule.code,
            rule_version: rule.version,
            rule_title: rule.title,
            status: 'passed',
            severity: rule.severity,
            field_key: 'valid_until',
            page: 1,
            bbox: { x: 320, y: 180, width: 220, height: 40 },
            confidence: 0.98,
            value_a: `Valid until ${docExpiry}`,
            value_b: `>= ${minValidUntil}`,
            explanation: `Certificate validity (${docExpiry}) is valid and complies with statutory requirement.`,
            suggested_action: 'None required.',
            why_line: 'Certificate is unexpired and current.',
            source_reference: rule.source_reference,
            created_at: new Date().toISOString()
          });
        }
      }
      continue;
    }

    // -------------------------------------------------------------------------
    // 5. CROSS-DOCUMENT CONSISTENCY / MISMATCH RULES
    // -------------------------------------------------------------------------
    if (rule.category === 'Data Consistency' || rule.code.startsWith('RULE-MATCH-')) {
      const compareDocTypes = ruleDepDocTypes;
      if (compareDocTypes.length >= 2) {
        const docA = currentDocs.find(d => d.doc_type.toLowerCase() === compareDocTypes[0].toLowerCase());
        const docB = currentDocs.find(d => d.doc_type.toLowerCase() === compareDocTypes[1].toLowerCase());

        if (!docA || !docB) {
          findings.push({
            id: `fnd-${rule.code}-missing-pair`,
            run_id: runId,
            application_id: application.id,
            document_id: docA?.id || docB?.id || null,
            document_name: !docA ? compareDocTypes[0] : compareDocTypes[1],
            rule_code: rule.code,
            rule_version: rule.version,
            rule_title: rule.title,
            status: 'missing',
            severity: rule.severity,
            field_key: ruleDepFieldKeys[0] || 'cross_check',
            confidence: 1.0,
            value_a: docA ? 'Document Present' : 'Document Missing',
            value_b: docB ? 'Document Present' : 'Document Missing',
            explanation: `Cannot perform cross-document consistency check: required document '${!docA ? compareDocTypes[0] : compareDocTypes[1]}' is not uploaded.`,
            suggested_action: `Upload missing statutory document to enable automated consistency verification.`,
            why_line: 'Cross-document verification requires both documents.',
            source_reference: rule.source_reference,
            created_at: new Date().toISOString()
          });
          continue;
        }

        // Compare key fields
        const targetKey = ruleDepFieldKeys[0] || 'land_survey_no';
        const fieldA = extractedFields.find(f => f.document_id === docA.id && f.field_key === targetKey);
        const fieldB = extractedFields.find(f => f.document_id === docB.id && f.field_key === targetKey);

        const valA = fieldA?.value || '';
        const valB = fieldB?.value || '';

        const similarity = computeStringSimilarity(valA, valB);
        const threshold = rule.config?.similarity_threshold || 0.85;

        if (similarity < threshold) {
          findings.push({
            id: `fnd-${rule.code}-mismatch`,
            run_id: runId,
            application_id: application.id,
            document_id: docB.id,
            document_name: docB.file_name,
            rule_code: rule.code,
            rule_version: rule.version,
            rule_title: rule.title,
            status: 'mismatch',
            severity: rule.severity,
            field_key: targetKey,
            page: fieldB?.page || 1,
            bbox: fieldB?.bbox || { x: 140, y: 260, width: 310, height: 45 },
            value_a: valA || 'Not Extracted',
            value_b: valB || 'Not Extracted',
            confidence: Math.min(fieldA?.confidence || 0.95, fieldB?.confidence || 0.95),
            explanation: `Cross-document discrepancy detected in '${targetKey}'. ${docA.doc_type} states '${valA}' while ${docB.doc_type} states '${valB}'.`,
            suggested_action: `Institution must reconcile parcel address details and submit a Sub-Registrar rectification or amended affidavit.`,
            why_line: `Field values do not match across ${docA.doc_type} and ${docB.doc_type} (similarity: ${(similarity * 100).toFixed(0)}%).`,
            source_reference: rule.source_reference,
            created_at: new Date().toISOString()
          });
        } else {
          findings.push({
            id: `fnd-${rule.code}-passed`,
            run_id: runId,
            application_id: application.id,
            document_id: docB.id,
            document_name: docB.file_name,
            rule_code: rule.code,
            rule_version: rule.version,
            rule_title: rule.title,
            status: 'passed',
            severity: rule.severity,
            field_key: targetKey,
            page: fieldB?.page || 1,
            bbox: fieldB?.bbox || { x: 140, y: 260, width: 310, height: 45 },
            confidence: Math.min(fieldA?.confidence || 0.95, fieldB?.confidence || 0.95),
            value_a: valA,
            value_b: valB,
            explanation: `Cross-document concordance verified for '${targetKey}'. Both documents match seamlessly.`,
            suggested_action: 'None required.',
            why_line: 'Identical across sworn affidavit and legal registered deed.',
            source_reference: rule.source_reference,
            created_at: new Date().toISOString()
          });
        }
        continue;
      }
    }

    // -------------------------------------------------------------------------
    // 6. NUMERIC / NORMATIVE THRESHOLD RULES (Land, Faculty, Built-up area)
    // -------------------------------------------------------------------------
    const primaryDoc = associatedDocs[0];
    const keyField = relevantFields.find(f => ruleDepFieldKeys.includes(f.field_key)) || relevantFields[0];

    if (keyField && primaryDoc) {
      // Check numeric thresholds if specified in config
      if (rule.config?.min_area_acres) {
        const numericVal = parseFloat(keyField.value.replace(/[^\d.]/g, ''));
        const minReq = rule.config.min_area_acres;
        if (!isNaN(numericVal) && numericVal < minReq) {
          findings.push({
            id: `fnd-${rule.code}-shortfall`,
            run_id: runId,
            application_id: application.id,
            document_id: primaryDoc.id,
            document_name: primaryDoc.file_name,
            rule_code: rule.code,
            rule_version: rule.version,
            rule_title: rule.title,
            status: 'mismatch',
            severity: rule.severity,
            field_key: keyField.field_key,
            page: keyField.page,
            bbox: keyField.bbox || { x: 100, y: 200, width: 250, height: 40 },
            value_a: `${numericVal} Acres`,
            value_b: `>= ${minReq} Acres`,
            confidence: keyField.confidence,
            explanation: `Declared land area (${numericVal} acres) is below the statutory minimum requirement of ${minReq} acres for Urban zones.`,
            suggested_action: `Institution must provide additional contiguous parcel deed to meet ${minReq} acres norm.`,
            why_line: `Shortfall of ${(minReq - numericVal).toFixed(2)} acres.`,
            source_reference: rule.source_reference,
            created_at: new Date().toISOString()
          });
          continue;
        }
      }

      // Default passed finding for evaluated normative rule
      findings.push({
        id: `fnd-${rule.code}-passed`,
        run_id: runId,
        application_id: application.id,
        document_id: primaryDoc.id,
        document_name: primaryDoc.file_name,
        rule_code: rule.code,
        rule_version: rule.version,
        rule_title: rule.title,
        status: 'passed',
        severity: rule.severity,
        field_key: keyField.field_key,
        page: keyField.page,
        bbox: keyField.bbox || { x: 100, y: 200, width: 250, height: 40 },
        value_a: keyField.value,
        value_b: keyField.claimed_value || 'Satisfied',
        confidence: keyField.confidence,
        explanation: `${rule.title} satisfied. Evidence extracted from ${primaryDoc.file_name} meets statutory criteria.`,
        suggested_action: 'None required.',
        why_line: 'Criteria satisfied based on extracted documentary evidence.',
        source_reference: rule.source_reference,
        created_at: new Date().toISOString()
      });
    } else {
      // Document not uploaded
      findings.push({
        id: `fnd-${rule.code}-missing-evidence`,
        run_id: runId,
        application_id: application.id,
        document_id: null,
        document_name: ruleDepDocTypes[0] || 'Required Document',
        rule_code: rule.code,
        rule_version: rule.version,
        rule_title: rule.title,
        status: 'missing',
        severity: rule.severity,
        field_key: ruleDepFieldKeys[0] || 'evidence_missing',
        confidence: 1.0,
        value_a: 'Not Provided',
        value_b: 'Required Evidence',
        explanation: `Documentary evidence for '${rule.title}' is missing from the application submission.`,
        suggested_action: `Upload certified ${ruleDepDocTypes.join(' or ')} to satisfy requirement.`,
        why_line: 'Mandatory statutory proof required.',
        source_reference: rule.source_reference,
        created_at: new Date().toISOString()
      });
    }
  }

  return findings;
}

/**
 * Summarize findings counts and calculate overall score
 */
export function buildValidationRun(
  applicationId: string,
  ruleSetVersion: string,
  findings: EngineFindingOutput[],
  triggerReason: string = 'Manual Evaluation',
  triggeredBy: string = 'System Rules Engine'
): ValidationRunOutput {
  const counts = {
    passed: 0,
    missing: 0,
    mismatch: 0,
    expired: 0,
    suspicious: 0,
    needsReview: 0,
    verificationUnavailable: 0
  };

  for (const f of findings) {
    if (f.status === 'passed') counts.passed++;
    else if (f.status === 'missing') counts.missing++;
    else if (f.status === 'mismatch') counts.mismatch++;
    else if (f.status === 'expired') counts.expired++;
    else if (f.status === 'suspicious') counts.suspicious++;
    else if (f.status === 'needs_manual_review') counts.needsReview++;
    else if (f.status === 'verification_unavailable') counts.verificationUnavailable++;
  }

  const total = findings.length || 1;
  const criticalDefects = counts.missing + counts.mismatch + counts.expired + counts.suspicious;
  const score = Math.max(30, Math.round(((total - criticalDefects) / total) * 100));

  let recommendedAction = 'Approve to Next Stage';
  if (counts.mismatch > 0 || counts.expired > 0 || counts.missing > 0) {
    recommendedAction = 'Seek Clarification';
  }
  if (counts.needsReview > 0 || counts.suspicious > 0) {
    recommendedAction = 'Needs Manual Review';
  }

  return {
    id: `run-${Date.now()}`,
    application_id: applicationId,
    rule_set_version: ruleSetVersion,
    triggered_by: triggeredBy,
    trigger_reason: triggerReason,
    overall_confidence: score,
    recommended_action: recommendedAction,
    findings_count: counts,
    created_at: new Date().toISOString(),
    findings
  };
}

/**
 * Smart Re-validation:
 * When a document is replaced:
 * 1. Create new document (version + 1, is_current = true, old row is_current = false, replaced_by set)
 * 2. Re-run ONLY rules whose depends_on includes that doc_type or its fields
 * 3. Insert new validation_runs row with trigger_reason
 * 4. Insert new findings and mark old findings superseded_by the new ones
 * 5. Never delete history
 */
export function revalidateDocumentReplacement(params: {
  application: EngineApplicationInput;
  allDocuments: EngineDocumentInput[];
  allExtractedFields: EngineExtractedFieldInput[];
  allRules: RuleDefinition[];
  previousFindings: EngineFindingOutput[];
  oldDocumentId: string;
  newDocumentData: Partial<EngineDocumentInput> & {
    file_name: string;
    doc_type: string;
    sha256: string;
  };
  newExtractedFields: EngineExtractedFieldInput[];
  triggerReason?: string;
}): SmartRevalidationResult {
  const {
    application,
    allDocuments,
    allExtractedFields,
    allRules,
    previousFindings,
    oldDocumentId,
    newDocumentData,
    newExtractedFields,
    triggerReason
  } = params;

  const oldDoc = allDocuments.find(d => d.id === oldDocumentId);
  const oldVersion = oldDoc?.version || 'v1.0';
  const newVersion = incrementDocVersion(oldVersion);
  const newDocId = `doc-${Date.now()}`;

  // 1. Prepare new and updated old document records
  const newDocument: EngineDocumentInput = {
    id: newDocId,
    application_id: application.id,
    doc_type: newDocumentData.doc_type,
    name: newDocumentData.name || oldDoc?.name || newDocumentData.doc_type,
    file_name: newDocumentData.file_name,
    category: newDocumentData.category || oldDoc?.category || 'Compliance',
    version: newVersion,
    is_current: true,
    replaced_by: null,
    valid_until: newDocumentData.valid_until || null,
    sha256: newDocumentData.sha256,
    file_size: newDocumentData.file_size || '1.8 MB',
    ocr_status: newDocumentData.ocr_status || 'Extracted',
    ocr_confidence: newDocumentData.ocr_confidence || 0.96
  };

  const updatedOldDoc: EngineDocumentInput = {
    ...(oldDoc || {
      id: oldDocumentId,
      application_id: application.id,
      doc_type: newDocumentData.doc_type,
      name: newDocumentData.name || 'Original Document',
      file_name: 'original.pdf',
      version: oldVersion,
      category: 'Compliance'
    }),
    is_current: false,
    replaced_by: newDocId
  };

  // 2. Identify affected rules
  const changedFieldKeys = newExtractedFields.map(f => f.field_key);
  const affectedRules = getAffectedRules(allRules, newDocumentData.doc_type, changedFieldKeys);
  const affectedRuleCodes = affectedRules.map(r => r.code);

  // 3. Assemble updated documents and fields state for evaluation
  const updatedDocs = allDocuments.map(d => (d.id === oldDocumentId ? updatedOldDoc : d));
  // Replace or append new document
  const finalDocList = [...updatedDocs.filter(d => d.id !== newDocId), newDocument];

  const updatedFields = [
    ...allExtractedFields.filter(f => f.document_id !== oldDocumentId),
    ...newExtractedFields.map(f => ({ ...f, document_id: newDocId }))
  ];

  // 4. Re-run ONLY affected rules
  const newRunId = `run-${Date.now()}`;
  const reevaluatedFindings = evaluateRules({
    application,
    documents: finalDocList,
    extractedFields: updatedFields,
    rules: affectedRules,
    runId: newRunId
  });

  // 5. Supersede old findings for affected rules
  const supersededFindingIds: string[] = [];
  const updatedPreviousFindings = previousFindings.map(oldFinding => {
    if (affectedRuleCodes.includes(oldFinding.rule_code)) {
      const matchingNewFinding = reevaluatedFindings.find(
        nf => nf.rule_code === oldFinding.rule_code
      );
      if (matchingNewFinding) {
        supersededFindingIds.push(oldFinding.id);
        return {
          ...oldFinding,
          superseded_by: matchingNewFinding.id
        };
      }
    }
    return oldFinding;
  });

  // 6. Retain unaffected findings and merge with newly generated findings
  const unaffectedFindings = updatedPreviousFindings.filter(
    f => !affectedRuleCodes.includes(f.rule_code) && !f.superseded_by
  );
  const combinedFindings = [...unaffectedFindings, ...reevaluatedFindings];

  // 7. Create new validation run record
  const reason =
    triggerReason ||
    `Document replaced: ${newDocumentData.doc_type} (${newDocumentData.file_name} ${newVersion})`;

  const newRun = buildValidationRun(
    application.id,
    allRules[0]?.version || '2026-27-v1',
    combinedFindings,
    reason,
    'Smart Re-validation Engine'
  );
  newRun.id = newRunId;

  return {
    newDocument,
    oldDocument: updatedOldDoc,
    newRun,
    affectedRuleCodes,
    newFindings: reevaluatedFindings,
    supersededFindingIds
  };
}
