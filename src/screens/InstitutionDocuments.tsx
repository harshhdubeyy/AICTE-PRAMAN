import React, { useState } from 'react';
import {
  UploadCloud,
  FileText,
  Lock,
  Download,
  CheckCircle2,
  AlertTriangle,
  History,
  Send,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { AppDocument } from '../types';

export const InstitutionDocuments: React.FC = () => {
  const { documents, uploadDocument, openReportModal, showToast } = useApp();
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(76);

  const svitDocuments = documents.filter(d => d.applicationId === 'app-1');

  const filteredDocs = svitDocuments.filter(d => {
    if (filterCategory === 'ALL') return true;
    return d.category.toLowerCase().includes(filterCategory.toLowerCase());
  });

  const handleSimulatedUpload = (category: AppDocument['category'] = 'Building & Safety') => {
    setIsUploading(true);
    setUploadProgress(20);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          setTimeout(() => {
            setIsUploading(false);
            uploadDocument('app-1', 'Fire Safety Renewal NOC 2027', category, '1.6 MB');
          }, 400);
          return 100;
        }
        return prev + 25;
      });
    }, 250);
  };

  const handleFetchDigiLocker = () => {
    showToast('Connecting to DigiLocker Aadhaar e-Sign Gateway...');
    setTimeout(() => {
      uploadDocument('app-1', 'DigiLocker Verified Land Revenue Record', 'Land & Ownership', '3.1 MB');
      showToast('Successfully pulled PKI verified Revenue Record from DigiLocker');
    }, 1200);
  };

  return (
    <div className="space-y-4">
      {/* Header & Stats Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[#8C91AB] text-[10px] uppercase font-bold tracking-wider mb-1">
            <span>Statutory Compliance</span>
            <span>›</span>
            <span className="text-[#4F63E8]">Document Vault</span>
          </div>
          <h1 className="text-xl font-bold text-[#1F2350] tracking-tight">Documents & Statutory Vault</h1>
          <p className="text-[11.5px] text-[#8C91AB] max-w-xl">
            Upload, manage, and verify statutory documents with AI-assisted spatial OCR and DigiLocker cryptographically signed timestamping.
          </p>
        </div>

        {/* Counter Pills */}
        <div className="flex items-center gap-2 flex-wrap text-[10.5px] font-bold">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-[#4F63E8] border border-indigo-100">
            TOTAL: {svitDocuments.length}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#3DBE8B] border border-emerald-100">
            EXTRACTED: {svitDocuments.filter(d => d.ocrStatus === 'Extracted').length}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-[#F59A3C] border border-amber-100">
            LOW CONF: {svitDocuments.filter(d => d.ocrStatus === 'Low Confidence').length}
          </span>
        </div>
      </div>

      {/* Drag & Drop Upload Zone matching Stitch design */}
      <div className="border-2 border-dashed border-[#4F63E8]/40 hover:border-[#4F63E8] bg-white rounded-2xl p-6 transition-all text-center space-y-4 shadow-card-soft">
        <div className="w-12 h-12 rounded-2xl bg-[#EEF0FD] text-[#4F63E8] flex items-center justify-center mx-auto">
          <UploadCloud className="w-6 h-6" />
        </div>

        <div className="max-w-md mx-auto">
          <h3 className="text-sm font-bold text-[#1F2350]">
            Drag and drop statutory documents here, or click to browse
          </h3>
          <p className="text-[11px] text-[#8C91AB] mt-1">
            Supports PDF, JPEG, PNG, TIFF up to 25MB each (Scanned deeds, sanction master plans, notarized affidavits, Fire NOCs)
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => handleSimulatedUpload('Building & Safety')}
            className="px-4 py-2 bg-[#4F63E8] hover:bg-[#4458DC] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Select Files</span>
          </button>
          <button
            onClick={handleFetchDigiLocker}
            className="px-4 py-2 bg-[#EEF0FD] hover:bg-indigo-100 text-[#4F63E8] text-xs font-bold rounded-xl transition-all border border-indigo-100 flex items-center gap-1.5 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Fetch from DigiLocker</span>
          </button>
        </div>

        {/* Live Upload Progress Simulator */}
        {isUploading && (
          <div className="max-w-lg mx-auto bg-[#F8F9FE] p-3 rounded-xl border border-indigo-100 text-left space-y-1.5 animate-pulse">
            <div className="flex items-center justify-between text-xs font-semibold text-[#1F2350]">
              <span className="truncate">Uploading: Fire_Safety_NOC_Renewal_2027.pdf (1.6 MB)</span>
              <span className="text-[#4F63E8]">{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4F63E8] rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-[10px] text-[#8C91AB] block">
              Scanning spatial OCR anchors & statutory seal validation...
            </span>
          </div>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap text-xs bg-white p-2.5 rounded-xl border border-[#ECEDF7] shadow-xs">
        <button
          onClick={() => setFilterCategory('ALL')}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            filterCategory === 'ALL'
              ? 'bg-[#4F63E8] text-white shadow-xs'
              : 'text-[#8C91AB] hover:text-[#1F2350] hover:bg-gray-100'
          }`}
        >
          All Categories ({svitDocuments.length})
        </button>
        <button
          onClick={() => setFilterCategory('Land')}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            filterCategory === 'Land'
              ? 'bg-[#4F63E8] text-white shadow-xs'
              : 'text-[#8C91AB] hover:text-[#1F2350] hover:bg-gray-100'
          }`}
        >
          Land & Ownership
        </button>
        <button
          onClick={() => setFilterCategory('Building')}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            filterCategory === 'Building'
              ? 'bg-[#4F63E8] text-white shadow-xs'
              : 'text-[#8C91AB] hover:text-[#1F2350] hover:bg-gray-100'
          }`}
        >
          Building & Safety
        </button>
        <button
          onClick={() => setFilterCategory('Faculty')}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            filterCategory === 'Faculty'
              ? 'bg-[#4F63E8] text-white shadow-xs'
              : 'text-[#8C91AB] hover:text-[#1F2350] hover:bg-gray-100'
          }`}
        >
          Faculty & Pay
        </button>
        <button
          onClick={() => setFilterCategory('Infrastructure')}
          className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
            filterCategory === 'Infrastructure'
              ? 'bg-[#4F63E8] text-white shadow-xs'
              : 'text-[#8C91AB] hover:text-[#1F2350] hover:bg-gray-100'
          }`}
        >
          Infrastructure
        </button>
      </div>

      {/* Documents Table */}
      <div className="bg-white rounded-2xl shadow-card-soft overflow-hidden border border-[#ECEDF7]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-wider text-[#8C91AB] bg-[#F8F9FE] border-b border-[#ECEDF7]">
                <th className="py-2.5 pl-4">Document & ID</th>
                <th className="py-2.5">Category</th>
                <th className="py-2.5">Size / Ver</th>
                <th className="py-2.5">Upload Stamp</th>
                <th className="py-2.5">OCR Status</th>
                <th className="py-2.5">Extracted Key Field</th>
                <th className="py-2.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F1FA] font-medium text-[#1F2350]">
              {filteredDocs.map(doc => {
                const primaryField = doc.extractedFields[0];

                return (
                  <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 pl-4">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#4F63E8] shrink-0" />
                        <div>
                          <span className="font-bold text-[#1F2350] block">{doc.name}</span>
                          <span className="text-[10px] text-[#8C91AB] font-mono block">
                            {doc.fileName}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F4F5FE] text-[#1F2350]">
                        {doc.category}
                      </span>
                    </td>

                    <td className="py-3 text-[11px] text-[#8C91AB]">
                      <span className="font-semibold text-[#1F2350] block">{doc.fileSize}</span>
                      <span className="text-[10px]">{doc.version}</span>
                    </td>

                    <td className="py-3 text-[10.5px] text-[#8C91AB] whitespace-nowrap">
                      {doc.uploadedAt}
                    </td>

                    <td className="py-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10.5px] font-bold ${
                          doc.ocrStatus === 'Extracted'
                            ? 'bg-emerald-50 text-[#3DBE8B]'
                            : doc.ocrStatus === 'Low Confidence'
                            ? 'bg-amber-50 text-[#F59A3C]'
                            : 'bg-indigo-50 text-[#4F63E8]'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            doc.ocrStatus === 'Extracted'
                              ? 'bg-[#3DBE8B]'
                              : doc.ocrStatus === 'Low Confidence'
                              ? 'bg-[#F59A3C]'
                              : 'bg-[#4F63E8]'
                          }`}
                        />
                        <span>{doc.ocrStatus}</span>
                      </span>
                    </td>

                    <td className="py-3 text-[11px]">
                      {primaryField ? (
                        <div className="max-w-xs">
                          <span className="text-[#8C91AB] text-[10px] block font-semibold">
                            {primaryField.fieldName}:
                          </span>
                          <span className="font-bold text-[#1F2350] truncate block">
                            {primaryField.extractedValue}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#8C91AB]">-</span>
                      )}
                    </td>

                    <td className="py-3 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openReportModal('app-1')}
                          className="p-1 hover:text-[#4F63E8] text-[#8C91AB] cursor-pointer"
                          title="View OCR Coordinates"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => showToast(`Downloading verified PDF copy of ${doc.fileName}`)}
                          className="p-1 hover:text-[#4F63E8] text-[#8C91AB] cursor-pointer"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 10(k) Statutory Requirement Box */}
      <div className="bg-white rounded-2xl p-5 shadow-card-soft border border-[#ECEDF7] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF0FD] text-[#4F63E8] flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1F2350]">
              Section 10(k) AICTE Act Statutory Requirement
            </h4>
            <p className="text-[11px] text-[#8C91AB] mt-0.5 leading-relaxed max-w-xl">
              All uploads are cryptographically stamped and mirrored to the Central AICTE Scrutiny Cluster. Untampered hash certificates generated upon submission.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => showToast('Opening immutable document checksum ledger')}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-[#ECEDF7] text-[#1F2350] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>Audit Logs</span>
          </button>
          <button
            onClick={() => showToast('Batch of 18 statutory documents mirrored to AICTE Scrutiny Committee!')}
            className="px-4 py-2 bg-[#4F63E8] hover:bg-[#4458DC] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Batch to AICTE</span>
          </button>
        </div>
      </div>
    </div>
  );
};
