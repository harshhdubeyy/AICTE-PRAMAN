import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  UploadCloud,
  FileText,
  Lock,
  Download,
  AlertTriangle,
  History,
  Send,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';
import {
  getDocuments,
  uploadPdf,
  downloadDocumentReport,
  type BackendDocument,
} from '../services/documentApi';

type CategoryFilter = 'ALL' | 'Land' | 'Building' | 'Faculty' | 'Infrastructure';

const formatDate = (value: string) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const getReviewLabel = (doc: BackendDocument) => {
  const review = (doc.review || '').trim();
  const flag = (doc.flag || '').trim();
  if (review && review.toLowerCase() !== 'pending') return review;
  if (flag && flag.toLowerCase() !== 'pending') return `Flagged: ${flag}`;
  return 'Pending review';
};

export const InstitutionDocuments: React.FC = () => {
  const [filterCategory, setFilterCategory] = useState<CategoryFilter>('ALL');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [backendDocuments, setBackendDocuments] = useState<BackendDocument[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [reportLoadingId, setReportLoadingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshBackendDocuments = useCallback(async () => {
    setApiLoading(true);
    setApiError(null);
    try {
      const data = await getDocuments();
      setBackendDocuments(data);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Could not load documents. Check that the backend is running.';
      setApiError(message);
    } finally {
      setApiLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshBackendDocuments();
  }, [refreshBackendDocuments]);

  const filteredDocs = backendDocuments.filter((doc) => {
    if (filterCategory === 'ALL') return true;
    // The backend currently does not store document categories. Filter by filename
    // until category metadata is added to the API.
    return doc.filename.toLowerCase().includes(filterCategory.toLowerCase());
  });

  const handleSelectFiles = () => fileInputRef.current?.click();

  const handleRealUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    event.target.value = '';

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setApiError('Please select a PDF file. The current backend accepts PDF uploads only.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setApiError('PDF must be 10 MB or smaller.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);
    setApiError(null);
    try {
      setUploadProgress(50);
      await uploadPdf(file);
      setUploadProgress(100);
      await refreshBackendDocuments();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload failed.';
      setApiError(`Upload failed: ${message}`);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDownloadReport = async (doc: BackendDocument) => {
    setReportLoadingId(doc.id);
    setApiError(null);
    try {
      await downloadDocumentReport(doc.id);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not download report.';
      setApiError(message);
    } finally {
      setReportLoadingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-1.5 text-[#8C91AB] text-[10px] uppercase font-bold tracking-wider mb-1">
            <span>Statutory Compliance</span>
            <span>›</span>
            <span className="text-[#4F63E8]">Document Vault</span>
          </div>
          <h1 className="text-xl font-bold text-[#1F2350] tracking-tight">
            Documents &amp; Statutory Vault
          </h1>
          <p className="text-[11.5px] text-[#8C91AB] max-w-xl">
            Upload PDF documents, review their recorded status, and generate a downloadable
            report. Uploading a file does not by itself authenticate the document.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap text-[10.5px] font-bold">
          <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-[#4F63E8] border border-indigo-100">
            TOTAL: {backendDocuments.length}
          </span>
          <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-[#F59A3C] border border-amber-100">
            PENDING: {backendDocuments.filter((doc) => getReviewLabel(doc).toLowerCase().includes('pending')).length}
          </span>
          <button
            onClick={() => void refreshBackendDocuments()}
            disabled={apiLoading}
            className="px-2.5 py-1 rounded-lg bg-white text-[#4F63E8] border border-indigo-100 disabled:opacity-50 inline-flex items-center gap-1"
            title="Refresh documents"
          >
            <RefreshCw className={`w-3 h-3 ${apiLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="border-2 border-dashed border-[#4F63E8]/40 hover:border-[#4F63E8] bg-white rounded-2xl p-6 transition-all text-center space-y-4 shadow-card-soft">
        <div className="w-12 h-12 rounded-2xl bg-[#EEF0FD] text-[#4F63E8] flex items-center justify-center mx-auto">
          <UploadCloud className="w-6 h-6" />
        </div>
        <div className="max-w-md mx-auto">
          <h3 className="text-sm font-bold text-[#1F2350]">
            Select a PDF document to upload
          </h3>
          <p className="text-[11px] text-[#8C91AB] mt-1">
            PDF only · Maximum 10 MB · Documents are recorded by the connected backend for review.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          className="hidden"
          onChange={handleRealUpload}
        />

        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleSelectFiles}
            disabled={isUploading}
            className="px-4 py-2 bg-[#4F63E8] hover:bg-[#4458DC] disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>{isUploading ? 'Uploading…' : 'Select PDF'}</span>
          </button>
        </div>

        {isUploading && (
          <div className="max-w-lg mx-auto bg-[#F8F9FE] p-3 rounded-xl border border-indigo-100 text-left space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-[#1F2350]">
              <span>Uploading selected PDF…</span>
              <span className="text-[#4F63E8]">{uploadProgress}%</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#4F63E8] rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
            <span className="text-[10px] text-[#8C91AB] block">
              Sending file to the backend. Review status will be shown after upload.
            </span>
          </div>
        )}
      </div>

      {apiError && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-3 text-xs">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Backend notice</p>
            <p className="mt-0.5 break-words">{apiError}</p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap text-xs bg-white p-2.5 rounded-xl border border-[#ECEDF7] shadow-xs">
        {([
          ['ALL', `All Documents (${backendDocuments.length})`],
          ['Land', 'Land & Ownership'],
          ['Building', 'Building & Safety'],
          ['Faculty', 'Faculty & Pay'],
          ['Infrastructure', 'Infrastructure'],
        ] as [CategoryFilter, string][]).map(([value, label]) => (
          <button
            key={value}
            onClick={() => setFilterCategory(value)}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              filterCategory === value
                ? 'bg-[#4F63E8] text-white shadow-xs'
                : 'text-[#8C91AB] hover:text-[#1F2350] hover:bg-gray-100'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-card-soft overflow-hidden border border-[#ECEDF7]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-[10px] font-bold uppercase tracking-wider text-[#8C91AB] bg-[#F8F9FE] border-b border-[#ECEDF7]">
                <th className="py-2.5 pl-4">Document &amp; ID</th>
                <th className="py-2.5">Category</th>
                <th className="py-2.5">Review / Flag</th>
                <th className="py-2.5">Uploaded</th>
                <th className="py-2.5">Review status</th>
                <th className="py-2.5">Notes</th>
                <th className="py-2.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F0F1FA] font-medium text-[#1F2350]">
              {apiLoading && backendDocuments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#8C91AB]">
                    Loading documents from backend…
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#8C91AB]">
                    {backendDocuments.length === 0
                      ? 'No backend documents yet. Select a PDF above to upload one.'
                      : 'No documents match this filter.'}
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => {
                  const reviewLabel = getReviewLabel(doc);
                  return (
                    <tr key={doc.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 pl-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#4F63E8] shrink-0" />
                          <div className="min-w-0">
                            <span className="font-bold text-[#1F2350] block break-all">
                              {doc.filename}
                            </span>
                            <span className="text-[10px] text-[#8C91AB] font-mono block break-all">
                              ID: {doc.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F4F5FE] text-[#1F2350]">
                          Not classified
                        </span>
                      </td>
                      <td className="py-3 text-[11px] text-[#8C91AB]">
                        <span className="block text-[#1F2350]">{doc.review || 'Pending'}</span>
                        <span className="text-[10px]">Flag: {doc.flag || 'pending'}</span>
                      </td>
                      <td className="py-3 text-[10.5px] text-[#8C91AB] whitespace-nowrap">
                        {formatDate(doc.created_at)}
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10.5px] font-bold bg-amber-50 text-[#9A6700]">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {reviewLabel}
                        </span>
                      </td>
                      <td className="py-3 text-[11px] max-w-xs">
                        <span className="text-[#8C91AB] break-words">{doc.note || '—'}</span>
                      </td>
                      <td className="py-3 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => void handleDownloadReport(doc)}
                            disabled={reportLoadingId === doc.id}
                            className="p-1 hover:text-[#4F63E8] text-[#8C91AB] disabled:opacity-50 cursor-pointer"
                            title="Download PDF report"
                          >
                            <Download className={`w-3.5 h-3.5 ${reportLoadingId === doc.id ? 'animate-pulse' : ''}`} />
                          </button>
                          <button
                            onClick={() => void refreshBackendDocuments()}
                            className="p-1 hover:text-[#4F63E8] text-[#8C91AB] cursor-pointer"
                            title="Refresh document status"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-card-soft border border-[#ECEDF7] flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF0FD] text-[#4F63E8] flex items-center justify-center shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1F2350]">Document review and audit</h4>
            <p className="text-[11px] text-[#8C91AB] mt-0.5 leading-relaxed max-w-xl">
              This prototype stores uploaded PDF records and generates reports. Cryptographic
              authenticity checks, DigiLocker integration, and official AICTE submission are
              not performed by this screen unless separately integrated and configured.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => void refreshBackendDocuments()}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-[#ECEDF7] text-[#1F2350] rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <History className="w-3.5 h-3.5" />
            <span>Refresh Records</span>
          </button>
          <button
            onClick={() => setApiError('Official AICTE batch submission is not connected in this prototype.')}
            className="px-4 py-2 bg-[#4F63E8] hover:bg-[#4458DC] text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Submit Batch</span>
          </button>
        </div>
      </div>
    </div>
  );
};
