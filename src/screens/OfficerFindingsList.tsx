import React, { useState } from 'react';
import { Zap, Filter, Search } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { FindingRow } from '../components/FindingRow';
import { ValidationStatus } from '../types';

export const OfficerFindingsList: React.FC = () => {
  const { applications, openReportModal, sendClarification } = useApp();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Collect all findings across all applications
  const allFindings = applications.flatMap(app =>
    app.latestRun.findings.map(f => ({
      ...f,
      appName: app.institutionName,
      appNumber: app.applicationNumber
    }))
  );

  const filtered = allFindings.filter(f => {
    if (filterStatus !== 'ALL' && f.status !== filterStatus) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        f.ruleTitle.toLowerCase().includes(q) ||
        f.appName.toLowerCase().includes(q) ||
        f.rule_code.toLowerCase().includes(q) ||
        f.explanation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-card-soft border border-[#ECEDF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF0FD] text-[#4F63E8] flex items-center justify-center">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#1F2350]">Automated AI Scrutiny Findings Repository</h1>
            <p className="text-[11px] text-[#8C91AB]">
              Real-time cross-document spatial variances, checklist omissions, expired certificates, and near-duplicates.
            </p>
          </div>
        </div>

        <div className="relative min-w-[220px]">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search findings, rules..."
            className="w-full h-8 pl-8 pr-3 text-xs bg-[#F4F5FE] border border-[#ECEDF7] rounded-lg"
          />
          <Search className="w-3.5 h-3.5 text-[#8C91AB] absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 flex-wrap text-xs bg-white p-2.5 rounded-xl border border-[#ECEDF7] shadow-xs">
        <span className="text-[#8C91AB] font-semibold flex items-center gap-1 ml-1">
          <Filter className="w-3.5 h-3.5" />
          Filter by Status:
        </span>
        {['ALL', 'Mismatch', 'Expired', 'Missing', 'Suspicious', 'Needs Manual Review', 'Passed'].map(
          status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filterStatus === status
                  ? 'bg-[#4F63E8] text-white shadow-xs'
                  : 'text-[#8C91AB] hover:text-[#1F2350] hover:bg-gray-100'
              }`}
            >
              {status}
            </button>
          )
        )}
      </div>

      {/* Findings Table */}
      <div className="bg-white rounded-2xl shadow-card-soft overflow-hidden border border-[#ECEDF7]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-wider text-[#8C91AB] bg-[#F8F9FE] border-b border-[#ECEDF7]">
                <th className="py-2.5 pl-4">Finding / Rule</th>
                <th className="py-2.5">Institution & Application</th>
                <th className="py-2.5">Rule Reference</th>
                <th className="py-2.5">Confidence</th>
                <th className="py-2.5">Status</th>
                <th className="py-2.5 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filtered.map(finding => (
                <FindingRow
                  key={finding.id}
                  finding={finding}
                  isExpanded={expandedId === finding.id}
                  onToggle={() => setExpandedId(prev => (prev === finding.id ? null : finding.id))}
                  onQuickClarification={() => {
                    sendClarification(finding.applicationId, finding.explanation, finding.field);
                    openReportModal(finding.applicationId);
                  }}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
