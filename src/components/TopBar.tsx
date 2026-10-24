import React, { useState } from 'react';
import { Search, ChevronDown, Menu, X, FileUp, PlusCircle, Filter, UserCheck } from 'lucide-react';
import { useApp } from '../store/AppContext';

interface TopBarProps {
  onSearch?: (query: string) => void;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export const TopBar: React.FC<TopBarProps> = ({
  onSearch,
  onMobileMenuToggle,
  isMobileMenuOpen = false
}) => {
  const { role, openReportModal, setActiveNav, showToast, toggleLoginModal } = useApp();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    if (onSearch) onSearch(val);
  };

  return (
    <header
      className="flex flex-wrap items-center justify-between gap-3 mb-5"
      data-purpose="workspace-header"
    >
      {/* Mobile Drawer Trigger (visible on small screens) */}
      <div className="flex items-center gap-2 xl:hidden">
        <button
          onClick={onMobileMenuToggle}
          className="p-2 rounded-lg bg-white border border-[#ECEDF7] text-[#1F2350] hover:bg-gray-50 cursor-pointer"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative flex-1 min-w-[220px] max-w-[380px]">
        <input
          type="text"
          value={searchValue}
          onChange={handleInputChange}
          placeholder="Search application ID, college code, tag..."
          className="w-full h-9 pl-3.5 pr-8 bg-white text-[11.5px] font-medium text-[#1F2350] placeholder:text-[#9EA3BE] rounded-lg border-0 shadow-sm focus:ring-2 focus:ring-[#4F63E8] focus:outline-none transition-all"
        />
        <Search className="w-3.5 h-3.5 text-[#9EA3BE] absolute right-3 top-2.5 pointer-events-none" />
      </div>

      {/* Controls: Active Role Indicator, Switch/Add Role Button & Primary Action Button */}
      <div className="flex items-center gap-2">
        {/* Active Role Indicator Badge */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 h-9 bg-white border border-[#ECEDF7] rounded-lg text-[11px] shadow-xs select-none">
          <span className="w-2 h-2 rounded-full bg-[#4F63E8]" />
          <span className="text-[#8C91AB] font-medium">Portal:</span>
          <span className="text-[#1F2350] font-bold">
            {role === 'officer' ? 'AICTE Officer' : 'Accredited Institution'}
          </span>
        </div>

        {/* Switch / Add Role Quick Trigger */}
        <button
          onClick={toggleLoginModal}
          className="h-9 px-3 bg-white hover:bg-gray-50 border border-[#ECEDF7] text-[#4F63E8] rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          title="Switch Account or Add New Role Profile"
        >
          <UserCheck className="w-3.5 h-3.5" />
          <span>Switch / Add Role</span>
        </button>

        {/* Action Button Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="h-9 px-3.5 bg-[#4F63E8] hover:bg-[#4458DC] text-white rounded-lg text-[11px] font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            {role === 'officer' ? (
              <>
                <span>Add New</span>
                <ChevronDown className="w-3 h-3" />
              </>
            ) : (
              <>
                <FileUp className="w-3.5 h-3.5" />
                <span>Upload Document</span>
                <ChevronDown className="w-3 h-3" />
              </>
            )}
          </button>

          {/* Dropdown popup */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-[#ECEDF7] py-1.5 z-40 text-[11px] font-medium text-[#1F2350]">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  toggleLoginModal();
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-[#EEF0FD] text-[#4F63E8] font-semibold flex items-center gap-2 cursor-pointer border-b border-[#F0F1FA]"
              >
                <UserCheck className="w-3.5 h-3.5 text-[#4F63E8]" />
                <span>Switch or Add Role Account</span>
              </button>

              {role === 'officer' ? (
                <>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      openReportModal('app-1');
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#EEF0FD] hover:text-[#4F63E8] flex items-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Open Full AI Report</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setActiveNav('ai-findings');
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#EEF0FD] hover:text-[#4F63E8] flex items-center gap-2 cursor-pointer"
                  >
                    <Filter className="w-3.5 h-3.5" />
                    <span>Filter Discrepancies</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      showToast('Initiating automated spatial re-scrutiny batch');
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#EEF0FD] hover:text-[#4F63E8] flex items-center gap-2 cursor-pointer"
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Initiate New Scrutiny</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setActiveNav('documents');
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#EEF0FD] hover:text-[#4F63E8] flex items-center gap-2 cursor-pointer"
                  >
                    <FileUp className="w-3.5 h-3.5" />
                    <span>Upload Statutory Document</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setActiveNav('applications');
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#EEF0FD] hover:text-[#4F63E8] flex items-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Start New Approval Wizard</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setActiveNav('infrastructure');
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-[#EEF0FD] hover:text-[#4F63E8] flex items-center gap-2 cursor-pointer"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Add Infrastructure Photo/CAD</span>
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
