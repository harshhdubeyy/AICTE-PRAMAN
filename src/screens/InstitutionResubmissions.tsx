import React, { useState } from 'react';
import { RefreshCw, UploadCloud, CheckCircle2, FileText, ArrowRight, History, GitCommit } from 'lucide-react';
import { useApp } from '../store/AppContext';

export const InstitutionResubmissions: React.FC = () => {
  const { documents, resubmitDocument, applications, showToast } = useApp();
  const [selectedDocId, setSelectedDocId] = useState<string>('doc-svit-02');
  const [amendedAddress, setAmendedAddress] = useState('Survey No. 44/A, Maan Road, Mulshi, Pune - 411057');
  const [isProcessing, setIsProcessing] = useState(false);

  const svitDocs = documents.filter(d => d.applicationId === 'app-1');
  const activeDoc = svitDocs.find(d => d.id === selectedDocId) || svitDocs[0];
  const app = applications.find(a => a.id === 'app-1');

  const handleResubmit = () => {
    setIsProcessing(true);
    setTimeout(() => {
      resubmitDocument('app-1', activeDoc.id, [
        { fieldName: 'Land Survey / Plot ID', newValue: amendedAddress }
      ]);
      setIsProcessing(false);
      showToast(`Successfully uploaded amended ${activeDoc.name}. Validation rules re-executed!`);
    }, 800);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-card-soft border border-[#ECEDF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF0FD] text-[#4F63E8] flex items-center justify-center">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#1F2350]">Document Rectification & Resubmission Center</h1>
            <p className="text-[11px] text-[#8C91AB]">
              Replace deficient documents with revised notary seals. Re-validation updates only affected rule findings and appends to run history.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Document Selector & Resubmission Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-5 border border-[#ECEDF7] shadow-card-soft space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1F2350] mb-1">
              Select Deficient Document to Replace:
            </label>
            <select
              value={selectedDocId}
              onChange={e => setSelectedDocId(e.target.value)}
              className="w-full h-10 px-3 bg-[#F4F5FE] border border-gray-200 rounded-xl text-xs font-semibold text-[#1F2350] focus:ring-1 focus:ring-[#4F63E8] cursor-pointer"
            >
              {svitDocs.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.version}) - Status: {d.status}
                </option>
              ))}
            </select>
          </div>

          {activeDoc && (
            <div className="p-3 bg-[#FAF8FF] rounded-xl border border-indigo-50 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#8C91AB]">Current Version in Docket:</span>
                <span className="font-bold text-[#4F63E8]">{activeDoc.version}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C91AB]">Last Upload Timestamp:</span>
                <span className="font-semibold text-[#1F2350]">{activeDoc.uploadedAt}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C91AB]">Current Validation Status:</span>
                <span className="font-bold text-[#F59A3C]">{activeDoc.status}</span>
              </div>
            </div>
          )}

          {/* Replacement Dropzone */}
          <div className="border-2 border-dashed border-[#4F63E8]/30 rounded-2xl p-5 text-center bg-[#F8F9FE] space-y-2">
            <UploadCloud className="w-8 h-8 text-[#4F63E8] mx-auto" />
            <h4 className="text-xs font-bold text-[#1F2350]">Upload Rectified Sworn Notary PDF</h4>
            <p className="text-[10.5px] text-[#8C91AB]">
              Must include Sub-Registrar stamp or attested endorsement resolving the discrepancy
            </p>
            <div>
              <input
                type="text"
                value={amendedAddress}
                onChange={e => setAmendedAddress(e.target.value)}
                placeholder="Amended Survey Number / Value"
                className="w-full max-w-md h-8 px-3 text-xs bg-white border border-gray-200 rounded-lg text-[#1F2350] mt-2 font-medium"
              />
            </div>
          </div>

          <button
            onClick={handleResubmit}
            disabled={isProcessing}
            className="w-full h-10 bg-[#4F63E8] hover:bg-[#4458DC] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isProcessing ? 'animate-spin' : ''}`} />
            <span>{isProcessing ? 'Re-running Rules Engine...' : 'Resubmit & Trigger Auto-Validation'}</span>
          </button>
        </div>

        {/* Right: Version Timeline & Run History */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-5 border border-[#ECEDF7] shadow-card-soft space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <History className="w-4 h-4 text-[#4F63E8]" />
            <h3 className="font-bold text-xs text-[#1F2350]">Document Version History & Runs</h3>
          </div>

          {/* Version timeline */}
          <div className="relative pl-6 space-y-4 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
            <div className="relative">
              <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-[#3DBE8B] ring-4 ring-white" />
              <div className="text-xs">
                <span className="font-bold text-[#1F2350] block">v3.1 (Latest Submission)</span>
                <span className="text-[10px] text-[#8C91AB] block">14 Oct 2026, 11:05 IST</span>
                <p className="text-[11px] text-[#F59A3C] font-semibold mt-0.5">
                  Mismatch flagged: Plot 44/B vs Title Deed 44/A
                </p>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-gray-300 ring-4 ring-white" />
              <div className="text-xs">
                <span className="font-bold text-[#8C91AB] block">v2.0 (Superseded)</span>
                <span className="text-[10px] text-[#8C91AB] block">10 Oct 2026, 14:20 IST</span>
                <p className="text-[11px] text-[#8C91AB] mt-0.5">
                  Missing town planning seal coordinate.
                </p>
              </div>
            </div>

            <div className="relative">
              <span className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-gray-300 ring-4 ring-white" />
              <div className="text-xs">
                <span className="font-bold text-[#8C91AB] block">v1.0 (Initial Draft)</span>
                <span className="text-[10px] text-[#8C91AB] block">05 Oct 2026, 09:10 IST</span>
                <p className="text-[11px] text-[#8C91AB] mt-0.5">
                  Draft affidavit without municipal stamp.
                </p>
              </div>
            </div>
          </div>

          {/* Previous Runs Summary */}
          {app && (
            <div className="pt-3 border-t border-gray-100">
              <span className="text-[11px] font-bold text-[#1F2350] block mb-2">
                Validation Engine Run History ({app.runHistory.length} Runs recorded)
              </span>
              <div className="space-y-1.5 max-h-36 overflow-y-auto text-[11px]">
                {app.runHistory.map((run, i) => (
                  <div key={run.runId} className="p-2 bg-[#F8F9FE] rounded-lg border border-indigo-50 flex justify-between items-center">
                    <div>
                      <span className="font-bold text-[#4F63E8]">Run #{app.runHistory.length - i}</span>
                      <span className="text-[10px] text-[#8C91AB] block">{run.timestamp.substring(0, 16)}</span>
                    </div>
                    <span className="font-bold text-[#1F2350]">{run.overallConfidence}% Match</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
