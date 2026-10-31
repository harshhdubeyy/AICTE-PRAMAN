import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  ArrowRight,
  UserCheck,
  School,
  Building,
  KeyRound,
  CheckCircle2,
  Sparkles,
  PlusCircle,
  FileCheck2,
  Globe
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { UserRole, UserProfile } from '../types';

interface LoginScreenProps {
  isModal?: boolean;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ isModal = false }) => {
  const {
    login,
    isLoggedIn,
    isLoginModalOpen,
    toggleLoginModal,
    availableOfficerProfiles,
    availableInstitutionProfiles,
    registerNewProfile,
    showToast
  } = useApp();

  const [selectedRole, setSelectedRole] = useState<UserRole>('officer');
  const [selectedProfileIndex, setSelectedProfileIndex] = useState<number>(0);
  const [email, setEmail] = useState<string>('sara.abraham@aicte-india.org');
  const [password, setPassword] = useState<string>('officer@2026');
  const [activeTabMode, setActiveTabMode] = useState<'preset' | 'custom'>('preset');

  // Custom role registration state
  const [customName, setCustomName] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customInstName, setCustomInstName] = useState('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // If in modal mode and modal is not open, or if logged in and not modal, return null
  if (isModal && !isLoginModalOpen) return null;
  if (!isModal && isLoggedIn) return null;

  const currentProfiles =
    selectedRole === 'officer' ? availableOfficerProfiles : availableInstitutionProfiles;
  const activeProfile = currentProfiles[selectedProfileIndex] || currentProfiles[0];

  const handleRoleTabChange = (newRole: UserRole) => {
    setSelectedRole(newRole);
    setSelectedProfileIndex(0);
    const profiles = newRole === 'officer' ? availableOfficerProfiles : availableInstitutionProfiles;
    if (profiles[0]) {
      setEmail(profiles[0].email);
      setPassword(newRole === 'officer' ? 'officer@2026' : 'svit@pune2026');
    }
  };

  const handleSelectPresetProfile = (index: number) => {
    setSelectedProfileIndex(index);
    const prof = currentProfiles[index];
    if (prof) {
      setEmail(prof.email);
      setPassword(selectedRole === 'officer' ? 'officer@2026' : 'svit@pune2026');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (activeTabMode === 'preset') {
        await login(activeProfile, email, activeProfile.institutionId, activeProfile.name, password);
      } else {
        // Custom credentials
        await login(selectedRole, email, selectedRole === 'institution' ? 'inst-1' : undefined, email.split('@')[0], password);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRegisterNewRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim() || !customEmail.trim()) {
      showToast('Please enter role name and work email');
      return;
    }

    setIsSubmitting(true);
    try {
      const newProfile: UserProfile = {
        name: customName,
        email: customEmail,
        role: selectedRole,
        title: customTitle || (selectedRole === 'officer' ? 'Scrutiny Officer' : 'Registrar'),
        institutionName: selectedRole === 'institution' ? customInstName || 'New Technical Institute' : undefined,
        institutionId: selectedRole === 'institution' ? `inst-${Date.now().toString(36)}` : undefined,
        avatar: selectedRole === 'officer'
          ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80'
          : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&h=120&q=80'
      };

      await registerNewProfile(newProfile, password);
      await login(newProfile, customEmail, newProfile.institutionId, newProfile.name, password);
      setActiveTabMode('preset');
    } finally {
      setIsSubmitting(false);
    }
  };

  const content = (
    <div className="w-full max-w-[1180px] max-h-[92vh] bg-white rounded-[32px] md:rounded-[40px] shadow-app-shell overflow-hidden border border-white/60 flex flex-col xl:flex-row relative">
      {/* Close button if in modal mode */}
      {isModal && (
        <button
          onClick={toggleLoginModal}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F4F5FE] hover:bg-gray-200 text-[#1F2350] flex items-center justify-center font-bold text-sm z-30 cursor-pointer shadow-xs"
        >
          ✕
        </button>
      )}

      {/* LEFT COLUMN: Hero Branded Showcase with Vector Graphic */}
      <div className="xl:w-[42%] bg-gradient-to-br from-[#5B6EF0] via-[#4F63E8] to-[#4054D6] p-6 sm:p-8 text-white flex flex-col justify-between relative overflow-hidden select-none">
        {/* Ambient lighting blobs */}
        <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-20 right-10 w-72 h-72 rounded-full bg-indigo-300/20 blur-3xl pointer-events-none" />

        {/* Brand header */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-white text-[#4F63E8] flex items-center justify-center font-extrabold shadow-md">
              <ShieldCheck className="w-6 h-6 stroke-[2.3]" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-white leading-none">
                  PRAMAN
                </span>
                <span className="text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                  v3.4 Production
                </span>
              </div>
              <span className="text-[9.5px] font-semibold text-indigo-100 uppercase tracking-wider block mt-0.5">
                AICTE Regulatory Scrutiny Engine
              </span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-snug mb-2">
            AI-Powered Regulatory Application Scrutiny & Validation
          </h2>
          <p className="text-xs text-indigo-100 leading-relaxed max-w-md">
            Automated spatial OCR coordinate cross-verification, versioned handbook compliance checks, and evidence-linked decision support.
          </p>
        </div>

        {/* 4 Statutory capability chips */}
        <div className="relative z-10 my-6 space-y-2 text-xs">
          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
            <Sparkles className="w-4 h-4 text-emerald-300 shrink-0" />
            <div>
              <span className="font-bold text-white block">Spatial Coordinate NLP Engine</span>
              <span className="text-[10px] text-indigo-100">98.4% coordinate match rate across deeds & affidavits</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
            <FileCheck2 className="w-4 h-4 text-amber-300 shrink-0" />
            <div>
              <span className="font-bold text-white block">Deterministic Rules (APH 2026-27)</span>
              <span className="text-[10px] text-indigo-100">Zero-guesswork cross-checking of land, NOCs, & faculty cadre</span>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center gap-3">
            <Globe className="w-4 h-4 text-cyan-300 shrink-0" />
            <div>
              <span className="font-bold text-white block">DigiLocker & State Revenue Gateway</span>
              <span className="text-[10px] text-indigo-100">PKI timestamped digital signatures under Section 10(k)</span>
            </div>
          </div>
        </div>

        {/* Vector illustration at bottom left */}
        <div className="relative z-10 flex items-center justify-between text-[10px] text-indigo-100 pt-3 border-t border-white/20">
          <span>Decision Support System • Final Authority Rests With Authorized Officer</span>
          <span className="font-mono font-bold text-white">NIC Root CA</span>
        </div>
      </div>

      {/* RIGHT COLUMN: Role Tabs & Multi-Role Login / Registration Form */}
      <div className="xl:w-[58%] bg-[#F4F5FE] p-5 sm:p-7 flex flex-col justify-between overflow-y-auto max-h-[92vh] custom-scrollbar">
        <div>
          {/* Top Title */}
          <div className="mb-5">
            <h3 className="text-xl font-extrabold text-[#1F2350] tracking-tight">
              Sign In to AICTE PRAMAN
            </h3>
            <p className="text-xs text-[#8C91AB] mt-0.5">
              Select your accredited institutional profile or AICTE scrutiny officer account to access dossiers.
            </p>
          </div>

          {/* Perspective Selector Pills: Institution | AICTE Official */}
          <div className="bg-white p-1.5 rounded-2xl flex items-center gap-1.5 mb-5 shadow-card-soft border border-[#ECEDF7]">
            <button
              type="button"
              onClick={() => handleRoleTabChange('institution')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedRole === 'institution'
                  ? 'bg-[#4F63E8] text-white shadow-sm'
                  : 'text-[#8C91AB] hover:text-[#1F2350]'
              }`}
            >
              <School className="w-4 h-4" />
              <span>Institution Portal</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange('officer')}
              className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                selectedRole === 'officer'
                  ? 'bg-[#4F63E8] text-white shadow-sm'
                  : 'text-[#8C91AB] hover:text-[#1F2350]'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>AICTE Official / Scrutiny Bureau</span>
            </button>
          </div>

          {/* Sub-mode Tabs: Choose Preset Account vs Add Custom Role */}
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-bold text-[#1F2350] uppercase tracking-wider text-[10.5px]">
              {selectedRole === 'officer' ? 'Select Officer Account:' : 'Select Accredited Institution:'}
            </span>
            <div className="flex items-center gap-1 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveTabMode('preset')}
                className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer ${
                  activeTabMode === 'preset'
                    ? 'bg-[#EEF0FD] text-[#4F63E8]'
                    : 'text-[#8C91AB] hover:text-[#1F2350]'
                }`}
              >
                Preset Profiles
              </button>
              <span className="text-[#8C91AB]">•</span>
              <button
                type="button"
                onClick={() => setActiveTabMode('custom')}
                className={`px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer flex items-center gap-1 ${
                  activeTabMode === 'custom'
                    ? 'bg-[#EEF0FD] text-[#4F63E8]'
                    : 'text-[#8C91AB] hover:text-[#1F2350]'
                }`}
              >
                <PlusCircle className="w-3 h-3" />
                <span>Add Custom Role</span>
              </button>
            </div>
          </div>

          {/* MODE 1: PRESET PROFILES SELECTOR */}
          {activeTabMode === 'preset' && (
            <div className="space-y-3 mb-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[220px] overflow-y-auto pr-1">
                {currentProfiles.map((prof, idx) => {
                  const isSelected = idx === selectedProfileIndex;

                  return (
                    <div
                      key={prof.email}
                      onClick={() => handleSelectPresetProfile(idx)}
                      className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center gap-2.5 ${
                        isSelected
                          ? 'bg-[#4F63E8] text-white shadow-sm border-[#4F63E8]'
                          : 'bg-white hover:bg-gray-50 border-gray-100 text-[#1F2350]'
                      }`}
                    >
                      <img
                        src={prof.avatar}
                        alt={prof.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-white/50"
                      />
                      <div className="overflow-hidden leading-tight flex-1">
                        <span className="font-bold text-xs truncate block">{prof.name}</span>
                        <span
                          className={`text-[9.5px] truncate block ${
                            isSelected ? 'text-white/80' : 'text-[#8C91AB]'
                          }`}
                        >
                          {prof.title}
                        </span>
                        {prof.institutionName && (
                          <span
                            className={`text-[9px] font-semibold truncate block ${
                              isSelected ? 'text-white/95' : 'text-[#4F63E8]'
                            }`}
                          >
                            {prof.institutionName}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Form with selected credentials */}
              <form onSubmit={handleSubmit} className="bg-white p-4 rounded-2xl shadow-card-soft border border-[#ECEDF7] space-y-3 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[#1F2350] mb-1">
                    Official Work Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 bg-[#F4F5FE] border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#4F63E8] text-[#1F2350] font-medium"
                    />
                    <Mail className="w-3.5 h-3.5 text-[#8C91AB] absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#1F2350] mb-1">
                    Security Key / Password
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full h-9 pl-9 pr-3 bg-[#F4F5FE] border border-gray-200 rounded-xl focus:ring-1 focus:ring-[#4F63E8] text-[#1F2350] font-medium"
                    />
                    <Lock className="w-3.5 h-3.5 text-[#8C91AB] absolute left-3 top-2.5" />
                  </div>
                </div>

                <div className="p-2 bg-[#EEF0FD] rounded-xl text-[10.5px] text-[#4F63E8] flex items-center justify-between">
                  <span>Selected Role: <strong className="text-[#1F2350]">{activeProfile.name}</strong></span>
                  <span className="font-bold uppercase text-[9px] bg-white px-2 py-0.5 rounded">
                    {selectedRole === 'officer' ? 'AICTE Officer' : 'Institution'}
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-10 bg-[#4F63E8] hover:bg-[#4458DC] disabled:opacity-75 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>
                    {isSubmitting
                      ? 'Authenticating...'
                      : `Sign In as ${selectedRole === 'officer' ? 'Officer' : 'Institution'}`}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {/* MODE 2: REGISTER / ADD CUSTOM ROLE */}
          {activeTabMode === 'custom' && (
            <form onSubmit={handleRegisterNewRole} className="bg-white p-4 rounded-2xl shadow-card-soft border border-[#ECEDF7] space-y-3 text-xs mb-5">
              <div className="p-2.5 bg-indigo-50/70 rounded-xl border border-indigo-100 text-[11px] text-[#4F63E8]">
                <strong>Add Different Role Profile:</strong> Create and log in with a new institutional administrator or AICTE regional officer identity.
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1F2350] mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Khanna"
                  className="w-full h-9 px-3 bg-[#F4F5FE] border border-gray-200 rounded-xl text-[#1F2350]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1F2350] mb-1">Official Work Email</label>
                <input
                  type="email"
                  required
                  value={customEmail}
                  onChange={e => setCustomEmail(e.target.value)}
                  placeholder="e.g. rajesh.khanna@aicte-india.org"
                  className="w-full h-9 px-3 bg-[#F4F5FE] border border-gray-200 rounded-xl text-[#1F2350]"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#1F2350] mb-1">Designation / Role Title</label>
                <input
                  type="text"
                  value={customTitle}
                  onChange={e => setCustomTitle(e.target.value)}
                  placeholder={selectedRole === 'officer' ? 'e.g. Regional Scrutiny Officer (Southern)' : 'e.g. Vice Chancellor / Dean'}
                  className="w-full h-9 px-3 bg-[#F4F5FE] border border-gray-200 rounded-xl text-[#1F2350]"
                />
              </div>

              {selectedRole === 'institution' && (
                <div>
                  <label className="block text-[11px] font-bold text-[#1F2350] mb-1">Institution Name</label>
                  <input
                    type="text"
                    value={customInstName}
                    onChange={e => setCustomInstName(e.target.value)}
                    placeholder="e.g. Delhi Technological University"
                    className="w-full h-9 px-3 bg-[#F4F5FE] border border-gray-200 rounded-xl text-[#1F2350]"
                  />
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setActiveTabMode('preset')}
                  className="w-1/2 h-9 rounded-xl border border-gray-200 font-bold text-[#1F2350] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 h-9 bg-[#4F63E8] hover:bg-[#4458DC] text-white rounded-xl font-bold shadow-sm cursor-pointer"
                >
                  Create & Sign In
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer stamp */}
        <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-[10px] text-[#8C91AB]">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#3DBE8B]" />
            Digital Signature Verified • Section 10(k)
          </span>
          <span>Zero Tamper Node</span>
        </div>
      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-[#1F2350]/60 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-y-auto p-2 sm:p-4 md:p-6 flex items-center justify-center selection:bg-indigo-100 selection:text-[#4F63E8]">
      {content}
    </div>
  );
};
