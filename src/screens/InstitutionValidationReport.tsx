import React from 'react';
import {
  FileCheck2,
  Download,
  FileSpreadsheet,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Clock
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { ConfidenceRing } from '../components/ConfidenceRing';

export const InstitutionValidationReport: React.FC = () => {
  const { applications, setActiveNav, resubmitDocument, showToast } = useApp();

  const svitApp = applications.find(a => a.id === 'app-1') || applications[0];
  const findings = svitApp.latestRun.findings;

  const handleFixMismatch = () => {
    setActiveNav('resubmissions');
    showToast('Redirected to Resubmissions tab to upload rectified affidavit');
  };

  const handleFixFireNoc = () => {
    setActiveNav('documents');
    showToast('Redirected to Documents tab to upload unexpired Fire NOC');
  };

  const handleExportCsv = () => {
    const headers = 'Rule Code,Rule Title,Document,Page,Extracted Value,Claimed Value,Status,Confidence\n';
    const rows = findings
      .map(
        f =>
          `"${f.rule_code}","${f.ruleTitle}","${f.documentName}","${f.page}","${f.extractedValue}","${f.claimedValue}","${f.status}","${f.confidence}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AICTE_Validation_Report_SVIT_Pune.csv`;
    a.click();
    showToast('Exported CSV findings report');
  };

  const handleExportPdf = () => {
    showToast('Opening print dialog for Official Dossier PDF export');
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-card-soft border border-[#ECEDF7] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-1.5 text-[#8C91AB] text-[10px] uppercase font-bold tracking-wider mb-1">
            <span>Official Scrutiny Report</span>
            <span>›</span>
            <span className="text-[#4F63E8]">AICTE Dossier Evaluation</span>
          </div>
          <h1 className="text-lg font-bold text-[#1F2350] tracking-tight">
            Automated Scrutiny Dossier — Sri Venkateswara Institute
          </h1>
          <p className="text-[11.5px] text-[#8C91AB]">
            Application ID: {svitApp.applicationNumber} • Scanned via Spatial Coordinate OCR Engine • Cycle AY 2026-27
          </p>
        </div>

        <div className="flex items-center gap-3 self-end md:self-auto">
          <ConfidenceRing
            score={svitApp.overallConfidence}
            label={`${svitApp.overallConfidence}%`}
            subLabel="Overall Match"
          />

          <button
            onClick={handleExportPdf}
            className="h-8 px-3 bg-[#EEF0FD] hover:bg-[#4F63E8] hover:text-white text-[#4F63E8] rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export PDF</span>
          </button>
          <button
            onClick={handleExportCsv}
            className="h-8 px-3 bg-[#F4F5FE] hover:bg-gray-200 text-[#1F2350] rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Mandatory Statutory Advisory Note */}
      <div className="p-3.5 bg-[#EEF0FD] rounded-xl border border-indigo-100 flex items-center gap-2.5 text-xs text-[#4F63E8] font-semibold">
        <ShieldCheck className="w-4 h-4 shrink-0" />
        <span>AI results are decision support. Final decision rests with the authorized officer.</span>
      </div>

      {/* Findings List with "Fix this" Action Buttons */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-[#8C91AB] uppercase tracking-wider px-1">
          Scrutiny Findings & Remediation Required ({findings.length})
        </h3>

        {findings.map(finding => {
          const isIssue = finding.status === 'Mismatch' || finding.status === 'Expired' || finding.status === 'Missing' || finding.status === 'Needs Manual Review';

          return (
            <div
              key={finding.id}
              className={`bg-white rounded-2xl p-4 border shadow-card-soft space-y-3 transition-all ${
                finding.status === 'Mismatch'
                  ? 'border-[#F59A3C]/70'
                  : finding.status === 'Expired'
                  ? 'border-[#F0566A]/70'
                  : 'border-[#ECEDF7]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs text-[#1F2350]">{finding.ruleTitle}</span>
                    <span className="font-mono text-[10px] bg-[#F4F5FE] px-2 py-0.5 rounded text-[#8C91AB]">
                      {finding.rule_code}
                    </span>
                    <span
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                        finding.status === 'Mismatch'
                          ? 'bg-amber-100 text-[#AD4E00]'
                          : finding.status === 'Expired'
                          ? 'bg-red-100 text-[#F0566A]'
                          : finding.status === 'Needs Manual Review'
                          ? 'bg-teal-100 text-[#006D75]'
                          : 'bg-emerald-100 text-[#3DBE8B]'
                      }`}
                    >
                      {finding.status}
                    </span>
                  </div>

                  <p className="text-[11px] text-[#8C91AB] leading-relaxed">
                    {finding.explanation}
                  </p>
                </div>

                {isIssue && (
                  <button
                    onClick={() => {
                      if (finding.status === 'Mismatch') handleFixMismatch();
                      else if (finding.status === 'Expired') handleFixFireNoc();
                      else {
                        setActiveNav('documents');
                        showToast(`Opened document fix for ${finding.field}`);
                      }
                    }}
                    className="px-3.5 py-1.5 bg-[#4F63E8] hover:bg-[#4458DC] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all shadow-xs cursor-pointer"
                  >
                    <span>Fix this</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Side-by-side values */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-gray-100 text-xs">
                <div className="p-2.5 bg-[#FAF8FF] rounded-lg border border-indigo-50">
                  <span className="text-[10px] text-[#8C91AB] block font-semibold mb-0.5">
                    Extracted Value in Uploaded Document:
                  </span>
                  <span className="font-bold text-[#1F2350]">{finding.extractedValue}</span>
                </div>
                <div className="p-2.5 bg-[#FAF8FF] rounded-lg border border-indigo-50">
                  <span className="text-[10px] text-[#8C91AB] block font-semibold mb-0.5">
                    Statutory Norm / Expected Value:
                  </span>
                  <span className="font-bold text-[#1F2350]">{finding.claimedValue}</span>
                </div>
              </div>

              {/* AI Suggestion */}
              <div className="p-2.5 bg-indigo-50/60 rounded-lg text-[11px] text-[#4F63E8] flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                <span>
                  <strong>AI Suggestion:</strong> {finding.suggestedAction}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
