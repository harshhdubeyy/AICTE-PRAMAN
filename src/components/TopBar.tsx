import React, { useState } from 'react';
import { Search, ChevronDown, Menu, X, FileUp, PlusCircle, Filter } from 'lucide-react';
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
  const { role, switchRole, openReportModal, setActiveNav, showToast } = useApp();
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
          className="p-2 rounded-lg bg-white border border-[#ECEDF7] text-[#1F2350] hover:bg-gray-50"
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

      {/* Controls: Role Selector Pills & Primary Action Button */}
      <div className="flex items-center gap-2.5">
        {/* Perspective Toggle Pill */}
        <div className="bg-white p-1 rounded-lg shadow-sm flex items-center text-[10.5px] font-bold border border-[#ECEDF7]">
          <button
            onClick={() => switchRole('officer')}
            className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
              role === 'officer'
                ? 'bg-[#4F63E8] text-white shadow-xs'
                : 'text-[#8C91AB] hover:text-[#1F2350]'
            }`}
          >
            AICTE Officer
          </button>
          <button
            onClick={() => switchRole('institution')}
            className={`px-2.5 py-1 rounded transition-all cursor-pointer ${
              role === 'institution'
                ? 'bg-[#4F63E8] text-white shadow-xs'
                : 'text-[#8C91AB] hover:text-[#1F2350]'
            }`}
          >
            Institution
          </button>
        </div>

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
            <div className="absolute right-0 mt-1 w-52 bg-white rounded-xl shadow-lg border border-[#ECEDF7] py-1.5 z-40 text-[11px] font-medium text-[#1F2350]">
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
