import React, { useState, useRef } from 'react';
import { Plus, FileText, CheckCircle, ArrowRight, ArrowLeft, Upload, Shield, Loader2 } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { ApplicationType } from '../types';
import { StatusDot } from '../components/StatusDot';

export const InstitutionApplications: React.FC = () => {
  const { applications, addNewApplication, openReportModal, showToast, isLoading } = useApp();
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Wizard form states
  const [appType, setAppType] = useState<ApplicationType>('Extension of Approval');
  const [academicYear, setAcademicYear] = useState('AY 2026-27');
  const [programName, setProgramName] = useState('Engineering & Technology (UG/PG)');
  const [builtUpArea, setBuiltUpArea] = useState('14,200 sq.m');
  const [uploadedFilesCount, setUploadedFilesCount] = useState(4);

  const wizardFileInputRef = useRef<HTMLInputElement>(null);

  // SVIT Pune applications only (inst-1)
  const institutionApps = applications.filter(a => a.institutionId === 'inst-1');

  const handleNextStep = async () => {
    if (wizardStep < 4) {
      setWizardStep(prev => prev + 1);
    } else {
      setIsSubmitting(true);
      try {
        await addNewApplication({
          institutionName: 'Sri Venkateswara Institute of Technology, Pune',
          applicationType: appType,
          academicYear
        });
        showToast('Application successfully submitted to AICTE Western Regional Office!');
        setIsWizardOpen(false);
        setWizardStep(1);
      } catch (err: any) {
        showToast('Submission error: ' + err.message);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleSimulateAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadedFilesCount(prev => prev + e.target.files!.length);
      showToast(`Attached ${e.target.files[0].name} with SHA-256 stamp to application`);
    }
  };

  return (
    <div className="space-y-4">
      {/* Hidden file input for wizard */}
      <input
        type="file"
        ref={wizardFileInputRef}
        onChange={handleSimulateAttach}
        accept=".pdf,.png,.jpg,.jpeg"
        className="hidden"
      />

      {/* Header */}
      <div className="bg-white rounded-2xl p-4 md:p-5 shadow-card-soft border border-[#ECEDF7] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EEF0FD] text-[#4F63E8] flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-[#1F2350]">My Regulatory Applications</h1>
            <p className="text-[11px] text-[#8C91AB]">
              Manage approval requests, track annual EoA dossiers, and initiate program modifications.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            setIsWizardOpen(true);
            setWizardStep(1);
          }}
          className="h-9 px-4 bg-[#4F63E8] hover:bg-[#4458DC] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Application</span>
        </button>
      </div>

      {/* Applications Cards List */}
      <div className="space-y-3">
        {isLoading && institutionApps.length === 0 ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-[#ECEDF7] animate-pulse space-y-3">
              <div className="h-4 w-48 bg-gray-200 rounded" />
              <div className="h-3 w-64 bg-gray-100 rounded" />
              <div className="h-2 w-36 bg-gray-200 rounded" />
            </div>
          ))
        ) : (
          institutionApps.map(app => (
            <div
              key={app.id}
              className="bg-white rounded-2xl p-4 sm:p-5 border border-[#ECEDF7] shadow-card-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-xs bg-indigo-50 text-[#4F63E8] px-2 py-0.5 rounded font-mono">
                    {app.applicationNumber}
                  </span>
                  <h3 className="font-bold text-sm text-[#1F2350]">{app.applicationType}</h3>
                  <StatusDot status={app.status} />
                </div>

                <div className="flex items-center gap-3 text-xs text-[#8C91AB]">
                  <span>Cycle: <strong className="text-[#1F2350]">{app.academicYear}</strong></span>
                  <span>•</span>
                  <span>Submitted: {app.submittedAt}</span>
                  <span>•</span>
                  <span>Stage: <strong className="text-[#4F63E8]">{app.stage}</strong></span>
                </div>

                <div className="flex items-center gap-2 mt-2">
                  <div className="w-36 h-2 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full bg-[#4F63E8] rounded-full"
                      style={{ width: `${app.completenessPercentage}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-bold text-[#1F2350]">{app.completenessPercentage}% Complete</span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => openReportModal(app.id)}
                  className="px-4 py-2 bg-[#EEF0FD] hover:bg-[#4F63E8] hover:text-white text-[#4F63E8] rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  View Validation Report
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 4-Step Wizard Modal */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2350]/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-7 w-full max-w-xl shadow-2xl border border-indigo-100 space-y-5">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#1F2350]">New Approval Application Wizard</h3>
                <p className="text-[10px] text-[#8C91AB]">AICTE Statutory Regulation 2026-27 Intake Approval</p>
              </div>
              <button
                onClick={() => setIsWizardOpen(false)}
                className="w-7 h-7 rounded-full bg-gray-100 text-[#1F2350] flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Stepper Header (4 steps) */}
            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              {[
                { num: 1, label: 'Select Type' },
                { num: 2, label: 'Fill Details' },
                { num: 3, label: 'Upload Documents' },
                { num: 4, label: 'Review & Submit' }
              ].map(s => (
                <div
                  key={s.num}
                  className={`p-2 rounded-xl border flex flex-col items-center ${
                    wizardStep === s.num
                      ? 'bg-[#EEF0FD] border-[#4F63E8] text-[#4F63E8] font-bold'
                      : wizardStep > s.num
                      ? 'bg-emerald-50 border-emerald-200 text-[#3DBE8B] font-bold'
                      : 'bg-gray-50 border-gray-200 text-[#8C91AB]'
                  }`}
                >
                  <span className="text-[10px] uppercase">Step {s.num}</span>
                  <span className="text-[11px] truncate">{s.label}</span>
                </div>
              ))}
            </div>

            {/* Step 1: Select Type */}
            {wizardStep === 1 && (
              <div className="space-y-3">
                <span className="text-xs font-bold text-[#1F2350] block">Choose Regulatory Application Type:</span>
                {[
                  'Extension of Approval',
                  'New Institution',
                  'Change in Program',
                  'Increase in Intake',
                  'Closure of Program'
                ].map((typeOption: any) => (
                  <div
                    key={typeOption}
                    onClick={() => setAppType(typeOption)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                      appType === typeOption
                        ? 'bg-[#EEF0FD] border-[#4F63E8] text-[#4F63E8] font-bold shadow-xs'
                        : 'bg-white hover:bg-gray-50 border-gray-200 text-[#1F2350]'
                    }`}
                  >
                    <span className="text-xs">{typeOption}</span>
                    {appType === typeOption && <CheckCircle className="w-4 h-4 text-[#4F63E8]" />}
                  </div>
                ))}
              </div>
            )}

            {/* Step 2: Fill Details */}
            {wizardStep === 2 && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[#1F2350] mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={e => setAcademicYear(e.target.value)}
                    className="w-full h-9 px-3 bg-[#F4F5FE] border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1F2350] mb-1">Target Program Disciplinary Stream</label>
                  <input
                    type="text"
                    value={programName}
                    onChange={e => setProgramName(e.target.value)}
                    className="w-full h-9 px-3 bg-[#F4F5FE] border border-gray-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#1F2350] mb-1">Declared Built-up Academic Space</label>
                  <input
                    type="text"
                    value={builtUpArea}
                    onChange={e => setBuiltUpArea(e.target.value)}
                    className="w-full h-9 px-3 bg-[#F4F5FE] border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Upload Documents */}
            {wizardStep === 3 && (
              <div className="space-y-3 text-xs">
                <span className="font-bold text-[#1F2350] block">Upload Mandatory Statutory Files</span>
                <div className="p-4 border-2 border-dashed border-indigo-200 rounded-xl text-center bg-[#F8F9FE] space-y-2">
                  <Upload className="w-6 h-6 text-[#4F63E8] mx-auto" />
                  <p className="text-[11px] text-[#1F2350]">
                    Drop Land Deed, Notarized Sworn Affidavit, and Fire Safety NOC
                  </p>
                  <button
                    type="button"
                    onClick={() => wizardFileInputRef.current?.click()}
                    className="px-3.5 py-1.5 bg-[#4F63E8] hover:bg-[#4458DC] text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
                  >
                    Attach File ({uploadedFilesCount} Attached)
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review & Submit */}
            {wizardStep === 4 && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-[#F8F9FE] rounded-xl border border-indigo-50 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-[#8C91AB]">Application Type:</span>
                    <span className="font-bold text-[#1F2350]">{appType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C91AB]">Academic Year:</span>
                    <span className="font-bold text-[#1F2350]">{academicYear}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C91AB]">Stream:</span>
                    <span className="font-bold text-[#1F2350]">{programName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#8C91AB]">Uploaded Documents:</span>
                    <span className="font-bold text-[#3DBE8B]">{uploadedFilesCount} Files Stamped</span>
                  </div>
                </div>

                <div className="flex items-start gap-2 p-2 bg-amber-50 rounded-lg border border-amber-200 text-[11px] text-[#AD4E00]">
                  <Shield className="w-4 h-4 text-[#F59A3C] shrink-0 mt-0.5" />
                  <span>
                    Self-declaration under oath: All uploaded revenue deeds, faculty pay rosters and floor plans are genuine.
                  </span>
                </div>
              </div>
            )}

            {/* Wizard Navigation Footer */}
            <div className="flex justify-between items-center pt-3 border-t">
              <button
                type="button"
                disabled={wizardStep === 1 || isSubmitting}
                onClick={() => setWizardStep(prev => prev - 1)}
                className={`px-4 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-1 ${
                  wizardStep === 1 || isSubmitting ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'
                }`}
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleNextStep}
                className="px-5 py-2 bg-[#4F63E8] hover:bg-[#4458DC] text-white rounded-xl text-xs font-bold shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Transmitting to AICTE...</span>
                  </>
                ) : (
                  <>
                    <span>{wizardStep === 4 ? 'Sign & Submit Application' : 'Next Step'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
