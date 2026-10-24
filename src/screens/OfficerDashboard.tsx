import React, { useState } from 'react';
import {
  FileEdit,
  FileWarning,
  Clock,
  Flag,
  CheckCircle2,
  Sparkles,
  Download
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { HeroBanner } from '../components/HeroBanner';
import { CategoryCard } from '../components/CategoryCard';
import { ConfidenceRing } from '../components/ConfidenceRing';
import { DataTable } from '../components/DataTable';

export const OfficerDashboard: React.FC = () => {
  const {
    applications,
    selectedAppId,
    selectApplication,
    openReportModal,
    applyAiSuggestion,
    showToast
  } = useApp();

  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const svitApp = applications.find(a => a.id === 'app-1') || applications[0];

  const filteredApps = applications.filter(app => {
    if (!activeFilter) return true;
    if (activeFilter === 'Mismatch') return app.status === 'Mismatch' || app.status === 'Needs Manual Review';
    if (activeFilter === 'Missing') return app.status === 'Missing';
    if (activeFilter === 'Expiring') return app.latestRun.findingsCount.expired > 0;
    if (activeFilter === 'Suspicious') return app.status === 'Suspicious';
    if (activeFilter === 'Ready for Decision') return app.status === 'Ready for Decision' || app.status === 'Passed';
    return true;
  });

  const handleCategoryClick = (filterName: string) => {
    if (activeFilter === filterName) {
      setActiveFilter(null);
      showToast('Showing all applications');
    } else {
      setActiveFilter(filterName);
      showToast(`Filtered queue: ${filterName}`);
    }
  };

  const handleExportPdf = () => {
    showToast('Exporting Dossier PDF for SVIT Pune...');
    window.print();
  };

  return (
    <div className="space-y-5">
      {/* Hero Banner */}
      <HeroBanner
        greeting="Good Morning, Sara"
        subtext="75 new applications are in your queue. 12 need attention today, 5 have AI-flagged discrepancies."
        primaryButtonText="Review Queue"
        onPrimaryClick={() => openReportModal('app-1')}
        secondaryText="OCR Engine Active"
      />

      {/* Category Cards Row (5 Cards) */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="text-[13px] font-bold text-[#1F2350] tracking-tight">
            You Need to Validate
          </h2>
          {activeFilter && (
            <button
              onClick={() => {
                setActiveFilter(null);
                showToast('Showing all applications');
              }}
              className="text-[10px] font-bold text-[#4F63E8] hover:text-[#4458DC] transition-colors bg-white px-2 py-0.5 rounded shadow-xs cursor-pointer"
            >
              Reset Filter (Showing {activeFilter})
            </button>
          )}
          {!activeFilter && (
            <button
              onClick={() => showToast('Showing all applications in queue')}
              className="text-[10px] font-bold text-[#4F63E8] hover:text-[#4458DC] transition-colors bg-white px-2 py-0.5 rounded shadow-xs cursor-pointer"
            >
              View All
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5" id="categoryCardsGrid">
          <CategoryCard
            title="Document Mismatches"
            countText="(14 Open)"
            icon={<FileEdit className="w-4 h-4" />}
            gradient="bg-gradient-to-tr from-[#3D52E6] to-[#5A6DF0]"
            isActive={activeFilter === 'Mismatch'}
            onClick={() => handleCategoryClick('Mismatch')}
          />
          <CategoryCard
            title="Missing Documents"
            countText="(9 Pending)"
            icon={<FileWarning className="w-4 h-4" />}
            gradient="bg-gradient-to-tr from-[#FF7A45] to-[#FFA940]"
            isActive={activeFilter === 'Missing'}
            onClick={() => handleCategoryClick('Missing')}
          />
          <CategoryCard
            title="Expiring Certificates"
            countText="(6 Expiring)"
            icon={<Clock className="w-4 h-4" />}
            gradient="bg-gradient-to-tr from-[#FF4D4F] to-[#FF7875]"
            isActive={activeFilter === 'Expiring'}
            onClick={() => handleCategoryClick('Expiring')}
          />
          <CategoryCard
            title="Suspicious Flags"
            countText="(4 To Review)"
            icon={<Flag className="w-4 h-4" />}
            gradient="bg-gradient-to-tr from-[#722ED1] to-[#9254DE]"
            isActive={activeFilter === 'Suspicious'}
            onClick={() => handleCategoryClick('Suspicious')}
          />
          <CategoryCard
            title="Ready for Decision"
            countText="(11 Cases)"
            icon={<CheckCircle2 className="w-4 h-4" />}
            gradient="bg-gradient-to-tr from-[#36CFC9] to-[#5CDBD3]"
            isActive={activeFilter === 'Ready for Decision'}
            onClick={() => handleCategoryClick('Ready for Decision')}
          />
        </div>
      </div>

      {/* Two-Column Section: Generated Validation Report + AI Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4" data-purpose="validation-preview-and-ai">
        {/* LEFT CARD: Generated Validation Report */}
        <div className="bg-white rounded-xl p-4 shadow-card-soft border border-[#ECEDF7] flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-[12.5px] font-bold text-[#1F2350] leading-snug">
                    {svitApp.institutionName}
                  </h3>
                  <span className="text-[9px] bg-indigo-50 text-[#4F63E8] font-bold px-1.5 py-0.5 rounded">
                    {svitApp.applicationType}
                  </span>
                </div>
                <p className="text-[10px] text-[#8C91AB] mt-0.5">
                  Application ID:{' '}
                  <span className="font-semibold text-[#1F2350]">{svitApp.applicationNumber}</span>
                </p>
              </div>

              {/* Radial Gauge */}
              <ConfidenceRing
                score={svitApp.overallConfidence}
                label={`${svitApp.overallConfidence}%`}
                subLabel="AI Confidence"
              />
            </div>

            {/* 5 Stat Chips Strip */}
            <div className="flex items-center gap-1.5 flex-wrap mb-3">
              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#EAFBF3] text-[#3DBE8B]">
                Passed {svitApp.latestRun.findingsCount.passed}
              </span>
              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#FEEBED] text-[#F0566A]">
                Missing {svitApp.latestRun.findingsCount.missing}
              </span>
              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#FFF5EB] text-[#F59A3C]">
                Mismatch {svitApp.latestRun.findingsCount.mismatch}
              </span>
              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#FFF1F0] text-[#CF1322]">
                Expired {svitApp.latestRun.findingsCount.expired}
              </span>
              <span className="px-2 py-0.5 rounded text-[9.5px] font-bold bg-[#F3F0FF] text-[#722ED1]">
                Suspicious {svitApp.latestRun.findingsCount.suspicious}
              </span>
            </div>

            {/* Top Findings list with colored status dots */}
            <div className="space-y-1.5 mb-3 bg-[#FAF8FF] p-2.5 rounded-lg border border-[#EEF0FD]">
              <div className="flex items-center gap-2 text-[10.5px]">
                <span className="w-2 h-2 rounded-full bg-[#F59A3C] shrink-0" />
                <span className="text-[#1F2350] font-medium">
                  Address mismatch: Affidavit vs Land Document (Page 3)
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10.5px]">
                <span className="w-2 h-2 rounded-full bg-[#F0566A] shrink-0" />
                <span className="text-[#1F2350] font-medium">Fire NOC expired on 12 Mar 2026</span>
              </div>
              <div className="flex items-center gap-2 text-[10.5px]">
                <span className="w-2 h-2 rounded-full bg-[#5FD0C0] shrink-0" />
                <span className="text-[#1F2350] font-medium">Faculty ratio below norm for 2 programs</span>
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-[#ECEDF7]">
            <button
              onClick={() => openReportModal(svitApp.id)}
              className="px-3.5 py-1.5 bg-[#4F63E8] hover:bg-[#4458DC] text-white rounded-md text-[10.5px] font-bold shadow-xs transition-colors cursor-pointer"
            >
              View Full Report
            </button>
            <button
              onClick={handleExportPdf}
              className="px-3 py-1.5 bg-white hover:bg-gray-50 border border-[#ECEDF7] text-[#1F2350] rounded-md text-[10.5px] font-bold transition-colors cursor-pointer flex items-center gap-1"
            >
              <Download className="w-3 h-3" />
              <span>Export PDF</span>
            </button>
          </div>
        </div>

        {/* RIGHT CARD: AI Suggestions */}
        <div className="bg-white rounded-xl p-4 shadow-card-soft border border-[#ECEDF7] flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md bg-indigo-50 flex items-center justify-center text-[#4F63E8]">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <h3 className="text-[12.5px] font-bold text-[#1F2350]">AI Suggestions</h3>
              </div>
              <span className="text-[9.5px] font-semibold text-[#4F63E8] bg-[#EEF0FD] px-2 py-0.5 rounded">
                4 Recommendations
              </span>
            </div>

            {/* 4 suggestion items with description and Apply button */}
            <div className="space-y-2">
              <div className="p-2 rounded-lg bg-[#FAF8FF] border border-[#EEF0FD] flex items-center justify-between gap-2">
                <div className="overflow-hidden">
                  <p className="text-[10px] text-[#1F2350] font-medium truncate">
                    Seek clarification on address mismatch before approval
                  </p>
                  <p className="text-[9px] text-[#8C91AB]">Why: Land deed parcel 44/A conflicts with affidavit parcel 44/B.</p>
                </div>
                <button
                  onClick={() => applyAiSuggestion('Seek clarification on address mismatch')}
                  className="px-2 py-0.5 rounded bg-white hover:bg-[#EEF0FD] text-[#4F63E8] border border-indigo-100 text-[9.5px] font-bold shrink-0 transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>

              <div className="p-2 rounded-lg bg-[#FAF8FF] border border-[#EEF0FD] flex items-center justify-between gap-2">
                <div className="overflow-hidden">
                  <p className="text-[10px] text-[#1F2350] font-medium truncate">
                    Request updated Fire NOC from the institution
                  </p>
                  <p className="text-[9px] text-[#8C91AB]">Why: Existing certificate lapsed on 12 Mar 2026.</p>
                </div>
                <button
                  onClick={() => applyAiSuggestion('Request updated Fire NOC from the institution')}
                  className="px-2 py-0.5 rounded bg-white hover:bg-[#EEF0FD] text-[#4F63E8] border border-indigo-100 text-[9.5px] font-bold shrink-0 transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>

              <div className="p-2 rounded-lg bg-[#FAF8FF] border border-[#EEF0FD] flex items-center justify-between gap-2">
                <div className="overflow-hidden">
                  <p className="text-[10px] text-[#1F2350] font-medium truncate">
                    Recommend physical inspection for lab facilities (evidence insufficient)
                  </p>
                  <p className="text-[9px] text-[#8C91AB]">Why: Lab equipment geo-tagged photos show low spatial confidence.</p>
                </div>
                <button
                  onClick={() => applyAiSuggestion('Recommend physical inspection for lab facilities')}
                  className="px-2 py-0.5 rounded bg-white hover:bg-[#EEF0FD] text-[#4F63E8] border border-indigo-100 text-[9.5px] font-bold shrink-0 transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>

              <div className="p-2 rounded-lg bg-[#FAF8FF] border border-[#EEF0FD] flex items-center justify-between gap-2">
                <div className="overflow-hidden">
                  <p className="text-[10px] text-[#1F2350] font-medium truncate">
                    Needs manual review for Sanction Plan (73% structural similarity)
                  </p>
                  <p className="text-[9px] text-[#8C91AB]">Why: Structural similarity with Pune Institute App #04112.</p>
                </div>
                <button
                  onClick={() => applyAiSuggestion('Needs manual review for Sanction Plan')}
                  className="px-2 py-0.5 rounded bg-white hover:bg-[#EEF0FD] text-[#4F63E8] border border-indigo-100 text-[9.5px] font-bold shrink-0 transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-[#ECEDF7] mt-2">
            <p className="text-[9px] text-[#8C91AB] italic leading-tight">
              * AI results are decision support. Final decision rests with the authorized officer.
            </p>
          </div>
        </div>
      </div>

      {/* Main Validation Progress Table */}
      <DataTable
        applications={filteredApps}
        selectedAppId={selectedAppId}
        onSelectRow={app => {
          selectApplication(app.id);
          openReportModal(app.id);
        }}
        onViewAll={() => {
          setActiveFilter(null);
          showToast('Showing all applications');
        }}
        viewDetailsClick={() => openReportModal(selectedAppId)}
      />
    </div>
  );
};
