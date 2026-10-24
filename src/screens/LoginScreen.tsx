import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, ArrowRight, UserCheck, School } from 'lucide-react';
import { useApp } from '../store/AppContext';
import { UserRole } from '../types';

export const LoginScreen: React.FC = () => {
  const { login, isLoginModalOpen, toggleLoginModal } = useApp();
  const [selectedRole, setSelectedRole] = useState<UserRole>('officer');
  const [email, setEmail] = useState<string>('sara.abraham@aicte-india.org');
  const [password, setPassword] = useState<string>('officer@2026');

  if (!isLoginModalOpen) return null;

  const handleRoleChange = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'officer') {
      setEmail('sara.abraham@aicte-india.org');
      setPassword('officer@2026');
    } else {
      setEmail('registrar@svit.ac.in');
      setPassword('svit@pune2026');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole, email);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1F2350]/60 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-app-shell w-full max-w-md p-6 sm:p-8 border border-white/80 relative">
        <button
          onClick={toggleLoginModal}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F4F5FE] hover:bg-gray-200 text-[#1F2350] flex items-center justify-center font-bold text-sm cursor-pointer"
        >
          ✕
        </button>

        {/* Brand Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#4F63E8] flex items-center justify-center text-white shadow-md shadow-indigo-300">
            <ShieldCheck className="w-5 h-5 stroke-[2.2]" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-[#1F2350] tracking-tight">AICTE PRAMAN</h2>
            <p className="text-[11px] text-[#8C91AB] font-semibold">Regulatory Scrutiny & Verification Portal</p>
          </div>
        </div>

        {/* Role Tabs */}
        <div className="bg-[#F4F5FE] p-1 rounded-xl flex items-center gap-1 mb-6 border border-[#ECEDF7]">
          <button
            type="button"
            onClick={() => handleRoleChange('institution')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedRole === 'institution'
                ? 'bg-[#4F63E8] text-white shadow-xs'
                : 'text-[#8C91AB] hover:text-[#1F2350]'
            }`}
          >
            <School className="w-3.5 h-3.5" />
            <span>Institution</span>
          </button>
          <button
            type="button"
            onClick={() => handleRoleChange('officer')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              selectedRole === 'officer'
                ? 'bg-[#4F63E8] text-white shadow-xs'
                : 'text-[#8C91AB] hover:text-[#1F2350]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>AICTE Official</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          <div>
            <label className="block text-[11px] font-bold text-[#1F2350] mb-1">
              Registered Work Email
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-xs bg-[#F4F5FE] border border-[#ECEDF7] rounded-xl focus:ring-2 focus:ring-[#4F63E8] focus:bg-white text-[#1F2350]"
              />
              <Mail className="w-4 h-4 text-[#8C91AB] absolute left-3 top-3" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-[#1F2350] mb-1">
              Secret Password
            </label>
            <div className="relative">
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full h-10 pl-9 pr-3 text-xs bg-[#F4F5FE] border border-[#ECEDF7] rounded-xl focus:ring-2 focus:ring-[#4F63E8] focus:bg-white text-[#1F2350]"
              />
              <Lock className="w-4 h-4 text-[#8C91AB] absolute left-3 top-3" />
            </div>
          </div>

          <div className="bg-[#EEF0FD] p-2.5 rounded-xl text-[10px] text-[#4F63E8] font-medium leading-relaxed">
            <span className="font-bold">Demo Preset:</span>{' '}
            {selectedRole === 'officer'
              ? 'Sara Abraham (Senior Scrutiny Officer, Western Regional Office)'
              : 'Dr. V. Kulkarni (Principal / Registrar, SVIT Pune - AICTE-2026-04821)'}
          </div>

          <button
            type="submit"
            className="w-full h-10 bg-[#4F63E8] hover:bg-[#4458DC] text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>Enter AICTE PRAMAN</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-5 text-center text-[10px] text-[#8C91AB]">
          Digital Signature Verified • NIC Root CA Infrastructure
        </div>
      </div>
    </div>
  );
};
