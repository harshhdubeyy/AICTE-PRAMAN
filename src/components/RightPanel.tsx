import React from 'react';
import { Settings, Bell, Mail, Eye, ShieldCheck, Zap, Clock } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { CalendarStrip } from './CalendarStrip';

export const RightPanel: React.FC = () => {
  const {
    role,
    queries,
    showToast,
    openReportModal,
    approveApplication,
    applications
  } = useApp();

  const handleApproveQuick = (name: string, appId: string) => {
    approveApplication(appId, `Approved by Senior Scrutiny Bureau: ${name}`);
  };

  return (
    <aside
      className="w-full xl:w-[270px] bg-white p-5 flex flex-col justify-between shrink-0 border-l border-[#F0F1FA] select-none"
      data-purpose="right-sidebar"
    >
      <div>
        {/* Top Profile & Notifications Bar */}
        <div className="flex items-center justify-between mb-5 pb-1 border-b border-[#F0F1FA]" data-purpose="user-header">
          <div className="flex items-center gap-2.5 text-[#8C91AB]">
            <button
              onClick={() => showToast('Opening AICTE Scrutiny System Preferences')}
              className="hover:text-[#4F63E8] p-1 transition-colors"
              title="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => showToast('Regulatory notifications marked as read')}
              className="hover:text-[#4F63E8] p-1 transition-colors relative"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#F0566A] ring-2 ring-white" />
            </button>
          </div>

          <div
            onClick={() =>
              showToast(
                `Active Profile: ${
                  role === 'officer'
                    ? 'Sara Abraham (Senior Scrutiny Officer, AICTE Western Bureau)'
                    : 'Dr. V. Kulkarni (Principal / Registrar, SVIT Pune)'
                }`
              )
            }
            className="flex items-center gap-2 text-right cursor-pointer group"
          >
            <div>
              <span className="text-[12px] font-bold text-[#1F2350] leading-tight block group-hover:text-[#4F63E8] transition-colors">
                {role === 'officer' ? 'Sara Abraham' : 'SVIT Pune Admin'}
              </span>
              <span className="text-[9.5px] text-[#8C91AB] group-hover:text-[#4F63E8] transition-colors block">
                {role === 'officer' ? 'View profile' : 'Institute ID: 1-4829101'}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-indigo-100 shrink-0">
              <img
                src={
                  role === 'officer'
                    ? 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80'
                    : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80'
                }
                alt="User Avatar"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Compliance Feed (Institution) / Stats Overview */}
        {role === 'institution' && (
          <div className="mb-5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-bold text-[#1F2350]">Compliance Feed</span>
              <Zap className="w-4 h-4 text-[#4F63E8]" />
            </div>
            <div className="p-2.5 bg-[#F4F5FE] rounded-xl flex flex-col gap-1 border border-[#ECEEFF]/60">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] text-[#4F63E8] font-bold tracking-wider uppercase">
                  Affiliation Status
                </span>
                <span className="w-2 h-2 rounded-full bg-[#4F63E8]" />
              </div>
              <span className="text-[12.5px] text-[#1F2350] font-bold">In Progress</span>
              <span className="text-[10px] text-[#8C91AB]">Cycle 2026-27 active scrutiny</span>
            </div>
            <div className="p-2.5 bg-[#F4F5FE] rounded-xl flex flex-col gap-1 border border-[#ECEEFF]/60">
              <div className="flex items-center justify-between">
                <span className="text-[9.5px] text-[#8C91AB] font-bold tracking-wider uppercase">
                  Scrutiny Queue
                </span>
                <Clock className="w-3.5 h-3.5 text-[#F59A3C]" />
              </div>
              <span className="text-[12.5px] text-[#1F2350] font-bold">8 Verifications</span>
              <span className="text-[10px] text-[#8C91AB]">2 awaiting AI & Officer sign-off</span>
            </div>
          </div>
        )}

        {/* Schedule / Calendar Widget */}
        <CalendarStrip />

        {/* Institution Queries / Clarification list */}
        <div className="mb-5" data-purpose="institution-queries-list">
          <div className="flex items-center justify-between mb-2.5">
            <h3 className="text-[12px] font-bold text-[#1F2350] tracking-tight">
              {role === 'officer' ? 'Institution Queries' : 'Queries from AICTE'}
            </h3>
            <button
              onClick={() => showToast('Displaying clarification tickets register')}
              className="text-[9.5px] font-bold text-[#4F63E8] hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-2.5">
            {/* Query 1: SVIT Pune */}
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-indigo-100 text-[#4F63E8] font-bold text-[10px] flex items-center justify-center shrink-0">
                  SV
                </div>
                <div className="leading-tight truncate">
                  <h4 className="text-[11px] font-bold text-[#1F2350] truncate">SVIT Pune</h4>
                  <p className="text-[9px] text-[#8C91AB] truncate">Replied: Fire NOC attached</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => showToast('Opened clarification channel for SVIT Pune')}
                  className="w-5 h-5 rounded-full bg-[#4F63E8] text-white flex items-center justify-center hover:bg-[#4458DC] transition-colors"
                  title="Message Institution"
                >
                  <Mail className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={() => openReportModal('app-1')}
                  className="w-5 h-5 rounded-full bg-[#4F63E8] text-white flex items-center justify-center hover:bg-[#4458DC] transition-colors"
                  title="View Submission"
                >
                  <Eye className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            {/* Query 2: Sahyadri Engg */}
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-[#FFE7BA] text-[#D46B08] font-bold text-[10px] flex items-center justify-center shrink-0">
                  SE
                </div>
                <div className="leading-tight truncate">
                  <h4 className="text-[11px] font-bold text-[#1F2350] truncate">Sahyadri Engg</h4>
                  <p className="text-[9px] text-[#8C91AB] truncate">Query on faculty cadre ratio</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => showToast('Opened clarification channel for Sahyadri Engg')}
                  className="w-5 h-5 rounded-full bg-[#4F63E8] text-white flex items-center justify-center hover:bg-[#4458DC] transition-colors"
                  title="Message Institution"
                >
                  <Mail className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={() => openReportModal('app-2')}
                  className="w-5 h-5 rounded-full bg-[#4F63E8] text-white flex items-center justify-center hover:bg-[#4458DC] transition-colors"
                  title="View Submission"
                >
                  <Eye className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            {/* Query 3: Narmada Inst */}
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-[#D9F7BE] text-[#389E0D] font-bold text-[10px] flex items-center justify-center shrink-0">
                  NI
                </div>
                <div className="leading-tight truncate">
                  <h4 className="text-[11px] font-bold text-[#1F2350] truncate">Narmada Inst</h4>
                  <p className="text-[9px] text-[#8C91AB] truncate">Clarification submitted: Land deed</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => showToast('Opened clarification channel for Narmada Inst')}
                  className="w-5 h-5 rounded-full bg-[#4F63E8] text-white flex items-center justify-center hover:bg-[#4458DC] transition-colors"
                  title="Message Institution"
                >
                  <Mail className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={() => openReportModal('app-3')}
                  className="w-5 h-5 rounded-full bg-[#4F63E8] text-white flex items-center justify-center hover:bg-[#4458DC] transition-colors"
                  title="View Submission"
                >
                  <Eye className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            {/* Query 4: Kaveri Poly */}
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-[#FFD6E7] text-[#C41D7F] font-bold text-[10px] flex items-center justify-center shrink-0">
                  KP
                </div>
                <div className="leading-tight truncate">
                  <h4 className="text-[11px] font-bold text-[#1F2350] truncate">Kaveri Poly</h4>
                  <p className="text-[9px] text-[#8C91AB] truncate">Awaiting trust deed amendment</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => showToast('Opened clarification channel for Kaveri Poly')}
                  className="w-5 h-5 rounded-full bg-[#4F63E8] text-white flex items-center justify-center hover:bg-[#4458DC] transition-colors"
                  title="Message Institution"
                >
                  <Mail className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={() => openReportModal('app-4')}
                  className="w-5 h-5 rounded-full bg-[#4F63E8] text-white flex items-center justify-center hover:bg-[#4458DC] transition-colors"
                  title="View Submission"
                >
                  <Eye className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>

            {/* Query 5: Gomti Pharmacy */}
            <div className="flex items-center justify-between group">
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-7 h-7 rounded-full bg-[#EFDBFF] text-[#531DAB] font-bold text-[10px] flex items-center justify-center shrink-0">
                  GP
                </div>
                <div className="leading-tight truncate">
                  <h4 className="text-[11px] font-bold text-[#1F2350] truncate">Gomti Pharmacy</h4>
                  <p className="text-[9px] text-[#8C91AB] truncate">Floor plan coordinates uploaded</p>
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => showToast('Opened clarification channel for Gomti Pharmacy')}
                  className="w-5 h-5 rounded-full bg-[#4F63E8] text-white flex items-center justify-center hover:bg-[#4458DC] transition-colors"
                  title="Message Institution"
                >
                  <Mail className="w-2.5 h-2.5" />
                </button>
                <button
                  onClick={() => openReportModal('app-5')}
                  className="w-5 h-5 rounded-full bg-[#4F63E8] text-white flex items-center justify-center hover:bg-[#4458DC] transition-colors"
                  title="View Submission"
                >
                  <Eye className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Ready For Decision Cards */}
        <div data-purpose="decision-cards-section">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[12px] font-bold text-[#1F2350] tracking-tight">Ready For Decision</h3>
            <button
              onClick={() => showToast('Loading Executive Committee Approvals docket')}
              className="text-[9.5px] font-bold text-[#4F63E8] hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-3 gap-1.5">
            {/* Card 1: IIT Delhi Extension */}
            <div className="bg-[#F8F9FE] hover:bg-[#EEF1FD] transition-colors rounded-xl p-2 flex flex-col items-center text-center">
              <div className="w-6 h-6 rounded-full bg-indigo-200 text-[#4F63E8] font-extrabold text-[9px] flex items-center justify-center mb-1 border border-white">
                IIT
              </div>
              <h5 className="text-[9px] font-bold text-[#1F2350] truncate w-full leading-tight">
                IIT Delhi Ext.
              </h5>
              <span className="text-[7.5px] text-[#8C91AB] truncate w-full block mb-1.5">New Delhi</span>
              <button
                onClick={() => handleApproveQuick('IIT Delhi Extension', 'app-3')}
                className="w-full py-0.5 bg-[#4F63E8] hover:bg-[#4458DC] text-white text-[8px] font-bold rounded transition-colors shadow-xs cursor-pointer"
              >
                Approve
              </button>
            </div>

            {/* Card 2: BITS Pilani Off-Campus */}
            <div className="bg-[#F8F9FE] hover:bg-[#EEF1FD] transition-colors rounded-xl p-2 flex flex-col items-center text-center">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-[#3DBE8B] font-extrabold text-[9px] flex items-center justify-center mb-1 border border-white">
                BITS
              </div>
              <h5 className="text-[9px] font-bold text-[#1F2350] truncate w-full leading-tight">
                BITS Pilani
              </h5>
              <span className="text-[7.5px] text-[#8C91AB] truncate w-full block mb-1.5">Goa</span>
              <button
                onClick={() => handleApproveQuick('BITS Pilani Off-Campus', 'app-6')}
                className="w-full py-0.5 bg-[#4F63E8] hover:bg-[#4458DC] text-white text-[8px] font-bold rounded transition-colors shadow-xs cursor-pointer"
              >
                Approve
              </button>
            </div>

            {/* Card 3: NIT Trichy PG Center */}
            <div className="bg-[#F8F9FE] hover:bg-[#EEF1FD] transition-colors rounded-xl p-2 flex flex-col items-center text-center">
              <div className="w-6 h-6 rounded-full bg-amber-100 text-[#D46B08] font-extrabold text-[9px] flex items-center justify-center mb-1 border border-white">
                NIT
              </div>
              <h5 className="text-[9px] font-bold text-[#1F2350] truncate w-full leading-tight">
                NIT Trichy
              </h5>
              <span className="text-[7.5px] text-[#8C91AB] truncate w-full block mb-1.5">
                Tiruchirappalli
              </span>
              <button
                onClick={() => handleApproveQuick('NIT Trichy PG Center', 'app-6')}
                className="w-full py-0.5 bg-[#4F63E8] hover:bg-[#4458DC] text-white text-[8px] font-bold rounded transition-colors shadow-xs cursor-pointer"
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trust Network Stamp at Bottom */}
      <div className="pt-3 border-t border-[#F0F1FA] text-center">
        <span className="text-[8.5px] text-[#8C91AB] font-medium flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3 text-[#4F63E8]" />
          Digital Signature Verified • Section 10(k)
        </span>
      </div>
    </aside>
  );
};
