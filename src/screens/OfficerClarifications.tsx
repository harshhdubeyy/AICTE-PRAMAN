import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, Paperclip, Plus } from 'lucide-react';
import { useApp } from '../store/AppContext';

export const OfficerClarifications: React.FC = () => {
  const { queries, applications, sendClarification, replyClarification, showToast } = useApp();
  const [selectedQueryId, setSelectedQueryId] = useState<string>(queries[0]?.id || '');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [targetAppId, setTargetAppId] = useState('app-1');
  const [subject, setSubject] = useState('');
  const [queryText, setQueryText] = useState('');
  const [fieldRef, setFieldRef] = useState('');
  const [replyText, setReplyText] = useState('');

  const activeQuery = queries.find(q => q.id === selectedQueryId) || queries[0];

  const handleCreateQuery = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryText.trim()) return;
    sendClarification(targetAppId, queryText, fieldRef || subject);
    setIsNewModalOpen(false);
    setSubject('');
    setQueryText('');
    setFieldRef('');
  };

  const handleSendReply = () => {
    if (!replyText.trim() || !activeQuery) return;
    replyClarification(activeQuery.id, replyText);
    setReplyText('');
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
            <h1 className="text-base font-bold text-[#1F2350]">Institutional Clarifications & Inquiries</h1>
            <p className="text-[11px] text-[#8C91AB]">
              Regulatory query dispatch and bilateral resolution threads with accredited institutions.
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsNewModalOpen(true)}
          className="h-8 px-3.5 bg-[#4F63E8] hover:bg-[#4458DC] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Clarification Query</span>
        </button>
      </div>

      {/* Main Grid: Ticket List + Active Conversation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Queries List */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-3 border border-[#ECEDF7] shadow-card-soft space-y-2">
          <span className="text-[11px] font-bold text-[#8C91AB] px-2 block uppercase tracking-wider">
            Active Query Threads ({queries.length})
          </span>

          <div className="space-y-1.5 overflow-y-auto max-h-[560px]">
            {queries.map(q => {
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
                    <span className="font-bold text-xs text-[#1F2350] truncate">{q.institutionName}</span>
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
                  <h4 className="text-[11px] font-semibold text-[#1F2350] truncate">{q.subject}</h4>
                  <p className="text-[10px] text-[#8C91AB] line-clamp-1 mt-0.5">{q.queryText}</p>
                  <div className="flex items-center justify-between text-[9px] text-[#8C91AB] mt-2">
                    <span>{q.applicationNumber}</span>
                    <span>{q.createdAt}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Active Query Thread */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-5 border border-[#ECEDF7] shadow-card-soft flex flex-col justify-between min-h-[480px]">
          {activeQuery ? (
            <div className="flex flex-col justify-between h-full space-y-4">
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-gray-100">
                  <div>
                    <h3 className="text-sm font-bold text-[#1F2350]">{activeQuery.subject}</h3>
                    <p className="text-[11px] text-[#8C91AB] mt-0.5">
                      {activeQuery.institutionName} • Application: {activeQuery.applicationNumber}
                    </p>
                    {activeQuery.fieldReference && (
                      <span className="inline-block mt-1 text-[10px] bg-indigo-50 text-[#4F63E8] px-2 py-0.5 rounded font-mono font-bold">
                        Target Field: {activeQuery.fieldReference}
                      </span>
                    )}
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

                {/* Conversation messages */}
                <div className="mt-4 space-y-3">
                  {/* Initial Officer Query */}
                  <div className="p-3 bg-[#FAF8FF] border border-indigo-50 rounded-xl space-y-1">
                    <div className="flex justify-between text-[10.5px]">
                      <span className="font-bold text-[#4F63E8]">{activeQuery.officerName}</span>
                      <span className="text-[#8C91AB]">{activeQuery.createdAt}</span>
                    </div>
                    <p className="text-xs text-[#1F2350] leading-relaxed">{activeQuery.queryText}</p>
                  </div>

                  {/* Replies */}
                  {activeQuery.replies.map(rep => (
                    <div
                      key={rep.id}
                      className={`p-3 rounded-xl space-y-1 ${
                        rep.senderRole === 'institution'
                          ? 'bg-emerald-50/60 border border-emerald-100'
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

              {/* Reply Box */}
              <div className="pt-3 border-t border-gray-100 space-y-2">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type an official regulatory follow-up or sign-off instructions..."
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 bg-[#FBFBFE] focus:ring-1 focus:ring-[#4F63E8] text-[#1F2350]"
                />
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-[#8C91AB]">
                    Transmitted via secure AICTE Scrutiny Intranet
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => showToast('Clarification marked as Resolved')}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-[#1F2350] text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#3DBE8B]" />
                      <span>Mark Resolved</span>
                    </button>
                    <button
                      onClick={handleSendReply}
                      className="px-4 py-1.5 bg-[#4F63E8] hover:bg-[#4458DC] text-white text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm"
                    >
                      <Send className="w-3 h-3" />
                      <span>Send Follow-up</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-[#8C91AB] text-xs">
              No query selected
            </div>
          )}
        </div>
      </div>

      {/* New Query Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2350]/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl border border-indigo-100 space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-sm text-[#1F2350]">Dispatch New Formal Clarification Notice</h3>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-[#1F2350] flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateQuery} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-[#1F2350] mb-1">Select Application</label>
                <select
                  value={targetAppId}
                  onChange={e => setTargetAppId(e.target.value)}
                  className="w-full h-9 px-2.5 bg-[#F4F5FE] border border-gray-200 rounded-lg text-xs font-medium"
                >
                  {applications.map(app => (
                    <option key={app.id} value={app.id}>
                      {app.applicationNumber} - {app.institutionName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#1F2350] mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  placeholder="e.g. Sworn Affidavit vs Revenue Deed Discrepancy"
                  className="w-full h-9 px-2.5 bg-[#F4F5FE] border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1F2350] mb-1">Target Field / Rule</label>
                <input
                  type="text"
                  value={fieldRef}
                  onChange={e => setFieldRef(e.target.value)}
                  placeholder="e.g. Rule APH-4.2 (Land Survey Number)"
                  className="w-full h-9 px-2.5 bg-[#F4F5FE] border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-[#1F2350] mb-1">Official Clarification Query</label>
                <textarea
                  rows={4}
                  required
                  value={queryText}
                  onChange={e => setQueryText(e.target.value)}
                  placeholder="State the observed variance, required documentation, and deadline for institutional response..."
                  className="w-full p-2.5 bg-[#F4F5FE] border border-gray-200 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-1.5 rounded-lg border text-[#1F2350] font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-[#4F63E8] hover:bg-[#4458DC] text-white font-bold shadow-sm"
                >
                  Dispatch to Institution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
