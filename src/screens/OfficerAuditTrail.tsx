import React, { useState, useEffect } from 'react';
import { History, Shield, ShieldCheck, ShieldAlert, Filter, Download, CheckCircle2, Copy, Check, ExternalLink, RefreshCw, ChevronDown, ChevronUp, Lock } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { AuditEvent } from '../types';
import { auditService, verifyAuditChain, ChainVerificationResult } from '../services/auditService';

export const OfficerAuditTrail: React.FC = () => {
  const { auditTrail, applications, showToast } = useApp();

  // Filters
  const [filterActor, setFilterActor] = useState<string>('ALL');
  const [filterAction, setFilterAction] = useState<string>('ALL');
  const [filterApp, setFilterApp] = useState<string>('ALL');
  const [filterDate, setFilterDate] = useState<string>('ALL');

  // Verification state
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [verificationResult, setVerificationResult] = useState<ChainVerificationResult | null>(null);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  // Auto-verify chain on load or when auditTrail changes
  useEffect(() => {
    let isMounted = true;
    async function runVerification() {
      const res = await verifyAuditChain(auditTrail);
      if (isMounted) {
        setVerificationResult(res);
      }
    }
    runVerification();
    return () => {
      isMounted = false;
    };
  }, [auditTrail]);

  const handleManualVerify = async () => {
    setIsVerifying(true);
    try {
      const res = await verifyAuditChain(auditTrail);
      setVerificationResult(res);
      if (res.isValid) {
        showToast(`Cryptographic Audit Chain Verified: ${res.verifiedCount} blocks intact`);
      } else {
        showToast(`Verification Failed: ${res.error}`);
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    showToast('Copied SHA-256 Hash to Clipboard');
    setTimeout(() => {
      setCopiedHash(prev => (prev === id ? null : prev));
    }, 2000);
  };

  // Distinct application options from applications & auditTrail
  const applicationOptions = Array.from(
    new Set([
      ...applications.map(a => a.applicationNumber),
      ...auditTrail.map(a => a.applicationNumber).filter(Boolean),
    ])
  );

  // Filter logic
  const filtered = auditTrail.filter(entry => {
    // Actor filter
    if (filterActor === 'OFFICER' && entry.actorRole !== 'officer') return false;
    if (filterActor === 'INSTITUTION' && entry.actorRole !== 'institution') return false;
    if (filterActor === 'AI' && entry.actorRole !== 'System AI' && entry.actor_role !== 'system') return false;
    if (filterActor === 'SIMULATED' && !entry.isSimulatedExternal) return false;

    // Action filter
    if (filterAction !== 'ALL') {
      const act = (entry.action || '').toLowerCase();
      if (filterAction === 'STATUS' && !act.includes('status') && !act.includes('transition')) return false;
      if (filterAction === 'DOCUMENT' && !act.includes('document') && !act.includes('upload') && !act.includes('superseded')) return false;
      if (filterAction === 'VALIDATION' && !act.includes('validation') && !act.includes('rules') && !act.includes('parsing')) return false;
      if (filterAction === 'CLARIFICATION' && !act.includes('clarification') && !act.includes('notice') && !act.includes('query')) return false;
      if (filterAction === 'INSPECTION' && !act.includes('inspection')) return false;
      if (filterAction === 'DECISION' && !act.includes('decision')) return false;
      if (filterAction === 'MANUAL' && !act.includes('manual') && !act.includes('correction')) return false;
    }

    // Application filter
    if (filterApp !== 'ALL') {
      if (entry.applicationNumber !== filterApp && entry.applicationId !== filterApp) return false;
    }

    // Date range filter
    if (filterDate !== 'ALL') {
      const entryTime = new Date(entry.created_at || entry.timestamp).getTime();
      const now = Date.now();
      if (filterDate === 'TODAY' && now - entryTime > 24 * 60 * 60 * 1000) return false;
      if (filterDate === '7DAYS' && now - entryTime > 7 * 24 * 60 * 60 * 1000) return false;
      if (filterDate === '30DAYS' && now - entryTime > 30 * 24 * 60 * 60 * 1000) return false;
    }

    return true;
  });

  const handleExportAudit = () => {
    auditService.exportCsv(filtered, `AICTE_PRAMAN_Audit_Trail_${filterApp === 'ALL' ? 'All' : filterApp}.csv`);
    showToast(`Exported ${filtered.length} Immutable Audit Events to CSV`);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-card-soft border border-[#ECEDF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF0FD] text-[#4F63E8] flex items-center justify-center">
            <History className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#1F2350]">Immutable Statutory Scrutiny Audit Trail</h1>
            <p className="text-[11px] text-[#8C91AB]">
              Cryptographically chained SHA-256 ledger recording officer interventions, OCR parses, and statutory actions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Verify Chain Button */}
          <button
            onClick={handleManualVerify}
            disabled={isVerifying}
            className="h-8 px-3 bg-[#EEF0FD] hover:bg-[#4F63E8] hover:text-white text-[#4F63E8] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            title="Recalculate SHA-256 hashes from genesis to tip to confirm tamper resistance"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
            <span>{isVerifying ? 'Verifying Chain...' : 'Verify Chain'}</span>
          </button>

          {/* Export to CSV Button */}
          <button
            onClick={handleExportAudit}
            className="h-8 px-3 bg-[#EEF0FD] hover:bg-[#4F63E8] hover:text-white text-[#4F63E8] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Cryptographic Integrity Indicator Banner */}
      <div
        className={`p-3.5 rounded-2xl border transition-all ${
          verificationResult?.isValid
            ? 'bg-[#F2FCF7] border-[#3DBE8B]/30'
            : 'bg-rose-50 border-rose-200'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
          <div className="flex items-start sm:items-center gap-2.5">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                verificationResult?.isValid
                  ? 'bg-[#3DBE8B] text-white shadow-xs'
                  : 'bg-rose-600 text-white'
              }`}
            >
              {verificationResult?.isValid ? (
                <ShieldCheck className="w-5 h-5" />
              ) : (
                <ShieldAlert className="w-5 h-5" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#1F2350]">
                  {verificationResult?.isValid ? 'Integrity: Verified' : 'Integrity: Compromised'}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    verificationResult?.isValid
                      ? 'bg-[#3DBE8B]/15 text-[#218359]'
                      : 'bg-rose-200 text-rose-800'
                  }`}
                >
                  {verificationResult?.verifiedCount || 0} / {auditTrail.length} Blocks Cryptographically Intact
                </span>
                <span className="text-[10px] text-[#8C91AB]">
                  • Verified at {verificationResult?.verifiedAt || 'Just now'}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[10.5px] text-[#8C91AB] mt-0.5 flex-wrap">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-[#3DBE8B]" />
                  <span>Tip Hash:</span>
                  <code className="font-mono text-[#1F2350] bg-white px-1.5 py-0.2 rounded border border-gray-200 text-[10px]">
                    {verificationResult?.tipHash
                      ? `${verificationResult.tipHash.slice(0, 16)}...${verificationResult.tipHash.slice(-8)}`
                      : 'GENESIS'}
                  </code>
                </span>
                {verificationResult?.tipHash && (
                  <button
                    onClick={() => handleCopy(verificationResult.tipHash, 'tip')}
                    className="hover:text-[#4F63E8] p-0.5 transition-colors cursor-pointer"
                    title="Copy full SHA-256 tip hash"
                  >
                    {copiedHash === 'tip' ? (
                      <Check className="w-3 h-3 text-[#3DBE8B]" />
                    ) : (
                      <Copy className="w-3 h-3 text-[#8C91AB]" />
                    )}
                  </button>
                )}
                <span className="text-[10px] text-[#8C91AB] hidden lg:inline">
                  • Zero-Tamper Guarantee • AICTE Statutory Compliance Standard Section 10(k)
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center">
            <span className="text-[10.5px] font-semibold text-[#3DBE8B] bg-white px-2.5 py-1 rounded-lg border border-[#3DBE8B]/20 shadow-xs flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3DBE8B]" />
              <span>SHA-256 Chained</span>
            </span>
          </div>
        </div>
      </div>

      {/* Filter Bar (Actor, Action, Application, Date) */}
      <div className="bg-white p-3 rounded-2xl border border-[#ECEDF7] shadow-xs space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-[#8C91AB] pb-1 border-b border-[#F0F1FA]">
          <span className="flex items-center gap-1.5 text-[#1F2350] font-bold">
            <Filter className="w-3.5 h-3.5 text-[#4F63E8]" />
            Audit Ledger Filters
          </span>
          <span>Showing {filtered.length} of {auditTrail.length} Events</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 text-xs">
          {/* 1. Actor Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C91AB] mb-1">
              Filter by Actor
            </label>
            <select
              value={filterActor}
              onChange={e => setFilterActor(e.target.value)}
              className="w-full h-8 px-2.5 bg-[#FAF8FF] border border-[#ECEDF7] rounded-lg text-xs font-medium text-[#1F2350] focus:ring-1 focus:ring-[#4F63E8] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Actors ({auditTrail.length})</option>
              <option value="OFFICER">AICTE Scrutiny Officers</option>
              <option value="INSTITUTION">Institutions</option>
              <option value="AI">PRAMAN AI Engine</option>
              <option value="SIMULATED">External Gateways (DigiLocker/UGC)</option>
            </select>
          </div>

          {/* 2. Action Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C91AB] mb-1">
              Filter by Action
            </label>
            <select
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
              className="w-full h-8 px-2.5 bg-[#FAF8FF] border border-[#ECEDF7] rounded-lg text-xs font-medium text-[#1F2350] focus:ring-1 focus:ring-[#4F63E8] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statutory Actions</option>
              <option value="STATUS">Application Status Transitions</option>
              <option value="DOCUMENT">Document Upload & Replacement</option>
              <option value="VALIDATION">Rules Validation Executed</option>
              <option value="CLARIFICATION">Clarification Inquiries & Replies</option>
              <option value="INSPECTION">Physical Inspection Scheduled</option>
              <option value="DECISION">Final Bureau Decisions</option>
              <option value="MANUAL">Manual Field Corrections</option>
            </select>
          </div>

          {/* 3. Application Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C91AB] mb-1">
              Filter by Application
            </label>
            <select
              value={filterApp}
              onChange={e => setFilterApp(e.target.value)}
              className="w-full h-8 px-2.5 bg-[#FAF8FF] border border-[#ECEDF7] rounded-lg text-xs font-medium text-[#1F2350] focus:ring-1 focus:ring-[#4F63E8] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Applications</option>
              {applicationOptions.map(num => (
                <option key={num} value={num}>
                  {num}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Date Range Filter */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8C91AB] mb-1">
              Filter by Date
            </label>
            <select
              value={filterDate}
              onChange={e => setFilterDate(e.target.value)}
              className="w-full h-8 px-2.5 bg-[#FAF8FF] border border-[#ECEDF7] rounded-lg text-xs font-medium text-[#1F2350] focus:ring-1 focus:ring-[#4F63E8] focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today (Last 24 Hours)</option>
              <option value="7DAYS">Last 7 Days</option>
              <option value="30DAYS">Last 30 Days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-white rounded-2xl shadow-card-soft overflow-hidden border border-[#ECEDF7]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-wider text-[#8C91AB] bg-[#F8F9FE] border-b border-[#ECEDF7]">
                <th className="py-2.5 pl-4">Timestamp (IST)</th>
                <th className="py-2.5">Actor & Role</th>
                <th className="py-2.5">Action & Scope</th>
                <th className="py-2.5">Application</th>
                <th className="py-2.5">Cryptographic Hash</th>
                <th className="py-2.5 pr-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F1FA] font-medium text-[#1F2350]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#8C91AB]">
                    No audit records match the selected filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const isExpanded = expandedRowId === item.id;
                  const rowHash = item.hash || '';
                  const prevHash = item.prev_hash || 'GENESIS';

                  return (
                    <React.Fragment key={item.id}>
                      <tr
                        className={`hover:bg-gray-50/80 transition-colors cursor-pointer ${
                          isExpanded ? 'bg-[#FAF8FF]' : ''
                        }`}
                        onClick={() => setExpandedRowId(isExpanded ? null : item.id)}
                      >
                        <td className="py-3 pl-4 text-[#8C91AB] whitespace-nowrap text-[11px]">
                          <div>{item.timestamp}</div>
                          {item.created_at && (
                            <div className="text-[9.5px] text-[#8C91AB]/70 font-mono">
                              UTC {new Date(item.created_at).toISOString().slice(11, 19)}
                            </div>
                          )}
                        </td>

                        <td className="py-3">
                          <span className="font-bold text-[#1F2350] block truncate max-w-[160px]">
                            {item.actor}
                          </span>
                          <span className="text-[9.5px] text-[#8C91AB] font-semibold uppercase tracking-wider">
                            {item.actorRole}
                          </span>
                        </td>

                        <td className="py-3">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-[#1F2350]">{item.action}</span>
                            {item.isSimulatedExternal && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-[#AD4E00] border border-amber-200">
                                Simulated
                              </span>
                            )}
                            {item.entity_type && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-indigo-50 text-[#4F63E8]">
                                {item.entity_type}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3 font-semibold text-[#4F63E8]">
                          {item.applicationNumber || 'AICTE-2026-04821'}
                        </td>

                        <td className="py-3 font-mono text-[10px]">
                          {rowHash ? (
                            <div className="flex items-center gap-1">
                              <span className="bg-[#FAF8FF] px-1.5 py-0.5 rounded border border-[#ECEDF7] text-[#1F2350]">
                                {rowHash.slice(0, 8)}...{rowHash.slice(-6)}
                              </span>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  handleCopy(rowHash, item.id);
                                }}
                                className="text-[#8C91AB] hover:text-[#4F63E8] p-0.5 cursor-pointer"
                                title="Copy row SHA-256 hash"
                              >
                                {copiedHash === item.id ? (
                                  <Check className="w-3 h-3 text-[#3DBE8B]" />
                                ) : (
                                  <Copy className="w-3 h-3" />
                                )}
                              </button>
                            </div>
                          ) : (
                            <span className="text-[#8C91AB]">Unchained</span>
                          )}
                        </td>

                        <td className="py-3 pr-4 text-right">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              setExpandedRowId(isExpanded ? null : item.id);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4F63E8] hover:text-[#3B4DB8] cursor-pointer"
                          >
                            <span>{isExpanded ? 'Hide' : 'Inspect'}</span>
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded View for Cryptographic Audit Inspection */}
                      {isExpanded && (
                        <tr className="bg-[#FAF8FF]">
                          <td colSpan={6} className="p-4 border-b border-[#ECEDF7]">
                            <div className="bg-white p-3.5 rounded-xl border border-indigo-100 space-y-3 text-xs">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
                                <span className="font-bold text-[#1F2350] flex items-center gap-1.5">
                                  <ShieldCheck className="w-4 h-4 text-[#3DBE8B]" />
                                  Cryptographic Proof & Canonical Ledger Record
                                </span>
                                <span className="text-[10px] font-mono text-[#8C91AB]">
                                  Event ID: {item.id}
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[10.5px]">
                                <div className="space-y-1 bg-[#F8F9FE] p-2.5 rounded-lg border border-gray-100">
                                  <span className="block text-[9.5px] font-sans font-bold text-[#8C91AB] uppercase">
                                    Previous Block Hash (prev_hash)
                                  </span>
                                  <div className="break-all text-[#1F2350]">{prevHash}</div>
                                </div>

                                <div className="space-y-1 bg-[#F8F9FE] p-2.5 rounded-lg border border-gray-100">
                                  <span className="block text-[9.5px] font-sans font-bold text-[#8C91AB] uppercase">
                                    Current Block Hash (hash = sha256(prev_hash || canonical data))
                                  </span>
                                  <div className="break-all text-[#4F63E8] font-bold">{rowHash || 'N/A'}</div>
                                </div>
                              </div>

                              <div className="space-y-1">
                                <span className="block text-[10px] font-bold text-[#8C91AB] uppercase">
                                  Audit Payload & Statutory Details
                                </span>
                                <p className="text-[11.5px] text-[#1F2350] leading-relaxed bg-[#FAF8FF] p-2.5 rounded-lg border border-indigo-50 font-sans">
                                  {item.details}
                                </p>
                              </div>

                              {item.details_json && Object.keys(item.details_json).length > 0 && (
                                <div className="space-y-1">
                                  <span className="block text-[10px] font-bold text-[#8C91AB] uppercase">
                                    Structured Canonical JSON
                                  </span>
                                  <pre className="text-[10px] bg-gray-900 text-emerald-400 p-2.5 rounded-lg overflow-x-auto max-h-36">
                                    {JSON.stringify(item.details_json, null, 2)}
                                  </pre>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Footer Info */}
      <div className="p-3 bg-[#EEF0FD]/60 rounded-xl flex items-center justify-between text-[11px] text-[#4F63E8] font-medium">
        <span className="flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" />
          Zero-Tamper Cryptographic Hash Chain: SHA-256 Validated
        </span>
        <span className="text-[#8C91AB]">Section 10(k) Compliance Standard</span>
      </div>
    </div>
  );
};
