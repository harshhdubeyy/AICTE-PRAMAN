import React, { useState } from 'react';
import { MapPin, Calendar, Plus, Building, UserCheck } from 'lucide-react';
import { useApp } from '../store/AppContext';

export const OfficerInspections: React.FC = () => {
  const { inspections, applications, requestInspection, showToast } = useApp();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetAppId, setTargetAppId] = useState('app-1');
  const [leadName, setLeadName] = useState('Prof. R. K. Singhal (IIT Bombay)');
  const [inspDate, setInspDate] = useState('2026-05-28');
  const [purpose, setPurpose] = useState('Physical audit of laboratory machines and fire escape setbacks');

  const handleSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    requestInspection(targetAppId, `${purpose} (Lead: ${leadName})`);
    setIsModalOpen(false);
    showToast('Expert Inspection Committee successfully scheduled in docket');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-card-soft border border-[#ECEDF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF0FD] text-[#4F63E8] flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#1F2350]">Expert Visiting Committee Inspections</h1>
            <p className="text-[11px] text-[#8C91AB]">
              Physical infrastructure audits, lab equipment inventory ground truth, and geo-tagged spot reviews.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="h-8 px-3.5 bg-[#4F63E8] hover:bg-[#4458DC] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Schedule New Inspection</span>
        </button>
      </div>

      {/* Grid of Inspection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {inspections.map(insp => (
          <div
            key={insp.id}
            className="bg-white rounded-2xl p-4 border border-[#ECEDF7] shadow-card-soft flex flex-col justify-between space-y-3"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <h3 className="font-bold text-xs text-[#1F2350] leading-snug">{insp.institutionName}</h3>
                  <span className="text-[10px] text-[#8C91AB] block mt-0.5">{insp.location}</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-amber-50 text-[#F59A3C] border border-amber-200">
                  {insp.status}
                </span>
              </div>

              <div className="p-3 bg-[#F8F9FE] rounded-xl border border-indigo-50 space-y-1.5 text-xs">
                <div className="flex items-center gap-2 text-[#1F2350]">
                  <Calendar className="w-3.5 h-3.5 text-[#4F63E8]" />
                  <span className="font-semibold">Inspection Date: {insp.date}</span>
                </div>
                <div className="flex items-center gap-2 text-[#1F2350]">
                  <UserCheck className="w-3.5 h-3.5 text-[#3DBE8B]" />
                  <span>Committee Lead: {insp.committeeLead}</span>
                </div>
                <div className="flex items-center gap-2 text-[#8C91AB] text-[11px] pt-1 border-t border-gray-100">
                  <Building className="w-3.5 h-3.5 text-[#8C91AB]" />
                  <span>Purpose: {insp.purpose}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-xs">
              <span className="text-[10px] text-[#8C91AB]">Empowered under AICTE Act Sec 10(p)</span>
              <button
                onClick={() => showToast(`Inspection dossier opened for ${insp.institutionName}`)}
                className="px-3 py-1 bg-[#EEF0FD] hover:bg-[#4F63E8] hover:text-white text-[#4F63E8] font-bold rounded-lg transition-colors cursor-pointer text-[11px]"
              >
                View Dossier & Photos
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2350]/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-indigo-100 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm text-[#1F2350]">Schedule Expert Inspection Committee</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-[#1F2350] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSchedule} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#1F2350] mb-1">Target Application</label>
                <select
                  value={targetAppId}
                  onChange={e => setTargetAppId(e.target.value)}
                  className="w-full h-9 px-2.5 bg-[#F4F5FE] border border-gray-200 rounded-lg text-xs"
                >
                  {applications.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.applicationNumber} - {app.institutionName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#1F2350] mb-1">Committee Lead Academician</label>
                <input
                  type="text"
                  required
                  value={leadName}
                  onChange={e => setLeadName(e.target.value)}
                  className="w-full h-9 px-2.5 bg-[#F4F5FE] border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1F2350] mb-1">Scheduled Inspection Date</label>
                <input
                  type="date"
                  required
                  value={inspDate}
                  onChange={e => setInspDate(e.target.value)}
                  className="w-full h-9 px-2.5 bg-[#F4F5FE] border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1F2350] mb-1">Audit Mandate / Scope</label>
                <textarea
                  rows={3}
                  required
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="w-full p-2.5 bg-[#F4F5FE] border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg border text-[#1F2350] font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#4F63E8] hover:bg-[#4458DC] text-white font-bold shadow-sm cursor-pointer"
                >
                  Confirm & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
