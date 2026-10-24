import React from 'react';
import {
  LayoutDashboard,
  FolderOpen,
  FileCheck2,
  Zap,
  MessageSquare,
  MapPin,
  CheckCircle,
  History,
  FileText,
  Building,
  RefreshCw,
  GitBranch,
  Lock,
  LogOut,
  ShieldCheck,
  UserCheck
} from 'lucide-react';
import { useApp } from '../store/AppContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  hasBadge?: boolean;
}

export const Sidebar: React.FC = () => {
  const { role, activeNav, setActiveNav, logout, toggleLoginModal } = useApp();

  const officerNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'applications', label: 'Applications', icon: FolderOpen },
    { id: 'validation-reports', label: 'Validation Reports', icon: FileCheck2 },
    { id: 'ai-findings', label: 'AI Findings', icon: Zap },
    { id: 'clarifications', label: 'Clarifications', icon: MessageSquare },
    { id: 'inspections', label: 'Inspections', icon: MapPin },
    { id: 'decisions', label: 'Decisions', icon: CheckCircle },
    { id: 'audit-trail', label: 'Audit Trail', icon: History }
  ];

  const institutionNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'applications', label: 'Applications', icon: FileText },
    { id: 'documents', label: 'Documents', icon: FolderOpen },
    { id: 'infrastructure', label: 'Infrastructure', icon: Building },
    { id: 'validation-report', label: 'Validation Report', icon: FileCheck2 },
    { id: 'queries', label: 'Queries', icon: MessageSquare, hasBadge: true },
    { id: 'resubmissions', label: 'Resubmissions', icon: RefreshCw },
    { id: 'track-status', label: 'Track Status', icon: GitBranch }
  ];

  const currentNav = role === 'officer' ? officerNav : institutionNav;

  return (
    <aside
      className="w-full xl:w-[215px] h-full bg-white flex flex-col justify-between py-4 shrink-0 border-r border-[#F0F1FA] select-none overflow-y-auto custom-scrollbar"
      data-purpose="sidebar-nav"
    >
      <div>
        {/* Brand Logo & Lockup */}
        <div
          onClick={() => setActiveNav('dashboard')}
          className="px-5 flex items-center gap-2 mb-4 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-[#4F63E8] flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <ShieldCheck className="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-[15px] text-[#1F2350] tracking-tight leading-none">
                PRAMAN
              </span>
            </div>
            <span className="text-[8.5px] font-semibold text-[#8C91AB] uppercase tracking-wider block mt-0.5">
              {role === 'officer' ? 'AICTE Verification' : 'AICTE Institution'}
            </span>
          </div>
        </div>

        {/* Dynamic Navigation Links */}
        <nav className="space-y-0.5">
          {currentNav.map(item => {
            const isActive = activeNav === item.id;
            const Icon = item.icon;

            return (
              <div
                key={item.id}
                onClick={() => setActiveNav(item.id)}
                className={`group cursor-pointer flex items-center justify-between py-2 px-6 text-[11.5px] font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#EEF0FD] text-[#4F63E8] nav-active-indicator'
                    : 'text-[#8C91AB] hover:text-[#1F2350] hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? 'text-[#4F63E8]' : 'text-[#8C91AB] group-hover:text-[#1F2350]'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.hasBadge && (
                  <span className="w-2 h-2 rounded-full bg-[#F0566A]" />
                )}
              </div>
            );
          })}
        </nav>
      </div>

      {/* Pinned Footer at Bottom */}
      <div className="px-6 pt-3 border-t border-[#F4F5FE] space-y-1">
        <button
          onClick={toggleLoginModal}
          className="flex items-center gap-3 text-[#4F63E8] hover:text-[#384cc2] text-[11.5px] font-bold transition-colors duration-150 w-full py-1.5 group cursor-pointer"
        >
          <UserCheck className="w-4 h-4 text-[#4F63E8]" />
          <span>Switch / Add Role</span>
        </button>

        <button
          onClick={logout}
          className="flex items-center gap-3 text-[#8C91AB] hover:text-[#1F2350] text-[11.5px] font-semibold transition-colors duration-150 w-full py-1 group cursor-pointer"
        >
          <LogOut className="w-4 h-4 text-[#8C91AB] group-hover:text-[#4F63E8] transition-colors" />
          <span>Logout</span>
        </button>

        <div className="mt-3 bg-[#EEF0FD] rounded-lg p-2.5 text-[9.5px] text-[#4F63E8] font-medium leading-tight">
          <div className="flex items-center gap-1 mb-0.5 font-bold">
            <Lock className="w-3 h-3 text-[#4F63E8]" />
            <span>v3.4 Production</span>
          </div>
          <span className="text-[#8C91AB]">Connected to AICTE DigiLocker</span>
        </div>
      </div>
    </aside>
  );
};
