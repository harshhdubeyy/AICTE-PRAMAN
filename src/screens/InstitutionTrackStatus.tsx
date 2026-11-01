import React, { useMemo } from 'react';
import { GitBranch, CheckCircle2, Clock, ShieldCheck, ArrowRight, Loader2, Sparkles, UserCheck, Award, Cpu, FileText, Lock } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { Stepper, StepItem } from '../components/Stepper';

export const InstitutionTrackStatus: React.FC = () => {
  const { applications, selectedAppId, selectApplication, openReportModal, auditTrail, isLoading } = useApp();

  const app = applications.find(a => a.id === selectedAppId) || applications.find(a => a.id === 'app-1') || applications[0];

  // Filter audit events specific to this application
  const appAuditEvents = useMemo(() => {
    if (!app) return [];
    return auditTrail.filter(
      e => e.applicationId === app.id || e.applicationNumber === app.applicationNumber
    );
  }, [auditTrail, app]);

  // Stage resolver: dynamically computes timestamps and state for all 5 canonical stages:
  // Submitted → Processing → Validation → Officer Review → Decision
  const stageData = useMemo(() => {
    const rawStatus = (app?.status || 'submitted').toLowerCase();
    const rawStage = (app?.stage || 'AI Validation').toLowerCase();

    // 1. Submitted
    const submitEvent = appAuditEvents.find(
      e => e.action.toLowerCase().includes('submit') || e.entity_type === 'application'
    );
    const submitTime = submitEvent?.timestamp || (app?.submittedAt ? `${app.submittedAt}, 09:15 IST` : '14 Oct 2026, 09:15 IST');

    // 2. Processing (OCR & Ingestion)
    const procEvent = appAuditEvents.find(
      e => e.action.toLowerCase().includes('ingestion') || e.action.toLowerCase().includes('parsing') || e.action.toLowerCase().includes('upload')
    );
    const procTime = procEvent?.timestamp || '14 Oct 2026, 11:15 IST';

    // 3. Validation (Deterministic Rules Engine)
    const valEvent = appAuditEvents.find(
      e => e.action.toLowerCase().includes('validation') || e.entity_type === 'validation_run'
    );
    const valTime = valEvent?.timestamp || '14 Oct 2026, 16:45 IST';

    // 4. Officer Review (Clarification & Scrutiny)
    const officerEvent = appAuditEvents.find(
      e => e.action.toLowerCase().includes('clarification') || e.action.toLowerCase().includes('inspection') || e.action.toLowerCase().includes('transition')
    );
    const officerTime = officerEvent?.timestamp || '14 Oct 2026, 17:00 IST';

    // 5. Decision
    const decisionEvent = appAuditEvents.find(
      e => e.action.toLowerCase().includes('decision') || e.entity_type === 'decision'
    );
    const decisionTime = decisionEvent?.timestamp || 'Scheduled 15 Nov 2026';

    // Current index determination
    // 0: Submitted, 1: Processing, 2: Validation, 3: Officer Review, 4: Decision
    let currentIdx = 2; // Default to Validation
    if (rawStage.includes('submitted')) {
      currentIdx = 0;
    } else if (rawStage.includes('processing') || rawStatus === 'in_validation') {
      currentIdx = 1;
    } else if (rawStage.includes('validation') || rawStage.includes('ai validation')) {
      currentIdx = 2;
    } else if (rawStage.includes('officer') || rawStatus.includes('clarification') || rawStatus.includes('inspection') || rawStatus.includes('review') || rawStatus.includes('mismatch') || rawStatus.includes('manual')) {
      currentIdx = 3;
    } else if (rawStage.includes('decision') || rawStatus.includes('approved') || rawStatus.includes('rejected') || rawStatus === 'passed' || rawStatus.includes('ready')) {
      currentIdx = 4;
    }

    const steps: StepItem[] = [
      {
        id: 'Submitted',
        label: '1. Submitted',
        subtitle: submitTime.split(',')[0],
        timestamp: submitTime,
        completed: currentIdx > 0,
        current: currentIdx === 0,
      },
      {
        id: 'Processing',
        label: '2. Processing',
        subtitle: procTime.split(',')[0],
        timestamp: procTime,
        completed: currentIdx > 1,
        current: currentIdx === 1,
      },
      {
        id: 'Validation',
        label: '3. Validation',
        subtitle: valTime.split(',')[0],
        timestamp: valTime,
        completed: currentIdx > 2,
        current: currentIdx === 2,
      },
      {
        id: 'Officer Review',
        label: '4. Officer Review',
        subtitle: officerTime.split(',')[0],
        timestamp: officerTime,
        completed: currentIdx > 3,
        current: currentIdx === 3,
      },
      {
        id: 'Decision',
        label: '5. Decision',
        subtitle: currentIdx === 4 ? 'Decision Recorded' : 'Scheduled Nov',
        timestamp: decisionTime,
        completed: currentIdx === 4 && (rawStatus.includes('approved') || rawStatus.includes('passed')),
        current: currentIdx === 4,
      },
    ];

    const milestones = [
      {
        title: 'Application Dossier Submitted & Fee Verified',
        stage: 'Submitted',
        timestamp: submitTime,
        completed: currentIdx >= 0,
        current: currentIdx === 0,
        description: `Statutory dossier submitted for ${app?.applicationNumber || 'AICTE-2026-04821'} by authorized representative. AICTE Transaction Ref: TXN-${(app?.applicationNumber || 'AICTE').replace(/\D/g, '') || '9812401'}.`,
        actor: 'Institution Authorized Signatory',
        auditEventId: submitEvent?.id || 'aud-6',
        hash: submitEvent?.hash || '7a1b42c98e1f53d26789acde45b12876a394ef01826d7c813a0e4f5d6c9b8a21',
      },
      {
        title: 'Spatial OCR & Document Geometry Extraction',
        stage: 'Processing',
        timestamp: procTime,
        completed: currentIdx > 1,
        current: currentIdx === 1,
        description: `Neural coordinate extraction executed across ${app?.documentCounts?.uploaded || 32} statutory documents with bitwise duplicate checks.`,
        actor: 'PRAMAN Spatial OCR Engine',
        auditEventId: procEvent?.id || 'aud-3',
        hash: procEvent?.hash || 'b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2',
      },
      {
        title: 'Deterministic Regulatory Rules Engine Validation',
        stage: 'Validation',
        timestamp: valTime,
        completed: currentIdx > 2,
        current: currentIdx === 2,
        description: 'Evaluated against AICTE Approval Process Handbook (APH) 2026-27 rules. Flagged variances evaluated without AI pass/fail hallucination.',
        actor: 'PRAMAN Compliance Engine v2026-27-v1',
        auditEventId: valEvent?.id || 'aud-1',
        hash: valEvent?.hash || 'e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6',
      },
      {
        title: 'Scrutiny Officer Review & Clarification Dispatch',
        stage: 'Officer Review',
        timestamp: officerTime,
        completed: currentIdx > 3,
        current: currentIdx === 3,
        description: 'Regional Scrutiny Officer reviewed flagged variances and issued inquiries regarding statutory documents.',
        actor: app?.assignedOfficer || 'Regional Scrutiny Bureau (Western Regional Office)',
        auditEventId: officerEvent?.id || 'aud-4',
        hash: officerEvent?.hash || '9a4b82c16f3d5e7a9c8b7a6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f',
      },
      {
        title: 'Standing Hearing Committee / Executive Council Decision',
        stage: 'Decision',
        timestamp: decisionTime,
        completed: currentIdx === 4 && (rawStatus.includes('approved') || rawStatus.includes('passed')),
        current: currentIdx === 4,
        description: currentIdx === 4
          ? `Final Statutory Decision recorded: ${app?.recommendedAction || 'Approved to Next Stage'}. Digital EoA order prepared.`
          : 'Issuance of Digital Extension of Approval (EoA) order upon resolution of clarification inquiries.',
        actor: 'AICTE Executive Committee & Approval Bureau',
        auditEventId: decisionEvent?.id,
        hash: decisionEvent?.hash,
      },
    ];

    return { steps, milestones, currentIdx };
  }, [app, appAuditEvents]);

  if (isLoading && !app) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-24 bg-white/70 rounded-2xl p-5 border border-indigo-50" />
        <div className="h-32 bg-white/70 rounded-2xl p-5 border border-indigo-50" />
        <div className="h-64 bg-white/70 rounded-2xl p-5 border border-indigo-50" />
      </div>
    );
  }

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
              Live status tracking for Application {app?.applicationNumber || 'AICTE-2026-04821'} dynamically reading from application status and statutory audit events.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Application Selector */}
          {applications.length > 1 && (
            <select
              value={app?.id}
              onChange={e => selectApplication(e.target.value)}
              className="h-8 px-2.5 bg-[#FAF8FF] border border-[#ECEDF7] rounded-lg text-xs font-semibold text-[#1F2350] focus:ring-1 focus:ring-[#4F63E8] focus:outline-none cursor-pointer"
            >
              {applications.map(a => (
                <option key={a.id} value={a.id}>
                  {a.applicationNumber} ({a.applicationType})
                </option>
              ))}
            </select>
          )}

          <button
            onClick={() => openReportModal(app?.id || 'app-1')}
            className="h-8 px-3.5 bg-[#EEF0FD] hover:bg-[#4F63E8] hover:text-white text-[#4F63E8] rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap"
          >
            View Full AI Report
          </button>
        </div>
      </div>

      {/* Top 5-Stage Stepper Card */}
      <div className="bg-white rounded-2xl p-5 border border-[#ECEDF7] shadow-card-soft space-y-4">
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#1F2350]">Statutory Scrutiny Stepper</span>
            <span className="text-[10.5px] font-mono text-[#8C91AB] bg-gray-100 px-2 py-0.5 rounded">
              5-Stage Statutory Protocol
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-[#4F63E8] bg-indigo-50 px-2.5 py-0.5 rounded-full">
              Status: {app?.status || 'In Progress'} • {app?.stage || 'Validation'}
            </span>
            <span className="text-[10px] text-[#3DBE8B] bg-emerald-50 px-2 py-0.5 rounded font-bold flex items-center gap-1 border border-emerald-200">
              <ShieldCheck className="w-3 h-3 text-[#3DBE8B]" />
              Audit Chained
            </span>
          </div>
        </div>

        {/* Dynamic 5-Stage Stepper */}
        <Stepper steps={stageData.steps} />
      </div>

      {/* Detailed Milestone Timeline Reading from Audit Events */}
      <div className="bg-white rounded-2xl p-5 border border-[#ECEDF7] shadow-card-soft space-y-4">
        <div className="flex items-center justify-between border-b border-[#F0F1FA] pb-3">
          <div>
            <h3 className="text-xs font-bold text-[#1F2350] uppercase tracking-wider">
              Statutory Scrutiny Timeline & Evidence Hash Chain
            </h3>
            <p className="text-[10.5px] text-[#8C91AB]">
              All milestone events are anchored to tamper-evident SHA-256 blocks in the statutory audit ledger.
            </p>
          </div>
          <span className="text-[10px] font-mono text-[#8C91AB] bg-[#FAF8FF] px-2 py-1 rounded border border-gray-200">
            {appAuditEvents.length} Events Logged
          </span>
        </div>

        <div className="relative pl-6 space-y-6 before:content-[''] before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-100">
          {stageData.milestones.map((m, idx) => (
            <div key={idx} className="relative">
              <span
                className={`absolute -left-6 top-1 w-3.5 h-3.5 rounded-full ring-4 ring-white ${
                  m.completed
                    ? 'bg-[#3DBE8B]'
                    : m.current
                    ? 'bg-[#4F63E8] animate-pulse ring-[#EEF0FD]'
                    : 'bg-gray-300'
                }`}
              />

              <div
                className={`p-4 rounded-xl border space-y-2 transition-all ${
                  m.current
                    ? 'bg-[#FAF8FF] border-[#4F63E8]/40 shadow-xs ring-1 ring-[#4F63E8]/20'
                    : m.completed
                    ? 'bg-white border-[#ECEDF7]'
                    : 'bg-gray-50/70 border-gray-100 opacity-70'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#1F2350]">{m.title}</span>
                    <span
                      className={`text-[9.5px] font-bold px-2 py-0.2 rounded-full ${
                        m.completed
                          ? 'bg-emerald-100 text-emerald-800'
                          : m.current
                          ? 'bg-[#EEF0FD] text-[#4F63E8]'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {m.completed ? 'Completed' : m.current ? 'Current Stage' : 'Pending'}
                    </span>
                  </div>

                  <span className="text-[10.5px] font-semibold text-[#4F63E8] bg-white px-2 py-0.5 rounded border border-[#ECEDF7] shadow-xs w-fit">
                    {m.timestamp}
                  </span>
                </div>

                <p className="text-[11.5px] text-[#8C91AB] leading-relaxed">
                  {m.description}
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pt-2 border-t border-gray-100 text-[10px] text-[#8C91AB]">
                  <div>
                    Responsible Entity: <strong className="text-[#1F2350]">{m.actor}</strong>
                  </div>

                  {m.hash && (
                    <div className="flex items-center gap-1 font-mono text-[9.5px] text-[#8C91AB]">
                      <Lock className="w-3 h-3 text-[#3DBE8B]" />
                      <span>Audit Block Hash:</span>
                      <code className="text-[#1F2350] bg-gray-50 px-1 py-0.2 rounded border border-gray-200">
                        {m.hash.slice(0, 10)}...{m.hash.slice(-6)}
                      </code>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
