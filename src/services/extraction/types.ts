/**
 * Provider Interface & Types for Document Extraction
 *
 * Allows transparent swapping of extraction engines (e.g. Gemini Flash Edge Function,
 * FastAPI + PaddleOCR, or local mock/offline extraction) without modifying
 * the rules engine or UI screens.
 */

export type ExtractedDocType =
  | 'Land Deed'
  | 'Building Plan'
  | 'Fire NOC'
  | 'Trust Deed'
  | 'Affidavit'
  | 'Faculty List'
  | 'Sanction Plan'
  | 'Other';

export interface ExtractedFieldItem {
  field_key:
    | 'institution_name'
    | 'address'
    | 'document_number'
    | 'issuing_authority'
    | 'issue_date'
    | 'expiry_date'
    | 'signatory'
    | 'land_survey_no'
    | 'total_land_area'
    | 'total_built_up_area'
    | 'structural_engineer_reg_no'
    | 'epf_challan_number'
    | string;
  value: string | null;
  confidence: number; // 0 to 1
  page: number;
  bbox?: {
    x: number;
    y: number;
    width: number;
    height: number;
    is_approximate_region?: boolean;
  } | null;
  low_confidence?: boolean;
  status?: 'passed' | 'needs_manual_review';
  source?: string;
}

export interface ExtractionResult {
  doc_type: ExtractedDocType;
  fields: ExtractedFieldItem[];
  average_confidence: number;
  provider_name: string;
  raw_metadata?: Record<string, any>;
}

export interface ExtractionFilePayload {
  file?: File;
  blob?: Blob;
  buffer?: ArrayBuffer;
  fileName: string;
  mimeType: string;
  documentId?: string;
}

/**
 * Extraction Provider Contract
 */
export interface ExtractionProvider {
  readonly name: string;
  readonly version: string;
  extract(payload: ExtractionFilePayload): Promise<ExtractionResult>;
}
