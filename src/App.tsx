import React, { useState } from 'react';
import { useApp } from './store/AppContext';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { RightPanel } from './components/RightPanel';
import { OfficerDashboard } from './screens/OfficerDashboard';
import { OfficerReportDetail } from './screens/OfficerReportDetail';
import { OfficerFindingsList } from './screens/OfficerFindingsList';
import { OfficerClarifications } from './screens/OfficerClarifications';
import { OfficerInspections } from './screens/OfficerInspections';
import { OfficerDecisions } from './screens/OfficerDecisions';
import { OfficerAuditTrail } from './screens/OfficerAuditTrail';
import { InstitutionDashboard } from './screens/InstitutionDashboard';
import { InstitutionApplications } from './screens/InstitutionApplications';
import { InstitutionDocuments } from './screens/InstitutionDocuments';
import { InstitutionInfrastructure } from './screens/InstitutionInfrastructure';
import { InstitutionValidationReport } from './screens/InstitutionValidationReport';
import { InstitutionQueries } from './screens/InstitutionQueries';
import { InstitutionResubmissions } from './screens/InstitutionResubmissions';
import { InstitutionTrackStatus } from './screens/InstitutionTrackStatus';
import { LoginScreen } from './screens/LoginScreen';
import { DataTable } from './components/DataTable';

export default function App() {
  const {
    role,
    activeNav,
    applications,
    selectedAppId,
    selectApplication,
    openReportModal,
    isReportModalOpen,
    closeReportModal,
    toast,
    showToast
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  // Screen routing for Officer
  const renderOfficerScreen = () => {
    switch (activeNav) {
      case 'dashboard':
        return <OfficerDashboard />;
      case 'applications':
        return (
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-4 shadow-card-soft border border-[#ECEDF7] flex justify-between items-center">
              <div>
                <h1 className="text-base font-bold text-[#1F2350]">All Accredited Institutions Docket</h1>
                <p className="text-[11px] text-[#8C91AB]">
                  Master register of AY 2026-27 applications under regional bureau review.
                </p>
              </div>
            </div>
            <DataTable
              applications={applications}
              selectedAppId={selectedAppId}
              onSelectRow={app => {
                selectApplication(app.id);
                openReportModal(app.id);
              }}
              viewDetailsClick={() => openReportModal(selectedAppId)}
            />
          </div>
        );
      case 'validation-reports':
        return <OfficerReportDetail />;
      case 'ai-findings':
        return <OfficerFindingsList />;
      case 'clarifications':
        return <OfficerClarifications />;
      case 'inspections':
        return <OfficerInspections />;
      case 'decisions':
        return <OfficerDecisions />;
      case 'audit-trail':
        return <OfficerAuditTrail />;
      default:
        return <OfficerDashboard />;
    }
  };

  // Screen routing for Institution
  const renderInstitutionScreen = () => {
    switch (activeNav) {
      case 'dashboard':
        return <InstitutionDashboard />;
      case 'applications':
        return <InstitutionApplications />;
      case 'documents':
        return <InstitutionDocuments />;
      case 'infrastructure':
        return <InstitutionInfrastructure />;
      case 'validation-report':
        return <InstitutionValidationReport />;
      case 'queries':
        return <InstitutionQueries />;
      case 'resubmissions':
        return <InstitutionResubmissions />;
      case 'track-status':
        return <InstitutionTrackStatus />;
      default:
        return <InstitutionDashboard />;
    }
  };

  return (
    <div className="min-h-screen p-3 md:p-6 lg:p-8 flex items-center justify-center selection:bg-indigo-100 selection:text-[#4F63E8]">
      {/* Master Application Shell */}
      <main className="w-full max-w-[1360px] bg-white rounded-[40px] shadow-app-shell overflow-hidden flex flex-col xl:flex-row min-h-[840px] border border-white/60 relative">
        {/* Mobile Sidebar Drawer Overlay */}
        {isMobileMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs xl:hidden"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Left Sidebar Navigation */}
        <div
          className={`${
            isMobileMenuOpen
              ? 'fixed inset-y-0 left-0 z-50 w-[240px] bg-white shadow-2xl flex'
              : 'hidden xl:flex'
          }`}
        >
          <Sidebar />
        </div>

        {/* Center Main Workspace */}
        <section
          className="flex-1 bg-[#F4F5FE] p-4 sm:p-6 lg:p-7 flex flex-col justify-between overflow-x-hidden"
          data-purpose="center-main-workspace"
        >
          <div>
            <TopBar
              onSearch={val => setSearchFilter(val)}
              onMobileMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              isMobileMenuOpen={isMobileMenuOpen}
            />

            {/* Active Screen Render */}
            <div id="main-content-area">
              {role === 'officer' ? renderOfficerScreen() : renderInstitutionScreen()}
            </div>
          </div>

          {/* Footer Bar of Center Workspace */}
          <footer className="mt-5 pt-3 text-[10px] text-[#8C91AB] flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[#E8EAF5]">
            <span>PRAMAN Engine: NLP Model v4.11.2 (Spatial Coordinate OCR)</span>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3DBE8B]" /> 98.4% Match rate
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F59A3C]" /> 3 Pending inspections
              </span>
            </div>
          </footer>
        </section>

        {/* Right Information Panel (Collapses on screens below 1280px or when drawer active) */}
        <div className="hidden xl:flex">
          <RightPanel />
        </div>
      </main>

      {/* Interactive AI Report & Officer Evaluation Modal */}
      {isReportModalOpen && (
        <div
          className="fixed inset-0 bg-[#1F2350]/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 z-50"
          data-purpose="officer-detail-modal"
        >
          <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-y-auto shadow-2xl border border-indigo-100 flex flex-col relative">
            <button
              onClick={closeReportModal}
              className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F4F5FE] hover:bg-gray-200 text-[#1F2350] flex items-center justify-center font-bold text-sm z-30 cursor-pointer shadow-xs"
            >
              ✕
            </button>
            <div className="p-2 sm:p-4">
              <OfficerReportDetail appId={selectedAppId} isModal={true} onClose={closeReportModal} />
            </div>
          </div>
        </div>
      )}

      {/* Login Screen / Modal */}
      <LoginScreen />

      {/* Toast Notification Element */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-[#1F2350] text-white px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold flex items-center gap-2.5 z-50 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-[#3DBE8B]" />
          <span>{toast.text}</span>
        </div>
      )}
    </div>
  );
}
