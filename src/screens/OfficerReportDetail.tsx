import React, { useState } from 'react';
import {
  ArrowLeft,
  FileDown,
  Share2,
  FileSpreadsheet,
  AlertCircle,
  CheckCircle,
  XCircle,
  HelpCircle,
  Sparkles,
  Send,
  Users,
  Check,
  Eye
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { ConfidenceRing } from '../components/ConfidenceRing';
import { StatCard } from '../components/StatCard';
import { FindingRow } from '../components/FindingRow';
import { DocumentViewer } from '../components/DocumentViewer';
import { ValidationFinding } from '../types';

interface OfficerReportDetailProps {
  appId?: string;
  isModal?: boolean;
  onClose?: () => void;
}

export const OfficerReportDetail: React.FC<OfficerReportDetailProps> = ({
  appId,
  isModal = false,
  onClose
}) => {
  const {
    applications,
    selectedAppId,
    documents,
    sendClarification,
    requestInspection,
    flagManualReview,
    approveApplication,
    postOfficerNote,
    applyAiSuggestion,
    showToast,
    closeReportModal
  } = useApp();

  const currentAppId = appId || selectedAppId;
  const currentApp = applications.find(a => a.id === currentAppId) || applications[0];

  const [activeTab, setActiveTab] = useState<'overview' | 'findings' | 'documents' | 'infrastructure' | 'history'>('findings');
  const [expandedFindingId, setExpandedFindingId] = useState<string | null>('fnd-mismatch-doc-svit-02-Land Survey / Plot ID');
  const [officerObservation, setOfficerObservation] = useState('');

  const appDocuments = documents.filter(d => d.applicationId === currentApp.id);
  const findings = currentApp.latestRun.findings;

  const handlePostNote = () => {
    if (!officerObservation.trim()) {
      showToast('Please type an observation before saving');
      return;
    }
    postOfficerNote(currentApp.id, officerObservation);
    setOfficerObservation('');
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
    a.download = `AICTE_Validation_Report_${currentApp.applicationNumber}.csv`;
    a.click();
    showToast('Exported CSV findings report');
  };

  const handleExportPdf = () => {
    showToast('Opening print dialog for Dossier PDF export');
    window.print();
  };

  const handleQuickClarification = (finding: ValidationFinding) => {
    sendClarification(
      currentApp.id,
      `Discrepancy identified under ${finding.rule_code}: ${finding.explanation}`,
      finding.field
    );
  };

  const handleClose = () => {
    if (onClose) onClose();
    closeReportModal();
  };

  return (
    <div className={`space-y-5 ${isModal ? '' : 'p-4'}`}>
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-card-soft flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[#ECEDF7]">
        <div className="flex items-start sm:items-center gap-3.5">
          <button
            onClick={handleClose}
            className="w-9 h-9 rounded-full bg-[#EEF0FD] text-[#4F63E8] hover:bg-[#4F63E8] hover:text-white flex items-center justify-center shrink-0 transition-all shadow-xs cursor-pointer"
            title="Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-base sm:text-lg font-bold text-[#1F2350] tracking-tight">
                {currentApp.institutionName}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EBF7F3] text-[#3DBE8B]">
                AI Scanned
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-[#8C91AB] mt-1 flex-wrap">
              <span className="font-semibold text-[#1F2350]">{currentApp.applicationNumber}</span>
              <span>•</span>
              <span>{currentApp.applicationType}</span>
              <span>•</span>
              <span>{currentApp.academicYear}</span>
              <span>•</span>
              <span>Submitted: {currentApp.submittedAt}</span>
            </div>
          </div>
        </div>

        {/* Right side of header: circular progress & CTAs */}
        <div className="flex items-center gap-3 self-end sm:self-center">
          <ConfidenceRing
            score={currentApp.overallConfidence}
            label={`${currentApp.overallConfidence}%`}
            subLabel="AI Trust Score"
          />

          {/* Recommended Action Chip */}
          <div className="px-3 py-1.5 bg-[#FFF6EB] rounded-xl flex items-center gap-1.5 border border-[#FFE7BA]">
            <span className="w-2 h-2 rounded-full bg-[#F59A3C]" />
            <span className="text-xs font-bold text-[#873800]">
              {currentApp.recommendedAction}
            </span>
          </div>

          {/* Export Buttons */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExportPdf}
              className="h-8 px-2.5 bg-[#EEF0FD] hover:bg-[#4F63E8] hover:text-white text-[#4F63E8] rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
              title="Export PDF"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span>PDF</span>
            </button>
            <button
              onClick={handleExportCsv}
              className="h-8 px-2.5 bg-[#F4F5FE] hover:bg-gray-200 text-[#1F2350] rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
              title="Export CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
            <button
              onClick={() => showToast('Sharing verification link with Regional Approval Bureau')}
              className="h-8 px-2.5 bg-[#F4F5FE] hover:bg-gray-200 text-[#1F2350] rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
              title="Share Dossier"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Stat Cards Strip (5 metrics) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard
          type="Passed"
          count={currentApp.latestRun.findingsCount.passed}
          onClick={() => setActiveTab('overview')}
        />
        <StatCard
          type="Missing"
          count={currentApp.latestRun.findingsCount.missing}
          onClick={() => setActiveTab('findings')}
        />
        <StatCard
          type="Mismatch"
          count={currentApp.latestRun.findingsCount.mismatch}
          onClick={() => setActiveTab('findings')}
        />
        <StatCard
          type="Expired"
          count={currentApp.latestRun.findingsCount.expired}
          onClick={() => setActiveTab('findings')}
        />
        <StatCard
          type="Suspicious"
          count={currentApp.latestRun.findingsCount.suspicious}
          onClick={() => setActiveTab('findings')}
        />
      </div>

      {/* Two Column Layout: Main Content Area + Right Intelligence Rail */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Main 8-column workspace */}
        <div className="lg:col-span-8 space-y-4">
          {/* Tabs Navigation Strip */}
          <div className="border-b border-indigo-100/70 flex items-center gap-6 text-xs select-none bg-white px-4 rounded-xl shadow-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`py-2.5 font-bold transition-colors cursor-pointer ${
                activeTab === 'overview'
                  ? 'text-[#4F63E8] border-b-2 border-[#4F63E8]'
                  : 'text-[#8C91AB] hover:text-[#1F2350]'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('findings')}
              className={`py-2.5 font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'findings'
                  ? 'text-[#4F63E8] border-b-2 border-[#4F63E8]'
                  : 'text-[#8C91AB] hover:text-[#1F2350]'
              }`}
            >
              <span>Findings</span>
              <span className="px-1.5 py-0.2 bg-[#EEF0FD] text-[#4F63E8] text-[10px] rounded-full font-extrabold">
                {findings.length || 6}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('documents')}
              className={`py-2.5 font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'documents'
                  ? 'text-[#4F63E8] border-b-2 border-[#4F63E8]'
                  : 'text-[#8C91AB] hover:text-[#1F2350]'
              }`}
            >
              <span>Documents</span>
              <span className="text-[11px] text-[#8C91AB]">({appDocuments.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('infrastructure')}
              className={`py-2.5 font-bold transition-colors cursor-pointer ${
                activeTab === 'infrastructure'
                  ? 'text-[#4F63E8] border-b-2 border-[#4F63E8]'
                  : 'text-[#8C91AB] hover:text-[#1F2350]'
              }`}
            >
              Infrastructure
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2.5 font-bold transition-colors cursor-pointer ${
                activeTab === 'history'
                  ? 'text-[#4F63E8] border-b-2 border-[#4F63E8]'
                  : 'text-[#8C91AB] hover:text-[#1F2350]'
              }`}
            >
              History & Audit
            </button>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Summary Alert Box */}
              <div className="bg-[#FFF8E6] border border-[#FFE7BA] rounded-xl p-4 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#F59A3C] text-white flex items-center justify-center shrink-0 text-xs font-bold">
                  !
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#873800]">
                    Needs Manual Review: Address & Fire Safety Certificate
                  </h4>
                  <p className="text-[11px] text-[#AD4E00] leading-relaxed mt-0.5">
                    Spatial coordinate extraction identified an address discrepancy between Land Title Deed (Survey No. 44/A) and Municipal Sworn Affidavit (Plot No. 44/B). Additionally, Fire Safety NOC expired on 12 Mar 2026.
                  </p>
                </div>
              </div>

              {/* Side-by-Side OCR Coordinate Inspection */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#F8F9FE] p-4 rounded-xl border border-indigo-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#4F63E8] uppercase tracking-wider">
                      Spatial Coordinate Extracted Data
                    </span>
                    <span className="text-[9px] bg-emerald-100 text-[#3DBE8B] font-bold px-1.5 py-0.5 rounded">
                      QR Tamper-Proof
                    </span>
                  </div>
                  <ul className="text-[11.5px] space-y-2 text-[#1F2350]">
                    <li className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-[#8C91AB]">Land Survey No:</span>
                      <span className="font-semibold text-[#F59A3C] font-bold">Survey 44/B, Hinjawadi</span>
                    </li>
                    <li className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-[#8C91AB]">FAR Floor Space:</span>
                      <span className="font-semibold">14,200 sq.m</span>
                    </li>
                    <li className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-[#8C91AB]">Fire Safety NOC:</span>
                      <span className="font-semibold text-[#F0566A] font-bold">Expired: 12 Mar 2026</span>
                    </li>
                    <li className="flex justify-between py-1">
                      <span className="text-[#8C91AB]">Faculty Count:</span>
                      <span className="font-semibold text-[#5FD0C0] font-bold">1:18 Ratio (Norm 1:15)</span>
                    </li>
                  </ul>
                </div>

                <div className="bg-[#F8F9FE] p-4 rounded-xl border border-indigo-50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-[#1F2350] uppercase tracking-wider">
                      Institutional Sworn Declaration
                    </span>
                    <span className="text-[9px] bg-indigo-50 text-[#4F63E8] font-bold px-1.5 py-0.5 rounded">
                      Stamped & Notarized
                    </span>
                  </div>
                  <ul className="text-[11.5px] space-y-2 text-[#1F2350]">
                    <li className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-[#8C91AB]">Land Survey No:</span>
                      <span className="font-semibold text-[#1F2350] font-bold">Survey 44/A (Mismatch)</span>
                    </li>
                    <li className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-[#8C91AB]">FAR Floor Space:</span>
                      <span className="font-semibold text-[#1F2350]">14,200 sq.m</span>
                    </li>
                    <li className="flex justify-between py-1 border-b border-gray-100">
                      <span className="text-[#8C91AB]">Fire Safety NOC:</span>
                      <span className="font-semibold text-[#1F2350]">Claimed Active in Annexure</span>
                    </li>
                    <li className="flex justify-between py-1">
                      <span className="text-[#8C91AB]">Faculty Count:</span>
                      <span className="font-semibold text-[#1F2350]">Claimed 1:15 Ratio</span>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Regulatory Rule Compliance Checks */}
              <div className="bg-white rounded-xl p-4 border border-[#ECEDF7]">
                <h4 className="text-xs font-bold text-[#1F2350] mb-2.5">
                  Rule Compliance Engine Checks (APH 2026-27)
                </h4>
                <div className="space-y-2 text-[11px]">
                  <div className="flex items-center justify-between p-2.5 bg-green-50/70 rounded-lg border border-green-100">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#3DBE8B] text-white flex items-center justify-center text-[10px]">
                        ✓
                      </span>
                      <span className="font-medium text-[#1F2350]">
                        Contiguous Land Requirement (Min 2.5 Acres for Pune Urban)
                      </span>
                    </div>
                    <span className="font-bold text-[#3DBE8B]">Satisfied (3.1 Acres)</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-amber-50/70 rounded-lg border border-amber-100">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#F59A3C] text-white flex items-center justify-center text-[10px]">
                        !
                      </span>
                      <span className="font-medium text-[#1F2350]">
                        Barrier-Free Infrastructure (Ramps, Lifts & Braille Indicators)
                      </span>
                    </div>
                    <span className="font-bold text-[#F59A3C]">Needs Manual Review</span>
                  </div>

                  <div className="flex items-center justify-between p-2.5 bg-red-50/70 rounded-lg border border-red-100">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-[#F0566A] text-white flex items-center justify-center text-[10px]">
                        ✕
                      </span>
                      <span className="font-medium text-[#1F2350]">
                        Current Valid Fire Safety NOC
                      </span>
                    </div>
                    <span className="font-bold text-[#F0566A]">Certificate Expired</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FINDINGS TABLE */}
          {activeTab === 'findings' && (
            <div className="bg-white rounded-2xl shadow-card-soft overflow-hidden border border-[#ECEDF7]">
              <div className="p-3.5 bg-white border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1F2350]">
                    Scrutiny Findings & Rule Violations
                  </span>
                  <span className="text-[11px] text-[#8C91AB]">• AI Rule Base: Handbook AY 2026-27</span>
                </div>
                <span className="text-[11px] font-semibold text-[#4F63E8]">
                  Showing {findings.length} Flagged Points
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-bold uppercase tracking-wider text-[#8C91AB] bg-[#F8F9FE]">
                      <th className="py-2.5 pl-4">Finding</th>
                      <th className="py-2.5">Document / Page / Field</th>
                      <th className="py-2.5">Rule Reference</th>
                      <th className="py-2.5">Confidence</th>
                      <th className="py-2.5">Status</th>
                      <th className="py-2.5 pr-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="text-xs divide-y divide-gray-100 font-medium">
                    {findings.map(finding => (
                      <FindingRow
                        key={finding.id}
                        finding={finding}
                        isExpanded={expandedFindingId === finding.id}
                        onToggle={() =>
                          setExpandedFindingId(prev => (prev === finding.id ? null : finding.id))
                        }
                        onQuickClarification={handleQuickClarification}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DOCUMENTS & BOUNDING BOX VIEWER */}
          {activeTab === 'documents' && (
            <DocumentViewer
              onInsertToClarification={() =>
                sendClarification(
                  currentApp.id,
                  'Spatial boundary survey coordinates in Sworn Affidavit (Plot 44/B) do not match registered deed (Survey 44/A). Provide Sub-Registrar rectification.',
                  'Land Survey / Plot ID'
                )
              }
            />
          )}

          {/* TAB 4: INFRASTRUCTURE */}
          {activeTab === 'infrastructure' && (
            <div className="space-y-4">
              <div className="bg-[#FFF8E6] border border-[#FFE7BA] rounded-xl p-3.5 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-bold text-[#873800]">Infrastructure Spatial Evidence</h4>
                  <p className="text-[11px] text-[#AD4E00]">
                    NBC 2016 Part 3 GPS metadata verified. Library terminal count requires physical inspection.
                  </p>
                </div>
                <button
                  onClick={() => requestInspection(currentApp.id, 'Library digital terminal verification')}
                  className="px-3 py-1.5 bg-[#4F63E8] text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Schedule Site Inspection
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                <div className="bg-white p-3.5 rounded-xl border border-[#ECEDF7] shadow-xs">
                  <h5 className="font-bold text-xs text-[#1F2350] mb-1">Advanced Computing Labs</h5>
                  <p className="text-[11px] text-[#8C91AB] mb-2">1,240 sq.m carpet area • 14 Units Active</p>
                  <span className="text-[10px] font-bold text-[#3DBE8B] bg-emerald-50 px-2 py-0.5 rounded">
                    AI Compliant (92%)
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#ECEDF7] shadow-xs">
                  <h5 className="font-bold text-xs text-[#1F2350] mb-1">Smart Classrooms</h5>
                  <p className="text-[11px] text-[#8C91AB] mb-2">32 Rooms • 72 sq.m avg room area</p>
                  <span className="text-[10px] font-bold text-[#3DBE8B] bg-emerald-50 px-2 py-0.5 rounded">
                    AI Compliant (88%)
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#F59A3C] shadow-xs">
                  <h5 className="font-bold text-xs text-[#1F2350] mb-1">Central Library Knowledge Center</h5>
                  <p className="text-[11px] text-[#8C91AB] mb-2">610 sq.m • 18 Terminals (Norm: ≥ 20)</p>
                  <span className="text-[10px] font-bold text-[#F59A3C] bg-amber-50 px-2 py-0.5 rounded">
                    Needs Review (Norm Gap -2)
                  </span>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-[#ECEDF7] shadow-xs">
                  <h5 className="font-bold text-xs text-[#1F2350] mb-1">Hostels & Campus Amenities</h5>
                  <p className="text-[11px] text-[#8C91AB] mb-2">1,200 Capacity • 400 Dining Capacity</p>
                  <span className="text-[10px] font-bold text-[#3DBE8B] bg-emerald-50 px-2 py-0.5 rounded">
                    AI Compliant (82%)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: HISTORY & AUDIT */}
          {activeTab === 'history' && (
            <div className="bg-white rounded-xl p-4 border border-[#ECEDF7] shadow-card-soft">
              <h4 className="text-xs font-bold text-[#1F2350] mb-3">Validation Runs & Run History</h4>
              <div className="space-y-3">
                {currentApp.runHistory.map((run, idx) => (
                  <div key={run.runId} className="p-3 bg-[#F8F9FE] rounded-lg border border-indigo-50 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#4F63E8]">
                        Run #{currentApp.runHistory.length - idx} • {run.runId}
                      </span>
                      <span className="text-[10px] text-[#8C91AB]">{run.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-[#1F2350]">
                      Rule Version: {run.ruleVersion} • Confidence: {run.overallConfidence}%
                    </p>
                    <div className="flex gap-2 mt-2 text-[10px]">
                      <span className="text-[#3DBE8B] font-bold">Passed: {run.findingsCount.passed}</span>
                      <span className="text-[#F59A3C] font-bold">Mismatch: {run.findingsCount.mismatch}</span>
                      <span className="text-[#F0566A] font-bold">Expired: {run.findingsCount.expired}</span>
                      <span className="text-[#4F63E8] font-bold">Suspicious: {run.findingsCount.suspicious}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Statutory Note Banner */}
          <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-[10.5px] text-[#8C91AB] italic">
            &ldquo;AI results are decision support. Final decision rests with the authorized officer. Digital Signature Verified • Section 10(k).&rdquo;
          </div>
        </div>

        {/* Right 4-column Intelligence & Action Rail */}
        <div className="lg:col-span-4 space-y-4">
          {/* AI Suggestions Card */}
          <div className="bg-white rounded-2xl p-4 shadow-card-soft border border-[#ECEDF7] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-[#4F63E8]" />
                <span className="text-xs font-bold text-[#1F2350]">AI Decision Assist</span>
              </div>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#EEF0FD] text-[#4F63E8]">
                4 New
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-2.5 bg-[#FAF8FF] rounded-xl border border-[#EEF0FD] flex flex-col gap-1">
                <div className="flex items-start justify-between">
                  <span className="font-bold text-[#1F2350] text-[11px]">
                    Seek clarification on address mismatch
                  </span>
                  <button
                    onClick={() => applyAiSuggestion('Seek clarification on address mismatch')}
                    className="text-[10px] font-bold text-[#4F63E8] hover:underline cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-[10px] text-[#8C91AB] leading-tight">
                  Why: Land deed parcel 44/A conflicts with affidavit parcel 44/B.
                </p>
              </div>

              <div className="p-2.5 bg-[#FAF8FF] rounded-xl border border-[#EEF0FD] flex flex-col gap-1">
                <div className="flex items-start justify-between">
                  <span className="font-bold text-[#1F2350] text-[11px]">
                    Request renewed Fire NOC
                  </span>
                  <button
                    onClick={() => applyAiSuggestion('Request updated Fire NOC')}
                    className="text-[10px] font-bold text-[#4F63E8] hover:underline cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-[10px] text-[#8C91AB] leading-tight">
                  Why: Existing certificate lapsed on 12 Mar 2026.
                </p>
              </div>

              <div className="p-2.5 bg-[#FAF8FF] rounded-xl border border-[#EEF0FD] flex flex-col gap-1">
                <div className="flex items-start justify-between">
                  <span className="font-bold text-[#1F2350] text-[11px]">
                    Recommend physical inspection
                  </span>
                  <button
                    onClick={() => applyAiSuggestion('Recommend physical inspection for lab facilities')}
                    className="text-[10px] font-bold text-[#4F63E8] hover:underline cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-[10px] text-[#8C91AB] leading-tight">
                  Why: Lab equipment geo-tagged photos show low spatial confidence.
                </p>
              </div>

              <div className="p-2.5 bg-[#FAF8FF] rounded-xl border border-[#EEF0FD] flex flex-col gap-1">
                <div className="flex items-start justify-between">
                  <span className="font-bold text-[#1F2350] text-[11px]">
                    Needs manual review for Sanction Plan
                  </span>
                  <button
                    onClick={() => applyAiSuggestion('Needs manual review for Sanction Plan')}
                    className="text-[10px] font-bold text-[#4F63E8] hover:underline cursor-pointer"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-[10px] text-[#8C91AB] leading-tight">
                  Why: 73% structural similarity with Pune Institute App #04112.
                </p>
              </div>
            </div>
          </div>

          {/* Officer Final Actions */}
          <div className="bg-white rounded-2xl p-4 shadow-card-soft border border-[#ECEDF7] space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C91AB]">
              Officer Final Actions
            </span>

            <button
              onClick={() =>
                sendClarification(
                  currentApp.id,
                  'Formal regulatory inquiry issued regarding spatial coordinate discrepancies in Land Survey number and expired Fire NOC.',
                  'Address & Safety Clearance'
                )
              }
              className="w-full h-8 bg-[#4F63E8] hover:bg-[#4458DC] text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send Clarification</span>
            </button>

            <button
              onClick={() => requestInspection(currentApp.id, 'Expert committee on-site audit')}
              className="w-full h-8 bg-white hover:bg-gray-50 border border-indigo-200 text-[#4F63E8] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Request Physical Inspection</span>
            </button>

            <button
              onClick={() =>
                flagManualReview(
                  currentApp.id,
                  'Flagged for Bureau Committee Manual Verification: Land title discrepancy & structural similarity.'
                )
              }
              className="w-full h-8 bg-white hover:bg-gray-50 border border-indigo-200 text-[#1F2350] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Needs Manual Review</span>
            </button>

            <button
              onClick={() => approveApplication(currentApp.id)}
              className="w-full h-8 bg-[#EBF7F3] hover:bg-[#d6f0e7] text-[#3DBE8B] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Approve to Next Stage</span>
            </button>
          </div>

          {/* Observation Comment Box */}
          <div className="bg-white rounded-2xl p-4 shadow-card-soft border border-[#ECEDF7] space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C91AB]">
              Observation Log
            </label>
            <textarea
              rows={3}
              value={officerObservation}
              onChange={e => setOfficerObservation(e.target.value)}
              placeholder="Add observation or query note for institution..."
              className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-[#FBFBFE] focus:ring-1 focus:ring-[#4F63E8] text-[#1F2350] placeholder:text-[#8C91AB]"
            />
            <div className="flex justify-end">
              <button
                onClick={handlePostNote}
                className="px-3 py-1 bg-[#EEF0FD] hover:bg-[#4F63E8] hover:text-white text-[#4F63E8] text-[11px] font-bold rounded-lg transition-all cursor-pointer"
              >
                Post Note
              </button>
            </div>
            {currentApp.officerObservation && (
              <div className="mt-2 p-2 bg-[#F8F9FE] rounded-lg text-[10.5px] text-[#1F2350] border border-indigo-50">
                <span className="font-bold text-[#4F63E8] block mb-0.5">Recorded Observation:</span>
                {currentApp.officerObservation}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
