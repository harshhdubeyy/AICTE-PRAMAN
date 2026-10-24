import React from 'react';
import {
  Building,
  Upload,
  History,
  ShieldCheck,
  Play,
  Maximize2,
  AlertTriangle,
  Send,
  Download,
  FileCheck2,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { useApp } from '../store/AppContext';

export const InstitutionInfrastructure: React.FC = () => {
  const { facilities, showToast } = useApp();

  const handleInspectSpatialOcr = (facilityName: string) => {
    showToast(`Inspecting spatial coordinate bounding vectors for ${facilityName}`);
  };

  const handleAddMedia = (facilityName: string) => {
    showToast(`Opened geotagged camera uploader for ${facilityName} (EXIF GPS Lock: active)`);
  };

  const handleUploadAddendum = () => {
    showToast('Addendum Upload: Uploaded proof of 2 additional IEEE e-terminal workstations');
  };

  return (
    <div className="space-y-5">
      {/* Header & Quick Action Buttons */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[#8C91AB] text-[10px] uppercase font-bold tracking-wider mb-1">
            <span>Statutory Compliance</span>
            <span>›</span>
            <span className="text-[#4F63E8]">Physical Infrastructure & Geo-Evidence</span>
          </div>
          <h1 className="text-xl font-bold text-[#1F2350] tracking-tight">
            Physical Infrastructure & Spatial Assets
          </h1>
          <p className="text-[11.5px] text-[#8C91AB] max-w-2xl">
            Manage geotagged photos, spatial video walkthroughs, and municipal sanction floor plans for AICTE physical compliance verification.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <button
            onClick={() => showToast('Opening immutable infrastructure audit ledger')}
            className="h-9 px-3.5 bg-white hover:bg-gray-50 border border-[#ECEDF7] text-[#4F63E8] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <History className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>
          <button
            onClick={() => showToast('Opened high-resolution spatial capture modal (GPS locked)')}
            className="h-9 px-4 bg-[#4F63E8] hover:bg-[#4458DC] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Infrastructure Proof</span>
          </button>
        </div>
      </div>

      {/* Advisory & Completeness Gauge Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Advisory Banner (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-4 sm:p-5 flex items-start gap-3.5 shadow-card-soft border border-[#ECEDF7]">
          <div className="w-10 h-10 rounded-xl bg-[#EEF0FD] text-[#4F63E8] flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="text-xs font-bold text-[#1F2350]">AICTE Statutory Clause 10(k) Mandate</span>
              <span className="px-2 py-0.5 rounded-full bg-[#F4F5FE] text-[#4F63E8] text-[9.5px] font-bold">
                Self-Disclosure Cycle
              </span>
            </div>
            <p className="text-[11px] text-[#8C91AB] leading-relaxed">
              <strong className="text-[#1F2350]">Automated spatial & image analysis is advisory and does not replace statutory physical inspection.</strong> All geotagged media must retain original EXIF metadata with GPS accuracy within 5 meters under National Building Code (NBC 2016) Part 3 norms.
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-[10px] text-[#4F63E8] font-bold self-center whitespace-nowrap pl-2">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3DBE8B]" />
            <span>NIC Root CA Active</span>
          </div>
        </div>

        {/* Completeness Gauge Card (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-5 flex flex-col justify-between shadow-card-soft border border-[#ECEDF7]">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] text-[#8C91AB] uppercase tracking-wider font-bold">
                Evidence Completeness
              </span>
              <h3 className="text-xl font-bold text-[#1F2350] mt-0.5">
                84% <span className="text-xs text-[#3DBE8B] font-semibold">Compliant</span>
              </h3>
            </div>

            {/* Radial SVG gauge */}
            <div className="relative w-12 h-12 flex items-center justify-center">
              <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-gray-100"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                />
                <path
                  className="text-[#4F63E8]"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="currentColor"
                  strokeDasharray="84, 100"
                  strokeLinecap="round"
                  strokeWidth="3.5"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-[#1F2350]">84%</span>
            </div>
          </div>

          <div className="mt-2 pt-2 flex items-center justify-between text-[10px] text-[#8C91AB] border-t border-gray-100">
            <span>4/4 Spatial Categories Filed</span>
            <span className="font-semibold text-[#F59A3C] flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F59A3C]" />
              2 Surveyor Signoffs Pending
            </span>
          </div>
        </div>
      </div>

      {/* 4 Category Bento Cards */}
      <div className="space-y-4">
        {facilities.map(facility => {
          const isWarning = facility.status.includes('Deficiency');

          return (
            <div
              key={facility.id}
              className={`bg-white rounded-2xl p-4 sm:p-5 shadow-card-soft border transition-all flex flex-col gap-3.5 ${
                isWarning ? 'border-[#F59A3C] ring-1 ring-[#F59A3C]/20' : 'border-[#ECEDF7]'
              }`}
            >
              {/* Card Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#F8F9FE] flex items-center justify-center text-[#4F63E8] shadow-xs shrink-0">
                    <Building className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-bold text-[#1F2350]">{facility.name}</h2>
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-semibold text-[#8C91AB]">
                        {facility.unitsActive}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#8C91AB]">{facility.subtitle}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-center">
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10.5px] font-bold flex items-center gap-1.5 ${
                      isWarning
                        ? 'bg-amber-100 text-[#92400E]'
                        : 'bg-emerald-50 text-[#047857]'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        isWarning ? 'bg-[#F59A3C]' : 'bg-[#3DBE8B]'
                      }`}
                    />
                    <span>{facility.status}</span>
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="flex flex-col gap-1.5 bg-[#F8F9FE] p-2.5 rounded-xl border border-indigo-50">
                <div className="flex items-center justify-between text-[10.5px]">
                  <span className="font-semibold text-[#1F2350]">Spatial Proof Submission Rate</span>
                  <span className={`font-bold ${isWarning ? 'text-[#D97706]' : 'text-[#4F63E8]'}`}>
                    {facility.statsText}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${isWarning ? 'bg-[#F59A3C]' : 'bg-[#4F63E8]'}`}
                    style={{ width: `${facility.submissionRate}%` }}
                  />
                </div>
              </div>

              {/* Media Thumbnails Grid (3 items) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {facility.media.map((mediaItem, idx) => (
                  <div
                    key={idx}
                    className="group relative rounded-xl overflow-hidden bg-gray-900 h-40 shadow-sm flex flex-col justify-between p-3 select-none"
                    style={{
                      backgroundImage: `url('${mediaItem.imageUrl}')`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {/* Dark gradient overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                    {/* Top badging */}
                    <div className="relative z-10 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm text-white text-[9.5px] font-semibold">
                        {mediaItem.coordinates || mediaItem.metaInfo}
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-white/95 text-[9.5px] font-bold text-[#1F2350]">
                        {mediaItem.badge}
                      </span>
                    </div>

                    {/* Play button if video */}
                    {mediaItem.type === 'video' && (
                      <div className="absolute inset-0 flex items-center justify-center z-10">
                        <div className="w-10 h-10 rounded-full bg-white/90 group-hover:scale-110 group-hover:bg-[#4F63E8] text-[#4F63E8] group-hover:text-white flex items-center justify-center shadow-lg transition-all cursor-pointer">
                          <Play className="w-4 h-4 fill-current ml-0.5" />
                        </div>
                      </div>
                    )}

                    {/* Bottom labels */}
                    <div className="relative z-10 flex flex-col">
                      <span className="text-white text-xs font-bold leading-tight">
                        {mediaItem.title}
                      </span>
                      <span className="text-white/80 text-[10px] mt-0.5 truncate">
                        {mediaItem.subtitle}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Metrics & Action Footer */}
              <div className="flex flex-col md:flex-row md:items-center justify-between pt-2 gap-2 border-t border-gray-100 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  {facility.metrics.map((m, mIdx) => (
                    <div key={mIdx} className="flex items-center gap-1.5">
                      <span className="text-[#8C91AB] font-semibold">{m.label}:</span>
                      <strong className={`font-bold ${m.isWarning ? 'text-[#D97706]' : 'text-[#1F2350]'}`}>
                        {m.value}
                      </strong>
                      <span className="text-[10px] text-[#8C91AB]">({m.normInfo})</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  {isWarning ? (
                    <button
                      onClick={handleUploadAddendum}
                      className="h-8 px-3 bg-[#F59A3C] hover:bg-[#D97706] text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload Addendum</span>
                    </button>
                  ) : null}

                  <button
                    onClick={() => handleInspectSpatialOcr(facility.name)}
                    className="h-8 px-2.5 rounded-lg hover:bg-gray-100 text-[#4F63E8] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                    <span>Inspect Spatial OCR</span>
                  </button>

                  <button
                    onClick={() => handleAddMedia(facility.name)}
                    className="h-8 px-2.5 bg-[#EEF0FD] hover:bg-indigo-100 text-[#4F63E8] text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Media</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Statutory Submission Bar (Section 10(k) Batch Ready Card) */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-card-soft border border-[#ECEDF7] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-[#3DBE8B] shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1F2350]">Ready for Scrutiny Committee Dispatch</h4>
            <p className="text-[11px] text-[#8C91AB] mt-0.5">
              Batch checksum generated: <code className="bg-[#F4F5FE] px-1.5 py-0.5 rounded text-[#1F2350] font-mono">SHA-256: 8f2a...c04e</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              showToast('Downloading complete spatial infrastructure dossier PDF');
              window.print();
            }}
            className="h-9 px-3.5 bg-white hover:bg-gray-50 border border-[#ECEDF7] text-[#1F2350] rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Dossier PDF</span>
          </button>
          <button
            onClick={() => showToast('Batch submitted to AICTE Committee! Timestamp recorded.')}
            className="h-9 px-4 bg-[#4F63E8] hover:bg-[#4458DC] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Batch to AICTE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
