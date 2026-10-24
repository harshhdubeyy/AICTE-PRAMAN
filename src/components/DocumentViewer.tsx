import React, { useState } from 'react';
import { ZoomIn, ZoomOut, Maximize2, ShieldCheck, Send } from 'lucide-react';
import { useApp } from '../store/AppContext';

interface DocumentViewerProps {
  onInsertToClarification?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({ onInsertToClarification }) => {
  const { showToast, applyAiSuggestion } = useApp();
  const [zoomLevel, setZoomLevel] = useState<number>(100);
  const [selectedDoc, setSelectedDoc] = useState<string>('doc-3');

  const handleZoom = (delta: number) => {
    setZoomLevel(prev => Math.min(150, Math.max(75, prev + delta)));
  };

  const resetZoom = () => {
    setZoomLevel(100);
    showToast('Auto-fit spatial bounding coordinates');
  };

  return (
    <div className="bg-white rounded-2xl shadow-card-soft p-4 sm:p-5 flex flex-col space-y-3">
      {/* Evidence Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-gray-100 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#EEF0FD] text-[#4F63E8] flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-[#1F2350]">
              Spatial Coordinate OCR Verification & Bounding Box Viewer
            </h2>
            <p className="text-[10px] text-[#8C91AB]">
              Computer Vision Anchor Analysis • Neural Layer Bounding Inspection
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={selectedDoc}
            onChange={e => {
              setSelectedDoc(e.target.value);
              showToast(`Switched document canvas: ${e.target.options[e.target.selectedIndex].text}`);
            }}
            className="text-xs font-semibold bg-[#F4F5FE] text-[#1F2350] rounded-lg px-2.5 py-1 border-0 focus:ring-1 focus:ring-[#4F63E8] cursor-pointer"
          >
            <option value="doc-3">Doc 03: Notarized Sworn Affidavit.pdf</option>
            <option value="doc-1">Doc 01: Registered Land Title Deed.pdf</option>
            <option value="doc-7">Doc 07: Fire Safety NOC.pdf</option>
          </select>

          <div className="flex items-center bg-[#F4F5FE] rounded-lg p-0.5 text-xs text-[#1F2350] font-bold">
            <button
              onClick={() => handleZoom(15)}
              className="px-2 py-0.5 hover:bg-white rounded cursor-pointer"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="px-1.5 text-[10px] text-[#8C91AB]">{zoomLevel}%</span>
            <button
              onClick={() => handleZoom(-15)}
              className="px-2 py-0.5 hover:bg-white rounded cursor-pointer"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={resetZoom}
              className="px-1.5 py-0.5 hover:bg-white rounded text-[10px] cursor-pointer"
              title="Fit"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Evidence Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Left 60%: Simulated Scanned PDF with Bounding Boxes */}
        <div className="lg:col-span-7 bg-[#EDF0F9] p-4 rounded-xl relative overflow-hidden flex flex-col items-center">
          <div
            className="w-full max-w-[460px] bg-white rounded-lg shadow-md p-6 relative select-none font-serif text-[#333] text-[11px] leading-relaxed transition-transform duration-200"
            style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: 'top center' }}
          >
            {/* PDF Watermark & Official Stamp Mockup */}
            <div className="flex items-center justify-between border-b-2 border-[#1F2350]/30 pb-3 mb-4">
              <div className="text-center w-full">
                <p className="text-[9px] uppercase tracking-widest font-sans font-extrabold text-[#1F2350]">
                  Government of Maharashtra • Revenue Authority
                </p>
                <p className="text-xs font-bold font-sans text-[#1F2350]">
                  FORM NO. 14 - LAND TITLE & CAMPUS POSSESSION AFFIDAVIT
                </p>
              </div>
            </div>

            {/* Page Body with Mockup Lines */}
            <p className="text-[10px] leading-normal text-gray-700">
              I, Sri. Ramdas Patil, Secretary of Venkateswara Charitable Trust, solemnly affirm that the educational campus is located on contiguous land as per norm:
            </p>

            {/* BOUNDING BOX 1: Yellow/Orange Discrepancy Highlight */}
            <div className="relative my-3 p-2.5 border-2 border-dashed border-[#F59A3C] bg-orange-50/60 rounded">
              <span className="absolute -top-2.5 left-2 px-1.5 py-0.2 bg-[#F59A3C] text-white text-[9px] font-sans font-bold rounded shadow-xs">
                Spatial OCR: 92.4% (Mismatch)
              </span>
              <p className="font-sans font-bold text-[#1F2350] text-xs">
                &ldquo;Plot No. 44/B, Hinjawadi Phase-1, Taluka Mulshi, District Pune 411057, measuring 3.10 Acres&rdquo;
              </p>
            </div>

            <p className="text-[10px] text-gray-600">
              The said property has unobstructed motorable access, free of encumbrances, and approved by the Municipal Town Planner under master plan 2024.
            </p>

            {/* BOUNDING BOX 2: Indigo Primary Highlight */}
            <div className="relative my-3 p-2.5 border border-[#4F63E8] bg-indigo-50/40 rounded">
              <span className="absolute -top-2.5 left-2 px-1.5 py-0.2 bg-[#4F63E8] text-white text-[9px] font-sans font-bold rounded shadow-xs">
                Target Match: 98.7%
              </span>
              <p className="font-sans text-[10px] text-[#1F2350]">
                Built-up Academic Area: 14,200 sq. meters • Approved Floor Space Index (FSI): 1.50
              </p>
            </div>

            {/* Simulated Signatures & Notary Stamp */}
            <div className="mt-6 pt-3 border-t border-gray-200 flex items-center justify-between">
              <div>
                <div className="w-20 h-6 border-b border-gray-400" />
                <span className="text-[8px] font-sans text-gray-400">Notary Public Signature</span>
              </div>
              <div className="w-14 h-14 rounded-full border-2 border-[#4F63E8]/30 flex items-center justify-center rotate-12">
                <span className="text-[8px] font-sans font-bold text-[#4F63E8] text-center leading-none">
                  PUNE SUB-REG<br />SEAL 2026
                </span>
              </div>
            </div>
          </div>

          {/* Footnote on Coordinates */}
          <div className="w-full flex items-center justify-between text-[10px] text-[#8C91AB] mt-2 px-1">
            <span>Bounding Coordinates: [X: 142px, Y: 310px, W: 260px, H: 45px]</span>
            <span className="text-[#4F63E8] font-semibold">Tesseract-NLP v4.11</span>
          </div>
        </div>

        {/* Right 40%: Evidence & AI Rule Explanation Panel */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="p-3.5 bg-[#EEF0FD]/70 rounded-xl flex flex-col space-y-2 border border-indigo-100">
            <span className="text-[10px] uppercase font-bold text-[#4F63E8] tracking-wider">
              Regulatory Reference
            </span>
            <h4 className="text-xs font-bold text-[#1F2350]">AICTE APH 2026-27 Chapter II, Cl. 4.2</h4>
            <p className="text-[11px] text-[#8C91AB] leading-relaxed">
              &ldquo;Land Title authenticity mandates that spatial boundary survey identifiers in self-attested affidavits must match the register of deed entries with exact revenue coordinates.&rdquo;
            </p>
          </div>

          <div className="p-3 bg-white rounded-xl border border-gray-100 space-y-2 text-[11px]">
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-[#8C91AB]">Extracted Plot ID:</span>
              <span className="font-bold text-[#F59A3C]">Plot 44/B</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-[#8C91AB]">Land Deed Survey No:</span>
              <span className="font-bold text-[#1F2350]">Survey 44/A</span>
            </div>
            <div className="flex justify-between py-1 border-b border-gray-50">
              <span className="text-[#8C91AB]">Bounding Box Match:</span>
              <span className="font-bold text-[#3DBE8B]">Confidence 92.4%</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-[#8C91AB]">Spatial Engine Model:</span>
              <span className="font-semibold text-[#1F2350]">VisionNLP-v4.11.2</span>
            </div>
          </div>

          <div className="p-3 bg-[#FFF8E6] rounded-xl border border-[#FFE7BA] text-[11px]">
            <span className="font-bold text-[#873800] block mb-1">Bureau Recommendation:</span>
            <p className="text-[#AD4E00] leading-snug">
              Request registered amendment deed or sworn clarification certificate from District Sub-Registrar before proceeding to SAC approval.
            </p>
          </div>

          <button
            onClick={() => {
              if (onInsertToClarification) {
                onInsertToClarification();
              } else {
                applyAiSuggestion('Seek clarification on address mismatch');
              }
            }}
            className="w-full py-2 bg-[#4F63E8] text-white rounded-lg text-xs font-bold hover:bg-[#4458DC] transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Insert Recommendation to Clarification Draft</span>
          </button>
        </div>
      </div>
    </div>
  );
};
