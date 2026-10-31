import { getExtractionProvider, ExtractionResult, ExtractionFilePayload } from './extraction';
import { ValidationFinding } from '../types';
import { supabase, isSupabaseConfigured } from './supabaseClient';

export const extractionService = {
  /**
   * Run structured document extraction via the active ExtractionProvider
   * (Defaults to Gemini Flash via Supabase Edge Function)
   */
  async extractDocument(
    payload: ExtractionFilePayload,
    providerType: 'gemini' | 'paddle_ocr' = 'gemini'
  ): Promise<ExtractionResult> {
    const provider = getExtractionProvider(providerType);
    return provider.extract(payload);
  },

  /**
   * Explain a structured finding via the explain-finding Edge Function
   * (Receives only the structured finding, never raw documents)
   */
  async explainFinding(finding: ValidationFinding): Promise<{
    explanation: string;
    next_steps: string[];
    statutory_significance: string;
  }> {
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase.functions.invoke('explain-finding', {
          body: {
            finding: {
              rule_code: finding.rule_code,
              rule_title: finding.ruleTitle,
              status: finding.status,
              field_key: finding.field,
              value_a: finding.extractedValue,
              value_b: finding.claimedValue,
              explanation: finding.explanation,
              source_reference: finding.sourceReference
            }
          }
        });

        if (!error && data && data.success) {
          return {
            explanation: data.explanation,
            next_steps: data.next_steps || [],
            statutory_significance: data.statutory_significance || ''
          };
        }
      } catch (err) {
        console.warn('explain-finding Edge Function invoke failed, using fallback:', err);
      }
    }

    // Default statutory explanation fallback
    return {
      explanation: finding.explanation || 'Regulatory variance detected during statutory coordination scrutiny.',
      next_steps: [
        finding.suggestedAction || 'Submit rectified document with certified Sub-Registrar seal.',
        'Review cross-document citations in Sworn Affidavit.',
        'Officer will review updated submission during next scrutiny committee convening.'
      ],
      statutory_significance: `Enforces regulatory compliance under ${finding.sourceReference}.`
    };
  },

  /**
   * Manual field correction:
   * Sets source = 'manual' in extracted_fields table and allows triggering smart revalidation.
   */
  async correctExtractedField(params: {
    documentId: string;
    fieldKey: string;
    newValue: string;
    correctedBy: string;
  }): Promise<{ success: boolean; error?: string }> {
    const { documentId, fieldKey, newValue, correctedBy } = params;

    if (isSupabaseConfigured() && supabase) {
      try {
        const { error } = await supabase
          .from('extracted_fields')
          .update({
            value: newValue,
            source: 'manual',
            notes: `Manually corrected by ${correctedBy} at ${new Date().toISOString()}`,
            confidence: 1.0,
            status: 'passed'
          })
          .eq('document_id', documentId)
          .eq('field_key', fieldKey);

        if (error) {
          console.warn('Error updating manual field in Supabase:', error);
          return { success: false, error: error.message };
        }
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    return { success: true };
  }
};
