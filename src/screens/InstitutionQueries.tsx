import React, { useState } from 'react';
import { MessageSquare, Send, Paperclip, CheckCircle2 } from 'lucide-react';
import { useApp } from '../store/AppContext';

export const InstitutionQueries: React.FC = () => {
  const { queries, replyClarification, showToast } = useApp();
  const [selectedQueryId, setSelectedQueryId] = useState<string>(queries[0]?.id || '');
  const [replyText, setReplyText] = useState('');
  const [attachmentName, setAttachmentName] = useState('');

  // SVIT Pune queries only
  const instQueries = queries.filter(q => q.applicationId === 'app-1');
  const activeQuery = instQueries.find(q => q.id === selectedQueryId) || instQueries[0];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !activeQuery) return;
    replyClarification(activeQuery.id, replyText, attachmentName || undefined);
    setReplyText('');
    setAttachmentName('');
  };

  const handleAttachMock = () => {
    setAttachmentName('Rectified_Affidavit_Annexure_IV_Stamped.pdf');
    showToast('Attached: Rectified_Affidavit_Annexure_IV_Stamped.pdf');
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-card-soft border border-[#ECEDF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF0FD] text-[#4F63E8] flex items-center justify-center">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#1F2350]">AICTE Scrutiny Bureau Clarification Requests</h1>
            <p className="text-[11px] text-[#8C91AB]">
              Direct communication channel with AICTE regional officers regarding document variances and compliance.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Query List */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-3 border border-[#ECEDF7] shadow-card-soft space-y-2">
          <span className="text-[11px] font-bold text-[#8C91AB] px-2 block uppercase tracking-wider">
            Inquiries Received ({instQueries.length})
          </span>

          <div className="space-y-1.5">
            {instQueries.map(q => {
              const isSelected = q.id === activeQuery?.id;

              return (
                <div
                  key={q.id}
                  onClick={() => setSelectedQueryId(q.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#EEF0FD] border-[#4F63E8] shadow-xs'
                      : 'bg-white hover:bg-gray-50 border-gray-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-[#1F2350] truncate">{q.officerName}</span>
                    <span
                      className={`text-[9.5px] font-bold px-2 py-0.5 rounded-full ${
                        q.status === 'Resolved'
                          ? 'bg-emerald-100 text-[#3DBE8B]'
                          : q.status === 'Replied'
                          ? 'bg-blue-100 text-[#4F63E8]'
                          : 'bg-amber-100 text-[#F59A3C]'
                      }`}
                    >
                      {q.status}
                    </span>
                  </div>
                  <h4 className="text-[11px] font-semibold text-[#1F2350]">{q.subject}</h4>
                  <p className="text-[10px] text-[#8C91AB] line-clamp-1 mt-0.5">{q.queryText}</p>
                  <span className="text-[9px] text-[#8C91AB] block mt-1.5">{q.createdAt}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Query Thread & Reply Box */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-5 border border-[#ECEDF7] shadow-card-soft flex flex-col justify-between min-h-[460px]">
          {activeQuery ? (
            <div className="flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#4F63E8]">
                      Official Inquiry
                    </span>
                    <h3 className="text-sm font-bold text-[#1F2350] mt-0.5">{activeQuery.subject}</h3>
                    <p className="text-[11px] text-[#8C91AB]">From: {activeQuery.officerName}</p>
                  </div>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      activeQuery.status === 'Resolved'
                        ? 'bg-emerald-100 text-[#3DBE8B]'
                        : 'bg-amber-100 text-[#F59A3C]'
                    }`}
                  >
                    {activeQuery.status}
                  </span>
                </div>

                {/* Messages */}
                <div className="mt-4 space-y-3">
                  <div className="p-3 bg-[#FAF8FF] border border-indigo-50 rounded-xl space-y-1">
                    <div className="flex justify-between text-[10.5px]">
                      <span className="font-bold text-[#4F63E8]">{activeQuery.officerName}</span>
                      <span className="text-[#8C91AB]">{activeQuery.createdAt}</span>
                    </div>
                    <p className="text-xs text-[#1F2350] leading-relaxed">{activeQuery.queryText}</p>
                  </div>

                  {activeQuery.replies.map(rep => (
                    <div
                      key={rep.id}
                      className={`p-3 rounded-xl space-y-1 ${
                        rep.senderRole === 'institution'
                          ? 'bg-emerald-50/70 border border-emerald-100'
                          : 'bg-[#FAF8FF] border border-indigo-50'
                      }`}
                    >
                      <div className="flex justify-between text-[10.5px]">
                        <span className="font-bold text-[#1F2350]">{rep.senderName}</span>
                        <span className="text-[#8C91AB]">{rep.timestamp}</span>
                      </div>
                      <p className="text-xs text-[#1F2350] leading-relaxed">{rep.message}</p>
                      {rep.attachmentName && (
                        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[#4F63E8] bg-white p-1.5 rounded border border-gray-100 w-fit">
                          <Paperclip className="w-3 h-3" />
                          <span>{rep.attachmentName}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Form */}
              <form onSubmit={handleSendReply} className="pt-3 border-t border-gray-100 space-y-2">
                <textarea
                  rows={3}
                  required
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Draft institutional clarification response with sworn annexure reference..."
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-[#FBFBFE] focus:ring-1 focus:ring-[#4F63E8] text-[#1F2350]"
                />

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleAttachMock}
                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#1F2350] text-xs font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>{attachmentName ? 'Attached' : 'Attach PDF Proof'}</span>
                    </button>
                    {attachmentName && (
                      <span className="text-[10px] text-[#3DBE8B] font-semibold truncate max-w-[180px]">
                        {attachmentName}
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#4F63E8] hover:bg-[#4458DC] text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                  >
                    <Send className="w-3 h-3" />
                    <span>Submit Official Reply</span>
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[#8C91AB] text-xs">
              No queries found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
