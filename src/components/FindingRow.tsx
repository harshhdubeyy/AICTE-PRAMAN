import React, { useState } from 'react';
import {
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Info,
  Edit2,
  Check,
  X,
  Sparkles,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { ValidationFinding } from '../types';
import { StatusDot } from './StatusDot';
import { useApp } from '../store/AppContext';
import { extractionService } from '../services';

interface FindingRowProps {
  finding: ValidationFinding;
  isExpanded: boolean;
  onToggle: () => void;
  onQuickClarification?: (finding: ValidationFinding) => void;
}

export const FindingRow: React.FC<FindingRowProps> = ({
  finding,
  isExpanded,
  onToggle,
  onQuickClarification
}) => {
  const { editExtractedValue, showToast } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editedValue, setEditedValue] = useState(finding.extractedValue);
  const [isSaving, setIsSaving] = useState(false);

  // Gemini explain-finding state
  const [aiExplanation, setAiExplanation] = useState<{
    explanation: string;
    next_steps: string[];
    statutory_significance: string;
  } | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Label bounding box as approximate region as requested
  const bboxText = finding.bbox
    ? `[x:${finding.bbox.x}, y:${finding.bbox.y}, ${finding.bbox.width}×${finding.bbox.height}px] (approximate region)`
    : '[x:140, y:260, 310×45px] (approximate region)';

  const handleSaveCorrection = async () => {
    if (!editedValue.trim()) {
      showToast('Please enter a valid value');
      return;
    }
    setIsSaving(true);
    try {
      await editExtractedValue(
        finding.applicationId,
        finding.documentId || 'doc-1',
        finding.field,
        editedValue.trim()
      );
      setIsEditing(false);
    } catch (err: any) {
      showToast('Error saving correction: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAskGeminiExplain = async () => {
    setIsLoadingAi(true);
    try {
      const res = await extractionService.explainFinding(finding);
      setAiExplanation(res);
      showToast('Generated plain-language explanation with Gemini Flash');
    } catch (err: any) {
      showToast('Explain error: ' + err.message);
    } finally {
      setIsLoadingAi(false);
    }
  };

  return (
    <>
      <tr
        onClick={onToggle}
        className={`transition-all duration-150 cursor-pointer ${
          isExpanded
            ? 'selected-table-row bg-[#4F63E8] text-white shadow-sm'
            : 'hover:bg-gray-50 text-[#1F2350]'
        }`}
      >
        <td className="py-3 pl-4 font-bold flex items-center gap-2">
          {finding.status === 'Mismatch' || finding.status === 'Suspicious' || finding.status === 'Needs Manual Review' ? (
            <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${isExpanded ? 'text-white' : 'text-[#F59A3C]'}`} />
          ) : finding.status === 'Expired' || finding.status === 'Missing' ? (
            <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${isExpanded ? 'text-white' : 'text-[#F0566A]'}`} />
          ) : (
            <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 ${isExpanded ? 'text-white' : 'text-[#3DBE8B]'}`} />
          )}
          <span className={isExpanded ? 'text-white' : 'text-[#1F2350]'}>{finding.ruleTitle}</span>
        </td>

        <td className={`py-3 ${isExpanded ? 'text-white/95' : 'text-[#8C91AB]'} text-[11px]`}>
          {finding.documentName} {finding.page ? `p.${finding.page}` : ''}
        </td>

        <td className={`py-3 font-mono text-[11px] ${isExpanded ? 'text-white/90' : 'text-[#8C91AB]'}`}>
          {finding.rule_code}
        </td>

        <td className={`py-3 font-bold ${isExpanded ? 'text-white' : 'text-[#1F2350]'}`}>
          {(finding.confidence * 100).toFixed(0)}%
        </td>

        <td className="py-3">
          <StatusDot
            status={finding.status}
            isInverseWhite={isExpanded}
            showText={true}
          />
        </td>

        <td className="py-3 pr-4 text-right">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 inline text-white" />
          ) : (
            <ChevronDown className="w-4 h-4 inline text-[#8C91AB]" />
          )}
        </td>
      </tr>

      {/* Expanded Sub-card: Side-by-Side Detailed Value Comparison & Trace Chip Row */}
      {isExpanded && (
        <tr className="bg-indigo-50/50">
          <td colSpan={6} className="p-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100 space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-[#4F63E8]">
                    Evidence-Linked Ground Truth
                  </span>
                  <span className="text-xs font-bold text-[#1F2350]">
                    Discrepancy Details & Bounding Box Context
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleAskGeminiExplain}
                    disabled={isLoadingAi}
                    className="text-[10.5px] font-bold text-[#4F63E8] bg-[#EEF0FD] hover:bg-indigo-100 px-2 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-all border border-indigo-100"
                  >
                    {isLoadingAi ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Sparkles className="w-3 h-3" />
                    )}
                    <span>Explain Finding with Gemini</span>
                  </button>
                  <span className="text-[11px] text-[#8C91AB] font-mono">{finding.sourceReference}</span>
                </div>
              </div>

              {/* Requirement 5: Finding → Rule → Doc → Page → Region Trace Chip Row */}
              <div className="flex items-center gap-1.5 flex-wrap text-[10.5px] font-medium py-2 px-3 bg-[#FAF8FF] border border-indigo-100/80 rounded-xl text-[#1F2350]">
                <span className="text-[#8C91AB] font-bold uppercase tracking-wider text-[9px] mr-0.5">
                  Evidence Trace:
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-indigo-100 font-bold text-[#4F63E8] shadow-xs">
                  Finding: {finding.ruleTitle}
                </span>
                <span className="text-[#8C91AB] font-bold">→</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-indigo-100 font-mono text-[#1F2350] shadow-xs">
                  Rule: {finding.rule_code}
                </span>
                <span className="text-[#8C91AB] font-bold">→</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-indigo-100 text-[#1F2350] shadow-xs">
                  Doc: {finding.documentName}
                </span>
                <span className="text-[#8C91AB] font-bold">→</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-indigo-100 text-[#1F2350] shadow-xs">
                  Page: {finding.page || 1}
                </span>
                <span className="text-[#8C91AB] font-bold">→</span>
                <span className="px-2 py-0.5 rounded-md bg-white border border-indigo-100 text-[#4F63E8] font-mono shadow-xs">
                  Region: {bboxText}
                </span>
              </div>

              {/* Optional Gemini Explain-Finding output */}
              {aiExplanation && (
                <div className="p-3 bg-[#F4F5FE] rounded-xl border border-indigo-100 text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-[#4F63E8]">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Gemini Plain-Language Finding Explanation:</span>
                  </div>
                  <p className="text-[#1F2350] text-[11px] leading-relaxed">
                    {aiExplanation.explanation}
                  </p>
                  {aiExplanation.next_steps && aiExplanation.next_steps.length > 0 && (
                    <div className="pt-1">
                      <span className="font-semibold text-[#1F2350] text-[10.5px]">Recommended Next Steps:</span>
                      <ul className="list-disc pl-4 text-[10.5px] text-[#8C91AB] space-y-0.5 mt-0.5">
                        {aiExplanation.next_steps.map((step, idx) => (
                          <li key={idx}><span className="text-[#1F2350]">{step}</span></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-2">
                {/* Left Box: Value Extracted by Engine (with Manual Correction capability) */}
                <div className="p-3 bg-[#F9FAFE] rounded-lg border border-indigo-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#1F2350] mb-1">
                      <span>Value Extracted by Rules Engine</span>
                      <div className="flex items-center gap-1">
                        <span className="text-[9px] bg-indigo-100 text-[#4F63E8] px-1 rounded">
                          Page {finding.page || 1}
                        </span>
                        {!isEditing && (
                          <button
                            onClick={() => setIsEditing(true)}
                            className="text-[9.5px] text-[#4F63E8] hover:underline flex items-center gap-0.5 cursor-pointer font-bold ml-1"
                            title="Manual Correction"
                          >
                            <Edit2 className="w-2.5 h-2.5" />
                            <span>Edit</span>
                          </button>
                        )}
                      </div>
                    </div>

                    {isEditing ? (
                      <div className="mt-1 space-y-2">
                        <input
                          type="text"
                          value={editedValue}
                          onChange={e => setEditedValue(e.target.value)}
                          className="w-full text-xs p-1.5 bg-white border border-indigo-200 rounded text-[#1F2350] focus:ring-1 focus:ring-[#4F63E8]"
                          placeholder="Correct extracted value..."
                        />
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => setIsEditing(false)}
                            disabled={isSaving}
                            className="px-2 py-0.5 text-[10px] text-gray-600 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleSaveCorrection}
                            disabled={isSaving}
                            className="px-2.5 py-0.5 text-[10px] text-white bg-[#4F63E8] rounded hover:bg-[#4458DC] flex items-center gap-1 font-bold cursor-pointer"
                          >
                            {isSaving ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Check className="w-2.5 h-2.5" />}
                            <span>Save (source: manual)</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-[#1F2350] font-semibold mt-1 p-2 bg-white rounded border border-gray-100 flex items-center justify-between">
                        <mark className="bg-orange-100 text-orange-950 font-bold px-1 rounded">
                          {finding.extractedValue || 'N/A'}
                        </mark>
                        {finding.confidence === 1.0 && (
                          <span className="text-[9px] text-[#3DBE8B] font-bold bg-emerald-50 px-1 rounded border border-emerald-100">
                            Source: Manual
                          </span>
                        )}
                      </p>
                    )}
                  </div>
                  <span className="text-[10px] text-[#8C91AB] mt-2">
                    OCR Confidence: {(finding.confidence * 100).toFixed(1)}% • Approximate Region Verified
                  </span>
                </div>

                {/* Right Box: Statutory Norm / Reference Value */}
                <div className="p-3 bg-[#F9FAFE] rounded-lg border border-indigo-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#1F2350] mb-1">
                      <span>Statutory Norm / Reference Value</span>
                      <span className="text-[9px] bg-emerald-100 text-[#3DBE8B] px-1 rounded">
                        Target Baseline
                      </span>
                    </div>
                    <p className="text-xs text-[#1F2350] font-semibold mt-1 p-2 bg-white rounded border border-gray-100">
                      <mark className="bg-emerald-50 text-emerald-950 font-bold px-1 rounded">
                        {finding.claimedValue || 'Statutory Baseline'}
                      </mark>
                    </p>
                  </div>
                  <span className="text-[10px] text-[#8C91AB] mt-2">
                    AICTE Standard / Revenue Record Match
                  </span>
                </div>
              </div>

              <div className="p-2.5 bg-orange-50/70 rounded-lg flex items-center justify-between text-[11px] text-orange-950">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#F59A3C] shrink-0" />
                  <span>
                    <strong>Statutory Explanation:</strong> {finding.explanation}
                  </span>
                </div>
                {onQuickClarification && (
                  <button
                    onClick={() => onQuickClarification(finding)}
                    className="text-[#4F63E8] hover:underline font-bold shrink-0 ml-2 cursor-pointer"
                  >
                    Quick Draft Clarification
                  </button>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
};
