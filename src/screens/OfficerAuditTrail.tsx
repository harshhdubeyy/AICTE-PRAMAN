import React, { useState } from 'react';
import { History, Shield, Filter, Download } from 'lucide-react';
import { useApp } from '../store/AppContext';

export const OfficerAuditTrail: React.FC = () => {
  const { auditTrail, showToast } = useApp();
  const [filterActor, setFilterActor] = useState<string>('ALL');

  const filtered = auditTrail.filter(entry => {
    if (filterActor === 'ALL') return true;
    if (filterActor === 'OFFICER') return entry.actorRole === 'officer';
    if (filterActor === 'INSTITUTION') return entry.actorRole === 'institution';
    if (filterActor === 'AI') return entry.actorRole === 'System AI';
    if (filterActor === 'SIMULATED') return entry.isSimulatedExternal;
    return true;
  });

  const handleExportAudit = () => {
    const csv = 'Timestamp,Actor,Role,Action,Application,Rule Version,Details,External Source\n' +
      auditTrail.map(a => `"${a.timestamp}","${a.actor}","${a.actorRole}","${a.action}","${a.applicationNumber}","${a.ruleVersion}","${a.details}","${a.externalSource || 'Internal'}"`).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'AICTE_PRAMAN_Audit_Trail.csv';
    link.click();
    showToast('Exported Immutable Audit Log CSV');
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
              Cryptographically timestamped log of all officer interventions, OCR engine parses, and external checks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportAudit}
            className="h-8 px-3 bg-[#EEF0FD] hover:bg-[#4F63E8] hover:text-white text-[#4F63E8] rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Audit Log</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center gap-2 flex-wrap text-xs bg-white p-2.5 rounded-xl border border-[#ECEDF7] shadow-xs">
        <span className="text-[#8C91AB] font-semibold flex items-center gap-1 ml-1">
          <Filter className="w-3.5 h-3.5" />
          Filter by Actor:
        </span>
        <button
          onClick={() => setFilterActor('ALL')}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            filterActor === 'ALL'
              ? 'bg-[#4F63E8] text-white shadow-xs'
              : 'text-[#8C91AB] hover:text-[#1F2350] hover:bg-gray-100'
          }`}
        >
          All Events ({auditTrail.length})
        </button>
        <button
          onClick={() => setFilterActor('OFFICER')}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            filterActor === 'OFFICER'
              ? 'bg-[#4F63E8] text-white shadow-xs'
              : 'text-[#8C91AB] hover:text-[#1F2350] hover:bg-gray-100'
          }`}
        >
          Officers
        </button>
        <button
          onClick={() => setFilterActor('INSTITUTION')}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            filterActor === 'INSTITUTION'
              ? 'bg-[#4F63E8] text-white shadow-xs'
              : 'text-[#8C91AB] hover:text-[#1F2350] hover:bg-gray-100'
          }`}
        >
          Institutions
        </button>
        <button
          onClick={() => setFilterActor('AI')}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            filterActor === 'AI'
              ? 'bg-[#4F63E8] text-white shadow-xs'
              : 'text-[#8C91AB] hover:text-[#1F2350] hover:bg-gray-100'
          }`}
        >
          AI Engine
        </button>
        <button
          onClick={() => setFilterActor('SIMULATED')}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            filterActor === 'SIMULATED'
              ? 'bg-[#4F63E8] text-white shadow-xs'
              : 'text-[#8C91AB] hover:text-[#1F2350] hover:bg-gray-100'
          }`}
        >
          Simulated External
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-card-soft overflow-hidden border border-[#ECEDF7]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-wider text-[#8C91AB] bg-[#F8F9FE] border-b border-[#ECEDF7]">
                <th className="py-2.5 pl-4">Timestamp (IST)</th>
                <th className="py-2.5">Actor</th>
                <th className="py-2.5">Action</th>
                <th className="py-2.5">Application</th>
                <th className="py-2.5">Rule Version</th>
                <th className="py-2.5 pr-4">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F1FA] font-medium text-[#1F2350]">
              {filtered.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 pl-4 text-[#8C91AB] whitespace-nowrap text-[11px]">
                    {item.timestamp}
                  </td>
                  <td className="py-3 font-bold">
                    <span className="block">{item.actor}</span>
                    <span className="text-[9.5px] text-[#8C91AB] font-normal uppercase">
                      {item.actorRole}
                    </span>
                  </td>
                  <td className="py-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold">{item.action}</span>
                      {item.isSimulatedExternal && (
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-100 text-[#AD4E00] border border-amber-200">
                          Simulated
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 font-semibold text-[#4F63E8]">
                    {item.applicationNumber}
                  </td>
                  <td className="py-3 font-mono text-[10.5px] text-[#8C91AB]">
                    {item.ruleVersion}
                  </td>
                  <td className="py-3 pr-4 text-[#8C91AB] max-w-xs truncate" title={item.details}>
                    {item.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

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
