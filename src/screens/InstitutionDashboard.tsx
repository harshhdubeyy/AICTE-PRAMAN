import React, { useState } from 'react';
import {
  MapPin,
  Flame,
  Users,
  Wallet,
  Camera,
  Bot,
  Filter,
  MoreVertical,
  UploadCloud,
  Edit3,
  UserPlus,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { HeroBanner } from '../components/HeroBanner';
import { CategoryCard } from '../components/CategoryCard';
import { Stepper } from '../components/Stepper';
import { StatusDot } from '../components/StatusDot';

export const InstitutionDashboard: React.FC = () => {
  const {
    documents,
    openReportModal,
    setActiveNav,
    resubmitDocument,
    showToast
  } = useApp();

  const [selectedRowId, setSelectedRowId] = useState<string>('doc-svit-02'); // Notarized Affidavit selected by default

  const svitDocuments = documents.filter(d => d.applicationId === 'app-1');

  const handleFixAffidavit = () => {
    resubmitDocument('app-1', 'doc-svit-02');
  };

  const handleFixFireNoc = () => {
    setActiveNav('documents');
    showToast('Redirected to Documents Vault for Fire NOC Renewal upload');
  };

  const handleFixCadre = () => {
    setActiveNav('documents');
    showToast('Redirected to Faculty Roster amendment section');
  };

  return (
    <div className="space-y-5">
      {/* 1. Hero Banner */}
      <HeroBanner
        cycleBadge="AICTE APPROVAL CYCLE 2026-27"
        statusBadge="Scrutiny Engine Live"
        greeting="Good Morning, Sri Venkateswara Institute"
        subtext="You have 3 deficiencies to fix and 1 new query from AICTE. Let's resolve them."
        primaryButtonText="View Report"
        onPrimaryClick={() => openReportModal('app-1')}
        showCompletenessBadge={true}
        completenessPercent={78}
      />

      {/* 2. Documents You Need to Submit (5 Category Cards) */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h2 className="text-[14px] font-bold text-[#1F2350]">Documents You Need to Submit</h2>
            <span className="text-[10px] font-semibold bg-white text-[#8C91AB] px-2 py-0.5 rounded shadow-xs">
              5 Categories
            </span>
          </div>
          <button
            onClick={() => setActiveNav('documents')}
            className="text-[10px] font-bold text-[#4F63E8] hover:text-[#4458DC] transition-colors bg-white px-2.5 py-1 rounded shadow-xs cursor-pointer"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          <CategoryCard
            title="Land & Ownership"
            countText="(2 Pending)"
            icon={<MapPin className="w-4 h-4" />}
            gradient="bg-gradient-to-br from-[#4F63E8] to-[#3B4ED4]"
            statusDotColor="#EF4444"
            onClick={() => setActiveNav('documents')}
          />
          <CategoryCard
            title="Building & Fire Safety"
            countText="(1 Expiring)"
            icon={<Flame className="w-4 h-4" />}
            gradient="bg-gradient-to-br from-[#FF7A59] to-[#EE5B37]"
            statusDotColor="#F59E0B"
            onClick={() => setActiveNav('documents')}
          />
          <CategoryCard
            title="Faculty Details"
            countText="(3 Pending)"
            icon={<Users className="w-4 h-4" />}
            gradient="bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9]"
            statusDotColor="#4F63E8"
            onClick={() => setActiveNav('documents')}
          />
          <CategoryCard
            title="Financial Documents"
            countText="(All Verified)"
            icon={<Wallet className="w-4 h-4" />}
            gradient="bg-gradient-to-br from-[#22C55E] to-[#16A34A]"
            statusDotColor="#22C55E"
            onClick={() => setActiveNav('documents')}
          />
          <CategoryCard
            title="Infrastructure"
            countText="(4 Uploaded)"
            icon={<Camera className="w-4 h-4" />}
            gradient="bg-gradient-to-br from-[#FF5B79] to-[#E03E5D]"
            statusDotColor="#8B5CF6"
            onClick={() => setActiveNav('infrastructure')}
          />
        </div>
      </div>

      {/* 3. Application Status & Stepper */}
      <div className="bg-white rounded-xl p-5 shadow-card-soft border border-[#ECEDF7] flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#4F63E8]" />
            <h3 className="text-[13.5px] font-bold text-[#1F2350]">Application Status — EoA 2026-27</h3>
            <span className="text-[10px] text-[#8C91AB] bg-[#F4F5FE] px-2 py-0.5 rounded font-mono">
              AICTE-2026-04821
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
              <span className="text-[11px] text-[#8C91AB]">Overall Completeness</span>
              <span className="text-[13px] font-bold text-[#4F63E8]">78%</span>
            </div>
            <div className="w-28 h-2 rounded-full bg-[#ECEEFF] overflow-hidden">
              <div className="h-full bg-[#4F63E8] rounded-full transition-all duration-500" style={{ width: '78%' }} />
            </div>
          </div>
        </div>

        <Stepper currentStage="AI Validation" />
      </div>

      {/* 4. AI Remediation Guidance (3 Priority Deficiencies) */}
      <div className="bg-white rounded-xl p-5 shadow-card-soft border border-[#ECEDF7] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-[#EEF0FD] text-[#4F63E8] flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <h3 className="text-[13.5px] font-bold text-[#1F2350]">AI Remediation Guidance</h3>
            <span className="text-[10px] text-[#EF4444] bg-[#FEE2E2] px-2 py-0.5 rounded-full font-bold">
              3 Priority Deficiencies
            </span>
          </div>
          <span className="text-[11px] text-[#4F63E8] font-semibold flex items-center gap-1">
            Auto-Detected by OCR Model
          </span>
        </div>

        <div className="flex flex-col gap-2 mt-1">
          {/* Priority 1 */}
          <div className="p-3.5 rounded-lg bg-[#F4F5FE] hover:bg-[#EEF0FD]/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F59A3C] mt-1.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-[#1F2350]">
                    Upload a Fire NOC valid beyond 31 Dec 2026
                  </span>
                  <span className="text-[9.5px] text-[#EF4444] bg-white px-2 py-0.5 rounded font-semibold shadow-xs">
                    Mandatory
                  </span>
                </div>
                <p className="text-[11.5px] text-[#8C91AB] mt-0.5">
                  Existing NOC #MH-F-2021 expired on 12 Mar 2026. State Fire Advisory requires minimum 12 months remaining validity.
                </p>
              </div>
            </div>
            <button
              onClick={handleFixFireNoc}
              className="self-start md:self-auto h-7 px-3 bg-[#4F63E8] text-white hover:bg-[#4458DC] text-[11px] font-semibold rounded-md shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload Renewal</span>
            </button>
          </div>

          {/* Priority 2 */}
          <div className="p-3.5 rounded-lg bg-[#F4F5FE] hover:bg-[#EEF0FD]/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] mt-1.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-[#1F2350]">
                    Correct the address in the affidavit to match the land deed
                  </span>
                  <span className="text-[9.5px] text-[#EF4444] bg-white px-2 py-0.5 rounded font-semibold shadow-xs">
                    Mismatch
                  </span>
                </div>
                <p className="text-[11.5px] text-[#8C91AB] mt-0.5">
                  Affidavit states ‘Plot 44/B, Hinjawadi Phase-1’ whereas Land Deed specifies ‘Survey 44/A’. AI spatial mismatch detected.
                </p>
              </div>
            </div>
            <button
              onClick={handleFixAffidavit}
              className="self-start md:self-auto h-7 px-3 bg-[#4F63E8] text-white hover:bg-[#4458DC] text-[11px] font-semibold rounded-md shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Replace Affidavit</span>
            </button>
          </div>

          {/* Priority 3 */}
          <div className="p-3.5 rounded-lg bg-[#F4F5FE] hover:bg-[#EEF0FD]/60 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4F63E8] mt-1.5 shrink-0" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-[#1F2350]">
                    Update Faculty Cadre Ratio for Computer Science Dept
                  </span>
                  <span className="text-[9.5px] text-[#4F63E8] bg-white px-2 py-0.5 rounded font-semibold shadow-xs">
                    Norm Violation
                  </span>
                </div>
                <p className="text-[11.5px] text-[#8C91AB] mt-0.5">
                  Professor to Asst Professor ratio is 1:2.8 (Norm requires 1:2:6). 2 additional assistant faculty required.
                </p>
              </div>
            </div>
            <button
              onClick={handleFixCadre}
              className="self-start md:self-auto h-7 px-3 bg-[#4F63E8] text-white hover:bg-[#4458DC] text-[11px] font-semibold rounded-md shadow-xs transition-colors shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Update Cadre</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Document Validation Status Table (with Solid Indigo Selected Row) */}
      <div className="bg-white rounded-xl p-5 shadow-card-soft border border-[#ECEDF7] flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-[14px] font-bold text-[#1F2350]">Document Validation Status</h3>
            <span className="text-[11px] text-[#8C91AB]">({svitDocuments.length} Records)</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => showToast('Filtered by latest verification status')}
              className="w-7 h-7 rounded-lg bg-[#F4F5FE] hover:bg-[#EEF0FD] text-[#8C91AB] flex items-center justify-center transition-colors cursor-pointer"
            >
              <Filter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setActiveNav('documents')}
              className="h-6 px-2.5 rounded bg-[#F4F5FE] hover:bg-[#EEF0FD] text-[#4F63E8] text-[11px] font-semibold transition-colors cursor-pointer"
            >
              View All
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-9 text-[11px] font-semibold text-[#8C91AB] bg-[#F4F5FE] rounded-lg">
                <th className="py-2 px-3 rounded-l-lg">Document Name</th>
                <th className="py-2 px-3">Type</th>
                <th className="py-2 px-3">Uploaded</th>
                <th className="py-2 px-3">Status</th>
                <th className="py-2 px-3 text-right rounded-r-lg">Actions</th>
              </tr>
            </thead>
            <tbody className="text-[12px]">
              {svitDocuments.map(doc => {
                const isSelected = doc.id === selectedRowId;

                if (isSelected) {
                  return (
                    <tr
                      key={doc.id}
                      onClick={() => openReportModal('app-1')}
                      className="h-12 bg-[#4F63E8] text-white rounded-xl shadow-row-selected font-medium cursor-pointer"
                    >
                      <td className="py-2 px-3 rounded-l-xl font-bold flex items-center gap-2">
                        <span>{doc.name}</span>
                        <span className="bg-white/20 text-white text-[9.5px] px-1.5 py-0.5 rounded font-mono">
                          Active Fix
                        </span>
                      </td>
                      <td className="py-2 px-3 text-white/90">{doc.documentType}</td>
                      <td className="py-2 px-3 text-white/90 text-[11px]">{doc.uploadedAt}</td>
                      <td className="py-2 px-3">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-white bg-white/20 px-2.5 py-0.5 rounded-full">
                          <span className="w-2 h-2 rounded-full bg-[#F59A3C]" />
                          <span>{doc.status}</span>
                        </span>
                      </td>
                      <td className="py-2 px-3 text-right rounded-r-xl">
                        <button className="w-7 h-7 rounded hover:bg-white/20 text-white inline-flex items-center justify-center">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={doc.id}
                    onClick={() => setSelectedRowId(doc.id)}
                    className="h-11 hover:bg-[#F4F5FE]/70 transition-colors border-b border-[#ECEEFF]/50 cursor-pointer text-[#1F2350]"
                  >
                    <td className="py-2 px-3 font-semibold flex items-center gap-2">
                      <span className="truncate">{doc.name}</span>
                    </td>
                    <td className="py-2 px-3 text-[#8C91AB] text-[11px]">{doc.documentType}</td>
                    <td className="py-2 px-3 text-[#8C91AB] text-[11px]">{doc.uploadedAt}</td>
                    <td className="py-2 px-3">
                      <StatusDot status={doc.status} />
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button className="w-7 h-7 rounded hover:bg-[#EEF0FD] text-[#8C91AB] inline-flex items-center justify-center">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compliance Engine & Integrity Banner */}
      <div className="bg-white rounded-xl p-3 shadow-card-soft border border-[#ECEDF7] flex flex-col md:flex-row items-center justify-between gap-3 text-[#8C91AB] text-[11px]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[#4F63E8] font-semibold">
            <ShieldCheck className="w-4 h-4" />
            <span>AICTE PRAMAN Compliance Engine v4.11.2 (Spatial Coordinate OCR)</span>
          </div>
          <span className="hidden sm:inline text-gray-200">•</span>
          <span className="flex items-center gap-1 text-[#3DBE8B] font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            DigiLocker PKI Verified
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-[#F4F5FE] px-2.5 py-0.5 rounded font-mono font-medium text-[#1F2350]">
            Digital Signature Verified • Section 10(k)
          </span>
        </div>
      </div>
    </div>
  );
};
