import React from 'react';
import { AlertTriangle, ChevronDown, ChevronUp, Info } from 'lucide-react';
import { ValidationFinding } from '../types';
import { StatusDot } from './StatusDot';

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
          {finding.status === 'Mismatch' || finding.status === 'Suspicious' ? (
            <AlertTriangle className={`w-3.5 h-3.5 shrink-0 ${isExpanded ? 'text-white' : 'text-[#F59A3C]'}`} />
          ) : null}
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

      {/* Expanded Sub-card: Side-by-Side Detailed Value Comparison */}
      {isExpanded && (
        <tr className="bg-indigo-50/50">
          <td colSpan={6} className="p-4">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-100 text-[#AD4E00]">
                    Spatial Coordinate Variance
                  </span>
                  <span className="text-xs font-bold text-[#1F2350]">
                    Discrepancy Details & Bounding Box Context
                  </span>
                </div>
                <span className="text-[11px] text-[#8C91AB]">{finding.sourceReference}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 mt-3">
                {/* Left Box: Value in Sworn Affidavit */}
                <div className="p-3 bg-[#F9FAFE] rounded-lg border border-indigo-50 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-bold text-[#1F2350] mb-1">
                      <span>Value Extracted by AI Engine</span>
                      <span className="text-[9px] bg-indigo-100 text-[#4F63E8] px-1 rounded">
                        Page {finding.page}
                      </span>
                    </div>
                    <p className="text-xs text-[#1F2350] font-semibold mt-1 p-2 bg-white rounded border border-gray-100">
                      <mark className="bg-orange-100 text-orange-950 font-bold px-1 rounded">
                        {finding.extractedValue}
                      </mark>
                    </p>
                  </div>
                  <span className="text-[10px] text-[#8C91AB] mt-2">
                    OCR Confidence: {(finding.confidence * 100).toFixed(1)}% • Spatial Anchor Verified
                  </span>
                </div>

                {/* Right Box: Claimed Value in Reference Document */}
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
                        {finding.claimedValue}
                      </mark>
                    </p>
                  </div>
                  <span className="text-[10px] text-[#8C91AB] mt-2">
                    AICTE Standard / Revenue Record Match
                  </span>
                </div>
              </div>

              <div className="mt-3 p-2.5 bg-orange-50/70 rounded-lg flex items-center justify-between text-[11px] text-orange-950">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-[#F59A3C] shrink-0" />
                  <span>
                    <strong>Discrepancy Explanation:</strong> {finding.explanation}
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
