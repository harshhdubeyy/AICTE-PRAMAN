import React from 'react';
import { Award, CheckCircle, ShieldCheck, Download, ExternalLink } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { StatusDot } from '../components/StatusDot';

export const OfficerDecisions: React.FC = () => {
  const { applications, approveApplication, showToast, openReportModal } = useApp();

  const decisionApps = applications.filter(
    a => a.status === 'Ready for Decision' || a.status === 'Passed' || a.stage === 'Final Decision'
  );

  const handleDownloadApprovalLetter = (appName: string, appNum: string) => {
    showToast(`Downloading Digital Approval Letter (EoA) for ${appNum}`);
    window.print();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-card-soft border border-[#ECEDF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF0FD] text-[#4F63E8] flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#1F2350]">Executive Committee Final Decision Docket</h1>
            <p className="text-[11px] text-[#8C91AB]">
              Final statutory approval orders, digital cryptographic signatures, and official Extension of Approval letters.
            </p>
          </div>
        </div>

        <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-[#3DBE8B] rounded-full border border-emerald-200 flex items-center gap-1.5 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4" />
          <span>PKI Signature Ready</span>
        </span>
      </div>

      {/* Decisions List */}
      <div className="space-y-3">
        {decisionApps.map(app => (
          <div
            key={app.id}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-[#ECEDF7] shadow-card-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-sm text-[#1F2350]">{app.institutionName}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-[#4F63E8]">
                  {app.applicationType}
                </span>
                <StatusDot status={app.status} />
              </div>

              <div className="flex items-center gap-2 text-xs text-[#8C91AB]">
                <span className="font-semibold text-[#1F2350]">{app.applicationNumber}</span>
                <span>•</span>
                <span>Academic Year: {app.academicYear}</span>
                <span>•</span>
                <span>AI Scrutiny Trust Score: <strong className="text-[#3DBE8B]">{app.overallConfidence}%</strong></span>
              </div>

              <p className="text-[11px] text-[#1F2350] bg-gray-50 p-2 rounded-lg border border-gray-100 max-w-xl">
                {app.officerObservation || 'All statutory document coordinates and norm ratios fulfilled without remaining discrepancies.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => openReportModal(app.id)}
                className="h-9 px-3 bg-[#EEF0FD] hover:bg-gray-100 text-[#4F63E8] rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>View Dossier</span>
              </button>

              <button
                onClick={() => handleDownloadApprovalLetter(app.institutionName, app.applicationNumber)}
                className="h-9 px-3.5 bg-white hover:bg-gray-50 border border-[#ECEDF7] text-[#1F2350] rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download EoA</span>
              </button>

              {app.status !== 'Passed' && (
                <button
                  onClick={() => approveApplication(app.id, 'Formally approved by Executive Committee.')}
                  className="h-9 px-4 bg-[#4F63E8] hover:bg-[#4458DC] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Sign & Grant EoA</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
