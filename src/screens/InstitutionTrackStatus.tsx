import React from 'react';
import { GitBranch, CheckCircle2, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Stepper } from '../components/Stepper';

export const InstitutionTrackStatus: React.FC = () => {
  const { applications, openReportModal, showToast } = useApp();
  const app = applications.find(a => a.id === 'app-1') || applications[0];

  const milestones = [
    {
      title: 'Application Dossier Submitted & Fee Verified',
      timestamp: '14 Oct 2026, 09:15 IST',
      completed: true,
      description: 'Transaction ID: TXN-AICTE-9812401. 32 statutory documents submitted to Western Regional Office.',
      actor: 'SVIT Pune Registrar'
    },
    {
      title: 'Spatial OCR & Automated Neural Scrutiny',
      timestamp: '14 Oct 2026, 16:45 IST',
      completed: true,
      description: 'Document coordinates checked against APH 2026-27 rules. 3 discrepancies detected requiring institutional response.',
      actor: 'PRAMAN Compliance Engine v4.11.2'
    },
    {
      title: 'Scrutiny Officer Review & Clarification Dispatch',
      timestamp: '14 Oct 2026, 17:00 IST',
      completed: false,
      current: true,
      description: 'Officer Sara Abraham reviewed flagged variances and issued inquiry #qry-1 regarding Land Survey 44/A vs 44/B.',
      actor: 'Regional Officer (Western Bureau)'
    },
    {
      title: 'Standing Hearing Committee / Final Decision',
      timestamp: 'Scheduled 15 Nov 2026',
      completed: false,
      description: 'Final issuance of Digital Extension of Approval (EoA) order upon clarification resolution.',
      actor: 'AICTE Executive Committee'
    }
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-card-soft border border-[#ECEDF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF0FD] text-[#4F63E8] flex items-center justify-center">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#1F2350]">Application Lifecycle & Stage Tracking</h1>
            <p className="text-[11px] text-[#8C91AB]">
              Live status tracking for Application {app.applicationNumber} across AI validation, committee scrutiny, and decision.
            </p>
          </div>
        </div>

        <button
          onClick={() => openReportModal('app-1')}
          className="h-8 px-3.5 bg-[#EEF0FD] hover:bg-[#4F63E8] hover:text-white text-[#4F63E8] rounded-lg text-xs font-bold transition-all cursor-pointer"
        >
          View Full AI Report
        </button>
      </div>

      {/* Top Stepper Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#ECEDF7] shadow-card-soft">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-bold text-[#1F2350]">Scrutiny Stepper</span>
          <span className="text-xs font-bold text-[#4F63E8] bg-indigo-50 px-2.5 py-0.5 rounded-full">
            Stage 2: AI Validation & Officer Inquiry
          </span>
        </div>
        <Stepper currentStage="AI Validation" />
      </div>

      {/* Detailed Milestone Timeline with Timestamps */}
      <div className="bg-white rounded-2xl p-5 border border-[#ECEDF7] shadow-card-soft space-y-4">
        <h3 className="text-xs font-bold text-[#1F2350] uppercase tracking-wider">
          Statutory Scrutiny Timeline & Event Logs
        </h3>

        <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
          {milestones.map((m, idx) => (
            <div key={idx} className="relative">
              <span
                className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full ring-4 ring-white ${
                  m.completed
                    ? 'bg-[#3DBE8B]'
                    : m.current
                    ? 'bg-[#4F63E8] animate-pulse'
                    : 'bg-gray-300'
                }`}
              />

              <div className="bg-[#FAF8FF] p-3.5 rounded-xl border border-indigo-50 space-y-1">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                  <span className="font-bold text-[#1F2350]">{m.title}</span>
                  <span className="text-[10.5px] font-semibold text-[#4F63E8] bg-white px-2 py-0.5 rounded shadow-xs w-fit">
                    {m.timestamp}
                  </span>
                </div>
                <p className="text-[11.5px] text-[#8C91AB] leading-relaxed">{m.description}</p>
                <div className="text-[10px] text-[#8C91AB] pt-1 border-t border-gray-100">
                  Responsible Entity: <strong className="text-[#1F2350]">{m.actor}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
